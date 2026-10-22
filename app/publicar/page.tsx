import React from "react";
import FormularioMaterial from "@/components/FormularioMaterial";
import { BookOpen, MapPin, ShieldCheck } from "lucide-react";

export default function PaginaPublicarMaterial() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Cabeçalho */}
      <div className="border-b border-[#130e30]/10 pb-6">
        <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#130e30]">
          Anúncio Solidário
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#130e30] mt-1">
          Publicar material para doação
        </h1>
        <p className="text-[#5f5c6e] text-sm mt-1 font-sans">
          Ajude outros alunos e famílias encontrando quem precisa de livros didáticos, peças de uniforme ou artigos escolares.
        </p>
      </div>

      <section aria-labelledby="orientacoes-publicacao" className="rounded-[24px] border border-[#130e30]/15 bg-[#eff2e5] p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe228] text-[#130e30]"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 id="orientacoes-publicacao" className="font-serif text-xl font-bold text-[#130e30] sm:text-2xl">Boas práticas e regras de segurança</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#5f5c6e]">Leia estas orientações antes de preencher e publicar seu anúncio.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 md:gap-8">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#130e30]"><BookOpen className="h-4 w-4" aria-hidden="true" />Boas práticas da comunidade</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-[#5f5c6e]">
              <li>Descreva com sinceridade a condição do item, a edição do livro ou o tamanho do uniforme.</li>
              <li>A doação é gratuita: não anuncie venda, troca ou cobrança.</li>
              <li>Não publique telefone, endereço, documentos ou outros dados pessoais.</li>
            </ul>
          </div>
          <div className="border-t border-[#130e30]/10 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#130e30]"><MapPin className="h-4 w-4" aria-hidden="true" />Regras de segurança</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-[#5f5c6e]">
              <li>Entregue somente dentro da escola selecionada e respeite as regras de acesso da unidade.</li>
              <li>Depois que alguém enviar um pedido, proponha data e horário pelo site; a pessoa interessada confirma ou cancela.</li>
              <li>Use o código somente no encontro, depois de entregar o material. Não o envie antes.</li>
              <li>Estudantes menores de idade devem realizar a retirada com acompanhamento de um responsável.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Componente Reutilizável de Formulário com Prévia */}
      <FormularioMaterial />
    </div>
  );
}
