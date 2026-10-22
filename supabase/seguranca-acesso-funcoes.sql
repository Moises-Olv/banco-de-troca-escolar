-- Corrige permissões excessivas identificadas pelo Supabase Security Advisor.
-- Executar no SQL Editor depois de administracao.sql e perfis-publicos.sql.
begin;

-- Denúncias exigem sessão; a própria função valida auth.uid().
revoke all on function public.criar_denuncia_anuncio(uuid, text) from public, anon;
grant execute on function public.criar_denuncia_anuncio(uuid, text) to authenticated;

-- Esta rotina é acionada pelo trigger de auth.users, não diretamente via RPC.
revoke all on function public.criar_perfil_apos_cadastro() from public, anon, authenticated;

notify pgrst, 'reload schema';
commit;
