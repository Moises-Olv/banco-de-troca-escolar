"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface BuscaCatalogoProps {
  valorBusca: string;
  aoMudarBusca: (valor: string) => void;
  aoLimparBusca: () => void;
  placeholder?: string;
}

export default function BuscaCatalogo({
  valorBusca,
  aoMudarBusca,
  aoLimparBusca,
  placeholder = "Buscar por título, matéria ou palavras-chave...",
}: BuscaCatalogoProps) {
  return (
    <div className="relative w-full">
      <label htmlFor="campo-busca" className="sr-only">
        Buscar materiais
      </label>
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#5f5c6e]">
        <Search className="h-5 w-5" />
      </div>
      <input
        id="campo-busca"
        type="text"
        value={valorBusca}
        onChange={(e) => aoMudarBusca(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3.5 rounded-full border border-[#130e30] bg-[#ffffff] text-[#130e30] placeholder-[#5f5c6e] text-sm sm:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#130e30] transition-all"
      />
      {valorBusca && (
        <button
          type="button"
          onClick={aoLimparBusca}
          className="absolute inset-y-0 right-0 inline-flex h-full min-h-11 w-11 items-center justify-center rounded-full text-[#5f5c6e] hover:text-[#130e30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#130e30]"
          aria-label="Limpar campo de busca"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
