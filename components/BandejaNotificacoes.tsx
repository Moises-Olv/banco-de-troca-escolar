"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Notificacao = {
  id: string;
  pedido_id: string | null;
  tipo: string;
  titulo: string;
  mensagem: string;
  criada_em: string;
  lida_em: string | null;
};

export default function BandejaNotificacoes({ usuarioId }: { usuarioId: string }) {
  const [aberta, setAberta] = useState(false);
  const [itens, setItens] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const carregar = useCallback(async () => {
    const [lista, contagem] = await Promise.all([
      supabase
        .from("notificacoes")
        .select("id,pedido_id,tipo,titulo,mensagem,criada_em,lida_em")
        .eq("destinatario_id", usuarioId)
        .order("criada_em", { ascending: false })
        .limit(12),
      supabase
        .from("notificacoes")
        .select("id", { count: "exact", head: true })
        .eq("destinatario_id", usuarioId)
        .is("lida_em", null),
    ]);

    const erroConsulta = lista.error ?? contagem.error;
    if (erroConsulta) {
      setErro(erroConsulta.code === "PGRST205" || erroConsulta.code === "42P01"
        ? "Ative as notificações executando supabase/notificacoes.sql no SQL Editor do Supabase."
        : "Não foi possível carregar as notificações. Tente novamente daqui a pouco.");
    } else {
      setErro("");
      setItens((lista.data ?? []) as Notificacao[]);
      setNaoLidas(contagem.count ?? 0);
    }
    setCarregando(false);
  }, [supabase, usuarioId]);

  useEffect(() => {
    void carregar();
    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible") void carregar();
    }, 30_000);
    const aoFocar = () => void carregar();
    document.addEventListener("visibilitychange", aoFocar);
    window.addEventListener("focus", aoFocar);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoFocar);
      window.removeEventListener("focus", aoFocar);
    };
  }, [carregar]);

  const marcarTodasComoLidas = async () => {
    const agora = new Date().toISOString();
    const { error } = await supabase
      .from("notificacoes")
      .update({ lida_em: agora })
      .eq("destinatario_id", usuarioId)
      .is("lida_em", null);
    if (error) return;
    setItens((atuais) => atuais.map((item) => ({ ...item, lida_em: item.lida_em ?? agora })));
    setNaoLidas(0);
  };

  const abrirNotificacao = async (item: Notificacao) => {
    if (!item.lida_em) {
      const agora = new Date().toISOString();
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida_em: agora })
        .eq("id", item.id)
        .eq("destinatario_id", usuarioId)
        .is("lida_em", null);
      if (!error) {
        setItens((atuais) => atuais.map((atual) => atual.id === item.id ? { ...atual, lida_em: agora } : atual));
        setNaoLidas((total) => Math.max(0, total - 1));
      }
    }
    setAberta(false);
    router.push("/minha-atividade");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setAberta((valor) => !valor); void carregar(); }}
        aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : "Notificações"}
        aria-expanded={aberta}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#130e30]/15 bg-[#f9fbf2] text-[#130e30] transition-colors hover:bg-[#eff2e5] focus:outline-none focus:ring-2 focus:ring-[#130e30]"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {naoLidas > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffe228] px-1 text-[10px] font-bold text-[#130e30]">{naoLidas > 9 ? "9+" : naoLidas}</span>}
      </button>

      {aberta && (
        <section aria-label="Notificações recentes" className="absolute right-0 top-full z-[70] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#130e30]/15 bg-[#eff2e5] text-[#130e30] shadow-xl">
          <header className="flex items-center justify-between gap-3 border-b border-[#130e30]/10 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold">Notificações</h2>
              <p className="text-xs text-[#5f5c6e]">{naoLidas ? `${naoLidas} não lida${naoLidas === 1 ? "" : "s"}` : "Tudo em dia"}</p>
            </div>
            {naoLidas > 0 && <button type="button" onClick={() => void marcarTodasComoLidas()} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-white"><CheckCheck className="h-4 w-4" />Marcar lidas</button>}
          </header>
          <div className="max-h-[min(65vh,28rem)] overflow-y-auto">
            {carregando ? <p className="px-4 py-6 text-center text-sm text-[#5f5c6e]">Carregando notificações…</p>
              : erro ? <p role="alert" className="px-4 py-6 text-center text-xs leading-relaxed text-[#5f5c6e]">{erro}</p>
              : itens.length === 0 ? <div className="px-5 py-8 text-center"><Bell className="mx-auto h-6 w-6 text-[#5f5c6e]" /><p className="mt-2 text-sm font-semibold">Nenhuma notificação ainda</p><p className="mt-1 text-xs text-[#5f5c6e]">Avisaremos sobre pedidos e combinações de entrega.</p></div>
                : <ul>{itens.map((item) => <li key={item.id} className="border-b border-[#130e30]/10 last:border-b-0">
                  <button type="button" onClick={() => void abrirNotificacao(item)} className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-white ${item.lida_em ? "opacity-75" : "bg-[#f9fbf2]"}`}>
                    <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.lida_em ? "bg-[#130e30]/10" : "bg-[#ffe228]"}`}>{item.lida_em ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.titulo}</span><span className="mt-0.5 block text-xs leading-relaxed text-[#5f5c6e]">{item.mensagem}</span><time className="mt-1 block text-[10px] text-[#5f5c6e]" dateTime={item.criada_em}>{new Date(item.criada_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</time></span>
                  </button>
                </li>)}</ul>}
          </div>
          <button type="button" onClick={() => { setAberta(false); router.push("/minha-atividade"); }} className="w-full border-t border-[#130e30]/10 px-4 py-3 text-center text-xs font-bold hover:bg-white">Ver minha atividade</button>
        </section>
      )}
    </div>
  );
}
