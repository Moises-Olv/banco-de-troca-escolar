-- Execute no Supabase depois de supabase/administracao.sql.
-- Anúncios retirados pela moderação ficam fora do catálogo e não podem ser
-- reativados ou apagados pelo proprietário. O registro e o histórico de pedidos
-- são preservados.
begin;

alter table public.materiais
  add column if not exists removido_por_moderacao boolean not null default false;

-- Impede contas comuns de marcar/remover o sinal de moderação ou editar/apagar
-- anúncios que já foram retirados. A função administrativa usa SECURITY DEFINER.
drop policy if exists materiais_moderacao_insert_guard on public.materiais;
create policy materiais_moderacao_insert_guard
  on public.materiais as restrictive
  for insert to authenticated
  with check (not removido_por_moderacao);

drop policy if exists materiais_moderacao_update_guard on public.materiais;
create policy materiais_moderacao_update_guard
  on public.materiais as restrictive
  for update to authenticated
  using (not removido_por_moderacao or (select public.admin_eh_usuario()))
  with check (not removido_por_moderacao or (select public.admin_eh_usuario()));

drop policy if exists materiais_moderacao_delete_guard on public.materiais;
create policy materiais_moderacao_delete_guard
  on public.materiais as restrictive
  for delete to authenticated
  using (not removido_por_moderacao or (select public.admin_eh_usuario()));

create or replace function public.admin_ocultar_anuncio(p_material_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if (select auth.uid()) is null or not private.eh_admin() then
    raise exception 'Acesso restrito a administradores.';
  end if;

  select m.status into v_status
  from public.materiais m
  where m.id = p_material_id
  for update;

  if not found then
    raise exception 'Anúncio não encontrado.';
  end if;
  if v_status = 'Reservado' then
    raise exception 'Este anúncio tem uma reserva em andamento. Encerre o pedido antes de retirá-lo do catálogo.';
  end if;

  update public.materiais
  set status = 'Indisponível', ativo = false, removido_por_moderacao = true
  where id = p_material_id;
end;
$$;
revoke all on function public.admin_ocultar_anuncio(uuid) from public, anon;
grant execute on function public.admin_ocultar_anuncio(uuid) to authenticated;

notify pgrst, 'reload schema';
commit;
