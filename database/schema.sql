-- Esquema inicial para uma instalação nova do Banco de Troca Escolar.
-- Execute antes dos arquivos de migração de supabase/.
-- O banco pertence ao projeto Supabase; este arquivo não cria um projeto/servidor.
-- Requer PostgreSQL 15 ou posterior (a view de catálogo usa security_invoker).

create table if not exists public.materiais (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) between 5 and 120),
  descricao text not null check (char_length(btrim(descricao)) between 15 and 1500),
  escola text not null check (char_length(btrim(escola)) between 1 and 200),
  serie text not null check (char_length(btrim(serie)) between 1 and 120),
  categoria text not null check (categoria in ('Livro', 'Uniforme', 'Outro material')),
  condicao text not null check (condicao in ('Novo', 'Bom estado', 'Usado')),
  modalidade text not null default 'Doação' check (modalidade = 'Doação'),
  status text not null default 'Disponível'
    check (status in ('Disponível', 'Indisponível', 'Reservado', 'Concluído')),
  imagem_url text,
  criado_em timestamptz not null default now(),
  ativo boolean not null default true,
  removido_por_moderacao boolean not null default false
);

comment on table public.materiais is
  'Anúncios públicos de doação gratuita de materiais escolares.';

create index if not exists materiais_usuario_recentes_idx
  on public.materiais (usuario_id, criado_em desc);
create index if not exists materiais_catalogo_disponiveis_recentes_idx
  on public.materiais (criado_em desc)
  where status = 'Disponível' and ativo = true;

alter table public.materiais enable row level security;
revoke all on table public.materiais from public;
revoke all on table public.materiais from anon, authenticated;
grant select on table public.materiais to anon, authenticated;
grant insert, update, delete on table public.materiais to authenticated;

-- Política permissiva de leitura; a migração atividade.sql acrescenta uma
-- política restritiva equivalente e as regras de escrita do proprietário.
drop policy if exists materiais_publico_ou_proprietario_select on public.materiais;
create policy materiais_publico_ou_proprietario_select
  on public.materiais for select to anon, authenticated
  using (
    (status = 'Disponível' and ativo = true)
    or usuario_id = (select auth.uid())
  );
