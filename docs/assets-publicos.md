# Arquivos públicos do site

No Next.js, os arquivos dentro de `public/` são servidos diretamente pelo domínio. Por exemplo, `public/logos/marca.svg` fica disponível em `/logos/marca.svg`.

## Pastas

```text
public/
├── fontes/   # fontes locais, se forem necessárias
├── icones/   # ícones e recursos gráficos
├── imagens/  # banner e imagens usadas pela interface
└── logos/    # logotipos e símbolos do projeto
```

O banner da página do GitHub está em `public/imagens/banner-banco-de-troca-escolar.svg` e é referenciado no início do README por um caminho relativo ao repositório.

## Boas práticas

- Mantenha em `public/` somente arquivos que podem ser baixados por qualquer visitante do site.
- Não coloque aqui `.env`, credenciais, dados pessoais, fotos de usuários ou documentos internos.
- Use imagens próprias ou com autorização de uso e forneça texto alternativo apropriado quando a imagem tiver significado na interface.
- Confira o nome e a extensão do arquivo ao referenciá-lo no código; caminhos começam com `/` e respeitam maiúsculas/minúsculas no servidor.

Exemplo:

```tsx
<img src="/logos/simbolo-banco-de-troca-escolar.svg" alt="Banco de Troca Escolar" />
```
