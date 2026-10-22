import type { Metadata } from "next";
import "./globals.css";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import FundoAnimadoDinamico from "@/components/FundoAnimadoDinamico";
import RevelarAoRolar from "@/components/RevelarAoRolar";
import { Hedvig_Letters_Serif, Inter } from "next/font/google";

const fonteInter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const fonteHedvig = Hedvig_Letters_Serif({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-hedvig-letters-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Banco de Troca Escolar | Doação de Livros e Uniformes",
  description:
    "Plataforma solidária para famílias e estudantes doarem e receberem livros didáticos, uniformes e materiais escolares por escola e série.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${fonteInter.variable} ${fonteHedvig.variable} bg-[#f9fbf2] text-[#130e30] antialiased min-h-screen flex flex-col font-sans selection:bg-[#ffe228] selection:text-[#130e30] isolate relative`}>
        <FundoAnimadoDinamico />
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#130e30] focus:px-5 focus:py-3 focus:text-white"
          >
            Pular para o conteúdo principal
          </a>
          <Cabecalho />
          <main id="conteudo" tabIndex={-1} className="w-full flex-1 focus:outline-none">
            <RevelarAoRolar>{children}</RevelarAoRolar>
          </main>
          <Rodape />
        </div>
      </body>
    </html>
  );
}
