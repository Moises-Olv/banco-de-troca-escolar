"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { Material } from "@/data/materiais";

interface Props {
  materiais: Material[];
}

export default function CarrosselMateriaisDestaque({ materiais }: Props) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (materiais.length < 2 || pausado) return;
    const temporizador = window.setInterval(() => {
      setIndice((atual) => (atual + 1) % materiais.length);
    }, 6000);
    return () => window.clearInterval(temporizador);
  }, [materiais.length, pausado]);

  if (materiais.length === 0) return null;

  const material = materiais[indice % materiais.length];
  const irPara = (proximo: number) => {
    setIndice((proximo + materiais.length) % materiais.length);
  };

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Materiais publicados recentemente"
      className="space-y-4 text-left"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#5f5c6e]">
            Materiais disponíveis
          </p>
          <p className="text-xs text-[#5f5c6e]">
            {indice + 1} de {materiais.length}
          </p>
        </div>
        {materiais.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => irPara(indice - 1)}
              aria-label="Ver material anterior"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#130e30]/20 bg-white text-[#130e30] hover:bg-[#130e30]/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => irPara(indice + 1)}
              aria-label="Ver próximo material"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#130e30]/20 bg-white text-[#130e30] hover:bg-[#130e30]/5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <article
        key={material.id}
        aria-live="polite"
        className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 border-t border-[#130e30]/10 pt-4 sm:grid-cols-[132px_minmax(0,1fr)]"
      >
        {material.imagem ? (
          <img
            src={material.imagem}
            alt={`Foto de ${material.titulo}`}
            className="h-32 w-full rounded-xl bg-[#eff2e5] object-cover sm:h-36"
          />
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl bg-[#eff2e5] text-[#130e30] sm:h-36">
            {material.categoria === "Livro" ? <BookOpen className="h-9 w-9" /> : <Package className="h-9 w-9" />}
          </div>
        )}

        <div className="flex min-w-0 flex-col items-start justify-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
            Disponível para doação
          </span>
          <h3 className="line-clamp-2 font-serif text-base font-bold leading-tight text-[#130e30] sm:text-lg">
            {material.titulo}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-[#5f5c6e]">
            {material.escola}{material.serie ? ` · ${material.serie}` : ""}
          </p>
          <Link
            href={`/materiais/${material.id}`}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#130e30] hover:underline"
          >
            Ver anúncio <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>

      {materiais.length > 1 && (
        <div className="flex justify-center gap-1.5" aria-label="Escolher material">
          {materiais.map((item, posicao) => (
            <button
              key={item.id}
              type="button"
              onClick={() => irPara(posicao)}
              aria-label={`Mostrar material ${posicao + 1}: ${item.titulo}`}
              aria-current={posicao === indice ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${posicao === indice ? "w-6 bg-[#130e30]" : "w-2 bg-[#130e30]/25 hover:bg-[#130e30]/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
