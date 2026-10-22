"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, LoaderCircle, Save, UserRound } from "lucide-react";
import AvatarUsuario from "@/components/AvatarUsuario";
import { LISTA_ESCOLAS } from "@/data/materiais";
import { createClient } from "@/lib/supabase/client";
import { gerarIdentificadorArquivo } from "@/lib/identificador";

const BUCKET_FOTOS_PERFIL = "perfis-fotos";
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_FOTO_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

interface EstatisticasPerfil {
  doador_ativo: boolean;
  total_doacoes: number;
}

export default function PaginaEditarPerfil() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const campoFoto = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState("");
  const [nome, setNome] = useState("");
  const [escola, setEscola] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [estatisticas, setEstatisticas] = useState<EstatisticasPerfil>({ doador_ativo: false, total_doacoes: 0 });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!foto) {
      setFotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  useEffect(() => {
    let ativo = true;

    const carregarPerfil = async () => {
      const { data: { user }, error: erroUsuario } = await supabase.auth.getUser();
      if (!ativo) return;
      if (erroUsuario || !user) {
        router.replace("/entrar");
        return;
      }

      setUserId(user.id);
      const { data: perfil, error: erroPerfil } = await supabase
        .from("perfis")
        .select("id,nome_exibicao,escola,foto_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!ativo) return;
      if (erroPerfil) {
        setErro(`Não foi possível carregar o perfil: ${erroPerfil.message}. Execute supabase/perfis-publicos.sql no Supabase.`);
        setCarregando(false);
        return;
      }

      setNome(perfil?.nome_exibicao || (typeof user.user_metadata?.nome === "string" ? user.user_metadata.nome : ""));
      setEscola(perfil?.escola || (typeof user.user_metadata?.escola === "string" ? user.user_metadata.escola : ""));
      setFotoUrl(perfil?.foto_url ?? null);

      const { data: dadosEstatisticas } = await supabase.rpc("estatisticas_perfil_publico", { p_usuario_id: user.id });
      if (ativo && Array.isArray(dadosEstatisticas) && dadosEstatisticas[0]) {
        setEstatisticas(dadosEstatisticas[0] as EstatisticasPerfil);
      }
      setCarregando(false);
    };

    void carregarPerfil();
    return () => { ativo = false; };
  }, [router, supabase]);

  const selecionarFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0] ?? null;
    setErro("");
    if (!arquivo) return;
    if (!TIPOS_FOTO_ACEITOS.includes(arquivo.type)) {
      setErro("Escolha uma imagem JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setErro("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }
    setFoto(arquivo);
    setRemoverFoto(false);
    setSucesso("");
  };

  const caminhoDaFotoAntiga = (url: string) => {
    const marcador = "/storage/v1/object/public/perfis-fotos/";
    const caminhoCodificado = url.split(marcador)[1]?.split("?")[0];
    if (!caminhoCodificado) return null;
    try {
      const caminho = decodeURIComponent(caminhoCodificado);
      return caminho.startsWith(`${userId}/`) ? caminho : null;
    } catch {
      return null;
    }
  };

  const salvarPerfil = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro("");
    setSucesso("");
    if (!nome.trim()) {
      setErro("Informe o nome que será exibido no seu perfil.");
      return;
    }

    setSalvando(true);
    let caminhoFotoNova: string | null = null;
    const fotoAntiga = fotoUrl;
    let novaFotoUrl = removerFoto ? null : fotoUrl;

    try {
      if (foto) {
        const extensao = foto.type === "image/jpeg" ? "jpg" : foto.type.split("/")[1];
        caminhoFotoNova = `${userId}/${gerarIdentificadorArquivo()}.${extensao}`;
        const { error: erroUpload } = await supabase.storage
          .from(BUCKET_FOTOS_PERFIL)
          .upload(caminhoFotoNova, foto, { contentType: foto.type, cacheControl: "3600", upsert: false });
        if (erroUpload) throw new Error(`Não foi possível enviar a foto: ${erroUpload.message}. Confirme que executou supabase/perfis-publicos.sql.`);
        novaFotoUrl = supabase.storage.from(BUCKET_FOTOS_PERFIL).getPublicUrl(caminhoFotoNova).data.publicUrl;
      }

      const nomeSalvo = nome.trim();
      const escolaSalva = escola.trim() || null;
      const { error: erroSalvar } = await supabase
        .from("perfis")
        .upsert({ id: userId, nome_exibicao: nomeSalvo, escola: escolaSalva, foto_url: novaFotoUrl }, { onConflict: "id" });
      if (erroSalvar) throw new Error(`Não foi possível salvar o perfil: ${erroSalvar.message}`);

      const { error: erroMetadados } = await supabase.auth.updateUser({ data: { nome: nomeSalvo, escola: escolaSalva } });
      if (fotoAntiga && fotoAntiga !== novaFotoUrl) {
        const caminhoAntigo = caminhoDaFotoAntiga(fotoAntiga);
        if (caminhoAntigo) await supabase.storage.from(BUCKET_FOTOS_PERFIL).remove([caminhoAntigo]);
      }

      setFotoUrl(novaFotoUrl);
      setFoto(null);
      setRemoverFoto(false);
      if (campoFoto.current) campoFoto.current.value = "";
      setSucesso(erroMetadados ? "Perfil salvo. O nome público foi atualizado; entre novamente para atualizar os dados auxiliares da conta." : "Perfil salvo com sucesso.");
      window.dispatchEvent(new CustomEvent("perfil-atualizado", { detail: { nome: nomeSalvo, fotoUrl: novaFotoUrl } }));
      router.refresh();
    } catch (falha) {
      if (caminhoFotoNova) await supabase.storage.from(BUCKET_FOTOS_PERFIL).remove([caminhoFotoNova]);
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[#5f5c6e]">Carregando perfil...</p>;
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#130e30]">Sua conta</span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[#130e30] sm:text-4xl">Editar perfil</h1>
        <p className="mt-2 text-sm text-[#5f5c6e]">Escolha como você aparece para quem encontra seus anúncios.</p>
      </div>

      <form onSubmit={salvarPerfil} className="space-y-6 rounded-[24px] border border-[#130e30]/15 bg-[#eff2e5] p-6 sm:p-8">
        {erro && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">{erro}</p>}
        {sucesso && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><CheckCircle2 className="h-4 w-4 shrink-0" />{sucesso}</p>}

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <AvatarUsuario nome={nome || "Sua foto"} fotoUrl={fotoPreview ?? (removerFoto ? undefined : fotoUrl ?? undefined)} className="h-24 w-24 text-2xl" />
          <div>
            <p className="font-semibold text-[#130e30]">Foto de perfil</p>
            <p className="mt-1 text-xs text-[#5f5c6e]">JPG, PNG ou WebP. Até 5 MB. A foto é opcional e ficará visível publicamente se você a adicionar. Evite fotos de crianças e documentos.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input ref={campoFoto} id="foto-perfil" type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} className="sr-only" />
              <label htmlFor="foto-perfil" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#130e30] px-4 py-3 text-sm font-semibold text-white hover:bg-[#222222] focus-within:ring-2 focus-within:ring-[#130e30] focus-within:ring-offset-2"><Camera className="h-4 w-4" />Escolher foto</label>
              {(fotoUrl || foto) && <button type="button" onClick={() => { setFoto(null); setRemoverFoto(true); if (campoFoto.current) campoFoto.current.value = ""; }} className="min-h-11 rounded-full border border-[#130e30]/25 px-4 py-3 text-sm font-medium text-[#130e30] hover:bg-white">Remover foto</button>}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="nome-perfil" className="mb-2 block text-sm font-semibold text-[#130e30]">Nome público</label>
          <input id="nome-perfil" value={nome} onChange={(event) => setNome(event.target.value)} maxLength={80} required className="w-full rounded-2xl border border-[#130e30]/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#130e30]" placeholder="Seu nome" />
          <p className="mt-1 text-xs text-[#5f5c6e]">Esse nome aparece nos anúncios e no seu perfil público. Use o nome pelo qual quer ser identificado no site.</p>
        </div>

        <div>
          <label htmlFor="escola-perfil" className="mb-2 block text-sm font-semibold text-[#130e30]">Escola (opcional)</label>
          <input id="escola-perfil" list="escolas-perfil" value={escola} onChange={(event) => setEscola(event.target.value)} maxLength={120} className="w-full rounded-2xl border border-[#130e30]/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#130e30]" placeholder="Digite ou escolha sua escola" />
          <datalist id="escolas-perfil">{LISTA_ESCOLAS.map((item) => <option key={item} value={item} />)}</datalist>
          <p className="mt-1 text-xs text-[#5f5c6e]">Se preenchida, a escola aparece no perfil público. Você pode deixá-la em branco.</p>
        </div>

        <div className="rounded-2xl border border-[#130e30]/10 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 font-semibold text-[#130e30]"><UserRound className="h-4 w-4" />Atividade de doação</div>
          <p className="text-sm text-[#5f5c6e]">{estatisticas.doador_ativo ? "Doador ativo" : "Ainda sem doações disponíveis"}</p>
          <p className="mt-1 text-sm text-[#5f5c6e]">Itens doados e concluídos: <strong className="text-[#130e30]">{estatisticas.total_doacoes}</strong></p>
          <p className="mt-2 text-xs text-[#5f5c6e]">Essas informações são calculadas automaticamente pelos anúncios concluídos. Não há dados de pagamento no perfil.</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#130e30]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href={userId ? `/perfil/${userId}` : "/perfil"} className="text-center text-sm font-semibold text-[#130e30] underline underline-offset-4">Ver meu perfil público</Link>
          <button type="submit" disabled={salvando || !userId} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#130e30] px-6 py-3 text-sm font-bold text-white hover:bg-[#222222] disabled:opacity-60">
            {salvando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>
      </form>
    </section>
  );
}
