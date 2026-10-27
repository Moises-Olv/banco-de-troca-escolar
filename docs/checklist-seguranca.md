# Revisão de segurança antes da entrega

Use junto ao Anexo B da apostila. O anexo não está versionado neste repositório; compare cada item do curso com este registro e não marque verificações do painel como concluídas sem olhar a instalação real.

## Evidências verificáveis no repositório

- [x] `.env.local` é ignorado pelo Git e `.env.example` contém apenas valores fictícios para as variáveis públicas necessárias.
- [x] Revisão estática de padrões de alta confiança (tokens Supabase/GitHub, chave privada, chave AWS, JWT e URLs de banco com senha) nos 29 commits que ainda existem localmente não encontrou correspondências. Isso não substitui a verificação de credenciais no painel nem detecta todo formato de segredo.
- [x] A aplicação usa Supabase Auth para autenticação; não mantém uma tabela própria de senhas.
- [x] Os scripts SQL configuram RLS, políticas de Storage, privilégios de funções e validações de propriedade/participante.
- [x] Upload de imagens limitado a JPEG, PNG ou WebP e 5 MB, com políticas para pastas por usuário.
- [x] Configuração do Next.js inclui cabeçalhos de segurança (`next.config.mjs`).
- [x] O fluxo de entrega limita tentativas de código no banco.
- [x] O esquema e as instruções não inserem contas, anúncios, senhas ou dados pessoais de teste.

## Conferências que o responsável precisa fazer no serviço

Na captura do Security Advisor compartilhada durante a revisão, o painel mostrava **0 erros, 19 avisos e 3 sugestões informativas**. Portanto, “zero vulnerabilidades” do relatório de dependências do GitHub não significa que o Security Advisor do Supabase esteja sem avisos. Reabra o advisor e confira cada aviso atual; alguns avisos de `SECURITY DEFINER` podem corresponder a RPCs intencionais do fluxo do site, mas cada função e permissão precisa ser validada contra os scripts e a necessidade real.

- [ ] Conferir o Security Advisor do projeto Supabase atual; comparar os avisos de `SECURITY DEFINER` com `supabase/seguranca-acesso-funcoes.sql`, testar a chamada como `anon` e `authenticated`, e resolver ou documentar individualmente cada aviso.
- [ ] Confirmar RLS habilitado nas tabelas públicas e testar com visitante, conta comum, doador, solicitante e administrador.
- [ ] Conferir que nenhuma chave `service_role` ou secret está nas variáveis `NEXT_PUBLIC_*`, nos logs ou no histórico GitHub; rotacionar credencial se alguma tiver sido exposta.
- [ ] Conferir as policies e os privilégios efetivos das funções `SECURITY DEFINER`, incluindo `search_path` e `EXECUTE`.
- [ ] Confirmar que bucket, tamanho, tipos de imagem e políticas de acesso correspondem aos scripts deste repositório.
- [ ] Confirmar domínio HTTPS, Site URL e Redirect URLs no Supabase e variáveis de ambiente na Vercel.
- [ ] Comparar com o Anexo B da apostila, registrar cada divergência e a correção adotada.

## Resultado desta revisão de código

O checkout foi compilado com `npm run build` no Windows 10 Home usando Node.js 24.20.0 e npm 11.19.0. Isso comprova a compilação desta cópia, não o estado dos serviços Supabase/Vercel nem aprovação integral do Anexo B. Registre aqui data e responsável depois de fazer a conferência externa.

- Responsável pela conferência externa: ____________________
- Data: ____________________
- Resultado do Anexo B: ____________________
