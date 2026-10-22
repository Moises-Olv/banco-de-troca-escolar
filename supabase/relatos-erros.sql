-- Cria o formulário público de relatos de erro e sugestões.
-- Executar no Supabase: SQL Editor > New query > Run.
-- Visitantes podem enviar relatos, mas não podem consultar, alterar ou excluir registros.

begin;

create table if not exists public.relatos_erros (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('Problema técnico', 'Erro no conteúdo', 'Acessibilidade', 'Solicitação de dados pessoais (LGPD)', 'Sugestão', 'Outro')),
  pagina text check (pagina is null or char_length(pagina) <= 500),
  descricao text not null check (char_length(trim(descricao)) between 15 and 3000),
  passos text check (passos is null or char_length(passos) <= 3000),
  email_contato text check (email_contato is null or char_length(email_contato) <= 254),
  status text not null default 'Novo' check (status in ('Novo', 'Em análise', 'Resolvido')),
  criado_em timestamptz not null default now()
);

alter table public.relatos_erros enable row level security;

revoke all privileges on table public.relatos_erros from anon, authenticated;
grant insert (tipo, pagina, descricao, passos, email_contato)
  on table public.relatos_erros to anon, authenticated;

drop policy if exists "Visitantes podem enviar relatos" on public.relatos_erros;
create policy "Visitantes podem enviar relatos"
  on public.relatos_erros
  for insert
  to anon, authenticated
  with check (status = 'Novo');

comment on table public.relatos_erros is
  'Relatos enviados pelo formulário público; a leitura e a moderação são restritas aos responsáveis pelo projeto.';

commit;
