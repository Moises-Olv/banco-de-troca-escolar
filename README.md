![Banner do Banco de Troca Escolar com ilustração de livros e materiais escolares e a mensagem “Materiais que continuam abrindo caminhos”](public/imagens/banner-banco-de-troca-escolar.svg)

# Banco de Troca Escolar

Aplicação web comunitária para aproximar estudantes, responsáveis e famílias que querem **doar ou receber materiais escolares gratuitamente**. O catálogo organiza anúncios por escola, série, categoria e conservação; o fluxo registra pedidos, combinação de entrega e confirmação do recebimento.

**Sistema publicado:** [banco-de-troca-escolar.vercel.app](https://banco-de-troca-escolar.vercel.app/) · **Histórico do repositório:** [GitHub](https://github.com/Moises-Olv/banco-de-troca-escolar/commits/main/)

## Prévia das telas

As imagens abaixo mostram as principais áreas da aplicação. Clique em uma imagem para abri-la em tamanho completo.

<table>
  <tr>
    <td align="center" width="50%">
      <a href="public/imagens/tela-inicial.png"><img src="public/imagens/tela-inicial.png" alt="Página inicial do Banco de Troca Escolar" width="560"></a><br>
      <strong>Início</strong>
    </td>
    <td align="center" width="50%">
      <a href="public/imagens/tela-catalogo.png"><img src="public/imagens/tela-catalogo.png" alt="Catálogo com busca, filtros e anúncios de materiais" width="560"></a><br>
      <strong>Catálogo</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <a href="public/imagens/publicar-material.png"><img src="public/imagens/publicar-material.png" alt="Formulário de publicação com boas práticas e regras de segurança" width="560"></a><br>
      <strong>Publicar material</strong>
    </td>
    <td align="center" width="50%">
      <a href="public/imagens/minha-atividade.png"><img src="public/imagens/minha-atividade.png" alt="Área Minha Atividade para acompanhar anúncios e pedidos" width="560"></a><br>
      <strong>Minha atividade</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <a href="public/imagens/tela-sobre.png"><img src="public/imagens/tela-sobre.png" alt="Página Sobre, com apresentação do projeto e seu objetivo" width="560"></a><br>
      <strong>Sobre o projeto</strong>
    </td>
    <td width="50%"></td>
  </tr>
</table>

> Apesar do nome, o sistema atual não faz trocas comerciais: não vende, compra, cobra nem processa pagamentos. A entrega é combinada entre as pessoas, na escola indicada no anúncio.

## O que o sistema oferece

- **Página inicial:** apresenta a proposta, mostra um carrossel de anúncios recentes, indicadores de materiais disponíveis e doações concluídas e explica as etapas da doação.
- **Catálogo:** busca anúncios por texto, escola, série, categoria e conservação; permite ordenar por mais recentes ou alfabeticamente.
- **Anúncios:** exibe descrição, categoria, conservação, escola, série e foto opcional. Uma pessoa autenticada pode denunciar um anúncio por cobrança indevida, exposição de dados pessoais, conteúdo impróprio ou informação incorreta.
- **Contas:** cadastro com e-mail e senha, confirmação de e-mail, login, encerramento de sessão e redefinição de senha por link.
- **Publicação:** contas autenticadas publicam livros, uniformes ou outros materiais, com título, descrição, escola de referência, série, condição e foto opcional. As orientações de segurança ficam junto ao formulário.
- **Pedidos de interesse:** uma pessoa autenticada pode enviar uma mensagem sobre um anúncio. A pessoa doadora recebe o pedido e pode propor data, horário e uma mensagem para a entrega.
- **Reserva e entrega:** ao propor o encontro, o anúncio fica reservado. Quem solicitou confirma a data ou cancela; ao cancelar, a reserva termina e o anúncio pode voltar ao catálogo. No encontro, a confirmação é feita com um código do pedido.
- **Minha Atividade:** reúne anúncios próprios, pedidos recebidos e enviados, estados da reserva e ações disponíveis para cada etapa. Também permite pausar, reativar ou excluir anúncios próprios e marcar uma doação como concluída.
- **Notificações:** informam eventos dos pedidos e permitem marcar avisos como lidos. A tabela e os gatilhos correspondentes precisam estar configurados no Supabase.
- **Perfis:** edição de nome de exibição, escola e foto; página pública com os dados escolhidos para exibição e indicadores de doações.
- **Relatos e privacidade:** formulário para problemas técnicos, erros de conteúdo, acessibilidade, sugestões e solicitações de dados pessoais. Solicitações de privacidade são analisadas manualmente; o formulário não apaga dados automaticamente.
- **Administração:** painel restrito a administradores com métricas, moderação de relatos e denúncias, retirada de anúncios e convites de uso único para outros administradores. Convites expiram em sete dias e só podem ser aceitos pela conta de e-mail confirmada correspondente.
- **Páginas informativas:** Sobre, Política de Privacidade e Termos de Uso.
- **Interface:** tema claro/escuro com transição circular de amanhecer/anoitecer, layout responsivo, fundo animado, entradas suaves ao rolar, microinterações nos cards e respeito à preferência de movimento reduzido do dispositivo; também oferece foco de teclado e link para pular ao conteúdo principal.

## Contexto e diferencial

O projeto foi pensado para complementar formas de doação que já existem. Em 2024, a Prefeitura de Porto Velho publicou uma campanha de arrecadação de materiais escolares com pontos físicos de coleta; a Biblioteca Municipal Francisco Meirelles recebe livros conforme critérios de conservação e acervo; e classificados gerais, como a OLX, atendem muitas categorias e permitem anunciar doações ou trocas. Essas iniciativas têm seus próprios objetivos e regras — o Banco de Troca Escolar não as substitui nem afirma ter parceria com elas.

O diferencial implementado é concentrar anúncios **somente de materiais escolares**, com campos e filtros estruturados para escola, série, categoria e conservação. A lista de escolas disponível no formulário é voltada a Porto Velho. A busca não possui filtro por bairro, mapa nem localização residencial. Depois de solicitar um item, as contas acompanham a proposta de data e horário, a confirmação ou o cancelamento e o registro da entrega por código.

Referências públicas usadas como contexto: [campanha da Prefeitura de Porto Velho (2024)](https://www.portovelho.ro.gov.br/artigo/45345/), [critérios de doação da Biblioteca Municipal Francisco Meirelles](https://sites.google.com/view/bibliotecafranciscomeirelles/servi%C3%A7os/doa%C3%A7%C3%B5es) e [orientações gerais para publicar na OLX](https://ajuda.olx.com.br/s/article/como-publicar-anuncio).

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| Next.js 15 (App Router) | Páginas, rotas e execução da aplicação web |
| React 19 | Interface e componentes interativos |
| TypeScript | Tipos e validação estática do código |
| Tailwind CSS 4 | Estilos e adaptação a telas diferentes |
| Supabase Auth | Cadastro, confirmação de e-mail, sessão e redefinição de senha |
| Supabase Postgres | Anúncios, perfis, pedidos, relatos e regras de acesso RLS |
| Supabase Storage | Fotos de materiais e perfis |
| Three.js, React Three Fiber e ShaderGradient | Fundo animado |
| Lucide React | Ícones |
| Vercel | Hospedagem de produção e integração de deploy com Git |

## Requisitos

- Node.js **24.20.0** (versão testada e indicada em `.nvmrc`) e npm 11.x. Esta instância foi compilada em Windows 10 Home com npm 11.19.0.
- Uma conta e um projeto Supabase próprios para autenticação, banco e arquivos.
- PostgreSQL 15 ou posterior no Supabase. A versão exata do serviço é controlada pelo Supabase e pode variar por projeto; consulte-a com `select version();` no SQL Editor.
- As credenciais públicas do projeto Supabase: URL e chave `publishable` (em projetos antigos, pode aparecer como `anon key`).

## Executar localmente

```bash
git clone https://github.com/Moises-Olv/banco-de-troca-escolar.git
cd banco-de-troca-escolar
npm ci
```

`npm ci` instala as versões registradas em `package-lock.json`. Crie `.env.local` a partir do modelo e preencha-o com os dados de um projeto Supabase que você controla:

```dotenv
cp .env.example .env.local
```

No PowerShell, use `Copy-Item .env.example .env.local`. `.env.local` é ignorado pelo Git. Configure a autenticação no Supabase conforme a seção seguinte.

Depois que o banco e as URLs de autenticação estiverem prontos, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Para gerar e executar a versão de produção localmente:

```bash
npm run build
npm run start
```

## Configurar seu próprio Supabase

O projeto Supabase fornece o PostgreSQL gerenciado e o banco padrão `postgres`; não é necessário criar um servidor PostgreSQL separado. O banco requerido é PostgreSQL 15 ou posterior. Para consultar a versão exata do seu projeto, rode `select version();` no SQL Editor.

O código usa a URL e a chave `publishable` configuradas em `.env.local`. **Nunca** coloque `service_role`, chaves secretas, senha de banco ou tokens em variável `NEXT_PUBLIC_*`, no código do navegador ou em commits. A chave publishable não substitui as políticas RLS.

Em um **projeto Supabase novo**, abra **Dashboard → SQL Editor → New query** e execute cada arquivo abaixo individualmente, nesta ordem. Aguarde sucesso antes de prosseguir:

1. [`database/schema.sql`](database/schema.sql) — tabela base `public.materiais`, campos, chave estrangeira, índices e leitura RLS.
2. `supabase/perfis-publicos.sql` — perfis, fotos de perfil e estatísticas públicas.
3. `supabase/atividade.sql` — pedidos, índices e políticas de anúncios/pedidos.
4. `supabase/apenas-doacao.sql` — regra de doações gratuitas.
5. `supabase/fluxo-pedidos-reserva.sql` — reserva e código de entrega.
6. `supabase/fluxo-data-entrega.sql` — proposta/confirmação de data, cancelamento e conclusão.
7. `supabase/fotos-materiais.sql` — bucket e políticas das fotos de anúncios.
8. `supabase/relatos-erros.sql` — formulário público de relatos.
9. `supabase/privacidade-lgpd.sql` — tipos de solicitação de privacidade.
10. `supabase/administracao.sql` — administração, convites, denúncias e moderação.
11. `supabase/notificacoes.sql` — notificações dos pedidos.
12. `supabase/moderacao-anuncios.sql` — regras de moderação dos anúncios.
13. `supabase/seguranca-acesso-funcoes.sql` — permissões explícitas das funções.
14. `supabase/indices-desempenho.sql` — índices e view otimizada do catálogo.

Depois, configure **Authentication → URL Configuration** com Site URL `http://localhost:3000` e Redirect URL `http://localhost:3000/auth/callback`. Configure o envio de e-mails de confirmação e redefinição de senha.

Crie a primeira conta pelo formulário do site e confirme o e-mail. Para conceder administração a essa conta, cole `database/bootstrap-admin.sql` no SQL Editor, substitua o marcador ali pelo e-mail confirmado da sua conta e execute. Não salve nem envie ao GitHub uma cópia que contenha o e-mail pessoal. Esse passo é separado do esquema para que o SQL inicial rode antes de haver uma conta. O próprio sistema não inclui contas nem anúncios fictícios.

Essa sequência é voltada a um projeto Supabase novo. Não a execute em produção sem backup e revisão. As policies RLS e funções do banco são a autorização efetiva; esconder controles na interface não protege dados.

### Storage

O projeto usa buckets públicos para leitura de fotos, com upload e remoção limitados à pasta do usuário autenticado pelas políticas de Storage. Os scripts aceitam JPEG, PNG e WebP, com limite de 5 MB. Não envie imagens com rostos de menores, documentos, contatos ou outras informações pessoais.

### Deploy próprio na Vercel

1. Publique o repositório na sua conta/organização GitHub e importe-o na Vercel.
2. Selecione Next.js e a raiz do projeto (`./`). Os comandos padrão são `npm run build` e `npm run start`.
3. Cadastre na Vercel as mesmas variáveis públicas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para os ambientes desejados.
4. No Supabase, adicione o domínio Vercel às URLs autorizadas de autenticação e configure a URL de callback `https://SEU-DOMINIO/auth/callback`.
5. Faça o deploy e teste cadastro, confirmação de e-mail, login, catálogo, publicação, pedido e fluxo de entrega no seu próprio projeto.

Não copie as credenciais Supabase de outra instalação. Cada instância deve usar o próprio projeto Supabase e sua própria configuração de administrador.

## Rotas principais

| Rota | Acesso | Função |
| --- | --- | --- |
| `/` | Público | Apresentação, carrossel, indicadores e passos |
| `/catalogo` | Público | Busca e filtros de anúncios disponíveis |
| `/materiais/[id]` | Público; ações exigem login | Detalhes e pedido/denúncia |
| `/cadastro` | Público | Criação de conta |
| `/entrar` | Público | Login |
| `/redefinir-senha` | Público, a partir do link recebido | Redefinição de senha |
| `/auth/callback` | Fluxo de autenticação | Recebe confirmação e retorno do Supabase |
| `/publicar` | Conta autenticada | Publicação de doação |
| `/minha-atividade` | Conta autenticada | Anúncios e pedidos da conta |
| `/perfil` | Conta autenticada | Edição do próprio perfil |
| `/perfil/[id]` | Público | Perfil público |
| `/sobre` | Público | Contexto, fluxo e formulário de relatos/privacidade |
| `/privacidade` | Público | Política de privacidade |
| `/termos` | Público | Termos de uso |
| `/admin` | Administrador | Métricas, moderação e convites administrativos |
| `/admin/aceitar` | Conta autenticada com convite | Aceite de convite administrativo |

O roteiro de verificação do fluxo principal está em [`docs/roteiro-de-teste.md`](docs/roteiro-de-teste.md). O checklist de segurança para a revisão antes da entrega está em [`docs/checklist-seguranca.md`](docs/checklist-seguranca.md).

## Estrutura do repositório

```text
app/          rotas e páginas Next.js
components/   componentes reutilizáveis da interface
data/         tipos e opções apresentadas nos formulários
lib/          integração Supabase e funções compartilhadas
public/       imagens, logos, ícones e outros arquivos públicos
supabase/     scripts SQL complementares do banco
database/    esquema inicial e bootstrap do primeiro administrador
docs/         especificação, referência inicial e organização de assets
```

A especificação final atualizada está em [`spec.md`](spec.md). [`docs/spec-moises-2.md`](docs/spec-moises-2.md) aponta para essa versão; [`docs/spec-inicial.md`](docs/spec-inicial.md) é a proposta antiga mantida como referência histórica. A organização dos arquivos em `public/` está documentada em [`docs/assets-publicos.md`](docs/assets-publicos.md).

## Privacidade, segurança e limites

- O acesso a anúncios, pedidos, perfis, relatos e funções administrativas é limitado por políticas RLS e funções no Postgres; permissões devem ser revistas no Supabase de cada implantação.
- Dados de autenticação ficam no Supabase Auth. A aplicação não deve expor senhas, códigos de confirmação, chaves privadas ou dados não necessários do perfil.
- O formulário do anúncio não tem campos próprios para telefone, e-mail ou endereço residencial, mas descrição e fotos são públicas e podem conter dados inseridos pela pessoa. O nome de exibição e a mensagem da solicitação são mostrados à pessoa doadora na área autenticada Minha Atividade; portanto, os pedidos não são anônimos entre as contas participantes. Não inclua dados de contato em anúncios ou mensagens.
- Os filtros são por escola, série, categoria e conservação. A lista atual de escolas é voltada a Porto Velho; não há filtro por bairro ou mapa.
- Fotos públicas podem ser vistas por visitantes enquanto disponíveis. O upload e a remoção são limitados pela pasta do usuário.
- O site organiza anúncios e pedidos, mas não inspeciona fisicamente materiais nem garante que a pessoa compareça ao encontro.
- A política publicada no site não substitui a revisão dos contratos com fornecedores nem uma análise jurídica da operação.
- Não há checkout, pagamentos, avaliações de usuários ou analytics encontrados no código atual.

## Estado e contribuições

O projeto usa npm e mantém `package-lock.json`. As decisões e correções registradas durante a revisão estão em [`CHANGELOG.md`](CHANGELOG.md); a confirmação de leitura do responsável fica pendente até uma pessoa revisar e preencher a seção de validação humana ali. Para propor mudanças, crie uma branch, faça alterações pequenas e descreva como foram verificadas. Não envie `.env.local`, credenciais, dados de usuários ou fotos pessoais.

## Licença

Não há um arquivo `LICENSE` neste repositório neste momento. Tornar o repositório público no GitHub, por si só, não concede uma licença de reutilização. Antes de reutilizar, modificar ou redistribuir o código, consulte o responsável ou aguarde a inclusão de uma licença escolhida pelo titular.
