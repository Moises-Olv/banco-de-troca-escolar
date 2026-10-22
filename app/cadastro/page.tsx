"use client";

import { createClient } from "@/lib/supabase/client";
import React, { useState } from "react";
import Link from "next/link";
import { LISTA_ESCOLAS } from "@/data/materiais";
import { UserPlus, Mail, Lock, User, School, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function PaginaCadastro() {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [escola, setEscola] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [concordaTermos, setConcordaTermos] = useState(false);

  const [erros, setErros] = useState<{
    nome?: string;
    email?: string;
    senha?: string;
    confirmarSenha?: string;
    termos?: string;
  }>({});

  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const validar = (): boolean => {
    const novosErros: {
      nome?: string;
      email?: string;
      senha?: string;
      confirmarSenha?: string;
      termos?: string;
    } = {};

    if (!nome.trim()) {
      novosErros.nome = "Informe o nome que deseja exibir no site.";
    } else if (nome.trim().length < 3) {
      novosErros.nome = "O nome deve conter pelo menos 3 caracteres.";
    }

    if (!email.trim()) {
      novosErros.email = "Informe seu endereço de e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = "Informe um e-mail válido (ex: seu.nome@email.com).";
    }

    if (!senha) {
      novosErros.senha = "Crie uma senha de acesso.";
    } else if (senha.length < 6) {
      novosErros.senha = "A senha deve ter no mínimo 6 caracteres.";
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = "Confirme a sua senha.";
    } else if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = "As senhas informadas não coincidem.";
    }

    if (!concordaTermos) {
      novosErros.termos = "Confirme a declaração de maioridade ou responsável e leia os termos e a política de privacidade.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) return;

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            nome: nome.trim(),
            escola,
          },
        },
      });

      if (error) {
        window.alert(`Não foi possível criar a conta: ${error.message}`);
        return;
      }

      setCadastroSucesso(true);
    } catch {
      window.alert("Não foi possível conectar ao Supabase. Tente novamente.");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      <div className="bg-[#eff2e5] p-7 sm:p-9 rounded-[24px] border border-[#130e30]/15 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#130e30] text-[#ffe228] rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#130e30]">Criar Conta Escolar</h1>
          <p className="text-xs sm:text-sm text-[#5f5c6e] font-sans">
            Para pais, responsáveis ou estudantes maiores de idade.
          </p>
        </div>

        {cadastroSucesso ? (
          <div className="space-y-4 py-2 text-center font-sans">
            <div className="w-14 h-14 bg-[#ffe228] text-[#130e30] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#130e30]">
              Confira seu e-mail
            </h2>
            <p className="text-xs sm:text-sm text-[#5f5c6e] leading-relaxed">
              Enviamos um link de confirmação para <strong className="text-[#130e30]">{email}</strong>. Abra o link para ativar sua conta.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/entrar"
                className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-[#130e30] hover:bg-[#222222] text-white text-sm font-semibold transition-colors"
              >
                Publicar material
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/catalogo"
                className="text-xs text-[#5f5c6e] hover:text-[#130e30] font-medium pt-1"
              >
                Explorar catálogo de materiais
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 font-sans">
            {/* Nome Completo */}
            <div>
              <label
                htmlFor="nome-cadastro"
                className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
              >
                Nome para exibição *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f5c6e]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="nome-cadastro"
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (erros.nome) setErros((prev) => ({ ...prev, nome: undefined }));
                  }}
                  placeholder="Ex.: Maria ou Moisés"
                  className={`w-full pl-11 pr-4 py-3 rounded-full border text-sm text-[#130e30] placeholder-[#5f5c6e] bg-white focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                    erros.nome ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                  }`}
                />
              </div>
              {erros.nome && (
                <p className="text-xs text-[#130e30] font-bold mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.nome}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label
                htmlFor="email-cadastro"
                className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
              >
                E-mail para avisos *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f5c6e]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-cadastro"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (erros.email) setErros((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="seu.email@exemplo.com"
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

            {/* Escola Principal de Referência */}
            <div>
              <label
                htmlFor="escola-cadastro"
                className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
              >
                Escola de referência da família (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f5c6e]">
                  <School className="w-4 h-4" />
                </div>
                <select
                  id="escola-cadastro"
                  value={escola}
                  onChange={(e) => setEscola(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-[#130e30]/30 bg-white text-sm text-[#130e30] focus:outline-none focus:ring-2 focus:ring-[#130e30]"
                >
                  <option value="">Selecione sua escola (opcional)</option>
                  {LISTA_ESCOLAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#5f5c6e]">Opcional. Se preenchida, a escola aparecerá no seu perfil público.</p>
            </div>

            {/* Senha e Confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="senha-cadastro"
                  className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
                >
                  Criar senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f5c6e]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="senha-cadastro"
                    type="password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      if (erros.senha) setErros((prev) => ({ ...prev, senha: undefined }));
                    }}
                    placeholder="Mín. 6 dígitos"
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
              </div>

              <div>
                <label
                  htmlFor="conf-senha-cadastro"
                  className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
                >
                  Confirmar senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5f5c6e]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="conf-senha-cadastro"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => {
                      setConfirmarSenha(e.target.value);
                      if (erros.confirmarSenha)
                        setErros((prev) => ({ ...prev, confirmarSenha: undefined }));
                    }}
                    placeholder="Repita a senha"
                    className={`w-full pl-11 pr-4 py-3 rounded-full border text-sm text-[#130e30] placeholder-[#5f5c6e] bg-white focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                      erros.confirmarSenha ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                    }`}
                  />
                </div>
                {erros.confirmarSenha && (
                  <p className="text-xs text-[#130e30] font-bold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {erros.confirmarSenha}
                  </p>
                )}
              </div>
            </div>

            {/* Aceite das regras e declaração de responsável/maioridade */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={concordaTermos}
                  onChange={(e) => {
                    setConcordaTermos(e.target.checked);
                    if (erros.termos) setErros((prev) => ({ ...prev, termos: undefined }));
                  }}
                  className="mt-0.5 rounded border-[#130e30]/30 text-[#130e30] focus:ring-[#130e30]"
                />
                <span className="text-xs text-[#5f5c6e] leading-normal">
                  Declaro que sou maior de idade ou responsável legal pelo estudante. Li e concordo com os <Link href="/termos" className="font-semibold text-[#130e30] underline underline-offset-2">Termos de uso</Link> e li a <Link href="/privacidade" className="font-semibold text-[#130e30] underline underline-offset-2">Política de privacidade</Link>.
                </span>
              </label>
              {erros.termos && (
                <p className="text-xs text-[#130e30] font-bold mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.termos}
                </p>
              )}
            </div>

            {/* Botão de Envio (Hi-Yellow CTA) */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#ffe228] hover:bg-[#f6d91d] text-[#130e30] text-sm font-bold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar conta
            </button>
          </form>
        )}

        {/* Link para Login */}
        <div className="pt-4 border-t border-[#130e30]/10 text-center text-xs text-[#5f5c6e] font-sans">
          Já possui conta cadastrada?{" "}
          <Link href="/entrar" className="text-[#130e30] font-bold hover:underline">
            Acesse sua conta
          </Link>
        </div>
      </div>
    </div>
  );
}
