# Roteiro de teste manual

Este roteiro testa o fluxo principal em um projeto Supabase de desenvolvimento configurado conforme [`spec.md`](../spec.md). Ele não cria contas nem anúncios fictícios. Use e-mails de teste sob controle de quem avalia e nunca reutilize senhas pessoais.

## Preparação

1. Configure as variáveis de ambiente e aplique o esquema e as migrações seguindo a seção **Instalação e execução** da spec.
2. Confirme o envio de e-mails do Supabase e os Redirect URLs locais.
3. Inicie o site com `npm run dev` e abra `http://localhost:3000`.
4. Para conferir a experiência pública, abra também uma janela anônima sem sessão autenticada.

## Fluxo de doação ponta a ponta

1. Na primeira janela, cadastre a **Conta A** com um e-mail de teste que possa receber mensagens e confirme o endereço.
2. Entre na Conta A e abra **Publicar material**.
3. Publique um item de teste sem dados pessoais (por exemplo, “Caderno de teste”), escolha escola, série, categoria e conservação e use uma foto não identificável ou nenhuma foto.
4. Abra o **Catálogo** e confirme que o anúncio aparece e que busca e filtros encontram os dados escolhidos.
5. Em outra janela anônima, cadastre a **Conta B** com outro e-mail de teste, confirme-o e entre.
6. Na Conta B, abra o anúncio e envie um pedido de interesse com uma mensagem de teste.
7. Volte à Conta A e abra **Minha atividade**. Confira o pedido recebido e aceite-o propondo data e horário futuros, com uma mensagem de entrega.
8. Confirme que a Conta B recebe a proposta e que o anúncio deixa de aparecer como disponível no catálogo.
9. Na Conta B, confirme a data e o horário. Confira que o estado da reserva é atualizado.
10. Na Conta A, abra o pedido e consulte o código de entrega que ficou disponível após a confirmação da data.
11. Na Conta B, informe esse código para confirmar o recebimento. Confirme que o pedido e o anúncio passam para **Concluído** e que não aparecem mais entre os disponíveis.

## Fluxo alternativo de cancelamento

1. Crie outro anúncio de teste e outro pedido pendente.
2. Na conta doadora, proponha uma nova data e horário.
3. Na conta solicitante, cancele a reserva em vez de confirmar.
4. Confirme que o pedido é encerrado, o código deixa de ser utilizável e o anúncio volta a aparecer disponível se continuar ativo.

## Verificações adicionais

- Uma conta não deve editar nem remover anúncio de outra pessoa.
- Visitantes podem ver o catálogo, mas não podem enviar pedidos sem entrar.
- Relatos enviados pelo formulário não ficam públicos; somente a administração pode consultá-los e moderá-los.
- Uma conta comum não pode abrir ações administrativas. Convites administrativos devem ser aceitos somente pela conta autenticada com o e-mail confirmado destinatário.
- Teste o site publicado em uma janela anônima e percorra o fluxo com duas contas antes da apresentação.

## Limitações do teste

- O teste depende de e-mails de confirmação e do estado do projeto Supabase.
- O primeiro administrador precisa ser configurado separadamente com `database/bootstrap-admin.sql`.
- Este roteiro não substitui testes automatizados, a revisão do Anexo B de segurança nem a conferência das configurações do Supabase e da Vercel.
- Ao terminar em um projeto de teste, remova manualmente os anúncios e contas descartáveis se não forem mais necessários; não rode limpeza destrutiva em produção.
