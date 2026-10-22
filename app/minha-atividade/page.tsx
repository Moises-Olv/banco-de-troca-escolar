"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Material,
  PedidoInteresse,
} from "@/data/materiais";
import { obterEstiloDoacao, obterCorStatus } from "@/lib/formatacao";
import EstadoVazio from "@/components/EstadoVazio";
import {
  HeartHandshake,
  Package,
  Inbox,
  Send,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  School,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LinhaMaterialBanco, mapearMaterialBanco } from "@/lib/materiais";
import { LinhaPedidoBanco, mapearPedidoBanco } from "@/lib/pedidos";

function paraCampoDataHora(valor?: string | null): string {
  if (!valor) return "";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";
  return new Date(data.getTime() - data.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function formatarDataHora(valor?: string | null): string | null {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return data.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

export default function PaginaMinhaAtividade() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"meus-anuncios" | "pedidos-recebidos" | "pedidos-enviados">(
    "meus-anuncios"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [meusAnuncios, setMeusAnuncios] = useState<Material[]>([]);
  const [pedidos, setPedidos] = useState<PedidoInteresse[]>([]);
  const [mensagemAcao, setMensagemAcao] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAtividade, setErroAtividade] = useState("");
  const [erroPedidos, setErroPedidos] = useState("");
  const [codigosEntrega, setCodigosEntrega] = useState<Record<string, string>>({});
  const [codigosDigitados, setCodigosDigitados] = useState<Record<string, string>>({});
  const [datasEntregaPropostas, setDatasEntregaPropostas] = useState<Record<string, string>>({});
  const [mensagensEntrega, setMensagensEntrega] = useState<Record<string, string>>({});
  const [errosCodigo, setErrosCodigo] = useState<Record<string, string>>({});
  const [pedidoProcessando, setPedidoProcessando] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    const carregarAtividade = async () => {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (!ativo) return;

      if (erroUsuario || !user) {
        router.replace("/entrar");
        setCarregando(false);
        return;
      }

      setUserId(user.id);

      const [resultadoMateriais, resultadoEnviados] = await Promise.all([
        supabase
          .from("materiais")
          .select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo,removido_por_moderacao")
          .eq("usuario_id", user.id)
          .order("criado_em", { ascending: false }),
        supabase
          .from("pedidos_interesse")
          .select("id,material_id,material_titulo,solicitante_nome,mensagem,status,criado_em,data_entrega,mensagem_entrega,entrega_confirmada_em")
          .eq("solicitante_id", user.id)
          .order("criado_em", { ascending: false }),
      ]);

      const { data: linhasMateriais, error: erroMateriais } = resultadoMateriais;
      const { data: linhasEnviados, error: erroEnviados } = resultadoEnviados;

      if (!ativo) return;

      if (erroMateriais) {
        setErroAtividade(`Não foi possível carregar seus anúncios: ${erroMateriais.message}`);
        setCarregando(false);
        return;
      }

      const anuncios = (linhasMateriais ?? []).map((linha) =>
        mapearMaterialBanco(linha as LinhaMaterialBanco)
      );
      setMeusAnuncios(anuncios);

      if (erroEnviados) {
        setErroPedidos(`Não foi possível carregar os pedidos: ${erroEnviados.message}`);
        setCarregando(false);
        return;
      }

      let linhasRecebidos: LinhaPedidoBanco[] = [];
      const idsMateriais = anuncios.map((anuncio) => anuncio.id);

      if (idsMateriais.length > 0) {
        const { data, error } = await supabase
          .from("pedidos_interesse")
          .select("id,material_id,material_titulo,solicitante_nome,mensagem,status,criado_em,data_entrega,mensagem_entrega,entrega_confirmada_em")
          .in("material_id", idsMateriais)
          .order("criado_em", { ascending: false });

        if (!ativo) return;

        if (error) {
          setErroPedidos(`Não foi possível carregar os pedidos: ${error.message}`);
          setCarregando(false);
          return;
        }

        linhasRecebidos = (data ?? []) as LinhaPedidoBanco[];
      }

      setPedidos([
        ...linhasRecebidos.map((linha) => mapearPedidoBanco(linha, "recebido")),
        ...(linhasEnviados ?? []).map((linha) =>
          mapearPedidoBanco(linha as LinhaPedidoBanco, "enviado")
        ),
      ]);
      setCarregando(false);
    };

    void carregarAtividade();

    return () => {
      ativo = false;
    };
  }, [router, supabase]);

  const handleMarcarConcluido = async (id: string, titulo: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("materiais")
      .update({ status: "Concluído", ativo: false })
      .eq("id", id)
      .eq("usuario_id", userId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      setMensagemAcao(`Não foi possível concluir o anúncio: ${error?.message ?? "verifique sua sessão."}`);
      return;
    }

    setMeusAnuncios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Concluído" } : item))
    );
    setMensagemAcao(`O anúncio "${titulo}" foi marcado como concluído.`);
  };

  const handleAlterarDisponibilidade = async (item: Material) => {
    if (!userId) return;
    const novoAtivo = item.status === "Indisponível";
    const { data, error } = await supabase
      .from("materiais")
      .update({ ativo: novoAtivo })
      .eq("id", item.id)
      .eq("usuario_id", userId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      setMensagemAcao(`Não foi possível alterar a disponibilidade: ${error?.message ?? "verifique sua sessão."}`);
      return;
    }

    const novoStatus = novoAtivo ? "Disponível" : "Indisponível";
    setMeusAnuncios((prev) =>
      prev.map((anuncio) =>
        anuncio.id === item.id ? { ...anuncio, status: novoStatus } : anuncio
      )
    );
    setMensagemAcao(
      novoAtivo
        ? `O anúncio "${item.titulo}" voltou a ficar disponível.`
        : `O anúncio "${item.titulo}" agora está indisponível e saiu do catálogo público.`
    );
  };

  const handleExcluirAnuncio = async (item: Material) => {
    if (!userId) return;
    const confirmou = window.confirm(
      `Excluir "${item.titulo}"? Os pedidos de interesse ligados a ele também serão removidos.`
    );
    if (!confirmou) return;

    const { data, error } = await supabase
      .from("materiais")
      .delete()
      .eq("id", item.id)
      .eq("usuario_id", userId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      setMensagemAcao(`Não foi possível excluir o anúncio: ${error?.message ?? "verifique sua sessão."}`);
      return;
    }

    setMeusAnuncios((prev) => prev.filter((anuncio) => anuncio.id !== item.id));
    setPedidos((prev) => prev.filter((pedido) => pedido.materialId !== item.id));
    setMensagemAcao(`O anúncio "${item.titulo}" foi excluído.`);
  };

  const handleRecusarPedido = async (pedido: PedidoInteresse) => {
    setPedidoProcessando(pedido.id);
    const { error } = await supabase.rpc("responder_pedido_interesse", {
      p_pedido_id: pedido.id,
      p_novo_status: "Recusado",
    });
    setPedidoProcessando(null);
    if (error) {
      setMensagemAcao(`Não foi possível recusar o pedido: ${error.message}`);
      return;
    }
    setPedidos((prev) => prev.map((item) => item.id === pedido.id ? { ...item, status: "Recusado" } : item));
    setMensagemAcao(`Pedido de ${pedido.solicitanteNome} recusado. O anúncio permanece disponível.`);
  };

  const handleReservarPedido = async (pedido: PedidoInteresse) => {
    const campoData = datasEntregaPropostas[pedido.id] ?? "";
    const dataProposta = new Date(campoData);
    if (!campoData || Number.isNaN(dataProposta.getTime()) || dataProposta.getTime() <= Date.now()) {
      setMensagemAcao("Escolha uma data e um horário futuros para propor a entrega.");
      return;
    }

    const dataISO = dataProposta.toISOString();
    const mensagemEntrega = (mensagensEntrega[pedido.id] ?? "").trim();
    if (mensagemEntrega.length > 1000) {
      setMensagemAcao("A mensagem da entrega deve ter no máximo 1.000 caracteres.");
      return;
    }
    setPedidoProcessando(pedido.id);
    const { error } = await supabase.rpc("reservar_pedido_interesse", {
      p_pedido_id: pedido.id,
      p_data_entrega: dataISO,
      p_mensagem_entrega: mensagemEntrega,
    });
    setPedidoProcessando(null);
    if (error) {
      setMensagemAcao(`Não foi possível reservar o anúncio: ${error.message}`);
      return;
    }
    setMeusAnuncios((prev) => prev.map((item) => item.id === pedido.materialId ? { ...item, status: "Reservado" } : item));
    setPedidos((prev) => prev.map((item) => item.materialId !== pedido.materialId || item.status !== "Pendente"
      ? item
      : { ...item, status: item.id === pedido.id ? "Reservado" : "Encerrado", dataEntrega: item.id === pedido.id ? dataISO : item.dataEntrega, mensagemEntrega: item.id === pedido.id ? mensagemEntrega || null : item.mensagemEntrega }));
    setMensagemAcao(`Você propôs ${formatarDataHora(dataISO)} para a entrega${mensagemEntrega ? " e enviou sua mensagem" : ""}. O anúncio ficará reservado enquanto ${pedido.solicitanteNome} confirma ou cancela o pedido.`);
  };

  const handleAtualizarDataEntrega = async (pedido: PedidoInteresse) => {
    const campoData = datasEntregaPropostas[pedido.id] ?? paraCampoDataHora(pedido.dataEntrega);
    const dataProposta = new Date(campoData);
    if (!campoData || Number.isNaN(dataProposta.getTime()) || dataProposta.getTime() <= Date.now()) {
      setMensagemAcao("Escolha uma data e um horário futuros para propor a entrega.");
      return;
    }

    const dataISO = dataProposta.toISOString();
    const mensagemEntrega = (mensagensEntrega[pedido.id] ?? pedido.mensagemEntrega ?? "").trim();
    if (mensagemEntrega.length > 1000) {
      setMensagemAcao("A mensagem da entrega deve ter no máximo 1.000 caracteres.");
      return;
    }
    setPedidoProcessando(pedido.id);
    const { error } = await supabase.rpc("atualizar_data_entrega_pedido", {
      p_pedido_id: pedido.id,
      p_data_entrega: dataISO,
      p_mensagem_entrega: mensagemEntrega,
    });
    setPedidoProcessando(null);
    if (error) {
      setMensagemAcao(`Não foi possível atualizar a proposta: ${error.message}`);
      return;
    }
    setPedidos((prev) => prev.map((item) => item.id === pedido.id ? { ...item, dataEntrega: dataISO, mensagemEntrega: mensagemEntrega || null } : item));
    setMensagemAcao(`A proposta de entrega foi atualizada para ${formatarDataHora(dataISO)}${mensagemEntrega ? ", com sua mensagem." : "."}`);
  };

  const handleConfirmarDataEntrega = async (pedido: PedidoInteresse) => {
    setPedidoProcessando(pedido.id);
    const { error } = await supabase.rpc("confirmar_data_entrega_pedido", { p_pedido_id: pedido.id });
    setPedidoProcessando(null);
    if (error) {
      setMensagemAcao(`Não foi possível confirmar a data: ${error.message}`);
      return;
    }
    setPedidos((prev) => prev.map((item) => item.id === pedido.id
      ? { ...item, entregaConfirmadaEm: new Date().toISOString() }
      : item));
    setMensagemAcao("Data e horário confirmados. O pedido está pronto para a entrega combinada.");
  };

  const handleMostrarCodigo = async (pedido: PedidoInteresse) => {
    const { data, error } = await supabase.rpc("codigo_entrega_pedido", { p_pedido_id: pedido.id });
    if (error || typeof data !== "string") {
      setMensagemAcao(`Não foi possível consultar o código: ${error?.message ?? "tente novamente."}`);
      return;
    }
    setCodigosEntrega((prev) => ({ ...prev, [pedido.id]: data }));
  };

  const handleCancelarReserva = async (pedido: PedidoInteresse) => {
    const confirmou = window.confirm(`Cancelar a reserva de "${pedido.materialTitulo}" e devolver o anúncio ao catálogo?`);
    if (!confirmou) return;
    setPedidoProcessando(pedido.id);
    const { error } = await supabase.rpc("cancelar_reserva_pedido", { p_pedido_id: pedido.id });
    setPedidoProcessando(null);
    if (error) {
      setMensagemAcao(`Não foi possível cancelar a reserva: ${error.message}`);
      return;
    }
    setMeusAnuncios((prev) => prev.map((item) => item.id === pedido.materialId ? { ...item, status: "Disponível" } : item));
    setPedidos((prev) => prev.map((item) => item.id === pedido.id ? { ...item, status: "Encerrado" } : item));
    setCodigosEntrega((prev) => { const { [pedido.id]: _removido, ...restante } = prev; return restante; });
    setMensagemAcao(`Reserva cancelada. "${pedido.materialTitulo}" voltou a ficar disponível.`);
  };

  const handleConfirmarRecebimento = async (pedido: PedidoInteresse) => {
    setPedidoProcessando(pedido.id);
    setErrosCodigo((prev) => ({ ...prev, [pedido.id]: "" }));
    const { data, error } = await supabase.rpc("confirmar_entrega_pedido", {
      p_pedido_id: pedido.id,
      p_codigo: codigosDigitados[pedido.id] ?? "",
    });
    setPedidoProcessando(null);
    if (error) {
      setErrosCodigo((prev) => ({ ...prev, [pedido.id]: error.message }));
      return;
    }
    if (data !== true) {
      setErrosCodigo((prev) => ({ ...prev, [pedido.id]: "Código incorreto ou limite de tentativas atingido. Confira o código com quem anunciou." }));
      return;
    }
    setPedidos((prev) => prev.map((item) => item.id === pedido.id ? { ...item, status: "Concluído" } : item));
    setCodigosDigitados((prev) => ({ ...prev, [pedido.id]: "" }));
    setMensagemAcao(`Recebimento de "${pedido.materialTitulo}" confirmado. O anúncio foi concluído e permanece indisponível.`);
  };

  const pedidosRecebidos = pedidos.filter((p) => p.tipo === "recebido");
  const pedidosEnviados = pedidos.filter((p) => p.tipo === "enviado");

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#130e30]/10 pb-6">
        <div>
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#130e30]">
            Painel do Usuário
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#130e30] mt-1">
            Minha Atividade
          </h1>
          <p className="text-[#5f5c6e] text-sm mt-1">
            Acompanhe o andamento dos seus anúncios de doação e os pedidos recebidos e enviados.
          </p>
        </div>

        <Link
          href="/publicar"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#ffe228] hover:bg-[#f6d91d] text-[#130e30] text-sm font-bold transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Novo Anúncio
        </Link>
      </div>

      {/* Feedback de Ação */}
      {mensagemAcao && (
        <div className="bg-[#eff2e5] border border-[#130e30] text-[#130e30] px-5 py-3.5 rounded-[24px] text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#130e30] flex-shrink-0" />
            <span className="font-medium">{mensagemAcao}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensagemAcao(null)}
            className="text-[#130e30] hover:opacity-70 text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {erroAtividade && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          {erroAtividade}
        </p>
      )}

      {erroPedidos && (
        <p role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {erroPedidos} Para ativar o fluxo atualizado, execute <strong>supabase/fluxo-data-entrega.sql</strong> no SQL Editor do Supabase.
        </p>
      )}

      {carregando && (
        <p className="py-6 text-center text-sm text-[#5f5c6e]">Carregando sua atividade...</p>
      )}

      {/* Abas de Navegação em Formato Pill */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => setAbaAtiva("meus-anuncios")}
          className={`py-2.5 px-5 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors ${
            abaAtiva === "meus-anuncios"
              ? "bg-[#130e30] text-white font-bold"
              : "bg-[#eff2e5] text-[#130e30] hover:bg-[#130e30]/10 border border-[#130e30]/15"
          }`}
        >
          <Package className="w-4 h-4" />
          Meus Anúncios ({meusAnuncios.length})
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("pedidos-recebidos")}
          className={`py-2.5 px-5 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors ${
            abaAtiva === "pedidos-recebidos"
              ? "bg-[#130e30] text-white font-bold"
              : "bg-[#eff2e5] text-[#130e30] hover:bg-[#130e30]/10 border border-[#130e30]/15"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Pedidos Recebidos ({pedidosRecebidos.length})
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("pedidos-enviados")}
          className={`py-2.5 px-5 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors ${
            abaAtiva === "pedidos-enviados"
              ? "bg-[#130e30] text-white font-bold"
              : "bg-[#eff2e5] text-[#130e30] hover:bg-[#130e30]/10 border border-[#130e30]/15"
          }`}
        >
          <Send className="w-4 h-4" />
          Meus Pedidos Enviados ({pedidosEnviados.length})
        </button>
      </div>

      {/* Conteúdo da Aba 1: Meus Anúncios */}
      {!carregando && !erroAtividade && abaAtiva === "meus-anuncios" && (
        <div className="space-y-4">
          {meusAnuncios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meusAnuncios.map((item) => {
                const estiloDoacao = obterEstiloDoacao();
                const estiloStatus = obterCorStatus(item.status);

                return (
                  <div
                    key={item.id}
                    className="bg-[#eff2e5] rounded-[24px] border border-[#130e30]/15 p-6 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {item.imagem && (
                        <img
                          src={item.imagem}
                          alt={`Foto de ${item.titulo}`}
                          className="aspect-[4/3] w-full rounded-2xl border border-[#130e30]/10 bg-white object-cover"
                        />
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold border ${estiloDoacao.bg} ${estiloDoacao.text} ${estiloDoacao.border}`}
                        >
                          {estiloDoacao.rotulo}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#130e30]/10 ${estiloStatus.bg} ${estiloStatus.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${estiloStatus.dot}`} />
                          {item.status}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xl text-[#130e30] line-clamp-2">
                        {item.titulo}
                      </h3>

                      {item.removidoPorModeracao && (
                        <p role="status" className="rounded-xl border border-amber-700/20 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
                          Este anúncio foi retirado do catálogo pela moderação e não pode ser reativado pela conta. Se acredita que houve um engano, entre em contato com a equipe responsável.
                        </p>
                      )}

                      <p className="text-xs text-[#5f5c6e] line-clamp-2 leading-relaxed font-sans">
                        {item.descricao}
                      </p>

                      <div className="text-xs text-[#5f5c6e] space-y-1.5 pt-2 border-t border-[#130e30]/10">
                        <div className="flex items-center gap-1.5 font-medium text-[#130e30]">
                          <School className="w-3.5 h-3.5" />
                          <span className="truncate">{item.escola}</span>
                        </div>
                        <div>Série: {item.serie}</div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#130e30]/10 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/materiais/${item.id}`}
                        className="text-xs font-bold text-[#130e30] hover:underline"
                      >
                        Ver anúncio
                      </Link>

                      <div className="flex flex-wrap justify-end gap-2">
                        {!item.removidoPorModeracao && (item.status === "Disponível" || item.status === "Indisponível") && (
                          <button
                            type="button"
                            onClick={() => void handleAlterarDisponibilidade(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-[#130e30]/30 text-[#130e30] hover:bg-[#130e30]/5 rounded-full transition-colors"
                          >
                            {item.status === "Disponível" ? (
                              <><EyeOff className="w-3.5 h-3.5" /> Marcar indisponível</>
                            ) : (
                              <><Eye className="w-3.5 h-3.5" /> Marcar disponível</>
                            )}
                          </button>
                        )}
                        {!item.removidoPorModeracao && item.status !== "Concluído" && item.status !== "Reservado" && (
                          <button
                            type="button"
                            onClick={() => void handleMarcarConcluido(item.id, item.titulo)}
                            className="text-xs font-semibold px-3 py-2 bg-[#130e30] hover:bg-[#222222] text-white rounded-full transition-colors"
                          >
                            Marcar concluído
                          </button>
                        )}
                        {!item.removidoPorModeracao && item.status !== "Reservado" && <button
                          type="button"
                          onClick={() => void handleExcluirAnuncio(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-red-300 text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EstadoVazio
              tipo="atividade"
              titulo="Você não possui anúncios cadastrados"
              descricao="Quando você publicar um livro ou uniforme escolar para doação, ele aparecerá nesta lista."
              rotuloAcao="Publicar meu primeiro anúncio"
              aoClicarAcao={() => (window.location.href = "/publicar")}
            />
          )}
        </div>
      )}

      {/* Conteúdo da Aba 2: Pedidos Recebidos */}
      {!carregando && !erroAtividade && !erroPedidos && abaAtiva === "pedidos-recebidos" && (
        <div className="space-y-4">
          {pedidosRecebidos.length > 0 ? (
            <div className="space-y-4">
              {pedidosRecebidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-[#eff2e5] rounded-[24px] border border-[#130e30]/15 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#130e30]">
                        {pedido.solicitanteNome}
                      </span>
                      <span className="text-xs text-[#5f5c6e]">• {pedido.criadoEm}</span>
                      <span
                        className={`text-xs px-3 py-0.5 rounded-full font-bold border ${
                          pedido.status === "Reservado" || pedido.status === "Concluído"
                            ? "bg-[#130e30] text-[#ffe228] border-[#130e30]"
                            : pedido.status === "Recusado"
                            ? "bg-[#ffffff] text-[#5f5c6e] border-[#130e30]/20"
                            : pedido.status === "Encerrado"
                            ? "bg-[#eff2e5] text-[#5f5c6e] border-[#130e30]/15"
                            : "bg-[#ffe228] text-[#130e30] border-[#130e30]"
                        }`}
                      >
                        {pedido.status === "Reservado"
                          ? pedido.entregaConfirmadaEm ? "Data e horário confirmados" : "Aguardando confirmação do horário"
                          : pedido.status === "Concluído" ? "Entrega confirmada" : pedido.status}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-[#130e30]">
                      Material solicitado:{" "}
                      <span className="font-serif text-base">{pedido.materialTitulo}</span>
                    </p>

                    <p className="text-xs sm:text-sm text-[#130e30] bg-[#ffffff] p-4 rounded-[24px] border border-[#130e30]/10 italic">
                      "{pedido.mensagem}"
                    </p>
                  </div>

                  {/* Ações para o Pedido (Pill Buttons) */}
                  <div className="w-full space-y-3 md:w-auto md:max-w-[420px]">
                    {pedido.status === "Pendente" ? (
                      <>
                        <div className="space-y-1.5">
                          <label htmlFor={`proposta-data-${pedido.id}`} className="block text-xs font-bold text-[#130e30]">
                            Proponha a data e o horário da entrega
                          </label>
                          <input
                            id={`proposta-data-${pedido.id}`}
                            type="datetime-local"
                            min={paraCampoDataHora(new Date().toISOString())}
                            value={datasEntregaPropostas[pedido.id] ?? ""}
                            onChange={(event) => setDatasEntregaPropostas((prev) => ({ ...prev, [pedido.id]: event.target.value }))}
                            className="min-h-11 w-full rounded-xl border border-[#130e30]/20 bg-white px-3 py-2 text-sm text-[#130e30]"
                          />
                          <label htmlFor={`mensagem-entrega-${pedido.id}`} className="block pt-2 text-xs font-bold text-[#130e30]">
                            Mensagem para quem vai receber (opcional)
                          </label>
                          <textarea
                            id={`mensagem-entrega-${pedido.id}`}
                            value={mensagensEntrega[pedido.id] ?? ""}
                            onChange={(event) => setMensagensEntrega((prev) => ({ ...prev, [pedido.id]: event.target.value }))}
                            maxLength={1000}
                            rows={3}
                            placeholder="Ex.: posso entregar na entrada da escola. Me avise se esse horário funcionar."
                            className="w-full resize-y rounded-xl border border-[#130e30]/20 bg-white px-3 py-2 text-sm text-[#130e30]"
                          />
                          <p className="text-right text-xs text-[#5f5c6e]">{(mensagensEntrega[pedido.id] ?? "").length}/1000</p>
                          <p className="text-xs leading-relaxed text-[#5f5c6e]">A entrega será combinada na escola. O anúncio ficará reservado até a resposta.</p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void handleRecusarPedido(pedido)}
                            disabled={pedidoProcessando === pedido.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#130e30] px-4 py-2 text-xs font-bold text-[#130e30] transition-colors hover:bg-[#130e30]/5 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Recusar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReservarPedido(pedido)}
                            disabled={pedidoProcessando === pedido.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#ffe228] px-4 py-2 text-xs font-bold text-[#130e30] transition-colors hover:bg-[#f6d91d] disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {pedidoProcessando === pedido.id ? "Reservando..." : "Propor e reservar"}
                          </button>
                        </div>
                      </>
                    ) : pedido.status === "Reservado" ? (
                      <div className="space-y-3">
                        {pedido.dataEntrega && (
                          <p className="rounded-xl border border-[#130e30]/10 bg-white p-3 text-xs text-[#5f5c6e]">
                            <span className="flex items-center gap-1.5 font-bold text-[#130e30]"><CalendarDays className="h-4 w-4" />Data proposta</span>
                            <span className="mt-1 block">{formatarDataHora(pedido.dataEntrega)}</span>
                            {pedido.mensagemEntrega && <span className="mt-2 block border-t border-[#130e30]/10 pt-2"><strong className="text-[#130e30]">Sua mensagem:</strong> {pedido.mensagemEntrega}</span>}
                            <span className="mt-1 block">{pedido.entregaConfirmadaEm ? "Quem recebe confirmou o horário." : "Aguardando confirmação de quem recebe."}</span>
                          </p>
                        )}
                        {!pedido.entregaConfirmadaEm && (
                          <div className="space-y-1.5">
                            <label htmlFor={`atualizar-data-${pedido.id}`} className="block text-xs font-bold text-[#130e30]">
                              {pedido.dataEntrega ? "Alterar a proposta de data e horário" : "Proponha data e horário para este pedido"}
                            </label>
                            <input
                              id={`atualizar-data-${pedido.id}`}
                              type="datetime-local"
                              min={paraCampoDataHora(new Date().toISOString())}
                              value={datasEntregaPropostas[pedido.id] ?? paraCampoDataHora(pedido.dataEntrega)}
                              onChange={(event) => setDatasEntregaPropostas((prev) => ({ ...prev, [pedido.id]: event.target.value }))}
                              className="min-h-11 w-full rounded-xl border border-[#130e30]/20 bg-white px-3 py-2 text-sm text-[#130e30]"
                            />
                            <label htmlFor={`atualizar-mensagem-entrega-${pedido.id}`} className="block pt-2 text-xs font-bold text-[#130e30]">
                              Mensagem para quem vai receber (opcional)
                            </label>
                            <textarea
                              id={`atualizar-mensagem-entrega-${pedido.id}`}
                              value={mensagensEntrega[pedido.id] ?? pedido.mensagemEntrega ?? ""}
                              onChange={(event) => setMensagensEntrega((prev) => ({ ...prev, [pedido.id]: event.target.value }))}
                              maxLength={1000}
                              rows={3}
                              placeholder="Escreva uma orientação para a entrega."
                              className="w-full resize-y rounded-xl border border-[#130e30]/20 bg-white px-3 py-2 text-sm text-[#130e30]"
                            />
                            <p className="text-right text-xs text-[#5f5c6e]">{(mensagensEntrega[pedido.id] ?? pedido.mensagemEntrega ?? "").length}/1000</p>
                            <button type="button" onClick={() => void handleAtualizarDataEntrega(pedido)} disabled={pedidoProcessando === pedido.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#130e30]/30 px-4 py-2 text-xs font-bold text-[#130e30] hover:bg-white disabled:opacity-50">
                              <CalendarDays className="h-3.5 w-3.5" />{pedidoProcessando === pedido.id ? "Salvando..." : "Salvar proposta"}
                            </button>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {pedido.entregaConfirmadaEm && codigosEntrega[pedido.id] ? (
                            <p className="rounded-xl border border-[#130e30]/15 bg-white px-3 py-2 text-center text-xs text-[#5f5c6e]">
                              Código para informar na entrega
                              <strong className="block font-mono text-lg tracking-[0.2em] text-[#130e30]">
                                {`${codigosEntrega[pedido.id].slice(0, 5)}-${codigosEntrega[pedido.id].slice(5)}`}
                              </strong>
                            </p>
                          ) : null}
                          {pedido.entregaConfirmadaEm && (
                            <button type="button" onClick={() => void handleMostrarCodigo(pedido)} className="inline-flex items-center gap-1.5 rounded-full border border-[#130e30]/30 px-4 py-2 text-xs font-bold text-[#130e30] hover:bg-white">
                              <KeyRound className="h-3.5 w-3.5" />{codigosEntrega[pedido.id] ? "Ver código" : "Mostrar código"}
                            </button>
                          )}
                          <button type="button" onClick={() => void handleCancelarReserva(pedido)} disabled={pedidoProcessando === pedido.id} className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-50 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" />Cancelar e reexibir
                          </button>
                        </div>
                      </div>
                    ) : pedido.status === "Concluído" ? (
                      <span className="text-xs font-semibold text-emerald-800">Recebimento confirmado pelo solicitante</span>
                    ) : (
                      <span className="text-xs text-[#5f5c6e] font-medium px-3 py-1 rounded-full bg-white border border-[#130e30]/10">
                        Resposta registrada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EstadoVazio
              tipo="atividade"
              titulo="Nenhum pedido de interesse recebido"
              descricao="Assim que outras famílias demonstrarem interesse em seus materiais escolares publicados, as solicitações aparecerão aqui."
            />
          )}
        </div>
      )}

      {/* Conteúdo da Aba 3: Meus Pedidos Enviados */}
      {!carregando && !erroAtividade && !erroPedidos && abaAtiva === "pedidos-enviados" && (
        <div className="space-y-4">
          {pedidosEnviados.length > 0 ? (
            <div className="space-y-4">
              {pedidosEnviados.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-[#eff2e5] rounded-[24px] border border-[#130e30]/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5f5c6e]">Enviado em {pedido.criadoEm}</span>
                      <span
                        className={`text-xs px-3 py-0.5 rounded-full font-bold border ${
                          pedido.status === "Reservado" || pedido.status === "Concluído"
                            ? "bg-[#130e30] text-[#ffe228] border-[#130e30]"
                            : pedido.status === "Recusado"
                            ? "bg-[#ffffff] text-[#5f5c6e] border-[#130e30]/20"
                            : pedido.status === "Encerrado"
                            ? "bg-[#eff2e5] text-[#5f5c6e] border-[#130e30]/15"
                            : "bg-[#ffe228] text-[#130e30] border-[#130e30]"
                        }`}
                      >
                        {pedido.status === "Reservado"
                          ? pedido.entregaConfirmadaEm ? "Data e horário confirmados" : "Confirme a data proposta"
                          : pedido.status === "Concluído" ? "Recebimento confirmado" : pedido.status}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#130e30]">
                      Material: {pedido.materialTitulo}
                    </h3>

                    <p className="text-xs text-[#130e30] italic bg-white p-3.5 rounded-[24px] border border-[#130e30]/10">
                      Sua mensagem: "{pedido.mensagem}"
                    </p>
                    {pedido.status === "Reservado" && (
                      <div className="max-w-md space-y-2 rounded-2xl border border-[#130e30]/15 bg-white p-4">
                        {pedido.dataEntrega ? (
                          <p className="text-xs leading-relaxed text-[#5f5c6e]">
                            Data proposta por quem doou: <strong className="text-[#130e30]">{formatarDataHora(pedido.dataEntrega)}</strong>
                            {pedido.mensagemEntrega && <span className="mt-2 block rounded-xl bg-[#eff2e5] p-3 text-[#130e30]"><strong>Mensagem de quem doou:</strong> {pedido.mensagemEntrega}</span>}
                          </p>
                        ) : (
                          <p className="text-xs leading-relaxed text-[#5f5c6e]">A pessoa que publicou precisa propor a data e o horário da entrega.</p>
                        )}
                        {pedido.entregaConfirmadaEm ? (
                          <>
                            <p className="text-xs leading-relaxed text-emerald-800">Data e horário confirmados. No encontro, peça o código a quem doou e informe-o abaixo para confirmar o recebimento.</p>
                            <label htmlFor={`codigo-${pedido.id}`} className="block text-xs font-bold text-[#130e30]">Código de entrega</label>
                            <input
                              id={`codigo-${pedido.id}`}
                              value={codigosDigitados[pedido.id] ?? ""}
                              onChange={(event) => setCodigosDigitados((prev) => ({ ...prev, [pedido.id]: event.target.value.toUpperCase() }))}
                              maxLength={12}
                              autoComplete="one-time-code"
                              placeholder="Ex.: A1B2C-3D4E5"
                              className="w-full rounded-xl border border-[#130e30]/20 px-3 py-2 font-mono text-sm uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#130e30]"
                            />
                            {errosCodigo[pedido.id] && <p role="alert" className="text-xs text-red-800">{errosCodigo[pedido.id]}</p>}
                            <button
                              type="button"
                              onClick={() => void handleConfirmarRecebimento(pedido)}
                              disabled={pedidoProcessando === pedido.id || !(codigosDigitados[pedido.id] ?? "").trim()}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#130e30] px-4 py-2 text-xs font-bold text-white hover:bg-[#222222] disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />{pedidoProcessando === pedido.id ? "Confirmando..." : "Confirmar recebimento"}
                            </button>
                          </>
                        ) : pedido.dataEntrega ? (
                          <button
                            type="button"
                            onClick={() => void handleConfirmarDataEntrega(pedido)}
                            disabled={pedidoProcessando === pedido.id}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#130e30] px-4 py-2 text-xs font-bold text-white hover:bg-[#222222] disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />{pedidoProcessando === pedido.id ? "Confirmando..." : "Confirmar data e horário"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleCancelarReserva(pedido)}
                          disabled={pedidoProcessando === pedido.id}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-300 px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-50 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" />Cancelar e devolver ao catálogo
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    {pedido.status !== "Reservado" && pedido.status !== "Concluído" && (
                      <Link
                        href={`/materiais/${pedido.materialId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#130e30] text-white hover:bg-[#222222] transition-colors"
                      >
                        Ver material
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EstadoVazio
              tipo="atividade"
              titulo="Você ainda não enviou nenhum pedido"
              descricao="Navegue pelo catálogo e use o botão 'Tenho interesse' para solicitar uma doação."
              rotuloAcao="Explorar o catálogo"
              aoClicarAcao={() => (window.location.href = "/catalogo")}
            />
          )}
        </div>
      )}
    </div>
  );
}
