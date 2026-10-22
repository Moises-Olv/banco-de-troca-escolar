import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // A verificação de sessão só é necessária nas páginas privadas. Nas páginas
  // públicas ela adicionava uma ida ao Supabase em toda navegação.
  matcher: ["/minha-atividade/:path*", "/publicar/:path*"],
};
