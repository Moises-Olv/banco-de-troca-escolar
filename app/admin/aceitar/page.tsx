"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AceitarConviteAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [token, setToken] = useState("");
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
    void supabase.auth.getUser().then(({ data }) => { setAutenticado(Boolean(data.user)); setVerificando(false); });
  }, [supabase]);

  const aceitar = async () => {
    setErro(""); setProcessando(true);
    const { error } = await supabase.rpc("admin_aceitar_convite", { p_token: token });
    setProcessando(false);
    if (error) { setErro(error.message || "Não foi possível aceitar o convite."); return; }
    setSucesso(true); router.refresh();
  };

  const destinoLogin = `/entrar?next=${encodeURIComponent(`/admin/aceitar?token=${token}`)}`;
  const tokenValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);

  return <main className="admin-panel mx-auto max-w-2xl px-4 py-16"><section className="rounded-3xl border border-[#130e30]/15 bg-[#eff2e5] p-7 text-center sm:p-10">
    <ShieldCheck className="mx-auto h-12 w-12 text-[#130e30]" /><h1 className="mt-4 font-serif text-3xl font-bold text-[#130e30]">Convite de administrador</h1>
    {verificando ? <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#5f5c6e]"><LoaderCircle className="h-4 w-4 animate-spin" />Verificando a conta...</p>
    : sucesso ? <><CheckCircle2 className="mx-auto mt-5 h-10 w-10 text-emerald-700" /><p className="mt-3 text-sm text-[#5f5c6e]">Convite aceito. Sua conta agora pode acessar e administrar o painel.</p><Link href="/admin" className="mt-6 inline-flex rounded-full bg-[#130e30] px-6 py-3 font-semibold text-white">Abrir painel administrativo</Link></>
    : !tokenValido ? <p className="mt-4 text-sm text-[#5f5c6e]">Este link está incompleto. Peça à pessoa administradora um novo convite.</p>
    : !autenticado ? <><p className="mt-4 text-sm leading-relaxed text-[#5f5c6e]">Entre na conta que recebeu o convite. O e-mail precisa estar confirmado e corresponder ao endereço convidado.</p><Link href={destinoLogin} className="mt-6 inline-flex rounded-full bg-[#130e30] px-6 py-3 font-semibold text-white">Entrar e continuar</Link></>
    : <><p className="mt-4 text-sm leading-relaxed text-[#5f5c6e]">Ao aceitar, sua conta receberá os mesmos privilégios administrativos de quem enviou o convite.</p><button type="button" onClick={() => void aceitar()} disabled={processando} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#130e30] px-6 py-3 font-semibold text-white disabled:opacity-60">{processando && <LoaderCircle className="h-4 w-4 animate-spin" />}Aceitar convite</button></>}
    {erro && <p role="alert" className="mt-5 flex items-start justify-center gap-2 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erro}</p>}
  </section></main>;
}
