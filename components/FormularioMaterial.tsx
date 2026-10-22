"use client";

import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LISTA_ESCOLAS,
  LISTA_CATEGORIAS,
  LISTA_CONDICOES,
  CategoriaMaterial,
  CondicaoMaterial,
  Material,
} from "@/data/materiais";
import CartaoMaterial from "./CartaoMaterial";
import { CheckCircle2, Eye, Send, AlertTriangle } from "lucide-react";
import { gerarIdentificadorArquivo } from "@/lib/identificador";

const BUCKET_FOTOS = "materiais-fotos";
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_FOTO_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

interface FormularioMaterialProps {
  aoPublicarSucesso?: (novoMaterial: Material) => void;
}

interface DadosFormulario {
  titulo: string;
  descricao: string;
  escola: string;
  serie: string;
  categoria: CategoriaMaterial | "";
  condicao: CondicaoMaterial | "";
}

interface ErrosFormulario {
  titulo?: string;
  descricao?: string;
  escola?: string;
  serie?: string;
  categoria?: string;
  condicao?: string;
}

export default function FormularioMaterial({ aoPublicarSucesso }: FormularioMaterialProps) {
  const supabase = createClient();
  const [dados, setDados] = useState<DadosFormulario>({
    titulo: "",
    descricao: "",
    escola: "",
    serie: "",
    categoria: "",
    condicao: "",
  });

  const [erros, setErros] = useState<ErrosFormulario>({});
  const [mostrarPrevia, setMostrarPrevia] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [materialCriado, setMaterialCriado] = useState<Material | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [erroFoto, setErroFoto] = useState("");
  const [publicando, setPublicando] = useState(false);
  const campoFoto = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!fotoPreview) return;
    return () => URL.revokeObjectURL(fotoPreview);
  }, [fotoPreview]);

  const validar = (): boolean => {
    const novosErros: ErrosFormulario = {};

    if (!dados.titulo.trim()) {
      novosErros.titulo = "Informe o título do material.";
    } else if (dados.titulo.trim().length < 5) {
      novosErros.titulo = "O título deve ter pelo menos 5 caracteres.";
    }

    if (!dados.descricao.trim()) {
      novosErros.descricao = "Descreva as condições e detalhes do item.";
    } else if (dados.descricao.trim().length < 15) {
      novosErros.descricao = "A descrição deve conter no mínimo 15 caracteres para orientar os interessados.";
    }

    if (!dados.escola) {
      novosErros.escola = "Selecione a escola de referência.";
    }

    if (!dados.serie) {
      novosErros.serie = "Informe a série, ano ou turma.";
    }

    if (!dados.categoria) {
      novosErros.categoria = "Escolha uma categoria (Livro, Uniforme ou Outro).";
    }

    if (!dados.condicao) {
      novosErros.condicao = "Informe o estado de conservação do item.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));

    if (erros[name as keyof ErrosFormulario]) {
      setErros((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0] ?? null;
    setErroFoto("");

    if (!arquivo) return;

    if (!TIPOS_FOTO_ACEITOS.includes(arquivo.type)) {
      setFoto(null);
      setFotoPreview(null);
      e.target.value = "";
      setErroFoto("Escolha uma imagem JPG, PNG ou WebP.");
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setFoto(null);
      setFotoPreview(null);
      e.target.value = "";
      setErroFoto("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setFoto(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
  };

  const removerFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    setErroFoto("");
    if (campoFoto.current) campoFoto.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setPublicando(true);
    let caminhoFotoEnviada: string | null = null;

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        window.alert("Sua sessão expirou. Entre novamente.");
        window.location.href = "/entrar";
        return;
      }

      let imagemUrl: string | null = null;

      if (foto) {
        const extensao = foto.type === "image/jpeg" ? "jpg" : foto.type.split("/")[1];
        caminhoFotoEnviada = `${user.id}/${gerarIdentificadorArquivo()}.${extensao}`;
        const { error: erroUpload } = await supabase.storage
          .from(BUCKET_FOTOS)
          .upload(caminhoFotoEnviada, foto, {
            cacheControl: "3600",
            contentType: foto.type,
            upsert: false,
          });

        if (erroUpload) {
          caminhoFotoEnviada = null;
          throw new Error(
            `Não foi possível enviar a foto (${erroUpload.message}). Confirme se executou supabase/fotos-materiais.sql no Supabase.`
          );
        }

        imagemUrl = supabase.storage
          .from(BUCKET_FOTOS)
          .getPublicUrl(caminhoFotoEnviada).data.publicUrl;
      }

      const { data, error } = await supabase
        .from("materiais")
        .insert({
          usuario_id: user.id,
          titulo: dados.titulo.trim(),
          descricao: dados.descricao.trim(),
          escola: dados.escola,
          serie: dados.serie,
          categoria: dados.categoria,
          condicao: dados.condicao,
          modalidade: "Doação",
          imagem_url: imagemUrl,
        })
        .select()
        .single();

      if (error || !data) {
        if (caminhoFotoEnviada) {
          await supabase.storage.from(BUCKET_FOTOS).remove([caminhoFotoEnviada]);
          caminhoFotoEnviada = null;
        }
        throw new Error(error?.message ?? "Tente novamente.");
      }

      const { data: perfil } = await supabase
        .from("perfis")
        .select("nome_exibicao,foto_url")
        .eq("id", user.id)
        .maybeSingle();

      const novoMaterial: Material = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        escola: data.escola,
        serie: data.serie,
        categoria: data.categoria as CategoriaMaterial,
        condicao: data.condicao as CondicaoMaterial,
        modalidade: "Doação",
        status: "Disponível",
        imagem: data.imagem_url ?? undefined,
        criadoEm: new Date(data.criado_em).toLocaleDateString("pt-BR"),
        anunciante: {
          id: user.id,
          nomeFicticio:
            perfil?.nome_exibicao ||
            (typeof user.user_metadata?.nome === "string" ? user.user_metadata.nome : "Membro da comunidade"),
          fotoUrl: perfil?.foto_url ?? undefined,
        },
      };

      setMaterialCriado(novoMaterial);
      setPublicado(true);
      aoPublicarSucesso?.(novoMaterial);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Tente novamente.";
      window.alert(`Não foi possível publicar: ${mensagem}`);
    } finally {
      setPublicando(false);
    }
  };

  // Se já foi publicado
  if (publicado && materialCriado) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-[#eff2e5] border border-[#130e30]/15 rounded-[24px] p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-[#ffe228] text-[#130e30] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#130e30]">
            Publicação realizada com sucesso!
          </h2>
          <p className="text-sm text-[#5f5c6e] max-w-lg mx-auto font-sans leading-relaxed">
            O anúncio foi validado com sucesso e formatado conforme as regras do Banco de Troca Escolar.
          </p>
        </div>

        <div>
          <h3 className="font-serif font-bold text-[#130e30] text-lg mb-3">Prévia do anúncio no catálogo:</h3>
          <CartaoMaterial material={materialCriado} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setPublicado(false);
              setDados({
                titulo: "",
                descricao: "",
                escola: "",
                serie: "",
                categoria: "",
                condicao: "",
              });
              removerFoto();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#130e30] text-[#130e30] font-medium text-sm hover:bg-[#130e30]/5 transition-colors font-sans"
          >
            Publicar outro material
          </button>
          <Link
            href="/catalogo"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ffe228] text-[#130e30] font-bold text-sm transition-colors text-center hover:bg-[#f6d91d] font-sans"
          >
            Ver catálogo de materiais
          </Link>
          <Link
            href="/minha-atividade"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#130e30] text-white font-medium text-sm transition-colors text-center font-sans"
          >
            Minha atividade
          </Link>
        </div>
      </div>
    );
  }

  // Material de prévia virtual
  const materialPrevia: Material = {
    id: "previa",
    titulo: dados.titulo || "Título do seu anúncio escolar",
    descricao:
      dados.descricao ||
      "A descrição detalhada do livro, uniforme ou material didático que você deseja doar aparecerá aqui.",
    escola: dados.escola || "Escola / ponto de encontro",
    serie: dados.serie || "Série / turma / curso",
    categoria: (dados.categoria as CategoriaMaterial) || "Livro",
    condicao: (dados.condicao as CondicaoMaterial) || "Bom estado",
    modalidade: "Doação",
    status: "Disponível",
    criadoEm: "Agora",
    anunciante: {
      nomeFicticio: "Seu Nome",
    },
    imagem: fotoPreview ?? undefined,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Formulário Principal */}
      <div className="lg:col-span-7">
        <form onSubmit={handleSubmit} noValidate className="space-y-6 bg-[#eff2e5] p-6 sm:p-8 rounded-[24px] border border-[#130e30]/15">
          <div className="border-b border-[#130e30]/10 pb-4">
            <h2 className="font-serif text-2xl font-bold text-[#130e30]">Detalhes do Material</h2>
            <p className="text-xs sm:text-sm text-[#5f5c6e] mt-1 font-sans">
              A escola selecionada será o ponto de entrega e retirada. Informe a turma e evite colocar contatos pessoais na descrição.
            </p>
          </div>

          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
              Título do Material *
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
                maxLength={120}
                aria-invalid={Boolean(erros.titulo)}
                aria-describedby={erros.titulo ? "erro-titulo" : undefined}
              value={dados.titulo}
              onChange={handleChange}
              placeholder="Ex: Livro de Matemática 8º Ano - FTD"
              className={`w-full px-5 py-3 rounded-full border text-sm text-[#130e30] placeholder-[#5f5c6e] bg-white font-sans focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                erros.titulo ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
              }`}
            />
            {erros.titulo && (
              <p className="text-xs text-[#130e30] mt-1.5 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {erros.titulo}
              </p>
            )}
          </div>

          {/* Categoria e Condição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
                Categoria *
              </label>
              <select
                id="categoria"
                name="categoria"
                value={dados.categoria}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-full border text-sm text-[#130e30] bg-white font-sans focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                  erros.categoria ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                }`}
              >
                <option value="">Selecione a categoria</option>
                {LISTA_CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {erros.categoria && (
                <p id="erro-titulo" role="alert" className="text-xs text-[#130e30] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.categoria}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="condicao" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
                Condição do Material *
              </label>
              <select
                id="condicao"
                name="condicao"
                value={dados.condicao}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-full border text-sm text-[#130e30] bg-white font-sans focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                  erros.condicao ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                }`}
              >
                <option value="">Selecione a conservação</option>
                {LISTA_CONDICOES.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
              {erros.condicao && (
                <p className="text-xs text-[#130e30] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.condicao}
                </p>
              )}
            </div>
          </div>

          {/* Foto opcional do item */}
          <div className="space-y-2.5">
            <label htmlFor="foto-material" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider font-sans">
              Foto do material (opcional)
            </label>
            <input
              ref={campoFoto}
              id="foto-material"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFotoChange}
              aria-describedby="ajuda-foto-material"
              className="block w-full rounded-2xl border border-[#130e30]/30 bg-white px-4 py-3 text-sm text-[#130e30] file:mr-4 file:rounded-full file:border-0 file:bg-[#130e30] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white focus:outline-none focus:ring-2 focus:ring-[#130e30]"
            />
            <p id="ajuda-foto-material" className="text-xs text-[#5f5c6e] font-sans">
              JPG, PNG ou WebP, até 5 MB. A foto ficará visível no anúncio público. Use uma imagem sua ou autorizada, fotografe apenas o material e evite rostos, documentos e dados pessoais.
            </p>
            {erroFoto && <p role="alert" className="text-xs font-semibold text-red-800">{erroFoto}</p>}
            {fotoPreview && (
              <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[#130e30]/15 bg-white p-3">
                <img src={fotoPreview} alt="Prévia da foto do material" className="h-32 w-40 rounded-xl border border-[#130e30]/10 object-cover" />
                <button
                  type="button"
                  onClick={removerFoto}
                  className="rounded-full border border-[#130e30]/30 px-4 py-2 text-xs font-semibold text-[#130e30] hover:bg-[#130e30]/5"
                >
                  Remover foto
                </button>
              </div>
            )}
          </div>

          {/* Escola e Série */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="escola" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
                Escola de referência e ponto de encontro *
              </label>
              <select
                id="escola"
                name="escola"
                value={dados.escola}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-full border text-sm text-[#130e30] bg-white font-sans focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                  erros.escola ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                }`}
              >
                <option value="">Selecione uma escola de Porto Velho</option>
                {LISTA_ESCOLAS.map((esc) => (
                  <option key={esc} value={esc}>
                    {esc}
                  </option>
                ))}
              </select>
              {erros.escola && (
                <p className="text-xs text-[#130e30] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.escola}
                </p>
              )}
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#5f5c6e]">
                Combine a entrega na escola selecionada e respeite as regras de acesso da unidade.
              </p>
            </div>

            <div>
              <label htmlFor="serie" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
                Série / ano letivo / turma *
              </label>
              <input
                id="serie"
                name="serie"
                type="text"
                maxLength={120}
                aria-invalid={Boolean(erros.serie)}
                aria-describedby={erros.serie ? "erro-serie" : undefined}
                value={dados.serie}
                onChange={handleChange}
                placeholder="Ex.: 3º B — Técnico em Informática — vespertino"
                className={`w-full px-4 py-3 rounded-full border text-sm text-[#130e30] bg-white font-sans focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                  erros.serie ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
                }`}
              />
              <p className="mt-1.5 text-[11px] text-[#5f5c6e]">
                Digite a série, turma, curso e turno, se houver.
              </p>
              {erros.serie && (
                <p id="erro-serie" role="alert" className="text-xs text-[#130e30] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {erros.serie}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-xs font-bold text-[#130e30] uppercase tracking-wider mb-2 font-sans">
              Descrição detalhada *
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              maxLength={1500}
              aria-invalid={Boolean(erros.descricao)}
              aria-describedby={erros.descricao ? "erro-descricao" : undefined}
              value={dados.descricao}
              onChange={handleChange}
              placeholder="Descreva o estado do material (se há grifos, tamanho de uniformes, edição de livros, etc.)"
              className={`w-full px-5 py-3.5 rounded-[24px] border text-sm text-[#130e30] placeholder-[#5f5c6e] bg-white font-sans focus:outline-none focus:ring-2 focus:ring-[#130e30] ${
                erros.descricao ? "border-[#130e30] ring-2 ring-[#ffe228]" : "border-[#130e30]/30"
              }`}
            />
            {erros.descricao && (
              <p id="erro-descricao" role="alert" className="text-xs text-[#130e30] mt-1.5 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {erros.descricao}
              </p>
            )}
          </div>

          {/* Botões de Ação (Par Hi-Yellow + Dark Pill) */}
          <div className="pt-4 border-t border-[#130e30]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMostrarPrevia(!mostrarPrevia)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#130e30] text-[#130e30] hover:bg-[#130e30]/5 text-sm font-medium transition-colors font-sans"
            >
              <Eye className="w-4 h-4" />
              {mostrarPrevia ? "Ocultar prévia" : "Visualizar prévia"}
            </button>

            <button
              type="submit"
              disabled={publicando}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#ffe228] hover:bg-[#f6d91d] text-[#130e30] text-sm font-bold transition-colors font-sans disabled:cursor-wait disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {publicando ? "Publicando..." : "Publicar material"}
            </button>
          </div>
        </form>
      </div>

      {/* Coluna Lateral: Prévia e Orientações */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#130e30] mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Prévia em tempo real
          </h3>
          <CartaoMaterial material={materialPrevia} />
        </div>



      </div>
    </div>
  );
}
