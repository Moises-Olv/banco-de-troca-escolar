"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Gift, School } from "lucide-react";
import AvatarUsuario from "@/components/AvatarUsuario";
import CartaoMaterial from "@/components/CartaoMaterial";
import EstadoVazio from "@/components/EstadoVazio";
import { Material } from "@/data/materiais";
import { LinhaMaterialBanco, mapearMaterialBanco } from "@/lib/materiais";
import type { PerfilPublicoBanco } from "@/lib/perfis";
import { createClient } from "@/lib/supabase/client";

interface EstatisticasPerfil {
  doador_ativo: boolean;
  total_doacoes: number;
}

export default function PaginaPerfilPublico() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [perfil, setPerfil] = useState<PerfilPublicoBanco | null>(null);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasPerfil>({ doador_ativo: false, total_doacoes: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      if (!id) return;
      const supabase = createClient();
      const [resPerfil, resMateriais, resEstatisticas] = await Promise.all([
        supabase.from("perfis").select("id,nome_exibicao,escola,foto_url").eq("id", id).maybeSingle(),
        supabase.from("materiais").select("id,usuario_id,titulo,descricao,escola,serie,categoria,condicao,modalidade,status,imagem_url,criado_em,ativo").eq("usuario_id", id).eq("status", "Disponível").eq("ativo", true).order("criado_em", { ascending: false }),
        supabase.rpc("estatisticas_perfil_publico", { p_usuario_id: id }),
      ]);
      if (!ativo) return;
      if (resPerfil.error) {
        setErro(`Não foi possível carregar o perfil: ${resPerfil.error.message}. Execute supabase/perfis-publicos.sql no Supabase.`);
      } else if (!resPerfil.data) {
        setErro("Este perfil não foi encontrado.");
      } else {
        const perfilEncontrado = resPerfil.data as PerfilPublicoBanco;
        setPerfil(perfilEncontrado);
        if (resMateriais.error) {
          setErro(`O perfil carregou, mas os anúncios não puderam ser exibidos: ${resMateriais.error.message}`);
        } else {
          setMateriais(((resMateriais.data ?? []) as LinhaMaterialBanco[]).map((linha) => mapearMaterialBanco(linha, perfilEncontrado)));
        }
        const estatisticasRetornadas = resEstatisticas.data as EstatisticasPerfil[] | null;
        if (!resEstatisticas.error && estatisticasRetornadas?.[0]) setEstatisticas(estatisticasRetornadas[0]);
      }
      setCarregando(false);
    };
    void carregar();
    return () => { ativo = false; };
  }, [id]);

  if (carregando) return <p className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[#5f5c6e]">Carregando perfil...</p>;
  if (!perfil) {
    return <div className="mx-auto max-w-5xl px-4 py-12"><EstadoVazio tipo="geral" titulo="Perfil indisponível" descricao={erro || "Não encontramos esta pessoa."} rotuloAcao="Ir ao catálogo" aoClicarAcao={() => { window.location.href = "/catalogo"; }} /></div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Link href="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#130e30] hover:underline"><ArrowLeft className="h-4 w-4" />Voltar ao catálogo</Link>
      <section className="rounded-[28px] border border-[#130e30]/15 bg-[#eff2e5] p-6 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <AvatarUsuario nome={perfil.nome_exibicao} fotoUrl={perfil.foto_url ?? undefined} className="h-24 w-24 text-2xl" />
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5f5c6e]">Perfil público</span>
            <h1 className="mt-1 break-words font-serif text-3xl font-bold text-[#130e30] sm:text-4xl">{perfil.nome_exibicao}</h1>
            {perfil.escola && <p className="mt-2 flex items-center gap-2 text-sm text-[#5f5c6e]"><School className="h-4 w-4 shrink-0 text-[#130e30]" />{perfil.escola}</p>}
          </div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-[#130e30]/10 bg-white p-4">
            {estatisticas.doador_ativo ? <BadgeCheck className="h-6 w-6 text-emerald-700" /> : <Gift className="h-6 w-6 text-[#130e30]" />}
            <div><p className="text-xs text-[#5f5c6e]">Status</p><p className="font-semibold text-[#130e30]">{estatisticas.doador_ativo ? "Doador ativo" : "Participante da comunidade"}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#130e30]/10 bg-white p-4">
            <Gift className="h-6 w-6 text-[#130e30]" />
            <div><p className="text-xs text-[#5f5c6e]">Doações concluídas</p><p className="font-semibold text-[#130e30]">{estatisticas.total_doacoes} {estatisticas.total_doacoes === 1 ? "item" : "itens"}</p></div>
          </div>
        </div>
      </section>

      {erro && <p role="status" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">{erro}</p>}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><span className="text-xs font-bold uppercase tracking-widest text-[#130e30]">Anúncios</span><h2 className="font-serif text-2xl font-bold text-[#130e30]">Materiais disponíveis</h2></div>
          <span className="text-sm text-[#5f5c6e]">{materiais.length} {materiais.length === 1 ? "anúncio" : "anúncios"}</span>
        </div>
        {materiais.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{materiais.map((material) => <CartaoMaterial key={material.id} material={material} />)}</div>
        ) : (
          <div className="rounded-[24px] border border-[#130e30]/10 bg-[#eff2e5] p-7 text-sm text-[#5f5c6e]">Esta pessoa não tem anúncios disponíveis no momento.</div>
        )}
      </section>
    </main>
  );
}
