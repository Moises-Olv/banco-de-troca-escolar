import React from "react";
import { SearchX, Inbox, PackageOpen } from "lucide-react";

interface EstadoVazioProps {
  titulo?: string;
  descricao?: string;
  tipo?: "busca" | "atividade" | "geral";
  rotuloAcao?: string;
  aoClicarAcao?: () => void;
  iconePersonalizado?: React.ReactNode;
}

export default function EstadoVazio({
  titulo = "Nenhum material encontrado",
  descricao = "Tente ajustar seus termos de pesquisa ou remover alguns filtros aplicados para ver mais resultados.",
  tipo = "busca",
  rotuloAcao,
  aoClicarAcao,
  iconePersonalizado,
}: EstadoVazioProps) {
  const renderIcone = () => {
    if (iconePersonalizado) return iconePersonalizado;
    switch (tipo) {
      case "atividade":
        return <Inbox className="w-10 h-10 text-[#130e30]" />;
      case "geral":
        return <PackageOpen className="w-10 h-10 text-[#130e30]" />;
      case "busca":
      default:
        return <SearchX className="w-10 h-10 text-[#130e30]" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-14 bg-[#eff2e5] rounded-[24px] border border-[#130e30]/15 my-6">
      <div className="w-16 h-16 rounded-full bg-[#f9fbf2] border border-[#130e30]/15 flex items-center justify-center mb-4">
        {renderIcone()}
      </div>
      <h3 className="font-serif font-bold text-2xl text-[#130e30] mb-2">{titulo}</h3>
      <p className="text-sm text-[#5f5c6e] max-w-md leading-relaxed mb-6 font-sans">
        {descricao}
      </p>
      {rotuloAcao && aoClicarAcao && (
        <button
          type="button"
          onClick={aoClicarAcao}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-[#130e30] bg-[#ffe228] hover:bg-[#f6d91d] transition-colors"
        >
          {rotuloAcao}
        </button>
      )}
    </div>
  );
}
