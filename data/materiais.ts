export type CategoriaMaterial = "Livro" | "Uniforme" | "Outro material";
export type CondicaoMaterial = "Novo" | "Bom estado" | "Usado";
export type ModalidadeMaterial = "Doação";
export type StatusMaterial = "Disponível" | "Indisponível" | "Reservado" | "Concluído";

export interface Material {
  id: string;
  titulo: string;
  descricao: string;
  escola: string;
  serie: string;
  categoria: CategoriaMaterial;
  condicao: CondicaoMaterial;
  modalidade: ModalidadeMaterial;
  status: StatusMaterial;
  removidoPorModeracao?: boolean;
  imagem?: string;
  criadoEm: string;
  anunciante: {
    id?: string;
    nomeFicticio: string;
    fotoUrl?: string;
  };
}

export interface PedidoInteresse {
  id: string;
  materialId: string;
  materialTitulo: string;
  solicitanteNome: string;
  mensagem: string;
  status: "Pendente" | "Reservado" | "Recusado" | "Encerrado" | "Concluído";
  criadoEm: string;
  dataEntrega?: string | null;
  mensagemEntrega?: string | null;
  entregaConfirmadaEm?: string | null;
  tipo: "recebido" | "enviado";
}

export const LISTA_ESCOLAS = [
  // Seleção inicial a partir de diretórios oficiais; não é um ranking nem uma lista completa.
  "IFRO — Campus Porto Velho Calama",
  "IFRO — Campus Porto Velho Zona Norte",
  "EEEM João Bento da Costa",
  "EEEFM Barão do Solimões",
  "EEEFM Getúlio Vargas",
  "EEEFM Professor Orlando Freire",
  "EEEFM Professor Eduardo Lima e Silva",
  "EEEFM Professora Flora Calheiros Cotrin",
  "EEEFM Presidente Tancredo de Almeida Neves",
  "EEEFM Mariana",
  "EEEFM José Otino de Freitas",
  "EEEFM Risoleta Neves",
  "EEEFM São Domingos Sávio — Unidade I",
  "EEEFM Madeira-Mamoré",
  "EEEFM Roberto Pires",
  "EEEF Maria Carmosina Pinheiro",
  "EMEF Antônio Ferreira da Silva",
  "EMEF Barão do Rio Branco",
  "EMEF Bom Jesus",
  "EMEF Padre Chiquinho",
  "EMEF Professor Herbert de Alencar",
  "EMEF Professor Pedro Tavares Batalha",
  "EMEF Senador Darcy Ribeiro",
  "EMEIEF Bilíngue Porto Velho",
  "EMEF João Ribeiro Soares",
  "IME Engenheiro Francisco Erse",
];

export const LISTA_CATEGORIAS: CategoriaMaterial[] = [
  "Livro",
  "Uniforme",
  "Outro material",
];

export const LISTA_CONDICOES: CondicaoMaterial[] = [
  "Novo",
  "Bom estado",
  "Usado",
];

export const MATERIAIS_INICIAIS: Material[] = [];

export const PEDIDOS_EXEMPLO: PedidoInteresse[] = [];

export const MEUS_ANUNCIOS_EXEMPLO: Material[] = [];
