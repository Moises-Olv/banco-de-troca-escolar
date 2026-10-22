# Instruções do projeto Banco de Troca Escolar

Este é um site funcional em Next.js App Router com autenticação, banco de dados e armazenamento no Supabase. Não trate as páginas como demonstração local: anúncios, perfis e pedidos são persistidos.

## Segurança e dados

- A URL do projeto e a chave `publishable` podem ser usadas no navegador. Nunca exponha uma `service_role`, chave secreta ou token em variável `NEXT_PUBLIC_*`, código cliente, logs ou commits.
- Mantenha `.env.local` fora do controle de versão. Não copie valores de chaves para documentação.
- Use as políticas RLS do Supabase como autorização real. Verificações no navegador servem apenas para orientar a interface e não substituem RLS.
- Aplique autenticação no servidor para rotas privadas e use o usuário validado pelo Supabase. Nunca confie em um `usuario_id` enviado pelo formulário sem comparar com `auth.uid()` no banco.
- Para alterações de pedidos, reservas e confirmação de entrega, use as funções RPC existentes. Preserve `SECURITY DEFINER`, `search_path` vazio, validação de participante e permissões `EXECUTE` restritas.
- Não exponha e-mails, telefones, endereços residenciais, códigos de confirmação ou dados internos de autenticação. Perfis públicos devem conter somente os campos que a interface precisa mostrar.
- Fotos aceitas são JPEG, PNG ou WebP, limitadas a 5 MB. Preserve as políticas de armazenamento que restringem envio e remoção à pasta do próprio usuário.
- Todo texto fornecido pelo usuário deve ter limites adequados e ser renderizado como texto escapado. Não use `dangerouslySetInnerHTML` para conteúdo de anúncios ou perfis.

## Banco de dados

- Mantenha alterações de banco em arquivos SQL idempotentes dentro de `supabase/`.
- Informe claramente quando uma migração precisa ser executada no SQL Editor do projeto Supabase. Não diga que uma migração remota foi aplicada sem confirmação observável.
- Antes de mudar uma política, função, tabela ou bucket, verifique como as páginas atuais dependem dela e considere dados já existentes.
- Não crie anúncios fictícios nem altere dados de usuários durante manutenção visual.

## Estrutura e interface

- Mantenha uma página por rota em `app/`, componentes reutilizáveis em `components/` e funções compartilhadas em `lib/`.
- Preserve a identidade visual do Banco de Troca Escolar e mantenha busca, filtros, anúncios, pedidos e perfil conectados ao Supabase.
- Cada tela deve funcionar em celular e computador sem rolagem horizontal. Textos importantes como escola, turma, condição, status e nome do anunciante não devem ser cortados.
- Associe rótulos aos campos, mostre foco de teclado, estados de carregamento/erro/vazio e alvos de toque confortáveis.
- Use links do Next.js para navegação interna e não deixe controles decorativos sem ação.
- Não adicione dependências quando os recursos já instalados forem suficientes.

## Verificação e comunicação

- Ao terminar alterações, descreva arquivos modificados e o que foi verificado.
- Diferencie erros locais de configuração de problemas que exigem executar SQL no Supabase.
- Não imprima valores de `.env.local` em saídas de terminal ou respostas.
