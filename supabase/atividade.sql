-- Executar uma vez no Supabase: SQL Editor > New query > Run.
-- Adiciona pausa de anúncios, pedidos persistentes e políticas de acesso.

alter table public.materiais
  add column if not exists ativo boolean not null default true;

alter table public.materiais enable row level security;

-- Visitantes podem consultar anúncios ativos; apenas o dono vê os próprios pausados.
drop policy if exists materiais_visibilidade_atividade on public.materiais;
create policy materiais_visibilidade_atividade
  on public.materiais
  as restrictive
  for select
  to anon, authenticated
  using (
    (status = 'Disponível' and ativo = true)
    or usuario_id = (select auth.uid())
  );

-- Garante que inserir, editar disponibilidade e excluir anúncios exija autenticação
-- e que o usuário só altere os próprios materiais.
revoke insert, update, delete on public.materiais from anon;
grant insert, update, delete on public.materiais to authenticated;

drop policy if exists materiais_proprietario_insert_atividade on public.materiais;
create policy materiais_proprietario_insert_atividade
  on public.materiais for insert to authenticated
  with check (usuario_id = (select auth.uid()));

drop policy if exists materiais_proprietario_insert_guard_atividade on public.materiais;
create policy materiais_proprietario_insert_guard_atividade
  on public.materiais as restrictive for insert to authenticated
  with check (usuario_id = (select auth.uid()));

drop policy if exists materiais_proprietario_update_atividade on public.materiais;
create policy materiais_proprietario_update_atividade
  on public.materiais for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

drop policy if exists materiais_proprietario_update_guard_atividade on public.materiais;
create policy materiais_proprietario_update_guard_atividade
  on public.materiais as restrictive for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

drop policy if exists materiais_proprietario_delete_atividade on public.materiais;
create policy materiais_proprietario_delete_atividade
  on public.materiais for delete to authenticated
  using (usuario_id = (select auth.uid()));

drop policy if exists materiais_proprietario_delete_guard_atividade on public.materiais;
create policy materiais_proprietario_delete_guard_atividade
  on public.materiais as restrictive for delete to authenticated
  using (usuario_id = (select auth.uid()));

create table if not exists public.pedidos_interesse (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materiais(id) on delete cascade,
  material_titulo text not null,
  solicitante_id uuid not null references auth.users(id) on delete cascade,
  solicitante_nome text not null default 'Membro da comunidade',
  mensagem text not null default '',
  status text not null default 'Pendente'
    check (status in ('Pendente', 'Aceito', 'Recusado', 'Encerrado')),
  criado_em timestamptz not null default now()
);

create index if not exists pedidos_interesse_material_criado_idx
  on public.pedidos_interesse (material_id, criado_em desc);
create index if not exists pedidos_interesse_solicitante_criado_idx
  on public.pedidos_interesse (solicitante_id, criado_em desc);
create unique index if not exists pedidos_interesse_pedido_ativo_unico
  on public.pedidos_interesse (material_id, solicitante_id)
  where status in ('Pendente', 'Aceito');
create unique index if not exists pedidos_interesse_uma_aceitacao_por_material
  on public.pedidos_interesse (material_id)
  where status = 'Aceito';

alter table public.pedidos_interesse enable row level security;
revoke all on public.pedidos_interesse from anon;
grant select, insert on public.pedidos_interesse to authenticated;

drop policy if exists pedidos_interesse_participantes_select on public.pedidos_interesse;
create policy pedidos_interesse_participantes_select
  on public.pedidos_interesse for select to authenticated
  using (
    solicitante_id = (select auth.uid())
    or exists (
      select 1 from public.materiais m
      where m.id = material_id and m.usuario_id = (select auth.uid())
    )
  );

drop policy if exists pedidos_interesse_participantes_select_guard on public.pedidos_interesse;
create policy pedidos_interesse_participantes_select_guard
  on public.pedidos_interesse as restrictive for select to authenticated
  using (
    solicitante_id = (select auth.uid())
    or exists (
      select 1 from public.materiais m
      where m.id = material_id and m.usuario_id = (select auth.uid())
    )
  );

drop policy if exists pedidos_interesse_solicitante_insert on public.pedidos_interesse;
create policy pedidos_interesse_solicitante_insert
  on public.pedidos_interesse for insert to authenticated
  with check (
    solicitante_id = (select auth.uid())
    and status = 'Pendente'
    and exists (
      select 1 from public.materiais m
      where m.id = material_id
        and m.usuario_id <> (select auth.uid())
        and m.status = 'Disponível'
        and m.ativo = true
    )
  );

drop policy if exists pedidos_interesse_solicitante_insert_guard on public.pedidos_interesse;
create policy pedidos_interesse_solicitante_insert_guard
  on public.pedidos_interesse as restrictive for insert to authenticated
  with check (
    solicitante_id = (select auth.uid())
    and status = 'Pendente'
    and exists (
      select 1 from public.materiais m
      where m.id = material_id
        and m.usuario_id <> (select auth.uid())
        and m.status = 'Disponível'
        and m.ativo = true
    )
  );

-- Resposta atômica: somente o dono do anúncio pode aceitar ou recusar;
-- ao aceitar, reserva o anúncio e encerra os demais pedidos pendentes.
create or replace function public.responder_pedido_interesse(
  p_pedido_id uuid,
  p_novo_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_material_id uuid;
  v_dono_id uuid;
  v_status_pedido text;
  v_status_material text;
  v_material_ativo boolean;
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar na conta.';
  end if;

  if p_novo_status not in ('Aceito', 'Recusado') then
    raise exception 'Resposta inválida.';
  end if;

  select pi.material_id, m.usuario_id, pi.status, m.status, m.ativo
    into v_material_id, v_dono_id, v_status_pedido, v_status_material, v_material_ativo
  from public.pedidos_interesse pi
  join public.materiais m on m.id = pi.material_id
  where pi.id = p_pedido_id
  for update of pi, m;

  if not found or v_dono_id <> auth.uid() then
    raise exception 'Pedido não encontrado para esta conta.';
  end if;
  if v_status_pedido <> 'Pendente' then
    raise exception 'Este pedido já recebeu uma resposta.';
  end if;

  if p_novo_status = 'Aceito' then
    if v_status_material <> 'Disponível' or not v_material_ativo then
      raise exception 'Este material não está mais disponível.';
    end if;

    update public.materiais
      set status = 'Reservado'
      where id = v_material_id;
    update public.pedidos_interesse
      set status = 'Aceito'
      where id = p_pedido_id;
    update public.pedidos_interesse
      set status = 'Encerrado'
      where material_id = v_material_id
        and id <> p_pedido_id
        and status = 'Pendente';
  else
    update public.pedidos_interesse
      set status = 'Recusado'
      where id = p_pedido_id;
  end if;
end;
$$;

revoke all on function public.responder_pedido_interesse(uuid, text) from public, anon;
grant execute on function public.responder_pedido_interesse(uuid, text) to authenticated;
