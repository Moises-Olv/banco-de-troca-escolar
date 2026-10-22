"use client";

import React, { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogIn, LogOut, Menu, Moon, PlusCircle, Sun, User, X } from "lucide-react";
import AvatarUsuario from "@/components/AvatarUsuario";
import BandejaNotificacoes from "@/components/BandejaNotificacoes";
import { createClient } from "@/lib/supabase/client";

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
  const [sessaoVerificada, setSessaoVerificada] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [ehAdmin, setEhAdmin] = useState(false);
  const [tema, setTema] = useState<"light" | "dark">("light");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const usuarioConectado = Boolean(usuarioId);

  useEffect(() => {
    try {
      const temaSalvo = window.localStorage.getItem("banco-troca-tema");
      if (temaSalvo === "dark") {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.style.colorScheme = "dark";
        setTema("dark");
      }
    } catch {
      // O tema ainda pode ser alternado mesmo se o navegador bloquear o armazenamento local.
    }
  }, []);

  const alternarTema = (event: React.MouseEvent<HTMLButtonElement>) => {
    const novoTema = tema === "light" ? "dark" : "light";
    const raiz = document.documentElement;
    const aplicarTema = () => {
      raiz.dataset.theme = novoTema;
      raiz.style.colorScheme = novoTema;
      try {
        window.localStorage.setItem("banco-troca-tema", novoTema);
      } catch {
        // A escolha vale até a página ser fechada, mesmo sem armazenamento local.
      }
      setTema(novoTema);
    };

    const documentoComTransicao = document as Document & {
      startViewTransition?: (atualizar: () => void) => { finished: Promise<void> };
    };
    const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (movimentoReduzido || !documentoComTransicao.startViewTransition) {
      aplicarTema();
      return;
    }

    const botao = event.currentTarget.getBoundingClientRect();
    const origemX = botao.left + botao.width / 2;
    const origemY = botao.top + botao.height / 2;
    const raio = Math.ceil(
      Math.hypot(
        Math.max(origemX, window.innerWidth - origemX),
        Math.max(origemY, window.innerHeight - origemY)
      )
    );

    raiz.style.setProperty("--theme-origin-x", `${origemX}px`);
    raiz.style.setProperty("--theme-origin-y", `${origemY}px`);
    raiz.style.setProperty("--theme-reveal-radius", `${raio}px`);

    const limparOrigem = () => {
      raiz.style.removeProperty("--theme-origin-x");
      raiz.style.removeProperty("--theme-origin-y");
      raiz.style.removeProperty("--theme-reveal-radius");
    };

    try {
      const transicao = documentoComTransicao.startViewTransition(() => {
        flushSync(aplicarTema);
      });
      void transicao.finished.then(limparOrigem, limparOrigem);
    } catch {
      limparOrigem();
      aplicarTema();
    }
  };

  const renderBotaoTema = () => (
    <button
      type="button"
      onClick={alternarTema}
      className="theme-toggle"
      aria-label={tema === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
      aria-pressed={tema === "dark"}
      title={tema === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      <span className={`theme-toggle-icons ${tema === "dark" ? "is-dark" : "is-light"}`} aria-hidden="true">
        <Sun className="theme-toggle-sun h-5 w-5" />
        <Moon className="theme-toggle-moon h-5 w-5" />
      </span>
    </button>
  );

  useEffect(() => {
    let ativo = true;
    const atualizarUsuario = (user: { id: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!ativo) return;
      setUsuarioId(user?.id ?? null);
      setNomeUsuario(typeof user?.user_metadata?.nome === "string" ? user.user_metadata.nome : "Membro da comunidade");
      if (!user) setFotoUsuario(null);
      setSessaoVerificada(true);
    };

    void supabase.auth.getUser().then(({ data }) => atualizarUsuario(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      atualizarUsuario(sessao?.user ?? null);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!usuarioId) { setEhAdmin(false); return; }
    let ativo = true;
    void supabase.rpc("admin_eh_usuario").then(({ data, error }) => {
      if (ativo) setEhAdmin(!error && Boolean(data));
    });
    return () => { ativo = false; };
  }, [supabase, usuarioId]);

  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    const carregarPerfil = async () => {
      const { data } = await supabase
        .from("perfis")
        .select("nome_exibicao,foto_url")
        .eq("id", usuarioId)
        .maybeSingle();
      if (!ativo || !data) return;
      setNomeUsuario(data.nome_exibicao || "Membro da comunidade");
      setFotoUsuario(data.foto_url ?? null);
    };
    void carregarPerfil();
    return () => { ativo = false; };
  }, [supabase, usuarioId]);

  useEffect(() => {
    const receberPerfilAtualizado = (evento: Event) => {
      const detalhe = (evento as CustomEvent<{ nome?: string; fotoUrl?: string | null }>).detail;
      if (detalhe?.nome) setNomeUsuario(detalhe.nome);
      if (detalhe && "fotoUrl" in detalhe) setFotoUsuario(detalhe.fotoUrl ?? null);
    };
    window.addEventListener("perfil-atualizado", receberPerfilAtualizado);
    return () => window.removeEventListener("perfil-atualizado", receberPerfilAtualizado);
  }, []);

  useEffect(() => {
    setMenuAberto(false);
    setMenuPerfilAberto(false);
  }, [pathname]);

  const handleSair = async () => {
    setSaindo(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      window.alert(`Não foi possível sair da conta: ${error.message}`);
      setSaindo(false);
      return;
    }
    setUsuarioId(null);
    setNomeUsuario("");
    setFotoUsuario(null);
    setMenuAberto(false);
    setMenuPerfilAberto(false);
    router.replace("/");
    router.refresh();
    setSaindo(false);
  };

  const linksNavegacao = [
    { nome: "Início", href: "/" },
    { nome: "Catálogo", href: "/catalogo" },
    { nome: "Publicar material", href: "/publicar" },
    { nome: "Minha atividade", href: "/minha-atividade" },
    { nome: "Sobre", href: "/sobre" },
  ];

  const estaAtivo = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  const renderMenuPerfil = (menuId: string) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuPerfilAberto((aberto) => !aberto)}
        className="inline-flex items-center gap-2 rounded-full p-1.5 text-[#130e30] hover:bg-[#130e30]/5 focus:outline-none focus:ring-2 focus:ring-[#130e30]"
        aria-label={menuPerfilAberto ? "Fechar menu do perfil" : "Abrir menu do perfil"}
        aria-expanded={menuPerfilAberto}
        aria-controls={menuId}
      >
        <AvatarUsuario nome={nomeUsuario || "Meu perfil"} fotoUrl={fotoUsuario ?? undefined} className="h-10 w-10" />
        <ChevronDown className={`hidden h-4 w-4 sm:block transition-transform ${menuPerfilAberto ? "rotate-180" : ""}`} />
      </button>
      {menuPerfilAberto && (
        <div id={menuId} className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-2xl border border-[#130e30]/15 bg-[#eff2e5] p-2 shadow-xl">
          <div className="border-b border-[#130e30]/10 px-3 py-3">
            <p className="truncate text-sm font-semibold text-[#130e30]">{nomeUsuario || "Membro da comunidade"}</p>
            <p className="text-xs text-[#5f5c6e]">Sua conta</p>
          </div>
          <Link href="/perfil" onClick={() => setMenuPerfilAberto(false)} className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-medium text-[#130e30] hover:bg-white">Perfil</Link>
          <Link href="/minha-atividade" onClick={() => setMenuPerfilAberto(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#130e30] hover:bg-white">Minha atividade</Link>
          {ehAdmin && <Link href="/admin" onClick={() => setMenuPerfilAberto(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[#130e30] hover:bg-white">Painel administrativo</Link>}
          <button type="button" onClick={handleSair} disabled={saindo} className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-[#130e30]/10 px-3 py-3 text-left text-sm font-semibold text-[#130e30] hover:bg-white disabled:opacity-60">
            <LogOut className="h-4 w-4" />{saindo ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#130e30]/10 bg-[#eff2e5]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center rounded-xl py-1 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#130e30]" title="Ir para página inicial do Banco de Troca Escolar">
            <img src="/logos/logo-banco-de-troca-escolar.svg" alt="Banco de Troca Escolar" className="theme-image-light h-10 w-auto sm:h-12" />
            <img src="/logos/logo-banco-de-troca-escolar-dark.svg" alt="" aria-hidden="true" className="theme-image-dark h-10 w-auto sm:h-12" />
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1.5 lg:flex lg:gap-2">
            {linksNavegacao.map((item) => (
              <Link key={item.href} href={item.href} aria-current={estaAtivo(item.href) ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${estaAtivo(item.href) ? "bg-[#130e30] text-white" : "text-[#130e30] hover:bg-[#130e30]/5"}`}>
                {item.nome}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            {renderBotaoTema()}
            {sessaoVerificada && usuarioConectado && <BandejaNotificacoes usuarioId={usuarioId!} />}
            {!sessaoVerificada ? null : usuarioConectado ? renderMenuPerfil("menu-perfil-desktop") : (
              <>
                <Link href="/entrar" className="rounded-full bg-[#130e30] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#222222]">Entrar</Link>
                <Link href="/cadastro" className="rounded-full bg-[#ffe228] px-5 py-2.5 font-sans text-sm font-medium text-[#130e30] transition-colors hover:bg-[#f6d91d]">Criar conta</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {renderBotaoTema()}
            <Link href="/publicar" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ffe228] text-[#130e30]" aria-label="Publicar material"><PlusCircle className="h-5 w-5" /></Link>
            {sessaoVerificada && usuarioConectado && renderMenuPerfil("menu-perfil-mobile")}
            <button type="button" onClick={() => setMenuAberto(!menuAberto)} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#130e30] hover:bg-[#130e30]/5 focus:outline-none focus:ring-2 focus:ring-[#130e30]" aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto} aria-controls="menu-navegacao-mobile">
              {menuAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuAberto && (
        <div id="menu-navegacao-mobile" className="space-y-3 border-t border-[#130e30]/10 bg-[#eff2e5] px-4 pb-6 pt-3 lg:hidden">
          <nav aria-label="Navegação móvel" className="flex flex-col space-y-1">
            {linksNavegacao.map((item) => (
              <Link key={item.href} href={item.href} aria-current={estaAtivo(item.href) ? "page" : undefined} className={`flex min-h-11 items-center justify-between rounded-full px-4 py-3 text-base font-medium ${estaAtivo(item.href) ? "bg-[#130e30] text-white" : "text-[#130e30] hover:bg-[#130e30]/5"}`}>
                <span>{item.nome}</span>
              </Link>
            ))}
          </nav>
          {sessaoVerificada && usuarioConectado && <div className="flex justify-end border-t border-[#130e30]/10 pt-3"><BandejaNotificacoes usuarioId={usuarioId!} /></div>}
          {!sessaoVerificada ? null : !usuarioConectado && (
            <div className="flex flex-col gap-2 border-t border-[#130e30]/10 pt-3">
              <Link href="/entrar" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#130e30] px-4 py-3 text-sm font-medium text-white"><LogIn className="h-4 w-4" />Entrar na conta</Link>
              <Link href="/cadastro" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ffe228] px-4 py-3 text-sm font-medium text-[#130e30]"><User className="h-4 w-4" />Criar conta gratuita</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
