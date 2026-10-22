"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, KeyRound, LoaderCircle, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PaginaRedefinirSenha() {
  const supabase = useMemo(() => createClient(), []);
  const [verificando, setVerificando] = useState(true);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    let ativo = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSessaoValida(Boolean(data.session));
      setVerificando(false);
    });
    return () => { ativo = false; };
  }, [supabase]);

  const salvarSenha = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErro("");
    if (senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (senha !== confirmacao) { setErro("As senhas não são iguais."); return; }

    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) { setErro("Não foi possível atualizar a senha. Solicite um novo link de recuperação e tente novamente."); return; }
    setSucesso(true);
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <section className="space-y-6 rounded-[24px] border border-[#130e30]/15 bg-[#eff2e5] p-7 sm:p-9">
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#130e30] text-[#ffe228]"><KeyRound className="h-6 w-6" aria-hidden="true" /></div>
          <h1 className="font-serif text-3xl font-bold text-[#130e30]">Redefinir senha</h1>
          <p className="text-sm text-[#5f5c6e]">Crie uma nova senha para acessar sua conta.</p>
        </header>

        {verificando ? <div className="flex items-center justify-center gap-2 py-5 text-sm text-[#5f5c6e]"><LoaderCircle className="h-4 w-4 animate-spin" />Verificando o link…</div>
          : sucesso ? <div className="space-y-4 text-center" role="status"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" /><h2 className="font-serif text-xl font-bold text-[#130e30]">Senha atualizada</h2><p className="text-sm text-[#5f5c6e]">Agora você já pode entrar com a nova senha.</p><Link href="/entrar" className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#130e30] px-5 py-3 text-sm font-semibold text-white">Ir para o login</Link></div>
            : !sessaoValida ? <div className="space-y-4 text-center"><p className="rounded-2xl border border-[#130e30]/15 bg-white/60 p-4 text-sm leading-relaxed text-[#5f5c6e]">Este link não está mais válido ou já foi usado. Peça uma nova recuperação na página de entrada.</p><Link href="/entrar" className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#130e30] px-5 py-3 text-sm font-semibold text-white">Voltar para entrar</Link></div>
              : <form onSubmit={salvarSenha} className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#130e30]" htmlFor="nova-senha">Nova senha</label>
                <div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f5c6e]" /><input id="nova-senha" type="password" autoComplete="new-password" value={senha} onChange={(evento) => setSenha(evento.target.value)} minLength={6} required className="w-full rounded-full border border-[#130e30]/30 bg-white py-3 pl-11 pr-4 text-sm text-[#130e30] focus:outline-none focus:ring-2 focus:ring-[#130e30]" /></div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#130e30]" htmlFor="confirmar-nova-senha">Confirme a nova senha</label>
                <div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f5c6e]" /><input id="confirmar-nova-senha" type="password" autoComplete="new-password" value={confirmacao} onChange={(evento) => setConfirmacao(evento.target.value)} minLength={6} required className="w-full rounded-full border border-[#130e30]/30 bg-white py-3 pl-11 pr-4 text-sm text-[#130e30] focus:outline-none focus:ring-2 focus:ring-[#130e30]" /></div>
                {erro && <p role="alert" className="flex items-start gap-2 text-sm font-medium text-[#130e30]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{erro}</p>}
                <button type="submit" disabled={salvando} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ffe228] px-5 py-3 text-sm font-bold text-[#130e30] disabled:opacity-60">{salvando && <LoaderCircle className="h-4 w-4 animate-spin" />}{salvando ? "Salvando…" : "Salvar nova senha"}</button>
              </form>}
      </section>
    </main>
  );
}
