import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de privacidade | Banco de Troca Escolar",
  description: "Entenda quais dados o Banco de Troca Escolar utiliza, para quê e como solicitar acesso, correção ou exclusão.",
};

const secao = "space-y-3 rounded-3xl border border-[#130e30]/15 bg-[#f9fbf2] p-5 sm:p-7";

export default function PaginaPrivacidade() {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-5 px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#130e30]/15 bg-[#eff2e5] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#130e30]"><LockKeyhole className="h-4 w-4" aria-hidden="true" />Privacidade</span>
        <h1 className="font-serif text-4xl font-bold text-[#130e30] sm:text-5xl">Política de privacidade</h1>
        <p className="text-sm text-[#5f5c6e]">Atualizada em 22 de outubro de 2026.</p>
        <p className="max-w-3xl text-base leading-relaxed text-[#5f5c6e]">Esta página explica como o Banco de Troca Escolar trata dados pessoais quando você navega, cria uma conta, publica uma doação ou envia um relato.</p>
      </header>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">1. Quem mantém o projeto</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">O Banco de Troca Escolar é um projeto escolar desenvolvido por Moisés Claudino Oliveira, estudante do IFRO — Campus Porto Velho Calama. É uma iniciativa pessoal de projeto escolar, não uma empresa nem um canal oficial do IFRO. Para falar sobre privacidade ou exercer seus direitos, use o <Link href="/sobre#reportar-problema" className="font-semibold text-[#130e30] underline underline-offset-2">formulário de relatos e solicitações</Link>.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">2. Dados utilizados e finalidades</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#5f5c6e]">
          <li><strong className="text-[#130e30]">Conta:</strong> e-mail e credencial de acesso, tratados pelo Supabase Auth para criar a conta, autenticar e recuperar a senha. A senha não é exibida no site.</li>
          <li><strong className="text-[#130e30]">Perfil:</strong> nome para exibição e, se você escolher, escola e foto. O nome e os campos preenchidos ficam visíveis no perfil público.</li>
          <li><strong className="text-[#130e30]">Anúncios:</strong> título, descrição, escola/ponto de entrega, série ou turma, categoria, condição e foto opcional, para apresentar a doação no catálogo.</li>
          <li><strong className="text-[#130e30]">Pedidos:</strong> mensagem, proposta e confirmação de data/horário, estado do pedido e código de confirmação. O código e os detalhes do pedido são restritos às pessoas participantes e à administração necessária do site.</li>
          <li><strong className="text-[#130e30]">Relatos e pedidos de privacidade:</strong> tipo, página, descrição, passos para reprodução e, se informado, e-mail de retorno. Esses registros são analisados no painel administrativo.</li>
          <li><strong className="text-[#130e30]">Dados técnicos:</strong> provedores de hospedagem e banco podem registrar informações técnicas de acesso, como horário, endereço IP e dados de requisição, para operar e proteger os serviços.</li>
        </ul>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">O site não solicita pagamento, cartão, telefone ou endereço residencial para usar as funções de doação. Não informe senhas, documentos, códigos de entrega ou dados de saúde em anúncios e relatos.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">3. O que fica público</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">Anúncios publicados e fotos dos materiais ficam acessíveis no catálogo público. No perfil, ficam visíveis o nome escolhido, a foto se adicionada, a escola se preenchida e as informações de doações mostradas pela página. Seu e-mail de acesso, senha, mensagens de pedidos e código de confirmação não aparecem publicamente. Considere que visitantes podem copiar ou capturar conteúdo público antes de sua remoção.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">4. Uso, base e compartilhamento</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">Os dados são usados para fornecer as funções solicitadas, manter contas e anúncios, organizar pedidos, responder relatos, proteger o serviço e cumprir obrigações aplicáveis. Para conta, publicação e pedido, o tratamento é necessário para fornecer a função que você solicitou. Escola e foto opcionais só são publicadas quando você escolhe preenchê-las e salvar. Segurança e moderação podem exigir tratamento para prevenção de fraude e proteção do serviço; obrigações legais e exercício regular de direitos podem justificar retenções específicas. A base aplicável depende da operação concreta.</p>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">O projeto usa Supabase para autenticação, banco de dados e armazenamento de fotos e Vercel para hospedagem. Esses fornecedores tratam dados para prestar seus serviços, conforme configurações e termos aplicáveis. O projeto Supabase está configurado na região US West (Oregon), nos Estados Unidos; a Vercel também pode processar dados nos Estados Unidos e em outras regiões onde opera. A transferência pode ocorrer de forma contínua enquanto as funções do site são usadas, para autenticação, armazenamento, banco e hospedagem. Consulte os documentos de processamento do <a href="https://supabase.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#130e30] underline underline-offset-2">Supabase</a> e da <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#130e30] underline underline-offset-2">Vercel</a>; para detalhes do contrato e do mecanismo aplicável a esta implantação, solicite pelo formulário de privacidade.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">5. Cookies e armazenamento no navegador</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">A sessão de login pode usar cookies técnicos do Supabase para manter sua autenticação. O tema escolhido (claro ou escuro) é salvo no armazenamento local do navegador. A inspeção do código não encontrou ferramentas de publicidade, analytics ou rastreamento comportamental; por isso, o site não mostra um banner de consentimento para cookies não essenciais. Se forem adicionadas ferramentas desse tipo, esta política e os controles de escolha deverão ser atualizados antes da ativação.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">6. Prazo de retenção e segurança</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">Os dados são mantidos enquanto a conta, anúncio ou pedido estiver ativo e pelo tempo necessário para administrar a plataforma, atender solicitações e preservar registros necessários. Cópias técnicas podem permanecer nos prazos de backup dos fornecedores. O banco usa regras de acesso por conta e função e o site aplica permissões para limitar alterações; nenhum serviço conectado à internet pode prometer risco zero.</p>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">Para solicitar exclusão da conta ou de dados, use o formulário abaixo. A solicitação será analisada; ela não apaga dados automaticamente e pode haver retenção permitida ou exigida por lei ou necessária para preservar histórico e resolver disputas.</p>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">7. Seus direitos</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">Você pode pedir confirmação e acesso aos dados, correção, informação sobre uso e compartilhamento, portabilidade quando aplicável, anonimização, bloqueio ou eliminação quando cabível, além de revogar consentimentos aplicáveis. Para evitar que outra pessoa acesse sua conta ou seus dados, pode ser necessário confirmar que o pedido veio de você.</p>
        <div className="rounded-2xl border border-[#130e30]/10 bg-[#eff2e5] p-4">
          <p className="text-sm leading-relaxed text-[#130e30]">O formulário registra seu pedido para análise administrativa; ele não executa exclusão ou alteração automaticamente. Informe o e-mail vinculado à conta e não envie senha, código de confirmação ou documentos.</p>
          <Link href="/sobre#reportar-problema" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#130e30] px-5 py-3 text-sm font-semibold text-white hover:bg-[#222222]">Abrir formulário de privacidade <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={secao}>
        <h2 className="font-serif text-2xl font-bold text-[#130e30]">8. Estudantes menores de idade</h2>
        <p className="text-sm leading-relaxed text-[#5f5c6e]">A conta deve ser criada por um responsável ou por estudante maior de idade. Estudantes menores devem usar a plataforma com acompanhamento de responsável e combinar entregas conforme as regras de segurança exibidas na publicação.</p>
      </section>

      <p className="px-1 text-xs leading-relaxed text-[#5f5c6e]">Esta política descreve o funcionamento identificado no projeto. A publicação da política não substitui a confirmação dos contratos com fornecedores nem uma análise jurídica da operação, em especial da transferência internacional de dados.</p>
    </article>
  );
}
