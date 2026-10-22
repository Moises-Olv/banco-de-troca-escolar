-- Índices para as consultas frequentes do catálogo, perfis e Minha Atividade.
-- Execute no Supabase: SQL Editor > New query > Run.

-- Reúne anúncios disponíveis e dados públicos do anunciante em uma só leitura.
-- security_invoker mantém as políticas RLS das tabelas materiais e perfis.
create or replace view public.catalogo_materiais_rapidos
with (security_invoker = true)
as
select
  m.id,
  m.usuario_id,
  m.titulo,
  m.descricao,
  m.escola,
  m.serie,
  m.categoria,
  m.condicao,
  m.modalidade,
  m.status,
  m.imagem_url,
  m.criado_em,
  m.ativo,
  p.nome_exibicao as anunciante_nome,
  p.foto_url as anunciante_foto_url
from public.materiais m
left join public.perfis p on p.id = m.usuario_id
where m.status = 'Disponível' and m.ativo = true;

grant select on public.catalogo_materiais_rapidos to anon, authenticated;

create index if not exists materiais_catalogo_disponiveis_recentes_idx
  on public.materiais (criado_em desc)
  where status = 'Disponível' and ativo = true;

create index if not exists materiais_usuario_recentes_idx
  on public.materiais (usuario_id, criado_em desc);

notify pgrst, 'reload schema';
