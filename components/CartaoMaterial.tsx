import React from "react";
import Link from "next/link";
import { Material } from "@/data/materiais";
import {
  obterEstiloDoacao,
  obterCorCategoria,
  obterCorCondicao,
  obterCorStatus,
  truncarTexto,
} from "@/lib/formatacao";
import { School, GraduationCap, Calendar, ArrowRight, Book, Shirt, Package } from "lucide-react";
import AvatarUsuario from "@/components/AvatarUsuario";

interface CartaoMaterialProps {
  material: Material;
}

export default function CartaoMaterial({ material }: CartaoMaterialProps) {
  const estiloDoacao = obterEstiloDoacao();
  const estiloCategoria = obterCorCategoria(material.categoria);
  const estiloCondicao = obterCorCondicao(material.condicao);
  const estiloStatus = obterCorStatus(material.status);

  const renderIconeCategoria = () => {
    switch (material.categoria) {
      case "Livro":
        return <Book className="w-3.5 h-3.5" />;
      case "Uniforme":
        return <Shirt className="w-3.5 h-3.5" />;
      default:
        return <Package className="w-3.5 h-3.5" />;
    }
  };

  return (
    <article className="material-card group bg-[#eff2e5] rounded-[24px] border border-[#130e30]/10 p-6 sm:p-7 flex flex-col justify-between hover:border-[#130e30]/30">
      <div>
        {material.imagem && (
          <div className="mb-5 aspect-[4/3] overflow-hidden rounded-2xl border border-[#130e30]/10 bg-white">
            <img
              src={material.imagem}
              alt={`Foto de ${material.titulo}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        )}

        {/* Badges de Topo (Pill Radius 1440px) */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${estiloDoacao.bg} ${estiloDoacao.text} ${estiloDoacao.border}`}
            >
              {estiloDoacao.rotulo}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${estiloCategoria.bg} ${estiloCategoria.text} ${estiloCategoria.border}`}
            >
              {renderIconeCategoria()}
              {material.categoria}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-[#130e30]/10 ${estiloStatus.bg} ${estiloStatus.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${estiloStatus.dot}`} />
            {material.status}
          </span>
        </div>

        {/* Título em Hedvig Letters Serif */}
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#130e30] leading-snug group-hover:opacity-85 transition-opacity line-clamp-2 mb-2">
          {material.titulo}
        </h3>

        {/* Descrição em Inter #5f5c6e */}
        <p className="text-[#5f5c6e] text-sm leading-relaxed line-clamp-2 mb-5 font-sans">
          {truncarTexto(material.descricao, 110)}
        </p>

        {/* Metadados Escola e Série */}
        <div className="space-y-2 border-t border-[#130e30]/10 pt-4 font-sans text-xs text-[#5f5c6e]">
          <div className="flex items-start gap-2">
            <School className="w-4 h-4 text-[#130e30] flex-shrink-0" />
            <span className="min-w-0 break-words font-medium text-[#130e30]">Entrega e retirada: {material.escola}</span>
          </div>
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-[#5f5c6e] flex-shrink-0" />
            <span className="min-w-0 break-words">Série / turma: {material.serie}</span>
          </div>
        </div>
      </div>

      {/* Rodapé do Cartão */}
      <div className="pt-5 mt-5 border-t border-[#130e30]/10 flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-2">
          {material.anunciante.id ? (
            <Link href={`/perfil/${material.anunciante.id}`} className="flex items-center gap-2 min-w-0 rounded-xl hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#130e30]">
              <AvatarUsuario nome={material.anunciante.nomeFicticio} fotoUrl={material.anunciante.fotoUrl} className="h-8 w-8 text-[10px]" />
              <span className="line-clamp-2 min-w-0 break-words text-xs font-semibold text-[#130e30]">{material.anunciante.nomeFicticio}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <AvatarUsuario nome={material.anunciante.nomeFicticio} fotoUrl={material.anunciante.fotoUrl} className="h-8 w-8 text-[10px]" />
              <span className="line-clamp-2 min-w-0 break-words text-xs font-semibold text-[#130e30]">{material.anunciante.nomeFicticio}</span>
            </div>
          )}
          <span className="text-[11px] text-[#5f5c6e] flex items-center gap-1 font-sans">
            <Calendar className="w-3.5 h-3.5" />
            {material.criadoEm}
          </span>
        </div>

        <Link
          href={`/materiais/${material.id}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#130e30] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#222222]"
          aria-label={`Ver detalhes de ${material.titulo}`}
        >
          Ver detalhes
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
