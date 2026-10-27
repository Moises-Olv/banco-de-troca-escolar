-- Execute somente depois de criar uma conta no site e confirmar o e-mail.
-- Substitua o marcador abaixo pelo e-mail confirmado da SUA conta desta instalação.
-- Não use nem publique o e-mail de outra pessoa.

do $$
declare
  v_usuario_id uuid;
  v_email_admin text := 'SUBSTITUA_PELO_EMAIL_CONFIRMADO_DO_ADMIN';
begin
  if v_email_admin = 'SUBSTITUA_PELO_EMAIL_CONFIRMADO_DO_ADMIN' then
    raise exception 'Edite v_email_admin com o e-mail confirmado da sua conta antes de executar.';
  end if;

  select u.id into v_usuario_id
  from auth.users u
  where lower(u.email) = lower(v_email_admin)
    and u.email_confirmed_at is not null
  order by u.created_at
  limit 1;

  if v_usuario_id is null then
    raise exception 'Não achei uma conta com esse e-mail confirmado. Cadastre-se, confirme o e-mail e tente novamente.';
  end if;

  insert into private.administradores (usuario_id)
  values (v_usuario_id)
  on conflict (usuario_id) do nothing;
end;
$$;
