"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TIPOS_RELATO = [
  "Problema técnico",
  "Erro no conteúdo",
  "Acessibilidade",
  "Solicitação de dados pessoais (LGPD)",
  "Sugestão",
  "Outro",
] as const;

export default function FormularioRelato() {
  const supabase = useMemo(() => createClient(), []);
  const [tipo, setTipo] = useState<(typeof TIPOS_RELATO)[number]>("Problema técnico");
  const solicitacaoPrivacidade = tipo === "Solicitação de dados pessoais (LGPD)";
  const [pagina, setPagina] = useState("");
  const [descricao, setDescricao] = useState("");
  const [passos, setPassos] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErro("");

    if (descricao.trim().length < 15) {
      setErro(tipo === "Solicitação de dados pessoais (LGPD)"
        ? "Descreva seu pedido com pelo menos 15 caracteres."
        : "Descreva o problema com pelo menos 15 caracteres.");
      return;
    }

    if (tipo === "Solicitação de dados pessoais (LGPD)" && !email.trim()) {
      setErro("Informe o e-mail vinculado à conta para que o pedido possa ser analisado.");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase.from("relatos_erros").insert({
        tipo,
        pagina: solicitacaoPrivacidade ? null : pagina.trim() || null,
        descricao: descricao.trim(),
        passos: solicitacaoPrivacidade ? null : passos.trim() || null,
        email_contato: email.trim() || null,
      });

      if (error) throw error;
      setSucesso(true);
      setPagina("");
      setDescricao("");
      setPassos("");
      setEmail("");
    } catch {
      setErro(solicitacaoPrivacidade
        ? "Não foi possível registrar o pedido. Confira se supabase/privacidade-lgpd.sql já foi executada no Supabase e tente novamente."
        : "Não foi possível enviar o relato agora. Tente novamente mais tarde.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-[#130e30]/15 bg-[#f9fbf2] p-5 shadow-sm sm:p-8">
      {sucesso ? (
        <div role="status" className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" aria-hidden="true" />
          <h3 className="font-serif text-2xl font-bold text-[#130e30]">{solicitacaoPrivacidade ? "Solicitação registrada" : "Relato enviado"}</h3>
          <p className="text-sm leading-relaxed text-[#5f5c6e]">{solicitacaoPrivacidade ? "Seu pedido foi encaminhado para análise administrativa. Se informou um e-mail, a equipe poderá responder por ele." : "Obrigado por ajudar a melhorar o Banco de Troca Escolar."}</p>
          <button type="button" onClick={() => setSucesso(false)} className="rounded-full border border-[#130e30]/20 px-5 py-2.5 text-sm font-semibold text-[#130e30] transition-colors hover:bg-[#eff2e5]">
            {solicitacaoPrivacidade ? "Enviar outra solicitação" : "Enviar outro relato"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={`grid gap-5 ${solicitacaoPrivacidade ? "" : "sm:grid-cols-2"}`}>
            <div className="space-y-2">
              <label htmlFor="relato-tipo" className="block text-sm font-semibold text-[#130e30]">Tipo de relato</label>
              <select id="relato-tipo" value={tipo} onChange={(evento) => {
                const novoTipo = evento.target.value as (typeof TIPOS_RELATO)[number];
                setTipo(novoTipo);
                if (novoTipo === "Solicitação de dados pessoais (LGPD)") { setPagina(""); setPassos(""); }
              }} className="min-h-12 w-full rounded-xl border border-[#130e30]/20 bg-white px-4 py-3 text-sm text-[#130e30]">
                {TIPOS_RELATO.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
              </select>
            </div>
            {!solicitacaoPrivacidade && <div className="space-y-2">
              <label htmlFor="relato-pagina" className="block text-sm font-semibold text-[#130e30]">Página onde aconteceu <span className="font-normal text-[#5f5c6e]">(opcional)</span></label>
              <input id="relato-pagina" type="text" maxLength={500} value={pagina} onChange={(evento) => setPagina(evento.target.value)} placeholder="Ex.: /catalogo ou o endereço da página" className="min-h-12 w-full rounded-xl border border-[#130e30]/20 bg-white px-4 py-3 text-sm text-[#130e30] placeholder:text-[#5f5c6e]" />
            </div>}
          </div>

          <div className="space-y-2">
            <label htmlFor="relato-descricao" className="block text-sm font-semibold text-[#130e30]">{solicitacaoPrivacidade ? "Descreva sua solicitação sobre seus dados pessoais" : "O que aconteceu?"} <span aria-hidden="true" className="text-red-700">*</span></label>
            <textarea id="relato-descricao" required minLength={15} maxLength={3000} rows={4} value={descricao} onChange={(evento) => setDescricao(evento.target.value)} placeholder={solicitacaoPrivacidade ? "Diga qual direito quer exercer (por exemplo, acesso, correção, exclusão ou portabilidade). Não inclua senha, códigos ou documentos." : "Explique o erro e o que você esperava que acontecesse."} className="w-full rounded-xl border border-[#130e30]/20 bg-white px-4 py-3 text-sm leading-relaxed text-[#130e30] placeholder:text-[#5f5c6e]" />
            <p className="text-right text-xs text-[#5f5c6e]">{descricao.length}/3000</p>
          </div>

          {!solicitacaoPrivacidade && <div className="space-y-2">
            <label htmlFor="relato-passos" className="block text-sm font-semibold text-[#130e30]">Como reproduzir o problema? <span className="font-normal text-[#5f5c6e]">(opcional)</span></label>
            <textarea id="relato-passos" maxLength={3000} rows={3} value={passos} onChange={(evento) => setPassos(evento.target.value)} placeholder="Ex.: abra o catálogo, selecione um filtro e toque em buscar." className="w-full rounded-xl border border-[#130e30]/20 bg-white px-4 py-3 text-sm leading-relaxed text-[#130e30] placeholder:text-[#5f5c6e]" />
          </div>}

          <div className="space-y-2">
            <label htmlFor="relato-email" className="block text-sm font-semibold text-[#130e30]">{solicitacaoPrivacidade ? "E-mail vinculado à conta" : "E-mail para contato"} <span className="font-normal text-[#5f5c6e]">{solicitacaoPrivacidade ? "(obrigatório)" : "(opcional)"}</span></label>
            <input id="relato-email" type="email" required={solicitacaoPrivacidade} maxLength={254} autoComplete="email" value={email} onChange={(evento) => setEmail(evento.target.value)} placeholder="voce@exemplo.com" className="min-h-12 w-full rounded-xl border border-[#130e30]/20 bg-white px-4 py-3 text-sm text-[#130e30] placeholder:text-[#5f5c6e]" />
            <p className="text-xs leading-relaxed text-[#5f5c6e]">{solicitacaoPrivacidade ? "Usaremos este e-mail para localizar a conta e responder ao pedido. Não envie senha, código de entrega ou documentos." : "Informe somente se quiser que entremos em contato sobre o relato."}</p>
          </div>

          {erro && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-700/20 bg-red-50 p-3 text-sm text-red-900"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{erro}</p>}

          <button type="submit" disabled={enviando} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#130e30] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#222222] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            <Send className="h-4 w-4" aria-hidden="true" />
            {enviando ? "Enviando relato..." : "Enviar relato"}
          </button>
        </form>
      )}
    </div>
  );
}
