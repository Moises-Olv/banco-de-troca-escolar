"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, Archive, CheckCircle2, Clipboard, LoaderCircle, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Relato = { id: string; tipo: string; pagina: string | null; descricao: string; passos: string | null; email_contato: string | null; status: string; criado_em: string };
type Denuncia = { id: string; material_id: string | null; material_titulo: string; motivo: string; status: string; criado_em: string };
type Anuncio = { id: string; titulo: string; escola: string | null; serie: string | null; criado_em: string };
type Metricas = { materiais_disponiveis: number; doacoes_concluidas: number; relatos_abertos: number; denuncias_abertas: number; anuncios_antigos: number };
const dataPt = (valor: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(valor));

export default function PainelAdministrativo() {
  const supabase = useMemo(() => createClient(), []);
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [erro, setErro] = useState("");
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [temMaisAnuncios, setTemMaisAnuncios] = useState(false);
  const [carregandoMaisAnuncios, setCarregandoMaisAnuncios] = useState(false);
  const [email, setEmail] = useState("");
  const [linkConvite, setLinkConvite] = useState("");
  const [criando, setCriando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      const { data: sessao } = await supabase.auth.getUser();
      if (!ativo) return;
      if (!sessao.user) { setCarregando(false); return; }
      const { data: admin, error: erroPermissao } = await supabase.rpc("admin_eh_usuario");
      if (!ativo) return;
      if (erroPermissao) {
        setErro("Execute supabase/administracao.sql no SQL Editor do Supabase e atualize esta página.");
        setCarregando(false);
        return;
      }
      if (!admin) { setCarregando(false); return; }
      setAutorizado(true);
      const [resumo, relatosDb, denunciasDb, anunciosDb] = await Promise.all([
        supabase.rpc("admin_obter_metricas"),
        supabase.from("relatos_erros").select("id,tipo,pagina,descricao,passos,email_contato,status,criado_em").order("criado_em", { ascending: false }).limit(50),
        supabase.from("denuncias_anuncios").select("id,material_id,material_titulo,motivo,status,criado_em").order("criado_em", { ascending: false }).limit(50),
        supabase.from("materiais").select("id,titulo,escola,serie,criado_em").eq("status", "Disponível").eq("ativo", true).order("criado_em", { ascending: false }).range(0, 49),
      ]);
      if (!ativo) return;
      const metric = Array.isArray(resumo.data) ? resumo.data[0] : resumo.data;
      setMetricas((metric ?? null) as Metricas | null);
      setRelatos((relatosDb.data ?? []) as Relato[]);
      setDenuncias((denunciasDb.data ?? []) as Denuncia[]);
      setAnuncios((anunciosDb.data ?? []) as Anuncio[]);
      setTemMaisAnuncios((anunciosDb.data?.length ?? 0) === 50);
      if (resumo.error || relatosDb.error || denunciasDb.error || anunciosDb.error) setErro("Algumas informações não carregaram. Confira se a migração de administração foi aplicada.");
      setCarregando(false);
    };
    void carregar();
    return () => { ativo = false; };
  }, [supabase]);

  const recarregarMetricas = async () => {
    const { data } = await supabase.rpc("admin_obter_metricas");
    const m = Array.isArray(data) ? data[0] : data;
    if (m) setMetricas(m as Metricas);
  };

  const mudarStatus = async (tipo: "relato" | "denuncia", id: string, status: string) => {
    const tabela = tipo === "relato" ? "relatos_erros" : "denuncias_anuncios";
    const { error: falha } = await supabase.from(tabela).update({ status }).eq("id", id);
    if (falha) { setErro("Não foi possível salvar o status. Tente novamente."); return; }
    if (tipo === "relato") setRelatos((lista) => lista.map((item) => item.id === id ? { ...item, status } : item));
    else setDenuncias((lista) => lista.map((item) => item.id === id ? { ...item, status } : item));
    await recarregarMetricas();
  };

  const retirarAnuncio = async (id: string, titulo: string, denunciaId?: string) => {
    setErro("");
    setMensagemSucesso("");
    if (!window.confirm(`Retirar “${titulo}” do catálogo público? O responsável não poderá reativá-lo. O histórico do anúncio e dos pedidos será preservado.`)) return;
    const { error: falha } = await supabase.rpc("admin_ocultar_anuncio", { p_material_id: id });
    if (falha) { setErro(falha.message || "Não foi possível retirar o anúncio do catálogo."); return; }
    setAnuncios((lista) => lista.filter((anuncio) => anuncio.id !== id));
    if (denunciaId) {
      const { error: falhaDenuncia } = await supabase.from("denuncias_anuncios").update({ status: "Resolvida" }).eq("id", denunciaId);
      if (falhaDenuncia) {
        setErro("O anúncio foi retirado, mas não foi possível atualizar o status da denúncia. Atualize-o manualmente.");
      } else {
        setDenuncias((lista) => lista.map((item) => item.id === denunciaId ? { ...item, status: "Resolvida" } : item));
      }
    }
    setMensagemSucesso(`“${titulo}” foi retirado do catálogo. O registro foi mantido para preservar o histórico.`);
    await recarregarMetricas();
  };

  const carregarMaisAnuncios = async () => {
    if (carregandoMaisAnuncios) return;
    setCarregandoMaisAnuncios(true);
    const inicio = anuncios.length;
    const { data, error: falha } = await supabase
      .from("materiais")
      .select("id,titulo,escola,serie,criado_em")
      .eq("status", "Disponível")
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .range(inicio, inicio + 49);
    setCarregandoMaisAnuncios(false);
    if (falha) { setErro("Não foi possível carregar mais anúncios para moderação."); return; }
    const novos = (data ?? []) as Anuncio[];
    setAnuncios((lista) => [...lista, ...novos]);
    setTemMaisAnuncios(novos.length === 50);
  };

  const criarConvite = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault(); setErro(""); setLinkConvite(""); setCopiado(false); setCriando(true);
    const { data, error: falha } = await supabase.rpc("admin_criar_convite", { p_email: email.trim() });
    setCriando(false);
    if (falha) { setErro(falha.message || "Não foi possível criar o convite."); return; }
    const convite = Array.isArray(data) ? data[0] : data;
    if (!convite?.token) { setErro("O banco não retornou um convite."); return; }
    const url = new URL("/admin/aceitar", window.location.origin);
    url.searchParams.set("token", convite.token);
    setLinkConvite(url.toString()); setEmail("");
  };

  const copiar = async () => {
    try { await navigator.clipboard.writeText(linkConvite); setCopiado(true); }
    catch { setErro("Selecione o link e copie manualmente."); }
  };

  if (carregando) return <div className="flex items-center justify-center gap-2 px-4 py-24 text-[#130e30]"><LoaderCircle className="h-5 w-5 animate-spin" />Carregando painel...</div>;
  if (!autorizado) return <main className="admin-panel mx-auto max-w-2xl px-4 py-16"><section className="rounded-3xl border border-[#130e30]/15 bg-[#eff2e5] p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-[#130e30]" /><h1 className="mt-4 font-serif text-3xl font-bold text-[#130e30]">Acesso administrativo</h1><p className="mt-3 text-sm text-[#5f5c6e]">Entre com uma conta autorizada como administradora.</p>{erro && <p role="alert" className="mt-4 text-sm text-red-800">{erro}</p>}<Link href="/entrar" className="mt-6 inline-flex rounded-full bg-[#130e30] px-6 py-3 font-semibold text-white">Entrar na conta</Link></section></main>;

  const cards: [string, number | undefined][] = [
    ["Doações disponíveis", metricas?.materiais_disponiveis], ["Doações concluídas", metricas?.doacoes_concluidas],
    ["Relatos abertos", metricas?.relatos_abertos], ["Denúncias abertas", metricas?.denuncias_abertas],
    ["Anúncios com + de 90 dias", metricas?.anuncios_antigos],
  ];

  return <main className="admin-panel mx-auto w-full max-w-[1200px] space-y-10 px-4 py-10 sm:px-6 lg:px-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><span className="inline-flex items-center gap-2 rounded-full bg-[#ffe228] px-3 py-1 text-xs font-bold uppercase text-[#130e30]"><ShieldCheck className="h-4 w-4" />Área restrita</span><h1 className="mt-3 font-serif text-4xl font-bold text-[#130e30]">Painel administrativo</h1><p className="mt-2 text-sm text-[#5f5c6e]">Acompanhe as doações, analise relatos e denúncias e mantenha o catálogo atualizado.</p></div>
      <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-full border border-[#130e30]/20 px-5 text-sm font-semibold text-[#130e30] hover:bg-white">Atualizar painel</button>
    </header>
    {erro && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-700/20 bg-red-50 p-4 text-sm text-red-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erro}</p>}
    {mensagemSucesso && <p role="status" className="rounded-xl border border-emerald-800/20 bg-emerald-50 p-4 text-sm text-emerald-950">{mensagemSucesso}</p>}

    <section aria-label="Indicadores da comunidade" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, valor]) => <article key={label} className="rounded-2xl border border-[#130e30]/15 bg-[#eff2e5] p-5"><p className="text-xs font-semibold text-[#5f5c6e]">{label}</p><p className="mt-2 font-serif text-3xl font-bold text-[#130e30]">{valor ?? "—"}</p></article>)}</section>

    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-[#130e30]/15 bg-white/80 p-6 sm:p-8">
        <div className="flex items-center gap-3"><Users className="h-6 w-6 text-[#130e30]" /><h2 className="font-serif text-2xl font-bold text-[#130e30]">Convidar administrador</h2></div>
        <p className="mt-3 text-sm leading-relaxed text-[#5f5c6e]">Crie um link de uso único, válido por 7 dias. A pessoa precisa entrar em uma conta com e-mail confirmado igual ao convidado. Depois de aceitar, terá as mesmas permissões administrativas.</p>
        <form onSubmit={criarConvite} className="mt-5 flex flex-col gap-3 sm:flex-row"><label htmlFor="email-convite" className="sr-only">E-mail da pessoa convidada</label><input id="email-convite" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#130e30]/20 bg-white px-4 text-sm text-[#130e30]" /><button disabled={criando} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#130e30] px-6 text-sm font-semibold text-white disabled:opacity-60">{criando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}Criar convite</button></form>
        {linkConvite && <div className="mt-4 space-y-3 rounded-2xl border border-emerald-800/20 bg-emerald-50 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-900"><CheckCircle2 className="h-4 w-4" />Convite pronto para compartilhar</p><input readOnly value={linkConvite} aria-label="Link de convite de administrador" className="min-h-11 w-full rounded-lg border border-emerald-900/20 bg-white px-3 text-xs text-[#130e30]" /><button type="button" onClick={() => void copiar()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#130e30] px-4 text-sm font-semibold text-white"><Clipboard className="h-4 w-4" />{copiado ? "Link copiado" : "Copiar link"}</button></div>}
      </article>
      <aside className="rounded-3xl border border-[#130e30]/15 bg-[#eff2e5] p-6 sm:p-8"><h2 className="font-serif text-2xl font-bold text-[#130e30]">Como moderar</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#5f5c6e]"><li>Revise relatos e denúncias e atualize o status após análise.</li><li>Retire anúncios com cobrança, dados pessoais expostos ou conteúdo impróprio. A conta responsável não poderá reativá-los, e os registros e pedidos serão preservados.</li><li>Anúncios com reserva em andamento precisam ter o pedido encerrado antes de serem retirados.</li></ul></aside>
    </section>

    <section className="space-y-4"><h2 className="font-serif text-2xl font-bold text-[#130e30]">Relatos e solicitações ({relatos.length})</h2>{relatos.length === 0 ? <p className="rounded-2xl border border-dashed border-[#130e30]/25 p-6 text-sm text-[#5f5c6e]">Nenhum relato ou pedido recebido.</p> : relatos.map((item) => <article key={item.id} className="rounded-2xl border border-[#130e30]/15 bg-white/85 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold text-[#5f5c6e]">{item.tipo} · {dataPt(item.criado_em)}</p><h3 className="mt-1 font-semibold text-[#130e30]">{item.pagina || (item.tipo === "Solicitação de dados pessoais (LGPD)" ? "Pedido sobre dados pessoais" : "Página não informada")}</h3></div><select aria-label="Status do relato" value={item.status} onChange={(e) => void mudarStatus("relato", item.id, e.target.value)} className="min-h-10 rounded-xl border border-[#130e30]/20 bg-white px-3 text-sm text-[#130e30]"><option>Novo</option><option>Em análise</option><option>Resolvido</option></select></div><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#130e30]">{item.descricao}</p>{item.passos && <p className="mt-2 whitespace-pre-wrap text-sm text-[#5f5c6e]"><strong>Como reproduzir:</strong> {item.passos}</p>}{item.email_contato && <p className="mt-2 text-sm text-[#5f5c6e]"><strong>E-mail para retorno:</strong> {item.email_contato}</p>}</article>)}</section>

    <section className="space-y-4"><h2 className="font-serif text-2xl font-bold text-[#130e30]">Denúncias de anúncios ({denuncias.length})</h2>{denuncias.length === 0 ? <p className="rounded-2xl border border-dashed border-[#130e30]/25 p-6 text-sm text-[#5f5c6e]">Nenhuma denúncia recebida.</p> : denuncias.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#130e30]/15 bg-white/85 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-xs text-[#5f5c6e]">{dataPt(item.criado_em)}</p><h3 className="mt-1 font-semibold text-[#130e30]">{item.material_titulo}</h3><p className="mt-1 text-sm text-[#5f5c6e]">{item.motivo}</p>{item.material_id && <Link href={`/materiais/${item.material_id}`} className="mt-2 inline-block text-sm font-semibold text-[#130e30] underline">Ver anúncio</Link>}</div><div className="flex flex-wrap items-center gap-2"><select aria-label={`Status da denúncia sobre ${item.material_titulo}`} value={item.status} onChange={(e) => void mudarStatus("denuncia", item.id, e.target.value)} className="min-h-10 shrink-0 rounded-xl border border-[#130e30]/20 bg-white px-3 text-sm text-[#130e30]"><option>Novo</option><option>Em análise</option><option>Resolvida</option><option>Ignorada</option></select>{item.material_id && item.status !== "Resolvida" && <button type="button" onClick={() => void retirarAnuncio(item.material_id!, item.material_titulo, item.id)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-red-800 px-4 text-sm font-semibold text-white hover:bg-red-900"><Archive className="h-4 w-4" />Retirar anúncio</button>}</div></article>)}</section>

    <section className="space-y-4"><div><h2 className="font-serif text-2xl font-bold text-[#130e30]">Anúncios ativos para moderar</h2><p className="mt-1 text-sm text-[#5f5c6e]">Confira os anúncios publicados. A retirada desativa a publicação sem apagar o registro nem os pedidos associados.</p></div>{anuncios.length === 0 ? <p className="rounded-2xl border border-dashed border-[#130e30]/25 p-6 text-sm text-[#5f5c6e]">Nenhum anúncio ativo para moderar.</p> : anuncios.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-[#130e30]/15 bg-white/85 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-[#130e30]">{item.titulo}</h3><p className="mt-1 text-sm text-[#5f5c6e]">{[item.escola, item.serie].filter(Boolean).join(" · ") || "Escola e série não informadas"} · anunciado em {dataPt(item.criado_em)}</p></div><button type="button" onClick={() => void retirarAnuncio(item.id, item.titulo)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-red-800/30 px-4 text-sm font-semibold text-red-900 hover:bg-red-50"><Archive className="h-4 w-4" />Retirar do catálogo</button></article>)}{temMaisAnuncios && <button type="button" onClick={() => void carregarMaisAnuncios()} disabled={carregandoMaisAnuncios} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#130e30]/20 px-5 text-sm font-semibold text-[#130e30] hover:bg-[#eff2e5] disabled:opacity-60">{carregandoMaisAnuncios && <LoaderCircle className="h-4 w-4 animate-spin" />}Carregar mais anúncios</button>}</section>
  </main>;
}
