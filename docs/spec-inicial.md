# Spec inicial — Banco de Troca Escolar

## 1. Objetivo

O Banco de Troca Escolar é uma aplicação web para estudantes e responsáveis anunciarem livros, uniformes e outros materiais escolares para troca ou doação e encontrarem itens compatíveis por escola, série e categoria. A primeira versão permitirá criar conta, publicar e consultar anúncios, demonstrar interesse, combinar a entrega sem expor contatos publicamente e concluir ou retirar um anúncio.

## 2. Usuários

- **Visitante:** pode consultar anúncios ativos e pesquisar ou filtrar o catálogo; não pode publicar anúncio nem demonstrar interesse.
- **Usuário cadastrado (responsável ou estudante maior de idade):** pode entrar na conta, publicar e editar os próprios anúncios, demonstrar interesse em anúncios de outras pessoas, acompanhar seus pedidos e encerrar um anúncio após a entrega.
- **Administrador/moderador:** pode consultar denúncias, ocultar anúncios que violem as regras e atualizar o estado de uma denúncia. A conta administrativa será concedida manualmente; usuários não podem escolher esse papel no cadastro.

Na versão inicial, menores não terão contas próprias. Um responsável poderá usar o sistema em nome da família. A aplicação não publicará telefone, endereço residencial ou outros contatos pessoais em anúncios.

## 3. Casos de uso principais

- **UC01 — Criar conta:** o usuário cadastra nome, e-mail e senha.
- **UC02 — Entrar e sair:** o usuário autentica-se e encerra a sessão.
- **UC03 — Publicar material:** o usuário cadastrado cria anúncio de troca ou doação com escola, série, categoria e condição do item.
- **UC04 — Encontrar material:** visitante ou usuário pesquisa e filtra anúncios ativos e consulta seus detalhes.
- **UC05 — Demonstrar interesse:** usuário cadastrado envia um pedido de interesse ao responsável pelo anúncio, sem divulgar contato publicamente.
- **UC06 — Gerenciar pedido:** o dono do anúncio aceita ou recusa o pedido; ao aceitar, o anúncio fica reservado e os outros pedidos pendentes são encerrados como indisponíveis.
- **UC07 — Concluir entrega ou retirar anúncio:** o dono marca a entrega como concluída ou encerra o anúncio sem entrega.
- **UC08 — Editar anúncio:** o dono atualiza informações ou disponibilidade do próprio anúncio.
- **UC09 — Denunciar anúncio:** usuário cadastrado envia uma denúncia com motivo.
- **UC10 — Moderar conteúdo:** administrador analisa denúncias e oculta anúncios inadequados.

Fluxo de negócio principal: o usuário cria conta, publica um item; outra pessoa encontra o anúncio e envia interesse; o dono aceita o pedido; após a entrega, o dono conclui a negociação e o anúncio deixa de aparecer como disponível. Anúncios, pedidos e mudanças de estado ficam salvos no banco e podem ser consultados pelas telas do sistema.

## 4. Requisitos funcionais (RF)

- **RF01 — Cadastro:** o sistema deve permitir criar uma conta com nome, e-mail e senha. O e-mail deve ser único e campos obrigatórios devem ser validados.
- **RF02 — Login e logout:** o sistema deve permitir entrar com e-mail e senha e encerrar a sessão. Operações de publicação, edição, interesse, denúncia e moderação exigem sessão válida.
- **RF03 — Publicar anúncio:** usuário autenticado deve poder cadastrar título, descrição, escola, série, categoria (livro, uniforme ou outro material), condição (novo, bom ou usado), modalidade (troca ou doação) e disponibilidade. O novo anúncio deve ser gravado e associado ao usuário criador.
- **RF04 — Consultar catálogo:** o sistema deve listar apenas anúncios ativos e disponíveis, mostrando título, categoria, série, escola, condição e modalidade. Deve permitir filtrar por escola, série, categoria e modalidade e ordenar por data de publicação.
- **RF05 — Consultar detalhes:** o sistema deve exibir os detalhes de um anúncio ativo e disponível, sem expor telefone, e-mail ou endereço residencial do dono.
- **RF06 — Demonstrar interesse:** usuário autenticado deve poder criar um pedido de interesse em anúncio disponível de outra pessoa. O sistema deve salvar o pedido com estado “pendente” e impedir que o dono demonstre interesse no próprio anúncio ou que o mesmo usuário crie pedidos duplicados ainda ativos para o mesmo anúncio.
- **RF07 — Responder ao pedido:** apenas o dono do anúncio deve poder aceitar ou recusar pedido pendente. Ao aceitar um pedido, o anúncio deve passar a “reservado” e outros pedidos pendentes associados devem ser encerrados com motivo “item reservado”.
- **RF08 — Concluir ou cancelar anúncio:** o dono deve poder marcar um anúncio reservado como “concluído” após a entrega, ou encerrar um anúncio ativo/reservado como “retirado”. Anúncios concluídos ou retirados não aparecem como disponíveis no catálogo.
- **RF09 — Editar anúncio próprio:** o dono deve poder editar os campos do próprio anúncio enquanto ele estiver ativo. Usuários não podem editar anúncios de outras pessoas.
- **RF10 — Denunciar anúncio:** usuário autenticado deve poder enviar denúncia com motivo e descrição opcional. O sistema deve associá-la ao anúncio e ao autor da denúncia e impedir denúncias de anúncios inexistentes.
- **RF11 — Moderar anúncio:** administrador deve poder consultar denúncias e ocultar um anúncio, registrando seu estado de moderação. A ação deve retirar o anúncio do catálogo público.
- **RF12 — Consultar atividade própria:** usuário autenticado deve poder consultar seus anúncios e os pedidos de interesse recebidos ou enviados, com seus estados atuais.

## 5. Requisitos não funcionais (RNF)

- **RNF01 — Proteção de senha:** senhas nunca serão armazenadas em texto puro. A autenticação será delegada ao Supabase Auth, que mantém credenciais protegidas com hash; a aplicação não copiará senhas para suas tabelas próprias.
- **RNF02 — Validação no servidor:** todo formulário e toda operação de escrita serão validados no servidor, mesmo quando também houver validação no navegador. Campos, tamanho, formatos, estados permitidos e permissões serão verificados antes de gravar dados.
- **RNF03 — Controle de acesso:** consultas e alterações de dados serão protegidas por sessão e políticas de Row Level Security (RLS) no Supabase. Um usuário só altera seus anúncios e pedidos conforme as regras de propriedade; apenas administradores podem moderar.
- **RNF04 — Privacidade:** anúncios públicos não conterão dados de contato ou endereço residencial. Serão coletados apenas os dados necessários para autenticação, autoria, escola e funcionamento dos pedidos. As páginas públicas não exibirão identificadores internos de autenticação.
- **RNF05 — Integridade:** chaves estrangeiras, restrições de valores e transações no servidor devem impedir pedidos para itens próprios, estados inválidos e múltiplas reservas simultâneas para o mesmo anúncio.
- **RNF06 — Desempenho:** em condições normais de rede, páginas do catálogo devem carregar em até 3 segundos para uma consulta paginada de até 20 anúncios. O catálogo deve usar paginação e índices para escola, série, categoria, modalidade e estado.
- **RNF07 — Compatibilidade:** a interface deve funcionar nas versões atuais de Chrome, Edge e Firefox e adaptar-se a telas de celular e computador.
- **RNF08 — Acessibilidade básica:** formulários devem ter rótulos associados aos campos, mensagens de erro legíveis e navegação por teclado para as ações principais.

## 6. Modelo de dados (DER simples)

```text
AUTH.USERS (Supabase Auth)
  1 ─── 1 PROFILES
           id (PK, FK -> auth.users.id)
           full_name
           role (user | admin)
           school_id (FK -> SCHOOLS.id, opcional)
           created_at

SCHOOLS
  id (PK)
  name
  municipality

PROFILES 1 ─── N LISTINGS
SCHOOLS  1 ─── N LISTINGS
LISTINGS
  id (PK)
  owner_id (FK -> PROFILES.id)
  school_id (FK -> SCHOOLS.id)
  title, description
  category (book | uniform | other)
  grade
  condition (new | good | used)
  offer_type (exchange | donation)
  status (active | reserved | completed | withdrawn | hidden)
  created_at, updated_at

LISTINGS 1 ─── N INTEREST_REQUESTS
PROFILES 1 ─── N INTEREST_REQUESTS (requester)
INTEREST_REQUESTS
  id (PK)
  listing_id (FK -> LISTINGS.id)
  requester_id (FK -> PROFILES.id)
  message (opcional)
  status (pending | accepted | declined | closed)
  created_at, updated_at

LISTINGS 1 ─── N REPORTS
PROFILES 1 ─── N REPORTS (reporter)
REPORTS
  id (PK)
  listing_id (FK -> LISTINGS.id)
  reporter_id (FK -> PROFILES.id)
  reason
  description (opcional)
  status (open | reviewed | dismissed)
  created_at, reviewed_at (opcional)
```

Restrições principais: `profiles.id` é também a referência à conta autenticada; `interest_requests` deve ter restrição única para impedir mais de um pedido ativo do mesmo usuário para o mesmo anúncio; o servidor deve garantir no máximo um pedido aceito por anúncio; `owner_id` não pode ser igual a `requester_id`. A aplicação não armazena senha em `profiles`.

## 7. Critérios de aceite

- **CA01 — Cadastro (RF01):** dado que o visitante informa nome, e-mail válido e senha válida ainda não cadastrados, quando envia o formulário, então a conta é criada e o perfil correspondente pode ser consultado; se o e-mail já estiver em uso ou algum campo for inválido, o cadastro é recusado com mensagem clara.
- **CA02 — Login/logout (RF02):** dado que existe uma conta válida, quando o usuário informa credenciais corretas, então acessa as funções autenticadas; quando encerra a sessão, então operações autenticadas deixam de ser permitidas.
- **CA03 — Publicação (RF03):** dado que o usuário está autenticado e preenche todos os campos obrigatórios com valores válidos, quando publica, então o anúncio é salvo com seu identificador como dono e aparece no catálogo; campos inválidos não geram registro.
- **CA04 — Catálogo e filtros (RF04):** dado que existem anúncios em diferentes estados e categorias, quando um visitante abre o catálogo e aplica filtros, então vê somente anúncios ativos e disponíveis que correspondem aos filtros selecionados.
- **CA05 — Detalhes e privacidade (RF05):** dado que existe anúncio ativo, quando qualquer visitante abre seus detalhes, então vê as informações do item, mas nenhum telefone, e-mail ou endereço residencial do dono.
- **CA06 — Pedido de interesse (RF06):** dado que um usuário autenticado diferente do dono abre um anúncio disponível, quando envia interesse, então um pedido pendente fica salvo e aparece ao dono; o sistema rejeita pedido do dono, duplicado ativo ou feito em anúncio indisponível.
- **CA07 — Resposta e reserva (RF07):** dado que o dono recebe pedido pendente, quando aceita, então o pedido passa a aceito, o anúncio fica reservado e os demais pedidos pendentes são fechados; quando recusa, então apenas aquele pedido passa a recusado.
- **CA08 — Conclusão/retirada (RF08):** dado que o anúncio é do usuário autenticado e está em estado permitido, quando o dono marca a entrega como concluída ou retira o item, então o novo estado é salvo e o anúncio não aparece no catálogo de disponíveis.
- **CA09 — Edição e propriedade (RF09):** dado que um anúncio está ativo, quando seu dono altera informações válidas, então as alterações ficam salvas; se outro usuário tentar editá-lo, o servidor recusa a operação.
- **CA10 — Denúncia (RF10):** dado que um usuário autenticado visualiza um anúncio existente, quando envia um motivo de denúncia válido, então a denúncia é salva e fica disponível para moderação; denúncia para anúncio inexistente é recusada.
- **CA11 — Moderação (RF11):** dado que uma conta com papel de administrador consulta denúncias, quando oculta um anúncio, então o estado de moderação é gravado e o anúncio deixa de aparecer publicamente; uma conta comum não consegue executar a ação.
- **CA12 — Atividade do usuário (RF12):** dado que o usuário possui anúncios e pedidos, quando abre “Minha atividade”, então vê apenas os próprios anúncios e pedidos enviados ou recebidos, com os estados atualizados.

## 8. Decisão de stack e deploy

- **Aplicação:** Next.js com TypeScript e App Router, usando componentes responsivos e formulários com validação no cliente para orientar o usuário. As mesmas regras serão repetidas no servidor por Server Actions ou Route Handlers.
- **Interface:** Tailwind CSS para estilos responsivos e consistentes.
- **Banco e autenticação:** Supabase, com PostgreSQL, Supabase Auth e políticas RLS. O banco armazenará perfis, escolas, anúncios, pedidos e denúncias; as senhas ficarão sob responsabilidade do Supabase Auth.
- **Deploy:** Vercel para hospedar a aplicação Next.js e Supabase Cloud para banco e autenticação. A integração é compatível com a arquitetura escolhida e permite configurar variáveis de ambiente sem incluir chaves secretas no código-fonte.
- **Justificativa:** essa stack permite construir uma aplicação web acessível por navegador em celular e computador, sem dispositivos IoT ou instalação de aplicativo. Next.js oferece rotas e validação no servidor; PostgreSQL atende aos relacionamentos do modelo; autenticação e RLS ajudam a proteger os dados; Vercel e Supabase oferecem serviços compatíveis para publicar a aplicação.
- **Configuração de produção:** chaves administrativas do Supabase serão usadas somente no servidor e guardadas como variáveis secretas; o navegador usará apenas a chave pública com RLS habilitado. O projeto terá ambientes separados de desenvolvimento e produção.
