-- Executar no Supabase: SQL Editor > New query > Run.
-- Cria o armazenamento público das fotos e permite que cada conta envie/remova
-- arquivos apenas dentro da própria pasta (ID do usuário).

alter table public.materiais
  add column if not exists imagem_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materiais-fotos',
  'materiais-fotos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Conta envia fotos dos próprios anúncios" on storage.objects;
create policy "Conta envia fotos dos próprios anúncios"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'materiais-fotos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Conta remove fotos dos próprios anúncios" on storage.objects;
create policy "Conta remove fotos dos próprios anúncios"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'materiais-fotos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
