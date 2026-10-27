# Changelog e registro de revisão

Este arquivo registra alterações de preparação da entrega e decisões tomadas ao revisar a implementação existente. Não registra operações feitas diretamente no banco Supabase ou em configurações externas sem evidência.

## 2026-10-27 — Preparação da Spec Final

### Corrigido

- Adicionado `database/schema.sql` com a tabela inicial `public.materiais`, que era dependência ausente dos scripts complementares.
- Separado o bootstrap do primeiro administrador em `database/bootstrap-admin.sql`, executado somente depois de criar e confirmar a conta. Removido o bloco que interrompia `supabase/administracao.sql` em um banco novo.
- Adicionados `.env.example` e `.nvmrc`; o primeiro contém apenas valores de exemplo e o segundo fixa a versão Node usada na compilação.
- Criado `spec.md` na raiz com instalação, variáveis, sequência SQL, modelo de dados, fluxo de teste e limitações.
- Atualizado o README para refletir os arquivos e a ordem reais de instalação.
- Criados roteiro manual ponta a ponta e checklist que separa evidências de código das verificações externas pendentes.

### Decisões registradas na revisão do agente

- Não criar usuários, senhas ou anúncios fictícios no esquema; o avaliador cria contas próprias de teste e confirma o e-mail.
- Não incluir chave privada ou e-mail de administrador em arquivos versionados; o primeiro administrador é configurado localmente depois do cadastro.
- Não afirmar que o banco hospedado foi migrado, que as variáveis da Vercel estão corretas ou que o Anexo B foi aprovado; essas verificações dependem dos painéis e do documento do curso.
- Identificado que a lista pública de commits não demonstra claramente o histórico do desenvolvimento desde seu início; esta atualização não reescreve nem inventa histórico anterior.
- O responsável confirmou nesta conversa que o professor `rafaelpitwak` já foi adicionado como colaborador. O estado do convite não foi consultado novamente por API nesta revisão.
- O histórico ativo do GitHub tem seis commits, começando em `Initial public release` (22/10/2026), e não comprova o histórico completo desde o início do desenvolvimento. Foram encontrados também 23 commits antigos como objetos Git locais não referenciados; eles não foram republicados porque existe uma pendência anterior de cache/remoção no GitHub e não se deve reintroduzir histórico antigo sem auditoria de credenciais.

### Verificações realizadas

- Compilação de produção `npm run build` concluída com sucesso no checkout em Windows 10 Home, Node.js 24.20.0 e npm 11.19.0.
- `.env.local` está coberto por `.gitignore`; somente `.env.example` é permitido no repositório.
- Busca estática de padrões de alta confiança (tokens Supabase/GitHub, chave privada, chave AWS, JWT e URL de banco com senha) nos 29 commits alcançáveis ou ainda presentes como objetos locais não referenciados não encontrou correspondências. A busca não prova que todo formato de segredo esteja ausente nem substitui a auditoria do histórico no GitHub.
- Foi feito um clone limpo do commit de entrega em diretório temporário. `npm ci` instalou as dependências e reportou zero vulnerabilidades; `npm run build` concluiu com sucesso usando valores Supabase fictícios. Isso valida instalação e compilação, não conexão nem migração do banco.
- A URL publicada respondeu HTTP 200 durante a conferência anterior. Isso não equivale a testar todo o fluxo autenticado.
- Não foi executado SQL no projeto Supabase hospedado nesta revisão. A versão exata do PostgreSQL, o resultado atual do Security Advisor e a comparação com o Anexo B continuam dependendo do painel e do material do curso.
- A pessoa responsável confirmou que o professor foi adicionado como colaborador. A pessoa ainda precisa preencher a declaração de revisão humana abaixo após conferir o resultado e o sistema.

### Confirmação humana exigida pela atividade

Esta revisão de código foi feita pelo agente e **não é uma declaração de que o estudante a leu ou aprovou**. Antes da entrega, o responsável deve conferir este changelog, revisar as mudanças no GitHub, percorrer o sistema e preencher o nome/data abaixo. Não assine sem realizar a revisão.

- Revisei as mudanças e o fluxo publicado: [ ] Sim
- Nome do responsável: ____________________
- Data: ____________________
