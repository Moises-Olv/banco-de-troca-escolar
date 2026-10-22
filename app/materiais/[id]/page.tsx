"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Material } from "@/data/materiais";
import { createClient } from "@/lib/supabase/client";
import { LinhaMaterialBanco, LinhaMaterialCatalogoBanco, mapearMaterialBanco, mapearMaterialCatalogoBanco } from "@/lib/materiais";
import { buscarPerfisPublicos } from "@/lib/perfis";
import AvatarUsuario from "@/components/AvatarUsuario";
import {
  obterEstiloDoacao,
  obterCorCategoria,
  obterCorCondicao,
  obterCorStatus,
} from "@/lib/formatacao";
import EstadoVazio from "@/components/EstadoVazio";
import {
  ArrowLeft,
  School,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Calendar,
  Send,
  Flag,
  CheckCircle2,
  Book,
  Shirt,
  Package,
} from "lucide-react";

export default function PaginaDetalhesMaterial() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const router = useRouter();

  const [modalInteresseAberto, setModalInteresseAberto] = useState(false);
  const [mensagemInteresse, setMensagemInteresse] = useState("");
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [enviandoInteresse, setEnviandoInteresse] = useState(false);
  const [erroInteresse, setErroInteresse] = useState("");

  const [modalDenunciaAberto, setModalDenunciaAberto] = useState(false);
  const [motivoDenuncia, setMotivoDenuncia] = useState("");
  const [denunciaEnviada, setDenunciaEnviada] = useState(false);
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false);
  const [erroDenuncia, setErroDenuncia] = useState("");

  const [material, setMaterial] = useState<Material | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const buscarMaterial = async () => {
      if (!id) {
        setCarregando(false);
        return;
      }

      const supabase = createClient();
      const resultadoRapido = await supabase
        .from("catalogo_materiais_rapidos")
        .select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo,anunciante_nome,anunciante_foto_url")
        .eq("id", id)
        .maybeSingle();

      if (!ativo) return;

      if (!resultadoRapido.error && resultadoRapido.data) {
        setMaterial(mapearMaterialCatalogoBanco(resultadoRapido.data as LinhaMaterialCatalogoBanco));
        setCarregando(false);
        return;
      }

      // Se o anúncio saiu do catálogo, preserva o acesso do próprio anunciante.
      const { data, error } = await supabase
        .from("materiais")
        .select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo")
        .eq("id", id)
        .maybeSingle();

      if (!ativo) return;

      if (!error && data) {
        const linha = data as LinhaMaterialBanco;
        setMaterial(mapearMaterialBanco(linha));
        setCarregando(false);
        const perfis = await buscarPerfisPublicos(supabase, [linha.usuario_id]);
        if (!ativo) return;
        setMaterial(mapearMaterialBanco(linha, perfis.get(linha.usuario_id)));
      }
      setCarregando(false);
    };

    void buscarMaterial();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <p className="mx-auto max-w-[1000px] px-4 py-12 text-center text-sm text-[#5f5c6e]">
        Carregando anúncio...
      </p>
    );
  }

  if (!material) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EstadoVazio
          tipo="geral"
          titulo="Material não encontrado"
          descricao="O identificador solicitado não corresponde a nenhum item ativo em nossa base."
          rotuloAcao="Voltar ao catálogo de materiais"
          aoClicarAcao={() => {
            window.location.href = "/catalogo";
          }}
        />
      </div>
    );
  }

  const estiloDoacao = obterEstiloDoacao();
  const estiloCategoria = obterCorCategoria(material.categoria);
  const estiloCondicao = obterCorCondicao(material.condicao);
  const estiloStatus = obterCorStatus(material.status);

  const renderIconeCategoria = () => {
    switch (material.categoria) {
      case "Livro":
        return <Book className="w-4 h-4" />;
      case "Uniforme":
        return <Shirt className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleEnviarInteresse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!material) return;

    setErroInteresse("");
    setEnviandoInteresse(true);

    const supabase = createClient();
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      setEnviandoInteresse(false);
      setModalInteresseAberto(false);
      router.push("/entrar");
      return;
    }

    const { error } = await supabase.rpc("criar_pedido_interesse", {
      p_material_id: material.id,
      p_mensagem: mensagemInteresse.trim(),
    });

    setEnviandoInteresse(false);

    if (error) {
      if (error.code === "23505") {
        setErroInteresse("Você já enviou um pedido pendente para este material.");
      } else if (error.code === "PGRST202" || error.message.includes("Could not find the function public.criar_pedido_interesse")) {
        setErroInteresse("O banco ainda não foi atualizado para pedidos. No Supabase, execute o arquivo supabase/fluxo-pedidos-reserva.sql no SQL Editor e atualize esta página.");
      } else {
        setErroInteresse(`Não foi possível enviar o pedido: ${error.message}`);
      }
      return;
    }

    setPedidoEnviado(true);
  };

  const handleEnviarDenuncia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoDenuncia || enviandoDenuncia) return;
    setErroDenuncia("");
    setEnviandoDenuncia(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("criar_denuncia_anuncio", {
      p_material_id: id,
      p_motivo: motivoDenuncia,
    });
    setEnviandoDenuncia(false);
    if (error) {
      setErroDenuncia(error.message.includes("JWT") || error.message.includes("auth") || error.message.includes("Entre na sua conta")
        ? "Entre na sua conta para enviar uma denúncia."
        : error.message);
      return;
    }
    setDenunciaEnviada(true);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Botão Voltar */}
      <div>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#130e30] hover:underline font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o catálogo
        </Link>
      </div>

      {/* Cartão de Detalhes Principal */}
      <div className="bg-[#eff2e5] rounded-[24px] border border-[#130e30]/15 overflow-hidden">
        {/* Faixa de Topo com Badges */}
        <div className="p-6 sm:p-8 border-b border-[#130e30]/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold border ${estiloDoacao.bg} ${estiloDoacao.text} ${estiloDoacao.border}`}
            >
              {estiloDoacao.rotulo}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-medium border ${estiloCategoria.bg} ${estiloCategoria.text} ${estiloCategoria.border}`}
            >
              {renderIconeCategoria()}
              {material.categoria}
            </span>

            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ffffff] border border-[#130e30]/15 text-[#5f5c6e]"
            >
              Condição: {material.condicao}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#130e30]/10 ${estiloStatus.bg} ${estiloStatus.text}`}
          >
            <span className={`w-2 h-2 rounded-full ${estiloStatus.dot}`} />
            Status: {material.status}
          </span>
        </div>

        {/* Corpo dos Detalhes */}
        <div className="p-6 sm:p-8 space-y-8">
          {material.imagem && (
            <img
              src={material.imagem}
              alt={`Foto de ${material.titulo}`}
              className="max-h-[520px] w-full rounded-[24px] border border-[#130e30]/10 bg-white object-contain"
            />
          )}

          <div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#130e30] leading-tight tracking-tight">
              {material.titulo}
            </h1>
            <p className="text-xs text-[#5f5c6e] mt-2 flex items-center gap-1.5 font-sans">
              <Calendar className="w-3.5 h-3.5" />
              Publicado em {material.criadoEm}
            </p>
          </div>

          {/* Grid de Informações Escolares */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-[24px] bg-[#ffffff] border border-[#130e30]/15 text-sm font-sans">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#eff2e5] text-[#130e30] rounded-full">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-[#5f5c6e] uppercase tracking-wider">
                  Ponto de entrega e retirada
                </span>
                <span className="font-bold text-[#130e30]">{material.escola}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#eff2e5] text-[#130e30] rounded-full">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-[#5f5c6e] uppercase tracking-wider">
                  Série / turma / curso
                </span>
                <span className="font-bold text-[#130e30]">{material.serie}</span>
              </div>
            </div>

          </div>

          {/* Descrição Completa */}
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-[#130e30]">Descrição do Material</h2>
            <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#130e30]/10 text-[#130e30] text-sm sm:text-base leading-relaxed font-sans">
              {material.descricao}
            </div>
          </div>

          {/* Orientação sobre contato e local de entrega */}
          <div className="p-5 rounded-[24px] bg-[#f9fbf2] border border-[#130e30]/15 text-xs sm:text-sm text-[#130e30] flex items-start gap-3.5 font-sans">
            <ShieldCheck className="w-5 h-5 text-[#130e30] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[#130e30]">Combine a entrega com cuidado</p>
              <p className="leading-relaxed text-[#5f5c6e]">
                O anúncio não tem campos próprios de telefone, e-mail ou endereço residencial. Como a descrição e as fotos são públicas, não inclua esses dados nelas. Combine a entrega na escola indicada e respeite as regras de acesso da unidade.
              </p>
            </div>
          </div>

          {/* Bloco de Ações (Hi-Yellow CTA + Dark Pill) */}
          <div className="pt-6 border-t border-[#130e30]/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
            {material.anunciante.id ? (
              <Link href={`/perfil/${material.anunciante.id}`} className="inline-flex items-center gap-3 rounded-2xl p-2 -ml-2 hover:bg-[#130e30]/5 focus:outline-none focus:ring-2 focus:ring-[#130e30]">
                <AvatarUsuario nome={material.anunciante.nomeFicticio} fotoUrl={material.anunciante.fotoUrl} className="h-11 w-11" />
                <span className="text-left text-xs text-[#5f5c6e]">
                  Anunciante responsável
                  <strong className="block text-sm text-[#130e30]">{material.anunciante.nomeFicticio}</strong>
                  <span className="text-[#130e30] underline">Ver perfil</span>
                </span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-3 text-xs text-[#5f5c6e]">
                <AvatarUsuario nome={material.anunciante.nomeFicticio} fotoUrl={material.anunciante.fotoUrl} className="h-11 w-11" />
                <span>Anunciante responsável<strong className="block text-sm text-[#130e30]">{material.anunciante.nomeFicticio}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setModalDenunciaAberto(true)}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-[#130e30]/20 text-[#130e30] hover:bg-[#130e30]/5 text-xs font-semibold transition-colors"
                title="Denunciar anúncio impróprio"
              >
                <Flag className="w-3.5 h-3.5" />
                Denunciar
              </button>

              <button
                type="button"
                disabled={material.status !== "Disponível"}
                onClick={() => setModalInteresseAberto(true)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all ${
                  material.status === "Disponível"
                    ? "bg-[#ffe228] hover:bg-[#f6d91d] text-[#130e30] cursor-pointer"
                    : "bg-[#eff2e5] border border-[#130e30]/20 text-[#5f5c6e] cursor-not-allowed"
                }`}
              >
                <HeartHandshake className="w-5 h-5" />
                {material.status === "Disponível" ? "Tenho interesse" : "Item indisponível"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Painel: Demonstrar Interesse */}
      {modalInteresseAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#130e30]/60 backdrop-blur-xs p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-interesse" className="bg-[#eff2e5] rounded-[24px] max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#130e30]">
            {!pedidoEnviado ? (
              <form onSubmit={handleEnviarInteresse} className="space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  <h3 id="titulo-modal-interesse" className="font-serif text-2xl font-bold text-[#130e30]">
                    Demonstrar Interesse no Material
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalInteresseAberto(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#5f5c6e] hover:bg-white hover:text-[#130e30]"
                    aria-label="Fechar janela de interesse"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-[#5f5c6e]">
                  Você está demonstrando interesse em:{" "}
                  <strong className="text-[#130e30]">{material.titulo}</strong>
                </p>

                {erroInteresse && (
                  <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-900">
                    {erroInteresse}
                  </p>
                )}

                <div>
                  <label
                    htmlFor="mensagem-interesse"
                    className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2"
                  >
                    Mensagem ao anunciante (opcional)
                  </label>
                  <textarea
                    id="mensagem-interesse"
                    rows={3}
                    value={mensagemInteresse}
                    onChange={(e) => setMensagemInteresse(e.target.value)}
                    maxLength={1000}
                    placeholder="Ex: Olá! Meu filho estuda no mesmo colégio e temos interesse neste livro..."
                    className="w-full px-4 py-3 rounded-[24px] border border-[#130e30]/30 text-sm text-[#130e30] bg-white focus:outline-none focus:ring-2 focus:ring-[#130e30]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalInteresseAberto(false)}
                    className="px-5 py-2.5 rounded-full text-[#130e30] hover:bg-[#130e30]/5 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoInteresse}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#ffe228] hover:bg-[#f6d91d] disabled:opacity-60 text-[#130e30] text-sm font-bold"
                  >
                    <Send className="w-4 h-4" />
                    {enviandoInteresse ? "Enviando..." : "Enviar pedido"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4 py-3 font-sans">
                <div className="w-14 h-14 bg-[#ffe228] text-[#130e30] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#130e30]">
                  Pedido enviado com sucesso!
                </h3>
                <p className="text-sm text-[#5f5c6e] leading-relaxed">
                  O responsável <strong className="text-[#130e30]">{material.anunciante.nomeFicticio}</strong> receberá o pedido em Minha atividade. Se reservar o material, você poderá confirmar o recebimento com um código no encontro.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    href="/minha-atividade"
                    className="px-6 py-3 bg-[#130e30] text-white text-sm font-semibold rounded-full hover:bg-[#222222]"
                  >
                    Ver em Minha Atividade
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setPedidoEnviado(false);
                      setModalInteresseAberto(false);
                      setMensagemInteresse("");
                    }}
                    className="px-6 py-3 border border-[#130e30] text-[#130e30] text-sm font-medium rounded-full hover:bg-[#130e30]/5"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Denúncia de Anúncio (UC09 / RF10) */}
      {modalDenunciaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#130e30]/60 backdrop-blur-xs p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-denuncia" className="bg-[#eff2e5] rounded-[24px] max-w-md w-full p-6 sm:p-8 space-y-5 border border-[#130e30]">
            {!denunciaEnviada ? (
              <form onSubmit={handleEnviarDenuncia} className="space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  <h3 id="titulo-modal-denuncia" className="font-serif text-2xl font-bold text-[#130e30] flex items-center gap-2">
                    <Flag className="w-5 h-5 text-[#130e30]" />
                    Denunciar Anúncio
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalDenunciaAberto(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#5f5c6e] hover:bg-white hover:text-[#130e30]"
                    aria-label="Fechar janela de denúncia"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-[#5f5c6e]">
                  Ajude a manter a comunidade do Banco de Troca Escolar segura. Selecione o motivo:
                </p>
                {erroDenuncia && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-900">{erroDenuncia} {erroDenuncia.startsWith("Entre na sua conta") && <Link href="/entrar" className="font-semibold underline">Entrar</Link>}</p>}

                <div className="space-y-2 text-xs">
                  {[
                    "Material comercial ou cobrança indevida",
                    "Dados de contato pessoal expostos no anúncio",
                    "Conteúdo impróprio ou ofensivo",
                    "Informações incorretas sobre escola ou item",
                  ].map((motivo) => (
                    <label
                      key={motivo}
                      className="flex items-center gap-2.5 p-3 rounded-full bg-white border border-[#130e30]/20 hover:bg-[#f9fbf2] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="motivo"
                        value={motivo}
                        checked={motivoDenuncia === motivo}
                        onChange={(e) => setMotivoDenuncia(e.target.value)}
                        className="text-[#130e30] focus:ring-[#130e30]"
                      />
                      <span className="text-[#130e30] font-medium">{motivo}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalDenunciaAberto(false)}
                    className="px-5 py-2.5 rounded-full text-[#130e30] hover:bg-[#130e30]/5 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!motivoDenuncia || enviandoDenuncia}
                    className="px-6 py-2.5 rounded-full bg-[#130e30] hover:bg-[#222222] disabled:opacity-40 text-white text-sm font-semibold"
                  >
                    {enviandoDenuncia ? "Enviando..." : "Enviar denúncia"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4 py-2 font-sans">
                <div className="w-14 h-14 bg-[#ffe228] text-[#130e30] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#130e30]">
                  Denúncia registrada para análise
                </h3>
                <p className="text-xs text-[#5f5c6e] leading-relaxed">
                  Administradores e moderadores analisarão a denúncia para retirar anúncios inadequados do catálogo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDenunciaEnviada(false);
                    setModalDenunciaAberto(false);
                    setMotivoDenuncia("");
                  }}
                  className="px-6 py-2.5 bg-[#130e30] text-white text-sm font-semibold rounded-full hover:bg-[#222222]"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
