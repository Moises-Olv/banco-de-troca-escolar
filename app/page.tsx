import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinhaMaterialBanco, LinhaMaterialCatalogoBanco, mapearMaterialBanco, mapearMaterialCatalogoBanco } from "@/lib/materiais";
import { buscarPerfisPublicos } from "@/lib/perfis";
import CartaoMaterial from "@/components/CartaoMaterial";
import CarrosselMateriaisDestaque from "@/components/CarrosselMateriaisDestaque";
import {
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  School,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

export default async function PaginaInicial() {
  const supabase = await createClient();
  const consultaDestaques = supabase
    .from("catalogo_materiais_rapidos")
    .select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo,anunciante_nome,anunciante_foto_url")
    .order("criado_em", { ascending: false })
    .limit(4);
  const [resultadoRapido, respostaMetricas] = await Promise.all([
    consultaDestaques,
    supabase.rpc("estatisticas_comunidade"),
  ]);
  const dadosMetricas = Array.isArray(respostaMetricas.data) ? respostaMetricas.data[0] : respostaMetricas.data;
  let erroCarregamento = resultadoRapido.error;
  let materiaisDestaque = (resultadoRapido.data ?? []).map((linha) =>
    mapearMaterialCatalogoBanco(linha as LinhaMaterialCatalogoBanco)
  );

  // Mantém a página funcionando com a consulta anterior caso a view ainda
  // não tenha sido criada no Supabase.
  if (resultadoRapido.error) {
    const resultadoAnterior = await supabase
      .from("materiais")
      .select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo")
      .eq("status", "Disponível")
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .limit(4);
    erroCarregamento = resultadoAnterior.error;
    const linhas = (resultadoAnterior.data ?? []) as LinhaMaterialBanco[];
    const perfis = await buscarPerfisPublicos(supabase, linhas.map((linha) => linha.usuario_id));
    materiaisDestaque = linhas.map((linha) => mapearMaterialBanco(linha, perfis.get(linha.usuario_id)));
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section com Formas Orgânicas Florais (Ditto Inspired) */}
      <section className="relative overflow-hidden pt-4 pb-12 sm:pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Coluna Esquerda: Título, Proposta e Botões */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eff2e5] border border-[#130e30]/15 text-[#130e30] text-xs font-sans font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#130e30]" />
                Iniciativa Escolar Solidária
              </div>

              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#130e30] leading-[1.05] tracking-tight">
                Dê uma nova vida aos materiais escolares.
              </h1>

              <p className="font-sans text-[#5f5c6e] text-base sm:text-lg leading-relaxed max-w-xl">
                Conectamos estudantes e famílias para facilitar a doação de livros didáticos, uniformes e artigos escolares por escola e série. Todas as doações são gratuitas: não há venda nem troca.
              </p>

              {/* Botões de Ação: Hi-Yellow + Dark Pill */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#ffe228] hover:bg-[#f6d91d] text-[#130e30] font-sans font-bold text-base transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Ver materiais disponíveis
                </Link>

                <Link
                  href="/publicar"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#130e30] hover:bg-[#222222] text-white font-sans font-medium text-base transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Anunciar material
                </Link>
              </div>

              {/* Micro-destaques informativos */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#5f5c6e] font-sans">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#130e30]" />
                  <span>E-mail não exibido no perfil público</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-[#130e30]" />
                  <span>Filtro por colégio e série</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#130e30]" />
                  <span>Doações sem cobrança pelo site</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Destaque visual e logo oficial */}
            <div className="lg:col-span-6 relative flex items-center justify-center">

              {/* Container Flutuante de Apresentação (Hero Card) */}
              <div className="relative z-10 w-full max-w-lg bg-[#ffffff] rounded-[24px] border border-[#130e30] p-6 sm:p-7 shadow-none space-y-4">
                <div className="flex items-center justify-between border-b border-[#130e30]/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logos/simbolo-banco-de-troca-escolar.svg"
                      alt="Símbolo oficial do Banco de Troca Escolar"
                      className="theme-image-light w-7 h-7"
                    />
                    <img src="/logos/simbolo-banco-de-troca-escolar-dark.svg" alt="" aria-hidden="true" className="theme-image-dark w-7 h-7" />
                    <span className="font-serif font-bold text-sm text-[#130e30]">
                      Banco de Troca Escolar
                    </span>
                  </div>
                  <span className="text-[11px] font-sans font-bold px-3 py-0.5 rounded-full bg-[#ffe228] text-[#130e30]">
                    Comunidade
                  </span>
                </div>

                {erroCarregamento ? (
                  <div className="space-y-3 py-6 text-center">
                    <HeartHandshake className="w-8 h-8 mx-auto text-[#130e30]" />
                    <h3 className="font-serif font-bold text-xl text-[#130e30]">
                      Catálogo indisponível
                    </h3>
                    <p className="text-sm text-[#5f5c6e] font-sans">
                      Não foi possível carregar os anúncios agora. Tente novamente em instantes.
                    </p>
                  </div>
                ) : materiaisDestaque.length > 0 ? (
                  <CarrosselMateriaisDestaque materiais={materiaisDestaque} />
                ) : (
                  <div className="space-y-3 py-6 text-center">
                    <HeartHandshake className="w-8 h-8 mx-auto text-[#130e30]" />
                    <h3 className="font-serif font-bold text-xl text-[#130e30]">
                      Anúncios da comunidade
                    </h3>
                    <p className="text-sm text-[#5f5c6e] font-sans">
                      Ainda não há materiais disponíveis. Seja o primeiro a anunciar.
                    </p>
                    <Link
                      href="/publicar"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#130e30] text-white hover:bg-[#222222] font-semibold text-sm transition-colors"
                    >
                      Anunciar material
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {dadosMetricas && (
        <section aria-labelledby="titulo-impacto" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[#130e30]/15 bg-[#f9fbf2] p-5 sm:p-8 lg:p-10">
            <div className="mb-6 max-w-2xl sm:mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ffe228] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#130e30]">
                <HeartHandshake className="h-3.5 w-3.5" />
                Impacto da comunidade
              </span>
              <h2 id="titulo-impacto" className="mt-4 font-serif text-2xl font-bold leading-tight text-[#130e30] sm:text-3xl">
                Materiais circulando, novas oportunidades surgindo.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5f5c6e] sm:text-base">
                Cada doação ajuda estudantes e famílias a encontrar os materiais de que precisam. Veja o movimento por aqui:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              <article className="rounded-2xl border border-[#130e30]/10 bg-[#eff2e5] p-4 sm:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe228] text-[#130e30] sm:h-11 sm:w-11">
                  <School className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#5f5c6e] sm:text-sm">Disponíveis para doação</p>
                <p className="mt-1 font-serif text-3xl font-bold leading-none text-[#130e30] sm:text-4xl">{dadosMetricas.materiais_disponiveis}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#5f5c6e] sm:text-sm">Materiais prontos para encontrar um novo estudante.</p>
              </article>

              <article className="rounded-2xl border border-[#130e30]/10 bg-[#eff2e5] p-4 sm:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#130e30] text-[#ffe228] sm:h-11 sm:w-11">
                  <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#5f5c6e] sm:text-sm">Doações concluídas</p>
                <p className="mt-1 font-serif text-3xl font-bold leading-none text-[#130e30] sm:text-4xl">{dadosMetricas.doacoes_concluidas}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#5f5c6e] sm:text-sm">Itens que já chegaram a quem precisava.</p>
              </article>
            </div>
          </div>
        </section>
      )}

      {/* Como funcionam as doações */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#130e30]">
            Passo a Passo
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#130e30]">
            Como funciona a doação?
          </h2>
          <p className="text-[#5f5c6e] text-sm sm:text-base font-sans">
            Em três etapas simples você encontra o que precisa ou ajuda outra família da mesma escola.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-[#eff2e5] p-7 sm:p-8 rounded-[24px] border border-[#130e30]/15 space-y-4">
            <div className="w-12 h-12 bg-[#130e30] text-[#ffe228] rounded-full flex items-center justify-center font-bold text-lg font-sans">
              1
            </div>
            <h3 className="font-serif font-bold text-xl text-[#130e30]">Encontre por escola e série</h3>
            <p className="text-[#5f5c6e] text-sm leading-relaxed font-sans">
              Consulte livros do ano letivo correto e uniformes da escola do seu filho no catálogo com busca e filtros por categoria e escola.
            </p>
          </div>

          <div className="bg-[#eff2e5] p-7 sm:p-8 rounded-[24px] border border-[#130e30]/15 space-y-4">
            <div className="w-12 h-12 bg-[#130e30] text-[#ffe228] rounded-full flex items-center justify-center font-bold text-lg font-sans">
              2
            </div>
            <h3 className="font-serif font-bold text-xl text-[#130e30]">Acompanhe o pedido</h3>
            <p className="text-[#5f5c6e] text-sm leading-relaxed font-sans">
              Envie um pedido ao responsável pelo anúncio dentro da plataforma, sem expor número de telefone ou endereço residencial em público.
            </p>
          </div>

          <div className="bg-[#eff2e5] p-7 sm:p-8 rounded-[24px] border border-[#130e30]/15 space-y-4">
            <div className="w-12 h-12 bg-[#130e30] text-[#ffe228] rounded-full flex items-center justify-center font-bold text-lg font-sans">
              3
            </div>
            <h3 className="font-serif font-bold text-xl text-[#130e30]">Combine a entrega e conclua</h3>
            <p className="text-[#5f5c6e] text-sm leading-relaxed font-sans">
              O site organiza a reserva e a confirmação da entrega na escola indicada. A equipe do projeto não acompanha os encontros presencialmente.
            </p>
          </div>
        </div>
      </section>

      {/* Vitrine de Materiais Recentes */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#130e30]">
              Vitrine de Materiais
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#130e30] mt-1">
              Materiais adicionados recentemente
            </h2>
            <p className="text-[#5f5c6e] text-sm mt-1 font-sans">
              Veja os livros, uniformes e outros materiais anunciados recentemente.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#130e30] hover:underline font-sans"
          >
            Explorar todo o catálogo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {erroCarregamento ? (
          <div role="alert" className="rounded-[24px] border border-red-300 bg-red-50 px-6 py-8 text-center text-sm text-red-900">
            Não foi possível carregar os anúncios agora. Atualize a página para tentar novamente.
          </div>
        ) : materiaisDestaque.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materiaisDestaque.map((material) => (
              <CartaoMaterial key={material.id} material={material} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#130e30]/30 bg-[#eff2e5] px-6 py-10 text-center">
            <p className="font-serif text-xl font-bold text-[#130e30]">
              Ainda não há anúncios publicados.
            </p>
            <p className="mt-2 text-sm text-[#5f5c6e]">
              Publique o primeiro material para iniciar a vitrine.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#130e30] hover:bg-[#222222] text-white font-sans font-medium text-sm transition-colors"
          >
            Ver todos os materiais no catálogo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Chamada para Publicação Solidária */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#eff2e5] rounded-[24px] border border-[#130e30] p-8 sm:p-14 text-[#130e30]">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl leading-tight">
              Tem livros ou uniformes parados em casa?
            </h2>
            <p className="text-[#5f5c6e] text-base leading-relaxed font-sans">
              O que já não serve para a sua família pode fazer toda a diferença para o ano letivo de outro estudante. Crie um anúncio de doação em poucos passos.
            </p>
            <div className="pt-2">
              <Link
                href="/publicar"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#ffe228] hover:bg-[#f6d91d] text-[#130e30] rounded-full font-bold text-sm transition-colors font-sans"
              >
                <PlusCircle className="w-4 h-4" />
                Criar anúncio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
