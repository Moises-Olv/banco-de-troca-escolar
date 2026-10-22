-- Execute uma vez no Supabase: SQL Editor > New query > Run.
-- Corrige a criação de pedidos e acrescenta reserva + confirmação por código.

-- Migra os pedidos antigos aceitos para o novo estado explícito.
alter table public.pedidos_interesse
  add column if not exists reservado_em timestamptz,
  add column if not exists concluido_em timestamptz;

alter table public.pedidos_interesse
  drop constraint if exists pedidos_interesse_status_check;

update public.pedidos_interesse
set status = 'Reservado', reservado_em = coalesce(reservado_em, criado_em)
where status = 'Aceito';

alter table public.pedidos_interesse
  add constraint pedidos_interesse_status_check
  check (status in ('Pendente', 'Reservado', 'Recusado', 'Encerrado', 'Concluído'));

drop index if exists public.pedidos_interesse_pedido_ativo_unico;
drop index if exists public.pedidos_interesse_uma_aceitacao_por_material;
create unique index if not exists pedidos_interesse_pedido_ativo_unico
  on public.pedidos_interesse (material_id, solicitante_id)
  where status in ('Pendente', 'Reservado');
create unique index if not exists pedidos_interesse_uma_reserva_por_material
  on public.pedidos_interesse (material_id)
  where status = 'Reservado';

-- A schema privada não é exposta pela API. O código em texto fica fora da
-- tabela pública, e só uma função autenticada do dono pode recuperá-lo.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.pedidos_codigos_entrega (
  pedido_id uuid primary key references public.pedidos_interesse(id) on delete cascade,
  codigo text not null,
  tentativas smallint not null default 0 check (tentativas between 0 and 5),
  criado_em timestamptz not null default now()
);
alter table private.pedidos_codigos_entrega enable row level security;
revoke all on table private.pedidos_codigos_entrega from public, anon, authenticated;

-- Os pedidos legados que já estavam aceitos recebem um código novo.
insert into private.pedidos_codigos_entrega (pedido_id, codigo)
select pi.id, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
from public.pedidos_interesse pi
where pi.status = 'Reservado'
on conflict (pedido_id) do nothing;

update public.materiais m
set ativo = false
where m.status = 'Reservado'
  and exists (
    select 1 from public.pedidos_interesse pi
    where pi.material_id = m.id and pi.status = 'Reservado'
  );

-- Criação controlada do pedido: evita depender de INSERT direto e valida
-- autenticação, propriedade e disponibilidade dentro da transação.
create or replace function public.criar_pedido_interesse(
  p_material_id uuid,
  p_mensagem text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_dono_id uuid;
  v_titulo text;
  v_status text;
  v_ativo boolean;
  v_nome text;
  v_pedido_id uuid;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para enviar um pedido.';
  end if;
  if char_length(coalesce(p_mensagem, '')) > 1000 then
    raise exception 'A mensagem pode ter no máximo 1000 caracteres.';
  end if;

  select m.usuario_id, m.titulo, m.status, m.ativo
    into v_dono_id, v_titulo, v_status, v_ativo
  from public.materiais m
  where m.id = p_material_id
  for update;

  if not found then
    raise exception 'Este anúncio não foi encontrado.';
  end if;
  if v_dono_id = v_usuario_id then
    raise exception 'Você não pode solicitar seu próprio anúncio.';
  end if;
  if v_status <> 'Disponível' or not v_ativo then
    raise exception 'Este material não está mais disponível.';
  end if;

  select coalesce(
    nullif(u.raw_user_meta_data ->> 'nome', ''),
    'Membro da comunidade'
  )
  into v_nome
  from auth.users u
  where u.id = v_usuario_id;

  insert into public.pedidos_interesse (
    material_id, material_titulo, solicitante_id, solicitante_nome, mensagem, status
  ) values (
    p_material_id, v_titulo, v_usuario_id, coalesce(v_nome, 'Membro da comunidade'),
    btrim(coalesce(p_mensagem, '')), 'Pendente'
  )
  returning id into v_pedido_id;

  return v_pedido_id;
end;
$$;

revoke all on function public.criar_pedido_interesse(uuid, text) from public, anon;
grant execute on function public.criar_pedido_interesse(uuid, text) to authenticated;

-- Reserva feita somente pela pessoa anunciante. O código tem 40 bits de
-- aleatoriedade, usa caracteres hexadecimais fáceis de ler e limita tentativas.
create or replace function public.reservar_pedido_interesse(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_material_id uuid;
  v_dono_id uuid;
  v_status_pedido text;
  v_status_material text;
  v_ativo boolean;
  v_codigo text;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para reservar o material.';
  end if;

  -- Todas as rotinas bloqueiam primeiro o anúncio e depois o pedido, evitando
  -- disputa de bloqueios quando vários interessados são respondidos juntos.
  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;
  if not found or v_material_id is null then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select m.usuario_id, m.status, m.ativo
    into v_dono_id, v_status_material, v_ativo
  from public.materiais m
  where m.id = v_material_id
  for update;
  if not found or v_dono_id <> v_usuario_id then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select pi.status into v_status_pedido
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status_pedido <> 'Pendente' then
    raise exception 'Este pedido já foi respondido.';
  end if;
  if v_status_material <> 'Disponível' or not v_ativo then
    raise exception 'Este material não está mais disponível.';
  end if;

  v_codigo := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  update public.pedidos_interesse
  set status = 'Reservado', reservado_em = now()
  where id = p_pedido_id;

  insert into private.pedidos_codigos_entrega (pedido_id, codigo, tentativas)
  values (p_pedido_id, v_codigo, 0)
  on conflict (pedido_id) do update
    set codigo = excluded.codigo, tentativas = 0, criado_em = now();

  update public.materiais
  set status = 'Reservado', ativo = false
  where id = v_material_id;

  update public.pedidos_interesse
  set status = 'Encerrado'
  where material_id = v_material_id
    and id <> p_pedido_id
    and status = 'Pendente';
end;
$$;

revoke all on function public.reservar_pedido_interesse(uuid) from public, anon;
grant execute on function public.reservar_pedido_interesse(uuid) to authenticated;

-- O código só pode ser consultado pelo dono do anúncio. Quem recebe pede que
-- a pessoa doadora informe o código no encontro e digita-o para confirmar.
create or replace function public.codigo_entrega_pedido(p_pedido_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_codigo text;
begin
  if (select auth.uid()) is null then
    raise exception 'Entre na sua conta para consultar o código.';
  end if;

  select c.codigo into v_codigo
  from private.pedidos_codigos_entrega c
  join public.pedidos_interesse pi on pi.id = c.pedido_id
  join public.materiais m on m.id = pi.material_id
  where pi.id = p_pedido_id
    and pi.status = 'Reservado'
    and m.usuario_id = (select auth.uid());

  if v_codigo is null then
    raise exception 'Código não disponível para esta conta ou pedido.';
  end if;
  return v_codigo;
end;
$$;

revoke all on function public.codigo_entrega_pedido(uuid) from public, anon;
grant execute on function public.codigo_entrega_pedido(uuid) to authenticated;

-- Só quem solicitou pode concluir, e precisa informar o código correto.
-- Código inválido retorna false para que a contagem de tentativas seja salva.
create or replace function public.confirmar_entrega_pedido(
  p_pedido_id uuid,
  p_codigo text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_material_id uuid;
  v_material_bloqueado uuid;
  v_solicitante_id uuid;
  v_status text;
  v_codigo text;
  v_tentativas smallint;
  v_codigo_digitado text;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para confirmar o recebimento.';
  end if;

  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;

  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select m.id into v_material_bloqueado
  from public.materiais m
  where m.id = v_material_id
  for update;
  if not found then
    raise exception 'O anúncio deste pedido não foi encontrado.';
  end if;

  select pi.solicitante_id, pi.status
    into v_solicitante_id, v_status
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found or v_solicitante_id <> v_usuario_id then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status <> 'Reservado' then
    raise exception 'Este pedido não está aguardando confirmação.';
  end if;

  select c.codigo, c.tentativas
    into v_codigo, v_tentativas
  from private.pedidos_codigos_entrega c
  where c.pedido_id = p_pedido_id
  for update;

  if not found or v_tentativas >= 5 then
    return false;
  end if;

  v_codigo_digitado := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-F0-9]', '', 'g'));
  if v_codigo_digitado <> v_codigo then
    update private.pedidos_codigos_entrega
    set tentativas = tentativas + 1
    where pedido_id = p_pedido_id;
    return false;
  end if;

  update public.pedidos_interesse
  set status = 'Concluído', concluido_em = now()
  where id = p_pedido_id;

  update public.materiais
  set status = 'Concluído', ativo = false
  where id = v_material_id;

  delete from private.pedidos_codigos_entrega where pedido_id = p_pedido_id;
  return true;
end;
$$;

revoke all on function public.confirmar_entrega_pedido(uuid, text) from public, anon;
grant execute on function public.confirmar_entrega_pedido(uuid, text) to authenticated;

-- O doador pode liberar a reserva se o encontro não acontecer.
create or replace function public.cancelar_reserva_pedido(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_material_id uuid;
  v_material_bloqueado uuid;
  v_dono_id uuid;
  v_status text;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para cancelar a reserva.';
  end if;

  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;

  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select m.id, m.usuario_id into v_material_bloqueado, v_dono_id
  from public.materiais m
  where m.id = v_material_id
  for update;
  if not found or v_dono_id <> v_usuario_id then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select pi.status into v_status
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status <> 'Reservado' then
    raise exception 'Este pedido não está reservado.';
  end if;

  update public.pedidos_interesse set status = 'Encerrado' where id = p_pedido_id;
  delete from private.pedidos_codigos_entrega where pedido_id = p_pedido_id;
  update public.materiais set status = 'Disponível', ativo = true where id = v_material_id;
end;
$$;

revoke all on function public.cancelar_reserva_pedido(uuid) from public, anon;
grant execute on function public.cancelar_reserva_pedido(uuid) to authenticated;

-- Compatibilidade para uma versão antiga do site: aceitar agora usa o mesmo
-- fluxo seguro de reserva; recusar continua sem reservar o material.
create or replace function public.responder_pedido_interesse(
  p_pedido_id uuid,
  p_novo_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_material_id uuid;
  v_material_bloqueado uuid;
  v_dono_id uuid;
  v_status_pedido text;
begin
  if v_usuario_id is null then
    raise exception 'É necessário entrar na conta.';
  end if;
  if p_novo_status = 'Aceito' then
    perform public.reservar_pedido_interesse(p_pedido_id);
    return;
  end if;
  if p_novo_status is distinct from 'Recusado' then
    raise exception 'Resposta inválida.';
  end if;

  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;

  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select m.id, m.usuario_id into v_material_bloqueado, v_dono_id
  from public.materiais m
  where m.id = v_material_id
  for update;

  if not found or v_dono_id <> v_usuario_id then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select pi.status into v_status_pedido
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status_pedido <> 'Pendente' then
    raise exception 'Este pedido já recebeu uma resposta.';
  end if;

  update public.pedidos_interesse set status = 'Recusado' where id = p_pedido_id;
end;
$$;

revoke all on function public.responder_pedido_interesse(uuid, text) from public, anon;
grant execute on function public.responder_pedido_interesse(uuid, text) to authenticated;

-- Revoga escrita direta: as funções acima são as únicas portas para o fluxo.
revoke insert, update, delete on public.pedidos_interesse from anon, authenticated;
grant select on public.pedidos_interesse to authenticated;

drop policy if exists pedidos_interesse_solicitante_insert on public.pedidos_interesse;
drop policy if exists pedidos_interesse_solicitante_insert_guard on public.pedidos_interesse;

-- Protege o estado do anúncio enquanto existir uma reserva válida.
create or replace function private.proteger_material_reservado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if exists (
      select 1 from public.pedidos_interesse pi
      where pi.material_id = old.id and pi.status = 'Reservado'
    ) then
      raise exception 'Cancele a reserva antes de excluir este anúncio.';
    end if;
    return old;
  end if;

  if new.status = 'Reservado' and not exists (
    select 1 from public.pedidos_interesse pi
    where pi.material_id = new.id and pi.status = 'Reservado'
  ) then
    raise exception 'Um anúncio só pode ser reservado por um pedido válido.';
  end if;

  if exists (
    select 1 from public.pedidos_interesse pi
    where pi.material_id = old.id and pi.status = 'Reservado'
  ) and (new.status <> 'Reservado' or new.ativo is distinct from false) then
    raise exception 'Este anúncio está reservado. Cancele a reserva ou confirme a entrega pelo pedido.';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_material_reservado on public.materiais;
create trigger proteger_material_reservado
  before update or delete on public.materiais
  for each row execute procedure private.proteger_material_reservado();

notify pgrst, 'reload schema';
