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
- Consultado o GitHub autenticado: já havia convite pendente para `rafaelpitwak`, então não foi enviado convite duplicado. O painel do responsável deve confirmar o estado final após o professor aceitar.

### Verificações realizadas

- Compilação de produção `npm run build` concluída com sucesso no checkout em Windows 10 Home, Node.js 24.20.0 e npm 11.19.0.
- `.env.local` está coberto por `.gitignore`; somente `.env.example` é permitido no repositório.
- Busca estática de padrões comuns de chaves Supabase secret, tokens GitHub, chave privada, chave AWS e URL de banco com senha nos cinco commits existentes não encontrou correspondências; essa busca não prova que todo tipo de segredo esteja ausente.
- A URL publicada respondeu HTTP 200 durante a conferência anterior. Isso não equivale a testar todo o fluxo autenticado.
- Não foi executado SQL no projeto Supabase hospedado nesta revisão.

### Confirmação humana exigida pela atividade

Esta revisão de código foi feita pelo agente e **não é uma declaração de que o estudante a leu ou aprovou**. Antes da entrega, o responsável deve conferir este changelog, revisar as mudanças no GitHub, percorrer o sistema e preencher o nome/data abaixo. Não assine sem realizar a revisão.

- Revisei as mudanças e o fluxo publicado: [ ] Sim
- Nome do responsável: ____________________
- Data: ____________________
