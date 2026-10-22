import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de uso | Banco de Troca Escolar",
  description: "Regras para usar o Banco de Troca Escolar e publicar ou solicitar doações de materiais escolares.",
};

const secao = "space-y-3 rounded-3xl border border-[#130e30]/15 bg-[#f9fbf2] p-5 sm:p-7";

export default function PaginaTermos() {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-5 px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 space-y-3">
        <span className="inline-flex rounded-full border border-[#130e30]/15 bg-[#eff2e5] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#130e30]">Regras do site</span>
        <h1 className="font-serif text-4xl font-bold text-[#130e30] sm:text-5xl">Termos de uso</h1>
        <p className="text-sm text-[#5f5c6e]">Atualizados em 22 de outubro de 2026.</p>
        <p className="max-w-3xl text-base leading-relaxed text-[#5f5c6e]">Ao criar uma conta ou usar as funções autenticadas, você concorda com estas regras e com a <Link href="/privacidade" className="font-semibold text-[#130e30] underline underline-offset-2">Política de privacidade</Link>.</p>
      </header>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">1. O que o site oferece</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">O Banco de Troca Escolar organiza anúncios e pedidos para facilitar doações gratuitas de materiais escolares entre pessoas. O site não vende, compra, cobra, paga nem realiza trocas. Não transfira dinheiro pelo site e denuncie anúncios que peçam pagamento.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">2. Quem pode usar</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">A conta é destinada a responsáveis ou estudantes maiores de idade. Estudantes menores de idade devem participar com acompanhamento do responsável; não devem combinar ou realizar entregas sozinhos.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">3. Regras para anúncios e pedidos</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#5f5c6e]">
          <li>Informe corretamente a condição, edição, tamanho e demais características do material.</li>
          <li>Não publique venda, cobrança, conteúdo ofensivo, ilegal ou informações de contato, endereço residencial, documentos ou dados de outras pessoas.</li>
          <li>Use apenas imagens que você criou ou tem autorização para publicar. Você mantém os direitos da imagem e permite que ela seja exibida no anúncio enquanto estiver no site. Evite rostos de crianças e dados identificáveis.</li>
          <li>Use o fluxo de pedidos do site para combinar a data e o horário de entrega na escola indicada. Respeite as regras da unidade escolar e use o código de confirmação somente no momento adequado da entrega.</li>
        </ul>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">4. Perfis e conteúdo público</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">O nome escolhido e, se preenchidos, foto e escola aparecem no perfil público. Anúncios e fotos de materiais são públicos enquanto publicados. Você pode editar o perfil e remover anúncios conforme as funções disponíveis. Não publique dados que não queira tornar visíveis.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">5. Moderação e disponibilidade</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">A administração pode analisar denúncias e retirar anúncios que violem estes termos ou coloquem pessoas em risco. O site organiza informações e pedidos, mas não inspeciona fisicamente cada item, não participa dos encontros e não garante que um anúncio continue disponível, que o item corresponda à descrição ou que uma entrega ocorra. Isso não elimina direitos previstos em lei.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">6. Pagamentos, reembolsos e avaliações</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">O site não cobra pelo uso, não processa pagamentos e não realiza vendas; por isso, não há reembolso de compra a ser solicitado na plataforma. O serviço atualmente não tem sistema de notas ou avaliações de usuários. Não considere relatos ou números como depoimentos ou resultados verificados.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">7. Acesso e alterações</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">O acesso pode sofrer interrupções para manutenção ou por falhas dos serviços de hospedagem, internet ou banco de dados. As regras podem ser atualizadas quando o site mudar; a versão vigente ficará disponível nesta página. Se você não concordar com uma alteração, deixe de usar a conta e solicite ajuda pelo formulário de <Link href="/sobre#reportar-problema" className="font-semibold text-[#130e30] underline underline-offset-2">relatos e solicitações</Link>.</p>
      </section>
    </article>
  );
}
