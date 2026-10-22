"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, AlertTriangle, CheckCircle2, ArrowRight, LoaderCircle } from "lucide-react";

export default function PaginaEntrar() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [loginSucesso, setLoginSucesso] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false);
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [erroRecuperacao, setErroRecuperacao] = useState("");
  const [destinoDepoisLogin, setDestinoDepoisLogin] = useState("/minha-atividade");

  useEffect(() => {
    const destino = new URLSearchParams(window.location.search).get("next");
    if (destino?.startsWith("/") && !destino.startsWith("//")) setDestinoDepoisLogin(destino);
  }, []);

  const validar = (): boolean => {
    const novosErros: { email?: string; senha?: string } = {};

    if (!email.trim()) {
      novosErros.email = "Informe o seu endereço de e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = "Informe um e-mail com formato válido (exemplo: usuario@email.com).";
    }

    if (!senha) {
      novosErros.senha = "Informe a sua senha de acesso.";
    } else if (senha.length < 6) {
      novosErros.senha = "A senha deve conter no mínimo 6 caracteres.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validar()) return;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      window.alert(`Não foi possível entrar: ${error.message}`);
      return;
    }

    setLoginSucesso(true);
  } catch {
    window.alert("Não foi possível conectar ao Supabase. Tente novamente.");
  }
};

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailValido) {
      setErros((atuais) => ({ ...atuais, email: "Informe um e-mail com formato válido." }));
      return;
    }

    setEnviandoRecuperacao(true);
    setErroRecuperacao("");
    const destino = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/redefinir-senha")}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: destino });
    setEnviandoRecuperacao(false);
    if (error) {
      setErroRecuperacao("Não foi possível solicitar o link agora. Confira sua conexão e tente novamente.");
      return;
    }
    setRecuperacaoEnviada(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      <div className="bg-[#eff2e5] p-7 sm:p-9 rounded-[24px] border border-[#130e30]/15 space-y-6">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block transition-transform hover:scale-105" title="Início">
            <img
              src="/logos/simbolo-banco-de-troca-escolar.svg"
              alt="Banco de Troca Escolar"
              className="theme-image-light w-14 h-14 mx-auto"
            />
            <img src="/logos/simbolo-banco-de-troca-escolar-dark.svg" alt="" aria-hidden="true" className="theme-image-dark mx-auto h-14 w-14" />
          </Link>
          <h1 className="font-serif font-bold text-3xl text-[#130e30]">{modoRecuperacao ? "Recuperar acesso" : "Entrar na Conta"}</h1>
          <p className="text-xs sm:text-sm text-[#5f5c6e] font-sans">
            {modoRecuperacao ? "Enviaremos por e-mail um link para você criar uma nova senha." : "Acesse para acompanhar seus anúncios de livros e uniformes."}
          </p>
        </div>

        {loginSucesso ? (
          <div className="space-y-4 py-2 text-center font-sans">
            <div className="w-14 h-14 bg-[#ffe228] text-[#130e30] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#130e30]">
              Login realizado com sucesso!
            </h2>
            <p className="text-xs sm:text-sm text-[#5f5c6e] leading-relaxed">
              Você está conectado com o e-mail:{" "}
              <strong className="text-[#130e30]">{email}</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={destinoDepoisLogin}
                className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-[#130e30] hover:bg-[#222222] text-white text-sm font-semibold transition-colors"
              >
                {destinoDepoisLogin === "/minha-atividade" ? "Acessar Minha Atividade" : "Continuar"}
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setLoginSucesso(false);
                  setEmail("");
                  setSenha("");
                }}
                className="text-xs text-[#5f5c6e] hover:text-[#130e30] pt-1 font-medium"
              >
                Tentar outro e-mail
              </button>
            </div>
          </div>
        ) : modoRecuperacao ? (
          recuperacaoEnviada ? (
            <div role="status" className="space-y-4 py-2 text-center font-sans">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe228] text-[#130e30]"><CheckCircle2 className="h-8 w-8" /></div>
              <h2 className="font-serif text-2xl font-bold text-[#130e30]">Confira seu e-mail</h2>
              <p className="text-sm leading-relaxed text-[#5f5c6e]">Se houver uma conta associada a <strong className="text-[#130e30]">{email}</strong>, enviaremos um link para redefinir sua senha. Confira também a caixa de spam.</p>
              <button type="button" onClick={() => { setModoRecuperacao(false); setRecuperacaoEnviada(false); }} className="text-sm font-semibold text-[#130e30] underline underline-offset-4">Voltar para entrar</button>
            </div>
          ) : (
            <form onSubmit={handleRecuperarSenha} noValidate className="space-y-4 font-sans">
              <p className="text-sm leading-relaxed text-[#5f5c6e]">Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um link para criar uma nova senha.</p>
              <label htmlFor="email-recuperacao" className="block text-xs font-bold uppercase tracking-wider text-[#130e30]">E-mail</label>
              <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f5c6e]" /><input id="email-recuperacao" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErros((atuais) => ({ ...atuais, email: undefined })); }} placeholder="exemplo@email.com" required className="w-full rounded-full border border-[#130e30]/30 bg-white py-3 pl-11 pr-4 text-sm text-[#130e30] placeholder-[#5f5c6e] focus:outline-none focus:ring-2 focus:ring-[#130e30]" />
              {erros.email && <p role="alert" className="mt-1.5 text-xs font-bold text-[#130e30]">{erros.email}</p>}</div>
              {erroRecuperacao && <p role="alert" className="flex items-start gap-2 text-sm font-medium text-[#130e30]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{erroRecuperacao}</p>}
              <button type="submit" disabled={enviandoRecuperacao} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ffe228] px-6 py-3.5 text-sm font-bold text-[#130e30] transition-colors hover:bg-[#f6d91d] disabled:opacity-60">{enviandoRecuperacao && <LoaderCircle className="h-4 w-4 animate-spin" />}{enviandoRecuperacao ? "Enviando…" : "Enviar link de recuperação"}</button>
              <button type="button" onClick={() => { setModoRecuperacao(false); setErroRecuperacao(""); }} className="w-full py-1 text-sm font-semibold text-[#5f5c6e] hover:text-[#130e30]">Voltar para o login</button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 font-sans">
            {/* Campo E-mail */}
            <div>
              <label
                htmlFor="email-login"
                className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
              >
                E-mail institucional ou pessoal *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f5c6e]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-login"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (erros.email) setErros((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="exemplo@email.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-full border text-sm text-[#130e30] placeholder-[#5f5c6e] bg-white focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                    erros.email ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                  }`}
                />
              </div>
              {erros.email && (
                <p className="text-xs text-[#130e30] font-bold mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.email}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="senha-login"
                className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
              >
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f5c6e]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="senha-login"
                  type="password"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    if (erros.senha) setErros((prev) => ({ ...prev, senha: undefined }));
                  }}
                  placeholder="Sua senha secreta"
                  className={`w-full pl-11 pr-4 py-3 rounded-full border text-sm text-[#130e30] placeholder-[#5f5c6e] bg-white focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                    erros.senha ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                  }`}
                />
              </div>
              {erros.senha && (
                <p className="text-xs text-[#130e30] font-bold mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.senha}
                </p>
              )}
              <div className="text-right">
                <button type="button" onClick={() => { setModoRecuperacao(true); setErros({}); }} className="text-xs font-semibold text-[#130e30] underline underline-offset-4">Esqueci minha senha</button>
              </div>
            </div>

            {/* Botão de Envio (Hi-Yellow CTA) */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#ffe228] hover:bg-[#f6d91d] text-[#130e30] text-sm font-bold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
          </form>
        )}

        {/* Link de alternância para Cadastro */}
        {!modoRecuperacao && <div className="pt-4 border-t border-[#130e30]/10 text-center text-xs text-[#5f5c6e] font-sans">
          Ainda não tem conta no Banco de Troca?{" "}<Link href="/cadastro" className="font-bold text-[#130e30] hover:underline">Cadastre-se gratuitamente</Link>
        </div>}
      </div>
    </div>
  );
}
