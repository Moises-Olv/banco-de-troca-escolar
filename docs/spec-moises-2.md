# Spec Moisés 2 — Especificação do sistema atual

**Projeto:** Banco de Troca Escolar  
**Tipo:** aplicação web responsiva para organização comunitária de doações escolares  
**Versão desta especificação:** retrato do código neste repositório em 22 de outubro de 2026

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
- O primeiro administrador é inicializado por SQL, não por autoinscrição pública. A instalação de outra instância requer adaptar o e-mail de bootstrap no script de administração para o próprio titular antes da execução.

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

### Entidades observadas

- **Auth user:** conta e autenticação gerenciadas pelo Supabase Auth.
- **Material:** `usuario_id`, título, descrição, escola, série, categoria, condição, modalidade, status, imagem, data de criação, indicador ativo e marcação de retirada por moderação.
- **Perfil público:** identificador ligado à conta, nome de exibição, escola e foto.
- **Pedido de interesse:** material, solicitante, mensagem, status, data/hora proposta, mensagem de entrega, datas de reserva/conclusão e confirmação de entrega.
- **Código de entrega:** fica em schema/tabela privada; tentativas são limitadas.
- **Notificação:** destinatário, pedido relacionado, tipo, título, mensagem e estado de leitura.
- **Relato:** tipo, página, descrição, passos, e-mail opcional/necessário conforme pedido e estado de análise.
- **Denúncia:** anúncio, motivo, denunciante e estado de análise.
- **Administrador e convite:** papéis e convites ficam em schema privado.

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

## 8. Configuração e implantação

Consulte [`README.md`](../README.md) para requisitos, variáveis de ambiente, execução local, configuração dos scripts Supabase e implantação Vercel. Há uma limitação relevante: **este repositório não inclui o esquema inicial completo da tabela `public.materiais`**. Alguns scripts são extensões e dependem dessa estrutura preexistente; assim, o banco de uma instalação nova não pode ser recriado somente pelos SQLs atualmente versionados.

## 9. Limites e itens não inferidos

- O código não cria contas de demonstração nem anúncios fictícios.
- Não se promete disponibilidade contínua, sucesso de cada doação ou inspeção física dos materiais.
- Não há suporte a pagamentos, reembolsos, compras, vendas, troca comercial, avaliação pública ou analytics no sistema atual.
- Os textos legais disponíveis são páginas do produto, não substituem revisão jurídica profissional.
- O repositório não contém arquivo `LICENSE`; sua visibilidade pública não define, por si só, direitos de reutilização.
- A configuração de um projeto de terceiros exige configurar seu próprio Supabase, URLs de autenticação, e-mail, esquema base e primeiro administrador.
- O site não garante anonimato entre doador e solicitante: o nome de exibição do solicitante aparece no pedido recebido pelo doador.
- Os filtros locais usam escola como referência; não há filtro por bairro, mapa ou raio de distância.

## 10. Fonte desta especificação

Esta spec descreve as rotas, componentes, consultas, mutações e scripts SQL versionados neste repositório. Quando a implementação mudar, atualize esta especificação para que permaneça alinhada ao produto. O arquivo raiz `spec.md` é uma proposta inicial anterior e não representa o escopo atual.
