import {
  CategoriaMaterial,
  CondicaoMaterial,
  Material,
  ModalidadeMaterial,
  StatusMaterial,
} from "@/data/materiais";

export interface LinhaMaterialBanco {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao: string;
  escola: string;
  serie: string;
  categoria: CategoriaMaterial;
  condicao: CondicaoMaterial;
  modalidade: ModalidadeMaterial;
  status: StatusMaterial;
  ativo: boolean;
  removido_por_moderacao?: boolean;
  imagem_url: string | null;
  criado_em: string;
}

export interface LinhaMaterialCatalogoBanco extends LinhaMaterialBanco {
  anunciante_nome: string | null;
  anunciante_foto_url: string | null;
}

export interface PerfilAnuncianteBanco {
  id: string;
  nome_exibicao: string;
  foto_url: string | null;
}

export function mapearMaterialBanco(
  linha: LinhaMaterialBanco,
  perfil?: PerfilAnuncianteBanco
): Material {
  return {
    id: linha.id,
    titulo: linha.titulo,
    descricao: linha.descricao,
    escola: linha.escola,
    serie: linha.serie,
    categoria: linha.categoria,
    condicao: linha.condicao,
    // Até a migração do banco ser aplicada, todos os anúncios são exibidos como doação.
    modalidade: "Doação",
    status:
      linha.status === "Disponível" && linha.ativo === false
        ? "Indisponível"
        : linha.status,
    removidoPorModeracao: linha.removido_por_moderacao === true,
    imagem: linha.imagem_url ?? undefined,
    criadoEm: linha.criado_em
      ? new Date(linha.criado_em).toLocaleDateString("pt-BR")
      : "Data não informada",
    anunciante: {
      id: linha.usuario_id,
      nomeFicticio: perfil?.nome_exibicao || "Membro da comunidade",
      fotoUrl: perfil?.foto_url ?? undefined,
    },
  };
}

export function mapearMaterialCatalogoBanco(linha: LinhaMaterialCatalogoBanco): Material {
  return mapearMaterialBanco(linha, {
    id: linha.usuario_id,
    nome_exibicao: linha.anunciante_nome || "Membro da comunidade",
    foto_url: linha.anunciante_foto_url,
  });
}
