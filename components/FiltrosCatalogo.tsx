"use client";

import React, { useState } from "react";
import {
  LISTA_ESCOLAS,
  LISTA_CATEGORIAS,
  LISTA_CONDICOES,
  CategoriaMaterial,
  CondicaoMaterial,
} from "@/data/materiais";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

export interface FiltrosEstado {
  escola: string;
  serie: string;
  categoria: CategoriaMaterial | "";
  condicao: CondicaoMaterial | "";
}

interface FiltrosCatalogoProps {
  filtros: FiltrosEstado;
  aoAlterarFiltro: (chave: keyof FiltrosEstado, valor: string) => void;
  aoLimparFiltros: () => void;
  totalResultados: number;
}

export default function FiltrosCatalogo({
  filtros,
  aoAlterarFiltro,
  aoLimparFiltros,
  totalResultados,
}: FiltrosCatalogoProps) {
  const [expandidoMobile, setExpandidoMobile] = useState(false);

  const filtrosAtivos = Object.values(filtros).filter((v) => v !== "").length;

  return (
    <div className="bg-[#eff2e5] rounded-[24px] border border-[#130e30]/15 p-6 sm:p-7">
      {/* Barra de título do filtro */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#130e30] text-[#ffe228] flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <h2 className="font-serif font-bold text-[#130e30] text-xl">Filtros de pesquisa</h2>
          {filtrosAtivos > 0 && (
            <span className="bg-[#ffe228] text-[#130e30] text-xs px-3 py-0.5 rounded-full font-bold">
              {filtrosAtivos} ativo{filtrosAtivos > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filtrosAtivos > 0 && (
            <button
              type="button"
              onClick={aoLimparFiltros}
              className="inline-flex items-center gap-1.5 text-xs text-[#130e30] hover:bg-[#130e30]/10 transition-colors font-medium py-1.5 px-3 rounded-full border border-[#130e30]/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar tudo
            </button>
          )}

          {/* Toggle em dispositivos móveis */}
          <button
            type="button"
            onClick={() => setExpandidoMobile(!expandidoMobile)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#130e30] hover:bg-[#130e30]/10 sm:hidden"
            aria-label={expandidoMobile ? "Recolher filtros" : "Expandir filtros"}
            aria-expanded={expandidoMobile}
            aria-controls="filtros-catalogo"
          >
            {expandidoMobile ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Conteúdo dos Filtros */}
      <div id="filtros-catalogo" className={`mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 ${expandidoMobile ? "block" : "hidden sm:grid"}`}>
        {/* Filtro: Categoria */}
        <div>
          <label htmlFor="filtro-categoria" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
            Categoria
          </label>
          <select
            id="filtro-categoria"
            value={filtros.categoria}
            onChange={(e) => aoAlterarFiltro("categoria", e.target.value)}
            className="w-full rounded-full border border-[#130e30]/30 bg-[#ffffff] px-4 py-3 text-xs text-[#130e30] focus:outline-none focus:ring-2 focus:ring-[#130e30] sm:text-sm"
          >
            <option value="">Todas as categorias</option>
            {LISTA_CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro: Escola */}
        <div>
          <label htmlFor="filtro-escola" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
            Escola
          </label>
          <select
            id="filtro-escola"
            value={filtros.escola}
            onChange={(e) => aoAlterarFiltro("escola", e.target.value)}
            className="w-full rounded-full border border-[#130e30]/30 bg-[#ffffff] px-4 py-3 text-xs text-[#130e30] focus:outline-none focus:ring-2 focus:ring-[#130e30] sm:text-sm"
          >
            <option value="">Todas as escolas</option>
            {LISTA_ESCOLAS.map((escola) => (
              <option key={escola} value={escola}>
                {escola}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro: Série / turma / curso */}
        <div>
          <label htmlFor="filtro-serie" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
            Série / turma / curso
          </label>
          <input
            id="filtro-serie"
            type="search"
            value={filtros.serie}
            onChange={(e) => aoAlterarFiltro("serie", e.target.value)}
            placeholder="Ex.: 3º B, Informática"
            className="w-full rounded-full border border-[#130e30]/30 bg-[#ffffff] px-4 py-3 text-xs text-[#130e30] focus:outline-none focus:ring-2 focus:ring-[#130e30] sm:text-sm"
          />
        </div>

        {/* Filtro: Condição */}
        <div>
          <label htmlFor="filtro-condicao" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
            Condição do Item
          </label>
          <select
            id="filtro-condicao"
            value={filtros.condicao}
            onChange={(e) => aoAlterarFiltro("condicao", e.target.value)}
            className="w-full rounded-full border border-[#130e30]/30 bg-[#ffffff] px-4 py-3 text-xs text-[#130e30] focus:outline-none focus:ring-2 focus:ring-[#130e30] sm:text-sm"
          >
            <option value="">Qualquer estado</option>
            {LISTA_CONDICOES.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador de resultados */}
      <div aria-live="polite" className="mt-5 flex items-center justify-between border-t border-[#130e30]/10 pt-4 font-sans text-xs text-[#5f5c6e]">
        <span>
          Exibindo <strong className="text-[#130e30] font-bold">{totalResultados}</strong> material(is) encontrado(s)
        </span>
        {filtrosAtivos > 0 && (
          <span className="text-[#130e30] font-medium">Filtros aplicados em tempo real</span>
        )}
      </div>
    </div>
  );
}
