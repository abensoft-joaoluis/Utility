# Soluções Técnicas Zotonic
**Data:** 14 de Dezembro de 2025

Este documento descreve os passos técnicos exatos para resolver os problemas de sessão, conexão de nó e autenticação administrativa.

---

## 1. Problema da Tela Zotonic (Cookies)
**Sintoma:** O acesso à URL da aplicação exibe apenas a página de status padrão do Zotonic, em vez do site correto.

**Causa:** O domínio configurado no cookie não coincide com o domínio de acesso no navegador.

**Detalhes Técnicos:**
O navegador implementa políticas de segurança que impedem que um cookie definido para um domínio (ex: `.superleme.dev`) seja enviado para um host diferente (ex: `abensoft.local`). Sem o cookie de sessão (`z_sid`), o Zotonic não consegue identificar a sessão do usuário ou vincular a requisição ao site específico, caindo no "fallback" que é a página de status global.

**Como Resolver:**

1. Abra o arquivo de configuração do site:
   `priv/sites/superleme/config`

2. Localize a tupla `cookie_domain`.

3. Altere o valor para corresponder ao host de acesso:
   ```erlang
   {cookie_domain, "superleme.dev"},
   ```

4. Salve o arquivo.

5. **Importante:** Se a alteração não surtir efeito imediato, limpe os cookies do navegador para remover a versão antiga e force um restart do site via shell para recarregar a configuração compilada.

---

## 2. Problema de Conexão do Nó (Hostname)
**Sintoma:** O Zotonic falha ao iniciar ou não comunica com o Phoenix. Erro de "longnames" com IP.

**Causa:** O Erlang Distribuído exige um nome de host (FQDN) e não aceita endereços IP (ex: `zotonic@127.0.0.1`).

**Detalhes Técnicos:**
O Zotonic opera com a flag `-name` (longnames), que exige que o nome do nó contenha um ponto (`.`) e seja resolvível via DNS ou `/etc/hosts`. Usar `zotonic@127.0.0.1` é válido apenas para `-sname` (shortnames), mas incompatível com a configuração distribuída necessária para conectar com o Phoenix.

**Como Resolver:**

### Passo A: Criar Host Local
Edite o arquivo `/etc/hosts` e adicione uma entrada para simular um domínio local:

```text
127.0.0.1 abensoft.local
127.0.0.1 superleme.abensoft
```
*Nota: A entrada `superleme.abensoft` é necessária se o hostname do site estiver configurado para escutar neste alias.*

### Passo B: Forçar Nome do Nó nos Scripts
Os scripts padrão não mantêm a variável de ambiente. Edite os arquivos manualmente:

1. **Arquivo `bin/zotonic`** (Script de execução):
   Adicione esta linha logo após o cabeçalho `#!/bin/bash`:
   ```bash
   export LNAME=${LNAME:=zotonic@abensoft.local}
   ```
   *Isso garante que o comando `zotonic debug` ou `start` use o nome correto mesmo se a variável de ambiente do shell for perdida.*

2. **Arquivo `GNUmakefile`** (Para compilação):
   Adicione esta linha no início do arquivo:
   ```makefile
   export LNAME=zotonic@abensoft.local
   ```
   *Isso é crítico para comandos como `make start`, pois o Make roda em uma subshell e frequentemente perde variáveis não exportadas explicitamente.*

---

## 3. Acesso Administrativo (Credenciais Hardcoded)
**Sintoma:** Acesso negado ou redirecionamento para a tela de status do Zotonic com credenciais padrão inválidas.

**Causa:** O Zotonic gera credenciais de segurança para a interface de status global (`zotonic_status`) que ficam salvas em um arquivo oculto, separado do banco de dados do site.

**Detalhes Técnicos:**
O site de Status (`zotonic_status`) roda separado dos sites de usuário (como o `superleme`). Ele possui sua própria configuração de segurança para evitar que um erro no banco de dados tranque o administrador para fora do sistema inteiro. A senha deste usuário é gerada aleatoriamente na primeira instalação e salva em um arquivo físico.

**Credenciais Descobertas:**
* **Usuário:** `wwwadmin`
* **Senha:** `ksU8TAbs42iU0VYo`

**Onde encontrar/editar:**
Este arquivo fica localizado no diretório de configuração do usuário do sistema:
`~/.config/zotonic/config/1/zotonic.config`

*Nota: Para usar esta senha, acesse a porta HTTPS (geralmente 8443) na URL raiz ou `/zotonic/status`.*
