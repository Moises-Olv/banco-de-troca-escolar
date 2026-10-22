import { CategoriaMaterial, CondicaoMaterial, StatusMaterial } from "@/data/materiais";

export function obterEstiloDoacao(): {
  bg: string;
  text: string;
  border: string;
  rotulo: string;
} {
  return {
    bg: "bg-[#ffe228]",
    text: "text-[#130e30]",
    border: "border-[#130e30]",
    rotulo: "Doação gratuita",
  };
}

export function obterCorCategoria(categoria: CategoriaMaterial): {
  bg: string;
  text: string;
  border: string;
} {
  return {
    bg: "bg-[#f9fbf2]",
    text: "text-[#130e30]",
    border: "border-[#130e30]/20",
  };
}

export function obterCorCondicao(condicao: CondicaoMaterial): {
  bg: string;
  text: string;
  border: string;
} {
  return {
    bg: "bg-[#eff2e5]",
    text: "text-[#5f5c6e]",
    border: "border-[#5f5c6e]/30",
  };
}

export function obterCorStatus(status: StatusMaterial): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case "Disponível":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-900",
        dot: "bg-emerald-600",
      };
    case "Reservado":
      return {
        bg: "bg-[#ffe228]/40",
        text: "text-[#130e30]",
        dot: "bg-[#ffe228]",
      };
    case "Indisponível":
    case "Concluído":
    default:
      return {
        bg: "bg-[#eff2e5]",
        text: "text-[#5f5c6e]",
        dot: "bg-[#5f5c6e]",
      };
  }
}

export function truncarTexto(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  return texto.slice(0, limite).trim() + "...";
}
