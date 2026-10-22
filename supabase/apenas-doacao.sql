-- Converte os anúncios existentes para doação e impede novos valores de troca.
-- Executar no Supabase: SQL Editor > New query > Run.

begin;

update public.materiais
set modalidade = 'Doação'
where modalidade is distinct from 'Doação';

alter table public.materiais
  drop constraint if exists materiais_modalidade_apenas_doacao_check;

alter table public.materiais
  add constraint materiais_modalidade_apenas_doacao_check
  check (modalidade is not null and modalidade = 'Doação');

commit;
