-- Notificações privadas para pedidos, propostas de entrega e confirmações.
-- Executar uma vez no Supabase: SQL Editor > New query > Run.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  destinatario_id uuid not null references auth.users(id) on delete cascade,
  pedido_id uuid references public.pedidos_interesse(id) on delete cascade,
  tipo text not null check (tipo in (
    'pedido_recebido', 'entrega_proposta', 'entrega_confirmada',
    'pedido_recusado', 'pedido_cancelado', 'pedido_encerrado', 'doacao_concluida'
  )),
  titulo text not null,
  mensagem text not null,
  criada_em timestamptz not null default now(),
  lida_em timestamptz
);

create index if not exists notificacoes_destinatario_criada_idx
  on public.notificacoes (destinatario_id, criada_em desc);
create index if not exists notificacoes_nao_lidas_idx
  on public.notificacoes (destinatario_id, criada_em desc)
  where lida_em is null;

alter table public.notificacoes enable row level security;
revoke all on public.notificacoes from public, anon, authenticated;
grant select on public.notificacoes to authenticated;
grant update (lida_em) on public.notificacoes to authenticated;

drop policy if exists notificacoes_leitura_propria on public.notificacoes;
create policy notificacoes_leitura_propria
  on public.notificacoes for select to authenticated
  using (destinatario_id = (select auth.uid()));

drop policy if exists notificacoes_marcar_proprias on public.notificacoes;
create policy notificacoes_marcar_proprias
  on public.notificacoes for update to authenticated
  using (destinatario_id = (select auth.uid()))
  with check (destinatario_id = (select auth.uid()));

create or replace function private.notificar_eventos_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dono_id uuid;
  v_titulo_material text;
  v_data_formatada text;
  v_usuario_ator uuid := (select auth.uid());
begin
  select m.usuario_id, m.titulo
    into v_dono_id, v_titulo_material
  from public.materiais m
  where m.id = new.material_id;

  if v_titulo_material is null then
    v_titulo_material := coalesce(new.material_titulo, 'um material escolar');
  end if;

  if tg_op = 'INSERT' then
    if v_dono_id is not null and v_dono_id <> new.solicitante_id then
      insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
      values (
        v_dono_id, new.id, 'pedido_recebido', 'Novo pedido de doação',
        'Alguém demonstrou interesse em "' || left(v_titulo_material, 120) || '".'
      );
    end if;
    return new;
  end if;

  if new.data_entrega is not null and new.data_entrega is distinct from old.data_entrega then
    v_data_formatada := to_char(new.data_entrega at time zone 'America/Porto_Velho', 'DD/MM/YYYY "às" HH24:MI');
    insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
    values (
      new.solicitante_id, new.id, 'entrega_proposta',
      case when old.data_entrega is null then 'Proposta de entrega recebida' else 'Proposta de entrega atualizada' end,
      'A pessoa doadora propôs ' || v_data_formatada || ' para "' || left(v_titulo_material, 120) || '". Confira em Minha atividade.'
    );
  end if;

  if old.entrega_confirmada_em is null and new.entrega_confirmada_em is not null and v_dono_id is not null then
    insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
    values (
      v_dono_id, new.id, 'entrega_confirmada', 'Data e horário confirmados',
      'A pessoa solicitante confirmou a entrega de "' || left(v_titulo_material, 120) || '".'
    );
  end if;

  if old.status is distinct from new.status then
    if new.status = 'Recusado' then
      insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
      values (new.solicitante_id, new.id, 'pedido_recusado', 'Pedido não aceito', 'O pedido de "' || left(v_titulo_material, 120) || '" não foi aceito. Você pode procurar outro anúncio no catálogo.');
    elsif new.status = 'Encerrado' and old.status = 'Reservado' then
      if v_usuario_ator = new.solicitante_id and v_dono_id is not null then
        insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
        values (v_dono_id, new.id, 'pedido_cancelado', 'Pedido cancelado', 'A pessoa solicitante cancelou o pedido de "' || left(v_titulo_material, 120) || '".');
      elsif v_dono_id is not null then
        insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
        values (new.solicitante_id, new.id, 'pedido_cancelado', 'Reserva cancelada', 'A reserva de "' || left(v_titulo_material, 120) || '" foi cancelada pela pessoa doadora.');
      end if;
    elsif new.status = 'Encerrado' and old.status = 'Pendente' and v_dono_id is not null then
      insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
      values (new.solicitante_id, new.id, 'pedido_encerrado', 'Anúncio já reservado', 'Outro pedido foi atendido para "' || left(v_titulo_material, 120) || '" e este pedido foi encerrado.');
    elsif new.status = 'Concluído' and v_dono_id is not null then
      insert into public.notificacoes (destinatario_id, pedido_id, tipo, titulo, mensagem)
      values (v_dono_id, new.id, 'doacao_concluida', 'Doação concluída', 'O recebimento de "' || left(v_titulo_material, 120) || '" foi confirmado.');
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.notificar_eventos_pedido() from public, anon, authenticated;

drop trigger if exists notificar_novo_pedido on public.pedidos_interesse;
create trigger notificar_novo_pedido
  after insert on public.pedidos_interesse
  for each row execute procedure private.notificar_eventos_pedido();

drop trigger if exists notificar_atualizacao_pedido on public.pedidos_interesse;
create trigger notificar_atualizacao_pedido
  after update on public.pedidos_interesse
  for each row execute procedure private.notificar_eventos_pedido();

notify pgrst, 'reload schema';
commit;
