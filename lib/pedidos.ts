import { PedidoInteresse } from "@/data/materiais";

export interface LinhaPedidoBanco {
  id: string;
  material_id: string;
  material_titulo: string;
  solicitante_nome: string;
  mensagem: string | null;
  status: PedidoInteresse["status"];
  criado_em: string;
  data_entrega?: string | null;
  mensagem_entrega?: string | null;
  entrega_confirmada_em?: string | null;
}

export function mapearPedidoBanco(
  linha: LinhaPedidoBanco,
  tipo: PedidoInteresse["tipo"]
): PedidoInteresse {
  return {
    id: linha.id,
    materialId: linha.material_id,
    materialTitulo: linha.material_titulo,
    solicitanteNome: linha.solicitante_nome,
    mensagem: linha.mensagem ?? "",
    status: linha.status,
    criadoEm: linha.criado_em
      ? new Date(linha.criado_em).toLocaleDateString("pt-BR")
      : "Data não informada",
    dataEntrega: linha.data_entrega ?? null,
    mensagemEntrega: linha.mensagem_entrega ?? null,
    entregaConfirmadaEm: linha.entrega_confirmada_em ?? null,
    tipo,
  };
}
