import React from "react";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, School } from "lucide-react";

export default function Rodape() {
  return (
    <footer className="mt-auto bg-[#eff2e5] text-[#130e30] border-t border-[#130e30]/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 mb-12 text-center md:grid-cols-5 md:text-left">
          {/* Coluna 1: Sobre e Logo Oficial */}
          <div className="flex flex-col items-center space-y-4 md:col-span-2 md:items-start">
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-90"
              title="Banco de Troca Escolar"
            >
              <img
                src="/logos/logo-banco-de-troca-escolar.svg"
                alt="Banco de Troca Escolar"
                className="theme-image-light h-10 sm:h-12 w-auto"
              />
              <img src="/logos/logo-banco-de-troca-escolar-dark.svg" alt="" aria-hidden="true" className="theme-image-dark h-10 sm:h-12 w-auto" />
            </Link>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-[#5f5c6e] font-sans md:mx-0">
              Plataforma para conectar estudantes e famílias e facilitar a doação de livros didáticos, uniformes e outros materiais escolares.
            </p>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#130e30]/15 bg-[#f9fbf2] px-4 py-2 text-left text-xs text-[#130e30]">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              <span>O e-mail de acesso não aparece no perfil público.</span>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-[#130e30] mb-4">
              Navegação
            </h3>
            <ul className="flex flex-col items-center space-y-2.5 text-sm font-sans text-[#5f5c6e] md:items-start">
              <li>
                <Link href="/" className="hover:text-[#130e30] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-[#130e30] transition-colors">
                  Catálogo de materiais
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-[#130e30] transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/sobre#reportar-problema" className="hover:text-[#130e30] transition-colors">
                  Relatar um problema
                </Link>
              </li>
              <li>
                <Link href="/publicar" className="hover:text-[#130e30] transition-colors">
                  Publicar material
                </Link>
              </li>
              <li>
                <Link href="/minha-atividade" className="hover:text-[#130e30] transition-colors">
                  Minha atividade
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Acesso */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-[#130e30] mb-4">
              Conta
            </h3>
            <ul className="flex flex-col items-center space-y-2.5 text-sm font-sans text-[#5f5c6e] md:items-start">
              <li>
                <Link href="/entrar" className="hover:text-[#130e30] transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-[#130e30] transition-colors">
                  Criar conta
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-[#130e30] mb-4">
              Informações legais
            </h3>
            <ul className="flex flex-col items-center space-y-2.5 text-sm font-sans text-[#5f5c6e] md:items-start">
              <li><Link href="/privacidade" className="hover:text-[#130e30] transition-colors">Política de privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-[#130e30] transition-colors">Termos de uso</Link></li>
            </ul>
          </div>
        </div>

        {/* Linha Inferior */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#130e30]/10 pt-8 text-center text-xs font-sans text-[#5f5c6e] sm:flex-row">
          <p className="w-full min-w-0 break-words leading-relaxed sm:w-auto sm:flex-1 sm:text-left">
            © {new Date().getFullYear()} Banco de Troca Escolar.
            <span className="mx-auto mt-1 block max-w-3xl break-words sm:mx-0">
              Desenvolvido por Moisés Claudino Oliveira — 3º ano B do curso Técnico em Informática, IFRO Campus Porto Velho Calama — Turma 2026.
            </span>
          </p>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5 text-[#130e30]">
              <School className="w-4 h-4" />
              Projeto escolar
            </span>
            <span className="flex items-center gap-1.5 text-[#130e30]">
              <HeartHandshake className="w-4 h-4" />
              Solidariedade & Reuso
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
