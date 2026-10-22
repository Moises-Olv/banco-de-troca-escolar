import type { SupabaseClient } from "@supabase/supabase-js";
import type { PerfilAnuncianteBanco } from "@/lib/materiais";

export interface PerfilPublicoBanco extends PerfilAnuncianteBanco {
  escola: string | null;
}

export async function buscarPerfisPublicos(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, PerfilPublicoBanco>> {
  const idsUnicos = Array.from(new Set(ids.filter(Boolean)));
  if (idsUnicos.length === 0) return new Map();

  const { data, error } = await supabase
    .from("perfis")
    .select("id,nome_exibicao,escola,foto_url")
    .in("id", idsUnicos);

  if (error || !data) return new Map();

  return new Map(
    (data as PerfilPublicoBanco[]).map((perfil) => [perfil.id, perfil])
  );
}
