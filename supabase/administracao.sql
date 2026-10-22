-- Administração segura: papéis, convites, moderação e métricas.
-- Execute no Supabase: SQL Editor > New query > cole este arquivo completo > Run.
-- O primeiro administrador é a conta proprietária informada para este projeto.
begin;

alter table public.materiais
  add column if not exists removido_por_moderacao boolean not null default false;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.administradores (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
alter table private.administradores enable row level security;
revoke all on table private.administradores from public, anon, authenticated;

create table if not exists private.convites_administrador (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token uuid not null unique default gen_random_uuid(),
  convidado_por uuid not null references auth.users(id) on delete restrict,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  aceito_em timestamptz,
  aceito_por uuid references auth.users(id) on delete set null
);
create unique index if not exists convites_admin_email_pendente_idx
  on private.convites_administrador (email)
  where aceito_em is null;
alter table private.convites_administrador enable row level security;
revoke all on table private.convites_administrador from public, anon, authenticated;

create or replace function private.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.administradores a
    where a.usuario_id = (select auth.uid())
  );
$$;
revoke all on function private.eh_admin() from public, anon, authenticated;

create or replace function public.admin_eh_usuario()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.eh_admin();
$$;
revoke all on function public.admin_eh_usuario() from public, anon;
grant execute on function public.admin_eh_usuario() to authenticated;

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

-- Bootstrap do primeiro administrador. Confira este e-mail antes de executar.
do $$
declare
  v_usuario_id uuid;
  -- Substitua o marcador pelo e-mail confirmado do administrador desta instalação.
  v_email_admin text := 'SUBSTITUA_PELO_EMAIL_CONFIRMADO_DO_ADMIN';
begin
  if v_email_admin = 'SUBSTITUA_PELO_EMAIL_CONFIRMADO_DO_ADMIN' then
    raise exception 'Antes de executar, substitua v_email_admin pelo e-mail confirmado do primeiro administrador desta instalação.';
  end if;

  select u.id into v_usuario_id
  from auth.users u
  where lower(u.email) = lower(v_email_admin)
  order by u.created_at
  limit 1;

  if v_usuario_id is null then
    raise exception 'Conta inicial não encontrada. Confira o e-mail em auth.users e substitua-o neste arquivo antes de executar.';
  end if;

  insert into private.administradores (usuario_id)
  values (v_usuario_id)
  on conflict (usuario_id) do nothing;
end;
$$;

-- Apenas administradores consultam relatos e alteram seu status.
grant select on public.relatos_erros to authenticated;
grant update (status) on public.relatos_erros to authenticated;
drop policy if exists relatos_erros_admin_leitura on public.relatos_erros;
create policy relatos_erros_admin_leitura
  on public.relatos_erros for select to authenticated
  using (public.admin_eh_usuario());
drop policy if exists relatos_erros_admin_modera on public.relatos_erros;
create policy relatos_erros_admin_modera
  on public.relatos_erros for update to authenticated
  using (public.admin_eh_usuario())
  with check (public.admin_eh_usuario());

create table if not exists public.denuncias_anuncios (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references public.materiais(id) on delete set null,
  material_titulo text not null check (char_length(material_titulo) <= 200),
  denunciante_id uuid not null references auth.users(id) on delete cascade,
  motivo text not null check (motivo in (
    'Material comercial ou cobrança indevida',
    'Dados de contato pessoal expostos no anúncio',
    'Conteúdo impróprio ou ofensivo',
    'Informações incorretas sobre escola ou item'
  )),
  status text not null default 'Novo'
    check (status in ('Novo', 'Em análise', 'Resolvida', 'Ignorada')),
  criado_em timestamptz not null default now()
);
create index if not exists denuncias_anuncios_status_data_idx
  on public.denuncias_anuncios (status, criado_em desc);
create index if not exists denuncias_anuncios_material_idx
  on public.denuncias_anuncios (material_id, criado_em desc);
create unique index if not exists denuncias_anuncios_mesmo_usuario_aberta_idx
  on public.denuncias_anuncios (material_id, denunciante_id)
  where material_id is not null and status in ('Novo', 'Em análise');

alter table public.denuncias_anuncios enable row level security;
revoke all on public.denuncias_anuncios from public, anon, authenticated;
grant select on public.denuncias_anuncios to authenticated;
grant update (status) on public.denuncias_anuncios to authenticated;
drop policy if exists denuncias_anuncios_admin_leitura on public.denuncias_anuncios;
create policy denuncias_anuncios_admin_leitura
  on public.denuncias_anuncios for select to authenticated
  using (public.admin_eh_usuario());
drop policy if exists denuncias_anuncios_admin_modera on public.denuncias_anuncios;
create policy denuncias_anuncios_admin_modera
  on public.denuncias_anuncios for update to authenticated
  using (public.admin_eh_usuario())
  with check (public.admin_eh_usuario());

-- O usuário não informa o próprio id nem o título do anúncio: o banco verifica os dados.
create or replace function public.criar_denuncia_anuncio(
  p_material_id uuid,
  p_motivo text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_titulo text;
  v_denuncia_id uuid;
begin
  if v_usuario_id is null then
    raise exception 'Entre na sua conta para denunciar um anúncio.';
  end if;
  if p_motivo not in (
    'Material comercial ou cobrança indevida',
    'Dados de contato pessoal expostos no anúncio',
    'Conteúdo impróprio ou ofensivo',
    'Informações incorretas sobre escola ou item'
  ) then
    raise exception 'Motivo de denúncia inválido.';
  end if;

  select m.titulo into v_titulo
  from public.materiais m
  where m.id = p_material_id;
  if v_titulo is null then
    raise exception 'Anúncio não encontrado.';
  end if;

  insert into public.denuncias_anuncios (material_id, material_titulo, denunciante_id, motivo)
  values (p_material_id, v_titulo, v_usuario_id, p_motivo)
  returning id into v_denuncia_id;
  return v_denuncia_id;
exception
  when unique_violation then
    raise exception 'Você já enviou uma denúncia em análise para este anúncio.';
end;
$$;
revoke all on function public.criar_denuncia_anuncio(uuid, text) from public, anon;
grant execute on function public.criar_denuncia_anuncio(uuid, text) to authenticated;

create or replace function public.admin_criar_convite(p_email text)
returns table (token uuid, expira_em timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_token uuid;
  v_expira_em timestamptz := now() + interval '7 days';
  v_usuario_id uuid := (select auth.uid());
begin
  if v_usuario_id is null or not private.eh_admin() then
    raise exception 'Somente administradores podem convidar outras contas.';
  end if;
  if char_length(v_email) > 254 or v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$' then
    raise exception 'Informe um e-mail válido.';
  end if;
  if exists (
    select 1 from auth.users u
    join private.administradores a on a.usuario_id = u.id
    where lower(u.email) = v_email
  ) then
    raise exception 'Esta conta já é administradora.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_email, 0));
  update private.convites_administrador c
  set token = gen_random_uuid(), convidado_por = v_usuario_id,
      criado_em = now(), expira_em = v_expira_em, aceito_por = null
  where c.email = v_email and c.aceito_em is null
  returning c.token into v_token;

  if v_token is null then
    insert into private.convites_administrador as convite (email, convidado_por, expira_em)
    values (v_email, v_usuario_id, v_expira_em)
    returning convite.token into v_token;
  end if;

  return query select v_token, v_expira_em;
end;
$$;
revoke all on function public.admin_criar_convite(text) from public, anon;
grant execute on function public.admin_criar_convite(text) to authenticated;

create or replace function public.admin_aceitar_convite(p_token uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := (select auth.uid());
  v_email text;
  v_confirmado_em timestamptz;
  v_convite private.convites_administrador%rowtype;
begin
  if v_usuario_id is null then
    raise exception 'Entre na conta vinculada ao e-mail convidado.';
  end if;

  select lower(u.email), u.email_confirmed_at
  into v_email, v_confirmado_em
  from auth.users u where u.id = v_usuario_id;
  if v_email is null or v_confirmado_em is null then
    raise exception 'Confirme o e-mail da conta antes de aceitar o convite.';
  end if;

  select c.* into v_convite
  from private.convites_administrador c
  where c.token = p_token
  for update;
  if not found or v_convite.aceito_em is not null or v_convite.expira_em <= now() then
    raise exception 'Convite inválido, expirado ou já utilizado.';
  end if;
  if v_convite.email <> v_email then
    raise exception 'Entre com a conta do e-mail que recebeu o convite.';
  end if;

  insert into private.administradores (usuario_id, criado_por)
  values (v_usuario_id, v_convite.convidado_por)
  on conflict (usuario_id) do nothing;
  update private.convites_administrador
  set aceito_em = now(), aceito_por = v_usuario_id
  where id = v_convite.id;
end;
$$;
revoke all on function public.admin_aceitar_convite(uuid) from public, anon;
grant execute on function public.admin_aceitar_convite(uuid) to authenticated;

create or replace function public.admin_obter_metricas()
returns table (
  materiais_disponiveis bigint,
  doacoes_concluidas bigint,
  relatos_abertos bigint,
  denuncias_abertas bigint,
  anuncios_antigos bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not private.eh_admin() then
    raise exception 'Acesso restrito a administradores.';
  end if;
  return query select
    (select count(*) from public.materiais m where m.status = 'Disponível' and m.ativo = true and m.modalidade = 'Doação'),
    (select count(*) from public.materiais m where m.status = 'Concluído' and m.modalidade = 'Doação'),
    (select count(*) from public.relatos_erros r where r.status <> 'Resolvido'),
    (select count(*) from public.denuncias_anuncios d where d.status in ('Novo', 'Em análise')),
    (select count(*) from public.materiais m
      where m.status = 'Disponível' and m.ativo = true
        and m.criado_em < now() - interval '90 days');
end;
$$;
revoke all on function public.admin_obter_metricas() from public, anon;
grant execute on function public.admin_obter_metricas() to authenticated;

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

create or replace function public.estatisticas_comunidade()
returns table (materiais_disponiveis bigint, doacoes_concluidas bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.materiais m where m.status = 'Disponível' and m.ativo = true and m.modalidade = 'Doação'),
    (select count(*) from public.materiais m where m.status = 'Concluído' and m.modalidade = 'Doação');
$$;
revoke all on function public.estatisticas_comunidade() from public;
grant execute on function public.estatisticas_comunidade() to anon, authenticated;

notify pgrst, 'reload schema';
commit;
