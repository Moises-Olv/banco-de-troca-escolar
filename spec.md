# Spec Moisés 2 — Especificação do sistema atual

**Projeto:** Banco de Troca Escolar

**Tipo:** aplicação web responsiva para organização comunitária de doações escolares
**Versão desta especificação:** retrato do código neste repositório em 27 de outubro de 2026

## 1. Finalidade

O sistema conecta pessoas que oferecem materiais escolares gratuitamente a pessoas interessadas em recebê-los. Ele publica anúncios, permite encontrar itens por escola e série, organiza pedidos e reserva, e registra a confirmação da entrega.

Apesar do nome do projeto, o escopo implementado é de **doação gratuita**. O sistema não processa compras, vendas, pagamentos ou trocas comerciais. O encontro e a transferência física do material ocorrem entre as pessoas, na escola de referência indicada no anúncio.

## 2. Papéis e acesso

| Papel | Ações disponíveis |
| --- | --- |
| Visitante | Ver página inicial, catálogo, anúncios disponíveis, perfis públicos, Sobre, Termos e Política de Privacidade; enviar relato/sugestão e solicitação de privacidade. |
| Conta autenticada | Publicar e gerenciar seus próprios anúncios; enviar pedidos de interesse; consultar pedidos recebidos e enviados; responder a propostas de entrega; usar notificações; editar o próprio perfil; denunciar anúncios. |
| Administrador | Acessar métricas e o painel de moderação; revisar relatos e denúncias; atualizar seus estados; retirar anúncios; convidar outras contas para administração. |

As páginas autenticadas exigem sessão. A autorização efetiva para dados e ações é aplicada pelo Postgres/Supabase através de RLS, restrições de privilégios e funções RPC. A interface não é a fronteira de segurança.

## 3. Fluxos funcionais

### 3.1 Conta e autenticação

1. No cadastro, a pessoa informa nome de exibição, e-mail, escola e senha e confirma que leu os Termos e a Política de Privacidade e que atende à declaração de idade/responsável apresentada.
2. O Supabase Auth cria a conta e envia e-mail de confirmação.
3. `/auth/callback` processa o retorno de autenticação.
4. A pessoa pode entrar e sair da conta e solicitar redefinição de senha por e-mail.
5. A autenticação do servidor e o middleware protegem os fluxos privados; a sessão é mantida pelo Supabase SSR.

### 3.2 Encontrar materiais

- A página inicial consulta materiais disponíveis e ativos, apresenta até quatro destaques recentes em carrossel, indicadores comunitários e etapas do funcionamento.
- O catálogo pesquisa texto no título, descrição e escola; filtra por escola, série, categoria e estado de conservação; ordena por data recente ou ordem alfabética. A lista atual de escolas é voltada a Porto Velho; não há filtro por bairro, mapa ou geolocalização.
- O detalhe público apresenta informações do material e dados do perfil selecionados para exibição pública.
- Categorias disponíveis: Livro, Uniforme e Outro material. Conservação: Novo, Bom estado e Usado.
- Anúncios pausados, reservados, concluídos, ocultados ou inativos não são exibidos como disponíveis no catálogo.

### 3.3 Publicar e gerenciar anúncio

- Exige autenticação.
- O formulário registra título, descrição, escola de referência, série/turma, categoria, estado de conservação e uma foto opcional.
- A escola informada é o local de referência para combinar a entrega. A interface orienta não incluir dados de contato ou outras informações pessoais na descrição.
- A aplicação só aceita modalidade de Doação. O limite e tipos de fotos permitidos no Storage são 5 MB e JPEG, PNG ou WebP.
- Em Minha Atividade, a pessoa pode pausar ou reativar seu anúncio, marcá-lo como concluído e removê-lo. A interface avisa que a exclusão do anúncio também exclui seus pedidos associados, conforme a relação do banco.
- Um anúncio retirado pela moderação recebe marcação persistente e não pode ser reativado pela conta responsável.

### 3.4 Pedido, reserva e entrega

1. Uma conta autenticada envia um pedido sobre um anúncio disponível, com mensagem opcional.
2. A pessoa que publicou consulta os pedidos recebidos em Minha Atividade e pode aceitar um pedido propondo data, horário e mensagem de entrega, ou recusar.
3. Ao reservar, o anúncio sai da disponibilidade pública e outros pedidos pendentes são encerrados.
4. A pessoa solicitante confirma a data proposta ou cancela a reserva. O cancelamento encerra o pedido e pode colocar o anúncio novamente disponível, conforme as validações do banco.
5. Depois da confirmação da data, o fluxo apresenta o código de entrega ao doador. As funções do banco limitam tentativas para proteger essa confirmação.
6. A entrega é registrada como concluída mediante confirmação do código e a atividade mostra o estado resultante.

O pedido registra o nome de exibição informado pela conta e mostra esse nome e a mensagem à pessoa doadora em Minha Atividade. O formulário de anúncio não tem campos próprios de telefone, e-mail ou endereço residencial, mas a descrição livre e as fotos são públicas e podem conter informações inseridas pela pessoa. O pedido não é anônimo entre as contas participantes.

As operações principais são realizadas pelas RPCs do banco para validar participantes, propriedade, status e concorrência. O código de entrega fica em tabela privada, não acessível por consulta direta normal.

### 3.5 Perfil

- A pessoa autenticada altera seu nome público, escola e foto de perfil.
- O perfil público mostra os campos destinados à apresentação comunitária, foto se existente e estatísticas de doações fornecidas por função do banco.
- A interface e as políticas do banco devem impedir exposição de dados de autenticação e de informações pessoais não destinadas ao público.

### 3.6 Notificações

- Uma bandeja apresenta notificações recentes e contagem de itens não lidos.
- A pessoa pode marcar uma notificação ou todas como lidas.
- Eventos de pedidos são inseridos por gatilhos SQL. O recurso depende de executar `supabase/notificacoes.sql`.

### 3.7 Relatos, privacidade e denúncias

- Em `/sobre`, qualquer pessoa pode enviar relato de problema técnico, erro de conteúdo, questão de acessibilidade, sugestão ou outro assunto. A página do relato, descrição e passos para reproduzir têm limites de tamanho; o e-mail para contato é opcional.
- O mesmo formulário aceita solicitações de dados pessoais (acesso, correção ou exclusão); requer e-mail associado à conta e descrição. A solicitação é encaminhada para análise humana; não executa exclusão automaticamente.
- Contas autenticadas podem denunciar anúncio por categorias de cobrança/comercialização indevida, contato pessoal exposto, conteúdo impróprio/ofensivo ou informação incorreta.
- A administração pode consultar e atualizar os status de relatos e denúncias. Relatos de visitantes não ficam publicamente consultáveis.

### 3.8 Administração

- A rota `/admin` consulta métricas de anúncios disponíveis e concluídos, relatos/denúncias em aberto e anúncios antigos.
- Administradores podem convidar um e-mail para função administrativa. O convite é de uso único, vence em sete dias, exige sessão autenticada, e só é aceito pela conta que tenha e-mail confirmado igual ao destinatário.
- Administradores revisam relatos e denúncias e mudam seus estados.
- Podem retirar anúncio do catálogo por meio de função administrativa. A retirada marca o anúncio como inativo/indisponível e preserva o registro e os pedidos existentes. Uma reserva em andamento precisa ser encerrada antes da retirada.
- O primeiro administrador é inicializado por SQL, não por autoinscrição pública. Depois de criar e confirmar a própria conta, o responsável adapta e executa `database/bootstrap-admin.sql`; o esquema principal não contém um e-mail pessoal.

### 3.9 Contexto e diferencial do produto

- O produto complementa campanhas, pontos de coleta, bibliotecas e canais de classificados ou mensagens; não substitui essas iniciativas e não declara parceria com elas.
- O diferencial verificado no código é o foco exclusivo em doações de materiais escolares, com catálogo pesquisável e filtros estruturados por escola, série, categoria e conservação, associado a pedidos e acompanhamento da entrega.
- A abrangência atual é baseada na lista de escolas de Porto Velho em `data/materiais.ts`. Embora isso dê uma referência escolar local, não existe busca por bairro, mapa ou proximidade residencial.
- Exemplos públicos de iniciativas que contextualizam o problema: [campanha de arrecadação da Prefeitura de Porto Velho em 2024](https://www.portovelho.ro.gov.br/artigo/45345/), [regras de doação da Biblioteca Municipal Francisco Meirelles](https://sites.google.com/view/bibliotecafranciscomeirelles/servi%C3%A7os/doa%C3%A7%C3%B5es) e [publicação de anúncios gerais na OLX](https://ajuda.olx.com.br/s/article/como-publicar-anuncio). Os exemplos não constituem parceria com o projeto.

## 4. Mapa de rotas

| Rota | Descrição e acesso |
| --- | --- |
| `/` | Página inicial pública, destaques e impacto da comunidade |
| `/catalogo` | Busca, filtro e ordenação pública |
| `/materiais/[id]` | Detalhes públicos; pedido e denúncia requerem conta |
| `/cadastro` | Cadastro e confirmação por e-mail |
| `/entrar` | Login |
| `/redefinir-senha` | Redefinição de senha |
| `/auth/callback` | Callback de confirmação/autenticação |
| `/publicar` | Formulário autenticado de anúncio |
| `/minha-atividade` | Anúncios e pedidos do usuário autenticado |
| `/perfil` | Edição do perfil próprio |
| `/perfil/[id]` | Exibição de perfil público |
| `/sobre` | Contexto do projeto, etapas e formulário de relatos/privacidade |
| `/privacidade` | Informação sobre tratamento e direitos de dados |
| `/termos` | Regras do serviço |
| `/admin` | Painel administrativo restrito |
| `/admin/aceitar` | Aceite de convite autenticado |

## 5. Requisitos de dados e regras

### Modelo de dados

As tabelas geridas pelo projeto estão no schema `public` ou no schema privado `private`. `auth.users` é mantida pelo Supabase Auth e não é criada pelo script do aplicativo.

| Tabela | Campos principais | Chave primária | Relacionamentos |
| --- | --- | --- | --- |
| `auth.users` (Supabase) | `id`, `email`, `email_confirmed_at`, metadados | `id` | Conta gerida pelo Supabase; referenciada por perfis, anúncios, pedidos e papéis administrativos |
| `public.materiais` | `id`, `usuario_id`, `titulo`, `descricao`, `escola`, `serie`, `categoria`, `condicao`, `modalidade`, `status`, `imagem_url`, `criado_em`, `ativo`, `removido_por_moderacao` | `id` | `usuario_id → auth.users.id` |
| `public.perfis` | `id`, `nome_exibicao`, `escola`, `foto_url`, `criado_em`, `atualizado_em` | `id` | `id → auth.users.id` |
| `public.pedidos_interesse` | `id`, `material_id`, `material_titulo`, `solicitante_id`, `solicitante_nome`, `mensagem`, `status`, `criado_em`, `reservado_em`, `concluido_em`, `data_entrega`, `mensagem_entrega`, `entrega_confirmada_em` | `id` | `material_id → materiais.id`; `solicitante_id → auth.users.id` |
| `private.pedidos_codigos_entrega` | `pedido_id`, `codigo`, `tentativas`, `criado_em` | `pedido_id` | `pedido_id → pedidos_interesse.id` |
| `public.notificacoes` | `id`, `destinatario_id`, `pedido_id`, `tipo`, `titulo`, `mensagem`, `criada_em`, `lida_em` | `id` | `destinatario_id → auth.users.id`; `pedido_id → pedidos_interesse.id` |
| `public.relatos_erros` | `id`, `tipo`, `pagina`, `descricao`, `passos`, `email_contato`, `status`, `criado_em` | `id` | Sem chave estrangeira; pode receber relatos de visitantes |
| `public.denuncias_anuncios` | `id`, `material_id`, `material_titulo`, `denunciante_id`, `motivo`, `status`, `criado_em` | `id` | `material_id → materiais.id` (anúncio pode ser removido); `denunciante_id → auth.users.id` |
| `private.administradores` | `usuario_id`, `criado_por`, `criado_em` | `usuario_id` | `usuario_id → auth.users.id`; `criado_por → auth.users.id` |
| `private.convites_administrador` | `id`, `email`, `token`, `convidado_por`, `criado_em`, `expira_em`, `aceito_em`, `aceito_por` | `id` | `convidado_por → auth.users.id`; `aceito_por → auth.users.id` |

O banco também contém a view `public.catalogo_materiais_rapidos`, que combina anúncios ativos e campos públicos de perfil. Ela não é uma tabela nem substitui as políticas RLS das tabelas subjacentes. Índices parciais limitam pedidos ativos e reservas duplicadas.

### Estados principais

- Material: Disponível, Indisponível, Reservado ou Concluído, além da marca persistente de moderação.
- Pedido: Pendente, Reservado, Recusado, Encerrado ou Concluído.
- Relato: Novo, Em análise ou Resolvido.
- Denúncia: Novo, Em análise, Resolvida ou Ignorada.

Restrições centrais incluem: apenas o dono gerencia seu anúncio; só os participantes autorizados consultam um pedido; um material pode ter no máximo uma reserva; ações de entrega verificam identidade/estado; funções privilegiadas têm `EXECUTE` restrito; tabelas privadas não são expostas à API pública.

## 6. Arquitetura e tecnologias

- Next.js 15 App Router com React 19 e TypeScript.
- Componentes reutilizáveis em `components/`; rotas em `app/`; integrações e mapeadores em `lib/`; tipos/opções em `data/`.
- Supabase JS e Supabase SSR para acesso cliente/servidor, sessão, banco, Storage e Auth.
- Supabase Postgres com políticas Row Level Security (RLS), views, funções RPC, gatilhos e scripts SQL em `supabase/`.
- Tailwind CSS 4, Lucide React, Three.js, React Three Fiber e ShaderGradient.
- Animações de entrada acionadas pela visibilidade das seções, microinterações dos cards e suporte a `prefers-reduced-motion`, sem adicionar dependências de animação.
- Vercel é a plataforma de hospedagem documentada para produção.

## 7. Segurança e privacidade no desenho atual

- Segredos privados nunca devem entrar no cliente, em `NEXT_PUBLIC_*` ou no controle de versão. O cliente usa URL e chave Supabase publishable.
- RLS aplica autorização no banco; páginas e botões condicionais não são substitutos para RLS.
- Operações de pedido/reserva/entrega usam RPCs que verificam sessão, participantes, propriedade e estados.
- Funções `SECURITY DEFINER` usam `search_path` vazio e permissões explícitas nos scripts SQL.
- Fotos usam limites de tipo/tamanho e policies para restringir escrita e exclusão à pasta da conta.
- `next.config.mjs` define cabeçalhos de segurança para tipo de conteúdo, frame, referrer, permissões de dispositivo e políticas cross-domain.
- O código revisado não contém checkout, ferramenta de analytics ou sistema de avaliações de usuário.
- A política do site não comprova, por si só, conformidade jurídica completa ou segurança da configuração Supabase/Vercel de cada instalação.

## 8. Instalação e execução

### 8.1 Ambiente testado

- **Sistema operacional verificado:** Windows 10 Home.
- **Node.js usado na compilação:** 24.20.0 (registrado também em `.nvmrc`).
- **npm usado na compilação:** 11.19.0.
- **Servidor local:** Next.js, iniciado com `npm run dev`.
- **Dependências:** instaladas pelo npm usando `npm ci` e `package-lock.json`; a lista completa está em `package.json`.
- **Banco:** PostgreSQL gerenciado pelo Supabase. Os scripts requerem PostgreSQL 15 ou posterior. O Supabase controla a instância e a versão exata pode variar; execute `select version();` no SQL Editor do seu próprio projeto para registrar a versão efetiva.

### 8.2 Banco, tabelas e dados iniciais

No Supabase, cada projeto inclui um banco gerenciado chamado `postgres`; não crie um banco separado. O arquivo [`database/schema.sql`](database/schema.sql) cria a tabela-base `public.materiais`, os campos usados pela aplicação, a chave estrangeira para `auth.users`, os índices, a política pública de leitura e os privilégios mínimos.

Em seguida, aplique os scripts complementares na ordem numerada da seção 8.4. Eles criam pedidos, perfis, notificações, relatos, denúncias, funções, políticas RLS, buckets de fotos e a view do catálogo. As tabelas e relações estão listadas na seção 5. `auth.users` é fornecida pelo Supabase Auth.

O repositório **não insere usuários, anúncios ou pedidos de demonstração**. A lista de escolas/categorias e estados iniciais está no código em `data/materiais.ts`; o trigger de `supabase/perfis-publicos.sql` cria o perfil público quando uma conta se cadastra. O primeiro administrador deve ser configurado pelo responsável da instalação depois de criar e confirmar sua própria conta; nenhum e-mail pessoal é embutido no esquema.

### 8.3 Variáveis de ambiente

Copie `.env.example` para `.env.local` na raiz e preencha os valores do seu próprio projeto Supabase:

| Variável | Finalidade | Onde obter |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Endereço do projeto usado pelo cliente e pelo servidor Next.js. | Supabase Dashboard → Project Settings → API. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública de acesso do cliente; as policies RLS continuam obrigatórias. | Supabase Dashboard → Project Settings → API Keys → publishable. Projetos antigos podem chamar a chave pública de `anon`. |

Essas duas variáveis são públicas por definição. **Nunca** use `service_role`, chaves secretas, senha de banco ou token em `NEXT_PUBLIC_*`, no `.env.example`, no código cliente ou em commits. `.env.local` é ignorado pelo Git.

### 8.4 Passo a passo do clone até abrir o sistema

1. Instale Node.js 24.20.0 e npm 11.x. O `.nvmrc` indica a versão Node usada na compilação de referência.
2. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/Moises-Olv/banco-de-troca-escolar.git
   cd banco-de-troca-escolar
   ```

3. Instale as dependências travadas pelo projeto:

   ```bash
   npm ci
   ```

4. Crie seu próprio projeto Supabase. No painel, abra **SQL Editor → New query**, cole e execute `database/schema.sql`.
5. Ainda no SQL Editor, execute os scripts nesta ordem, um por vez:

   1. `supabase/perfis-publicos.sql`
   2. `supabase/atividade.sql`
   3. `supabase/apenas-doacao.sql`
   4. `supabase/fluxo-pedidos-reserva.sql`
   5. `supabase/fluxo-data-entrega.sql`
   6. `supabase/fotos-materiais.sql`
   7. `supabase/relatos-erros.sql`
   8. `supabase/privacidade-lgpd.sql`
   9. `supabase/administracao.sql`
   10. `supabase/notificacoes.sql`
   11. `supabase/moderacao-anuncios.sql`
   12. `supabase/seguranca-acesso-funcoes.sql`
   13. `supabase/indices-desempenho.sql`

   Aguarde sucesso em cada execução. Se um script falhar, pare, leia a mensagem e não continue sobre um banco parcialmente configurado. Essa sequência é para um projeto Supabase novo; não a aplique sobre produção sem backup e revisão.
6. Crie `.env.local` copiando `.env.example` e substitua os valores pelos da sua instalação:

   ```bash
   cp .env.example .env.local
   ```

   No PowerShell, use `Copy-Item .env.example .env.local`. Configure também no Supabase **Authentication → URL Configuration**: Site URL `http://localhost:3000` e Redirect URL `http://localhost:3000/auth/callback`. Configure o envio de e-mails de confirmação e redefinição de senha.
7. Inicie o servidor:

   ```bash
   npm run dev
   ```

8. Abra [http://localhost:3000](http://localhost:3000) no navegador e crie uma conta de teste usando um endereço de e-mail que você controle. Confirme o e-mail pelo link recebido.
9. Para tornar essa conta administradora na sua instalação, cole o conteúdo de `database/bootstrap-admin.sql` no SQL Editor, substitua o marcador ali pelo e-mail confirmado dessa conta e execute. Não salve nem envie ao GitHub uma cópia contendo o e-mail pessoal. O script é separado para evitar que um endereço pessoal seja registrado ou que o esquema falhe antes de o usuário existir.
10. Recarregue o site. Para compilar e executar como produção local:

    ```bash
    npm run build
    npm run start
    ```

    O Next.js abre por padrão em `http://localhost:3000`.

O script não cria nem migra o banco remoto automaticamente ao iniciar o Next.js. O banco e a autenticação precisam estar configurados no Supabase antes de testar cadastro e publicação.

### 8.5 Como testar o fluxo principal

Use duas contas fictícias de teste com e-mails controlados pelos avaliadores; não publique senhas de contas reais nem crie usuários de demonstração no script SQL. O roteiro passo a passo está em [`docs/roteiro-de-teste.md`](docs/roteiro-de-teste.md). Ele percorre cadastro, anúncio, catálogo, pedido, proposta de entrega, confirmação e código de conclusão.

### 8.6 Publicação

O sistema publicado desta instância está em [banco-de-troca-escolar.vercel.app](https://banco-de-troca-escolar.vercel.app/). Para uma cópia própria, importe o repositório na Vercel, configure as mesmas variáveis em Project Settings → Environment Variables e adicione o domínio Vercel à URL de autenticação do seu Supabase. O deploy não transfere nem compartilha o banco original.

## 9. Limites e itens não inferidos

- O código não cria contas de demonstração nem anúncios fictícios; o avaliador precisa cadastrar contas de teste.
- Não se promete disponibilidade contínua, sucesso de cada doação ou inspeção física dos materiais.
- Não há suporte a pagamentos, reembolsos, compras, vendas, troca comercial, avaliação pública ou analytics no sistema atual.
- Os textos legais disponíveis são páginas do produto, não substituem revisão jurídica profissional.
- O repositório não contém arquivo `LICENSE`; sua visibilidade pública não define, por si só, direitos de reutilização.
- A configuração de um projeto de terceiros exige configurar seu próprio Supabase, URLs de autenticação, envio de e-mail, esquema e primeiro administrador.
- O site não garante anonimato entre doador e solicitante: o nome de exibição do solicitante aparece no pedido recebido pelo doador.
- Os filtros locais usam escola como referência; não há filtro por bairro, mapa ou raio de distância.

## 10. Limitações conhecidas e conferências externas

- A versão exata do PostgreSQL, a entrega de e-mails, as políticas ativas do projeto Supabase e as variáveis configuradas na Vercel são propriedades da instalação; verifique-as nos respectivos painéis. Esta especificação informa o requisito mínimo e como consultar a versão, sem alegar acesso às configurações privadas.
- Não foi incluído um login/senha de teste. Crie as contas fictícias conforme o roteiro e use e-mails de teste controlados por quem avalia.
- A Spec e os scripts descrevem o código neste repositório; quando a implementação mudar, atualize esta especificação e o changelog.
- Antes de entregar, confira o convite `rafaelpitwak` em GitHub → Settings → Collaborators e percorra o checklist da atividade, inclusive o Anexo B de segurança fornecido pelo curso.
