-- Execute uma vez no Supabase: SQL Editor > New query > Run.
-- Cria perfis públicos sem expor e-mail ou dados de autenticação.

create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_exibicao text not null default 'Membro da comunidade',
  escola text,
  foto_url text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;
revoke all on public.perfis from public;
grant select on public.perfis to anon, authenticated;
grant insert, update on public.perfis to authenticated;

drop policy if exists perfis_leitura_publica on public.perfis;
create policy perfis_leitura_publica
  on public.perfis for select to anon, authenticated
  using (true);

drop policy if exists perfis_insercao_propria on public.perfis;
create policy perfis_insercao_propria
  on public.perfis for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists perfis_edicao_propria on public.perfis;
create policy perfis_edicao_propria
  on public.perfis for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function public.criar_perfil_apos_cadastro()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome_exibicao, escola)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''), 'Membro da comunidade'),
    nullif(btrim(new.raw_user_meta_data ->> 'escola'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_public_profile on auth.users;
create trigger on_auth_user_created_public_profile
  after insert on auth.users
  for each row execute procedure public.criar_perfil_apos_cadastro();

-- O trigger continua usando a função, mas ela não é uma RPC pública do app.
revoke all on function public.criar_perfil_apos_cadastro() from public, anon, authenticated;

-- Garante perfil para contas que já existiam antes desta migração.
insert into public.perfis (id, nome_exibicao, escola)
select
  u.id,
  coalesce(nullif(btrim(u.raw_user_meta_data ->> 'nome'), ''), 'Membro da comunidade'),
  nullif(btrim(u.raw_user_meta_data ->> 'escola'), '')
from auth.users u
on conflict (id) do nothing;

-- Um doador ativo tem ao menos uma doação disponível. O total conta
-- materiais de doação marcados como concluídos.
create or replace function public.estatisticas_perfil_publico(p_usuario_id uuid)
returns table (doador_ativo boolean, total_doacoes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.materiais m
      where m.usuario_id = p_usuario_id
        and m.modalidade = 'Doação'
        and m.status = 'Disponível'
        and m.ativo = true
    ),
    count(*) filter (
      where m.modalidade = 'Doação'
        and m.status = 'Concluído'
    )
  from public.materiais m
  where m.usuario_id = p_usuario_id;
$$;

revoke all on function public.estatisticas_perfil_publico(uuid) from public;
grant execute on function public.estatisticas_perfil_publico(uuid) to anon, authenticated;

-- Fotos públicas para visualização; cada usuário só envia/remove arquivos na
-- própria pasta, cujo primeiro segmento é o UUID da conta.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('perfis-fotos', 'perfis-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists perfis_fotos_inserir_pasta_propria on storage.objects;
create policy perfis_fotos_inserir_pasta_propria
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'perfis-fotos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists perfis_fotos_remover_pasta_propria on storage.objects;
create policy perfis_fotos_remover_pasta_propria
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'perfis-fotos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
