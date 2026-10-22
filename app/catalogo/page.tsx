"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Material } from "@/data/materiais";
import CartaoMaterial from "@/components/CartaoMaterial";
import BuscaCatalogo from "@/components/BuscaCatalogo";
import FiltrosCatalogo, { FiltrosEstado } from "@/components/FiltrosCatalogo";
import EstadoVazio from "@/components/EstadoVazio";
import { ArrowUpDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LinhaMaterialBanco, LinhaMaterialCatalogoBanco, mapearMaterialBanco, mapearMaterialCatalogoBanco } from "@/lib/materiais";
import { buscarPerfisPublicos } from "@/lib/perfis";

export default function PaginaCatalogo() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<"recentes" | "alfabetica">("recentes");
  const [filtros, setFiltros] = useState<FiltrosEstado>({
    escola: "",
    serie: "",
    categoria: "",
    condicao: "",
  });

  useEffect(() => {
    let ativo = true;

    const buscarMateriais = async () => {
      const supabase = createClient();
      const resultadoRapido = await supabase
        .from("catalogo_materiais_rapidos")
        .select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo,anunciante_nome,anunciante_foto_url")
        .order("criado_em", { ascending: false });

      if (!ativo) return;

      let materiaisCarregados: Material[];
      if (resultadoRapido.error) {
        // Compatibilidade enquanto a view de leitura ainda não estiver no banco.
        const resultadoAnterior = await supabase
          .from("materiais")
          .select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo")
          .eq("status", "Disponível")
          .eq("ativo", true)
          .order("criado_em", { ascending: false });
        if (!ativo) return;
        if (resultadoAnterior.error) {
          setErroCarregamento("Não foi possível carregar os anúncios. Tente atualizar a página.");
          setCarregando(false);
          return;
        }
        const linhasAnteriores = (resultadoAnterior.data ?? []) as LinhaMaterialBanco[];
        const perfis = await buscarPerfisPublicos(supabase, linhasAnteriores.map((linha) => linha.usuario_id));
        materiaisCarregados = linhasAnteriores.map((linha) => mapearMaterialBanco(linha, perfis.get(linha.usuario_id)));
      } else {
        const linhas = (resultadoRapido.data ?? []) as LinhaMaterialCatalogoBanco[];
        materiaisCarregados = linhas.map(mapearMaterialCatalogoBanco);
      }
      if (!ativo) return;
      setMateriais(materiaisCarregados);
      setCarregando(false);
    };

    void buscarMateriais();

    return () => {
      ativo = false;
    };
  }, []);

  const handleAlterarFiltro = (chave: keyof FiltrosEstado, valor: string) => {
    setFiltros((prev) => ({ ...prev, [chave]: valor }));
  };

  const handleLimparFiltros = () => {
    setFiltros({
      escola: "",
      serie: "",
      categoria: "",
      condicao: "",
    });
    setBusca("");
  };

  const materiaisFiltrados = useMemo(() => {
    const filtrados = materiais.filter((item: Material) => {
      if (item.status !== "Disponível") {
        return false;
      }

      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const noTitulo = item.titulo.toLowerCase().includes(termo);
        const naDescricao = item.descricao.toLowerCase().includes(termo);
        const naEscola = item.escola.toLowerCase().includes(termo);
        if (!noTitulo && !naDescricao && !naEscola) {
          return false;
        }
      }

      if (filtros.categoria && item.categoria !== filtros.categoria) {
        return false;
      }

      if (filtros.escola && item.escola !== filtros.escola) {
        return false;
      }

      if (filtros.serie && !item.serie.toLocaleLowerCase().includes(filtros.serie.trim().toLocaleLowerCase())) {
        return false;
      }

      if (filtros.condicao && item.condicao !== filtros.condicao) {
        return false;
      }

      return true;
    });

    if (ordenacao === "alfabetica") {
      return filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    // A consulta já vem ordenada do mais recente para o mais antigo.
    return filtrados;
  }, [materiais, busca, filtros, ordenacao]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#130e30]/10 pb-6">
        <div>
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#130e30]">
            Explorar Acervo
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#130e30] mt-1">
            Catálogo de Materiais Escolares
          </h1>
          <p className="text-[#5f5c6e] text-sm mt-1 font-sans">
            Encontre materiais doados e combine a retirada na escola indicada no anúncio.
          </p>
        </div>

        {/* Ordenação com Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label htmlFor="ordenacao" className="text-xs font-bold text-[#130e30] flex items-center gap-1 font-sans">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Ordenar por:
          </label>
          <select
            id="ordenacao"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as "recentes" | "alfabetica")}
            className="text-xs sm:text-sm bg-[#ffffff] border border-[#130e30]/30 rounded-full py-2 px-4 text-[#130e30] font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#130e30]"
          >
            <option value="recentes">Mais recentes</option>
            <option value="alfabetica">Ordem alfabética (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Campo de Busca Principal */}
      <div className="max-w-2xl">
        <BuscaCatalogo
          valorBusca={busca}
          aoMudarBusca={setBusca}
          aoLimparBusca={() => setBusca("")}
          placeholder="Buscar por livro, matéria, uniforme ou nome da escola..."
        />
      </div>

      {/* Painel de Filtros Reutilizável */}
      <FiltrosCatalogo
        filtros={filtros}
        aoAlterarFiltro={handleAlterarFiltro}
        aoLimparFiltros={handleLimparFiltros}
        totalResultados={materiaisFiltrados.length}
      />

      {erroCarregamento && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          {erroCarregamento}
        </p>
      )}

      {/* Grade de Resultados */}
      {erroCarregamento ? null : carregando ? (
        <p className="py-8 text-center text-sm text-[#5f5c6e]">Carregando anúncios...</p>
      ) : materiaisFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {materiaisFiltrados.map((material) => (
            <CartaoMaterial key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <EstadoVazio
          tipo="busca"
          titulo={materiais.length === 0 ? "Ainda não há anúncios publicados" : "Nenhum material encontrado"}
          descricao={
            materiais.length === 0
              ? "Quando alguém publicar um livro, uniforme ou outro material, ele aparecerá aqui."
              : "Não encontramos itens correspondentes aos termos ou filtros selecionados. Tente buscar com termos mais amplos ou redefinir os filtros."
          }
          rotuloAcao="Limpar busca e filtros"
          aoClicarAcao={handleLimparFiltros}
        />
      )}
    </div>
  );
}
