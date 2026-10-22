-- Permite registrar pedidos de acesso, correção e exclusão no painel administrativo.
-- Execute uma vez no Supabase: SQL Editor > New query > cole este arquivo > Run.

begin;

alter table public.relatos_erros
  drop constraint if exists relatos_erros_tipo_check;

alter table public.relatos_erros
  add constraint relatos_erros_tipo_check
  check (tipo in (
    'Problema técnico',
    'Erro no conteúdo',
    'Acessibilidade',
    'Solicitação de dados pessoais (LGPD)',
    'Sugestão',
    'Outro'
  ));

comment on column public.relatos_erros.tipo is
  'Inclui relatos de manutenção do site e solicitações de titulares sobre seus dados pessoais.';

notify pgrst, 'reload schema';
commit;
