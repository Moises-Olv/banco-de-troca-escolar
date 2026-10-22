import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  School,
} from "lucide-react";
import FormularioRelato from "@/components/FormularioRelato";

const etapas = [
  {
    numero: "01",
    titulo: "A pessoa interessada envia um pedido",
    descricao: "Ela escolhe um anúncio disponível e explica brevemente por que tem interesse no material.",
  },
  {
    numero: "02",
    titulo: "Quem doa propõe dia e horário",
    descricao: "Em Minha Atividade, quem doa escolhe a data e o horário da entrega na escola e pode deixar uma mensagem com orientações. O anúncio fica reservado enquanto quem recebe confirma ou cancela.",
  },
  {
    numero: "03",
    titulo: "Quem recebe confirma ou cancela",
    descricao: "A pessoa interessada pode confirmar a data proposta ou cancelar o pedido. Ao cancelar, o anúncio volta a ficar disponível para outras pessoas.",
  },
  {
    numero: "04",
    titulo: "A entrega é confirmada",
    descricao: "No encontro, quem doa informa o código do pedido e quem recebe usa esse código para confirmar o recebimento no site.",
  },
];

export default function PaginaSobre() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-16 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section className="grid items-center gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:gap-14">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-[#130e30]/15 bg-[#eff2e5] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#130e30]">
            Sobre o projeto
          </span>
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-[#130e30] sm:text-5xl">
            Uma iniciativa escolar para aproximar quem pode doar de quem precisa.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#5f5c6e] sm:text-lg">
            Desenvolvi o Banco de Troca Escolar para facilitar a doação de livros, uniformes e outros materiais entre estudantes e famílias. A ideia é ajudar a reduzir gastos, dar novo uso a itens em bom estado e tornar mais simples encontrar materiais por escola e série.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link href="/catalogo" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#130e30] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#222222]">
              Explorar o catálogo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/publicar" className="inline-flex items-center justify-center rounded-full bg-[#ffe228] px-6 py-3 font-semibold text-[#130e30] transition-colors hover:bg-[#f6d91d]">
              Publicar uma doação
            </Link>
          </div>
        </div>

        <aside className="rounded-[28px] border border-[#130e30]/15 bg-[#eff2e5] p-6 sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe228] text-[#130e30]">
            <School className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#5f5c6e]">Desenvolvido por</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#130e30]">Moisés Claudino Oliveira</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5f5c6e]">
            Sou estudante do 3º ano B do curso Técnico em Informática no IFRO — Campus Porto Velho Calama, turma 2026. Estudo tecnologia e desenvolvimento de soluções digitais.
          </p>
          <p className="mt-4 border-t border-[#130e30]/10 pt-4 text-sm leading-relaxed text-[#130e30]">
            Criei este site como projeto escolar, unindo tecnologia a uma necessidade cotidiana de estudantes e famílias.
          </p>
        </aside>
      </section>

      <section aria-labelledby="problema-titulo" className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-[#130e30]/15 bg-[#f9fbf2] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5f5c6e]">O problema</p>
          <h2 id="problema-titulo" className="mt-2 font-serif text-2xl font-bold text-[#130e30]">Materiais custam, e muitos ainda podem ser usados.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5f5c6e]">
            No começo do ano letivo, comprar livros, uniformes e outros itens pode pesar no orçamento. Ao mesmo tempo, materiais em boas condições podem ficar guardados depois que deixam de servir para uma família.
          </p>
        </article>
        <article className="rounded-3xl border border-[#130e30]/15 bg-[#eff2e5] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5f5c6e]">A proposta</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#130e30]">Facilitar a doação e o encontro entre as pessoas.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5f5c6e]">
            O site organiza anúncios e pedidos por escola e série, ajuda as pessoas a combinar a entrega na escola e permite acompanhar o pedido até a confirmação do recebimento. A plataforma é voltada à doação gratuita de materiais escolares.
          </p>
        </article>
      </section>

      <section aria-labelledby="diferencial-titulo" className="space-y-6">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ffe228] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#130e30]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Contexto local e diferencial
          </span>
          <h2 id="diferencial-titulo" className="font-serif text-3xl font-bold text-[#130e30]">
            Uma ferramenta complementar para encontrar doações escolares.
          </h2>
          <p className="text-sm leading-relaxed text-[#5f5c6e] sm:text-base">
            Porto Velho já conta com campanhas, pontos de coleta e iniciativas de bibliotecas. O Banco de Troca Escolar foi pensado para complementar esses caminhos com um catálogo digital dedicado a materiais escolares, organizado por escola, série, categoria e conservação.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-[#130e30]/15 bg-[#f9fbf2] p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffe228] text-[#130e30]">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#130e30]">Campanhas e pontos de coleta</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5f5c6e]">
              Uma campanha da Prefeitura de Porto Velho em 2024 reuniu materiais escolares para envio ao Rio Grande do Sul e indicou pontos físicos de coleta. O site complementa ações desse tipo com anúncios individuais consultáveis no catálogo.
            </p>
            <a href="https://www.portovelho.ro.gov.br/artigo/45345/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#130e30] underline underline-offset-4">
              Ver notícia da Prefeitura <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>

          <article className="rounded-3xl border border-[#130e30]/15 bg-[#f9fbf2] p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff2e5] text-[#130e30]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#130e30]">Bibliotecas e iniciativas locais</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5f5c6e]">
              A Biblioteca Municipal Francisco Meirelles recebe livros conforme critérios de conservação e interesse do acervo, e informa que não aceita livros didáticos. O Banco de Troca Escolar contempla também uniformes e outros materiais cadastrados no sistema.
            </p>
            <a href="https://sites.google.com/view/bibliotecafranciscomeirelles/servi%C3%A7os/doa%C3%A7%C3%B5es" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#130e30] underline underline-offset-4">
              Ver critérios da biblioteca <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>

          <article className="rounded-3xl border border-[#130e30]/15 bg-[#eff2e5] p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#130e30]">
              <School className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#130e30]">Um catálogo escolar especializado</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5f5c6e]">
              Em vez de um classificado para qualquer produto, o foco aqui é material escolar doado gratuitamente. A busca permite combinar escola, série, categoria e conservação; os pedidos também acompanham a proposta de entrega e a confirmação por código.
            </p>
            <a href="https://ajuda.olx.com.br/s/article/como-publicar-anuncio" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#130e30] underline underline-offset-4">
              Ver como funcionam anúncios gerais na OLX <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        </div>

        <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[#5f5c6e]">
          O catálogo atual usa uma lista de escolas de Porto Velho. É possível filtrar por escola, mas ainda não há filtro por bairro ou mapa. As referências externas são exemplos de iniciativas e serviços, não parcerias ou endossos ao projeto.
        </p>
      </section>

      <section aria-labelledby="fluxo-titulo" className="space-y-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5f5c6e]">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Do pedido à entrega
          </span>
          <h2 id="fluxo-titulo" className="font-serif text-3xl font-bold text-[#130e30]">Como a doação é combinada</h2>
          <p className="text-sm leading-relaxed text-[#5f5c6e] sm:text-base">
            A data e o horário são propostos por quem doa; quem recebe decide se confirma o combinado.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {etapas.map((etapa) => (
            <li key={etapa.numero} className="flex gap-4 rounded-3xl border border-[#130e30]/15 bg-[#f9fbf2] p-5 sm:p-6">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ffe228] text-sm font-bold text-[#130e30]">
                {etapa.numero}
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#130e30]">{etapa.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5f5c6e]">{etapa.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto flex max-w-3xl gap-4 rounded-3xl border border-[#130e30]/15 bg-[#eff2e5] p-5 sm:p-7">
        <LockKeyhole className="mt-1 h-5 w-5 flex-shrink-0 text-[#130e30]" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-[#130e30]">Confirmação e segurança</h2>
          <p className="text-sm leading-relaxed text-[#5f5c6e]">
            Depois que quem recebe confirma a data, o pedido continua reservado. No encontro, o código de entrega confirma que o material chegou à pessoa solicitante. Se o pedido for cancelado antes da conclusão, a reserva é encerrada e o anúncio volta ao catálogo.
          </p>
        </div>
        <CheckCircle2 className="mt-1 hidden h-5 w-5 flex-shrink-0 text-emerald-700 sm:block" aria-hidden="true" />
      </section>

      <section aria-labelledby="privacidade-pedidos-titulo" className="mx-auto flex max-w-3xl gap-4 rounded-3xl border border-[#130e30]/15 bg-white p-5 sm:p-7">
        <LockKeyhole className="mt-1 h-5 w-5 flex-shrink-0 text-[#130e30]" aria-hidden="true" />
        <div className="space-y-2">
          <h2 id="privacidade-pedidos-titulo" className="font-serif text-xl font-bold text-[#130e30]">O que fica visível em um pedido</h2>
          <p className="text-sm leading-relaxed text-[#5f5c6e]">
            O formulário do anúncio não pede telefone, e-mail ou endereço residencial, mas descrição e fotos são públicas; não coloque esses dados nelas. Quando alguém solicita um material, o nome de exibição e a mensagem ficam visíveis para a pessoa doadora em Minha Atividade. Portanto, o pedido não é anônimo entre as duas contas. Evite incluir contatos ou dados pessoais na mensagem.
          </p>
        </div>
      </section>

      <section id="reportar-problema" aria-labelledby="reportar-titulo" className="scroll-mt-24">
        <div className="mx-auto mb-6 max-w-2xl space-y-2 text-center">
          <h2 id="reportar-titulo" className="font-serif text-3xl font-bold text-[#130e30]">Relatos e solicitações de privacidade</h2>
          <p className="text-sm leading-relaxed text-[#5f5c6e] sm:text-base">
            Relate um problema do site ou selecione “Solicitação de dados pessoais (LGPD)” para pedir acesso, correção ou exclusão. Pedidos de privacidade são analisados manualmente; não é necessário entrar na conta.
          </p>
        </div>
        <FormularioRelato />
      </section>
    </div>
  );
}
