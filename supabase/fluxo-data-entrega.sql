-- Acrescenta a proposta e a confirmação da data e do horário da entrega.
-- Executar no Supabase: SQL Editor > New query > Run.
-- Quem solicita pode confirmar ou cancelar a reserva; o cancelamento republica o anúncio.

begin;

alter table public.pedidos_interesse
  add column if not exists data_entrega timestamptz,
  add column if not exists mensagem_entrega text,
  add column if not exists entrega_confirmada_em timestamptz;

alter table public.pedidos_interesse
  drop constraint if exists pedidos_interesse_mensagem_entrega_check;
alter table public.pedidos_interesse
  add constraint pedidos_interesse_mensagem_entrega_check
  check (mensagem_entrega is null or char_length(mensagem_entrega) <= 1000);

-- Nova reserva exige uma data e um horário futuros propostos por quem publicou.
-- Remove versões antigas que permitiam reservar sem mensagem/data completa.
drop function if exists public.reservar_pedido_interesse(uuid, timestamptz);
drop function if exists public.reservar_pedido_interesse(uuid);
create or replace function public.reservar_pedido_interesse(
  p_pedido_id uuid,
  p_data_entrega timestamptz,
  p_mensagem_entrega text
)
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
  if p_data_entrega is null or p_data_entrega <= now() then
    raise exception 'Escolha uma data e um horário futuros para a entrega.';
  end if;
  if char_length(coalesce(p_mensagem_entrega, '')) > 1000 then
    raise exception 'A mensagem da entrega deve ter no máximo 1.000 caracteres.';
  end if;

  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;
  if not found then
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
  if not found or v_status_pedido <> 'Pendente' then
    raise exception 'Este pedido já foi respondido.';
  end if;
  if v_status_material <> 'Disponível' or not v_ativo then
    raise exception 'Este material não está mais disponível.';
  end if;

  v_codigo := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  update public.pedidos_interesse
  set status = 'Reservado',
      reservado_em = now(),
      data_entrega = p_data_entrega,
      mensagem_entrega = nullif(btrim(coalesce(p_mensagem_entrega, '')), ''),
      entrega_confirmada_em = null
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

revoke all on function public.reservar_pedido_interesse(uuid, timestamptz, text) from public, anon;
grant execute on function public.reservar_pedido_interesse(uuid, timestamptz, text) to authenticated;

-- Quem solicitou confirma a proposta antes de liberar o código da entrega.
create or replace function public.confirmar_data_entrega_pedido(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_material_id uuid;
  v_solicitante_id uuid;
  v_status text;
  v_data_entrega timestamptz;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para confirmar a data.';
  end if;

  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;
  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  perform 1 from public.materiais m
  where m.id = v_material_id
  for update;

  select pi.solicitante_id, pi.status, pi.data_entrega
    into v_solicitante_id, v_status, v_data_entrega
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found or v_solicitante_id <> v_usuario_id then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status <> 'Reservado' or v_data_entrega is null then
    raise exception 'Este pedido ainda não tem uma data de entrega proposta.';
  end if;

  update public.pedidos_interesse
  set entrega_confirmada_em = coalesce(entrega_confirmada_em, now())
  where id = p_pedido_id;
end;
$$;

revoke all on function public.confirmar_data_entrega_pedido(uuid) from public, anon;
grant execute on function public.confirmar_data_entrega_pedido(uuid) to authenticated;

-- Permite ao doador atualizar o horário enquanto a pessoa solicitante ainda não confirmou.
create or replace function public.atualizar_data_entrega_pedido(
  p_pedido_id uuid,
  p_data_entrega timestamptz,
  p_mensagem_entrega text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_material_id uuid;
  v_dono_id uuid;
  v_status text;
  v_confirmada_em timestamptz;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para atualizar a data.';
  end if;
  if p_data_entrega is null or p_data_entrega <= now() then
    raise exception 'Escolha uma data e um horário futuros para a entrega.';
  end if;
  if char_length(coalesce(p_mensagem_entrega, '')) > 1000 then
    raise exception 'A mensagem da entrega deve ter no máximo 1.000 caracteres.';
  end if;

  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;
  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select m.usuario_id into v_dono_id
  from public.materiais m
  where m.id = v_material_id
  for update;
  if not found or v_dono_id <> v_usuario_id then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select pi.status, pi.entrega_confirmada_em
    into v_status, v_confirmada_em
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found or v_status <> 'Reservado' then
    raise exception 'Este pedido não está reservado.';
  end if;
  if v_confirmada_em is not null then
    raise exception 'A pessoa solicitante já confirmou a data; cancele a reserva para propor outro horário.';
  end if;

  update public.pedidos_interesse
  set data_entrega = p_data_entrega,
      mensagem_entrega = nullif(btrim(coalesce(p_mensagem_entrega, '')), '')
  where id = p_pedido_id;
end;
$$;

drop function if exists public.atualizar_data_entrega_pedido(uuid, timestamptz);
revoke all on function public.atualizar_data_entrega_pedido(uuid, timestamptz, text) from public, anon;
grant execute on function public.atualizar_data_entrega_pedido(uuid, timestamptz, text) to authenticated;

-- O código fica disponível para quem doou somente depois da confirmação do horário.
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
    and pi.entrega_confirmada_em is not null
    and m.usuario_id = (select auth.uid());

  if v_codigo is null then
    raise exception 'O código estará disponível depois que a pessoa solicitante confirmar a data.';
  end if;
  return v_codigo;
end;
$$;

revoke all on function public.codigo_entrega_pedido(uuid) from public, anon;
grant execute on function public.codigo_entrega_pedido(uuid) to authenticated;

-- A pessoa solicitante só confirma o recebimento após confirmar o horário.
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
  v_solicitante_id uuid;
  v_status text;
  v_horario_confirmado timestamptz;
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

  perform 1 from public.materiais m
  where m.id = v_material_id
  for update;

  select pi.solicitante_id, pi.status, pi.entrega_confirmada_em
    into v_solicitante_id, v_status, v_horario_confirmado
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found or v_solicitante_id <> v_usuario_id then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status <> 'Reservado' then
    raise exception 'Este pedido não está aguardando confirmação.';
  end if;
  if v_horario_confirmado is null then
    raise exception 'Confirme a data e o horário antes de confirmar o recebimento.';
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

-- Ambas as pessoas podem cancelar; ao cancelar, o anúncio volta ao catálogo.
create or replace function public.cancelar_reserva_pedido(p_pedido_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_material_id uuid;
  v_dono_id uuid;
  v_solicitante_id uuid;
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

  select m.usuario_id into v_dono_id
  from public.materiais m
  where m.id = v_material_id
  for update;
  if not found then
    raise exception 'Anúncio não encontrado para esta conta.';
  end if;

  select pi.solicitante_id, pi.status
    into v_solicitante_id, v_status
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id and pi.material_id = v_material_id
  for update;
  if not found
    or (v_dono_id <> v_usuario_id and v_solicitante_id <> v_usuario_id) then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status <> 'Reservado' then
    raise exception 'Este pedido não está reservado.';
  end if;

  update public.pedidos_interesse set status = 'Encerrado' where id = p_pedido_id;
  delete from private.pedidos_codigos_entrega where pedido_id = p_pedido_id;
  update public.materiais
  set status = 'Disponível', ativo = true
  where id = v_material_id;
end;
$$;

revoke all on function public.cancelar_reserva_pedido(uuid) from public, anon;
grant execute on function public.cancelar_reserva_pedido(uuid) to authenticated;

-- Mantém a operação antiga apenas para recusa; a reserva exige data e horário.
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
  v_dono_id uuid;
  v_status text;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para responder ao pedido.';
  end if;
  if p_novo_status is distinct from 'Recusado' then
    raise exception 'Para aceitar, proponha uma data e um horário de entrega.';
  end if;

  select pi.material_id into v_material_id
  from public.pedidos_interesse pi
  where pi.id = p_pedido_id;
  if not found then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;

  select m.usuario_id into v_dono_id
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
  if not found or v_status <> 'Pendente' then
    raise exception 'Este pedido já foi respondido.';
  end if;

  update public.pedidos_interesse
  set status = 'Recusado'
  where id = p_pedido_id;
end;
$$;

revoke all on function public.responder_pedido_interesse(uuid, text) from public, anon;
grant execute on function public.responder_pedido_interesse(uuid, text) to authenticated;

notify pgrst, 'reload schema';

commit;
