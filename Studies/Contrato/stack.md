# Contratos de Empreendimento no Superleme

É necessário criar um sistema que receba um documento em word e seja capaz de transformar em Markdown e renderizá-lo na tela. 

- Encontrar métodos e alternativas, decidir se Word é a melhor opção
- Listar a stack necessária. Isso será feito em Elixir + React. Talvez tentar fazer um projeto de teste. 
- Listar documentações, se disponível

## Leitura de variáveis em Word 
A questão é se há uma forma de ler as variáveis contidas dentro de um documento comum do Word, e não necessariamente docx. Para isso, pode ser possível procurar alguma documentação da Microsoft.

### Caso seja docx:
1. No front-end é possível usar a biblioteca mammoth.js. Ela é especificamente criada para transformar documentos docx em Markdown.
> O usuário seleciona o arquivo -> O React lê o ArrayBuffer -> mammoth converte para HTML -> turndown converte para Markdown -> Exibe na tela. O upside é que o servidor não precisa lidar com isso, e portanto fica mais leve. Supostamente o mammoth.js pode causar bugs visuais nos arquivos dependendo da estrutura, se for complexa demais.

** Essa opção é mais relevante, arquivos legados são desnecessários **
- HTML para Markdown: node-html-markdown or turndown 

https://github.com/mwilliamson/mammoth.js
https://www.npmjs.com/package/mammoth
https://www.npmjs.com/package/node-html-markdown
https://www.npmjs.com/package/turndown
docx -> html -> markdown




2. Uso de Python via NIF em Elixir. Basicamente conectar o servidor a um código de python que rode uma biblioteca tal como o python-docx. 
> erlport, python-docx (leitura), pypandoc (conversão)

### Caso seja doc (Word Legado/Binário):
Arquivos antigos (`.doc`) são binários complexos e não são suportados por bibliotecas modernas de JavaScript ou Python. A solução oficial e mais robusta é utilizar a **Microsoft Graph API** para realizar a conversão na nuvem da Microsoft antes do processamento.

1. **Microsoft Graph API (Conversão Remota)**
   O sistema Elixir atua como um cliente que orquestra a conversão usando a engine real do Word na nuvem.
   > **Fluxo:** O Elixir recebe o `.doc` -> Faz upload para o OneDrive/SharePoint via API -> Solicita o download do arquivo convertendo-o em tempo real (`GET /drive/items/{id}/content?format=docx`) -> O sistema recebe um `.docx` moderno.

   * **Vantagens:** Garante fidelidade visual 100% (layout jurídico, tabelas) pois usa o renderizador oficial; resolve a incompatibilidade de arquivos binários sem hacks no servidor.
   * **Requisitos:** Licença Microsoft 365 (Business), registro de App no Azure (OAuth2) e biblioteca HTTP no Elixir (`Req` ou `Tesla`).
   * **Pós-processamento:** Uma vez recebido o arquivo convertido em `.docx`, ele entra no fluxo de **Python via NIF** citado acima para extração de variáveis.

> Para esse caso, é necessário ter uma licença da Microsoft. Ou seja, ter uma assinatura do Word.
