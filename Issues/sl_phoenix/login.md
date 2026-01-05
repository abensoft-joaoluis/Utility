# Relatório Técnico Completo: Soluções Zotonic
**Data:** 14 de Dezembro de 2025
**Status:** Resolvido

Este documento consolida todas as correções aplicadas ao ambiente: o problema da Tela Zotonic (Cookies) e os ajustes de Infraestrutura (Nós e Senhas).

---

## 1. O Problema da Tela Zotonic (Configuração de Cookies)
**Sintoma:** O acesso à URL da aplicação exibe apenas a página de status padrão do Zotonic, em vez do site correto.
**Causa:** O domínio configurado no cookie (`cookie_domain`) não coincidia com o domínio de acesso no navegador.

**COMO RESOLVER (Tutorial Passo a Passo):**

1.  Abra o arquivo de configuração do site:
    `apps_user/superleme/priv/zotonic_site.config`

2.  Localize a tupla `cookie_domain`.

3.  Altere o valor para corresponder exatamente ao host que você está usando para acessar:
    ```erlang
    {cookie_domain, "superleme.dev"},
    ```

4.  Salve o arquivo e reinicie o site.

---

## 2. Infraestrutura: Nomeação de Nó Erlang (Node Naming)
**Problema:** O Erlang Distribuído falhava ao iniciar com `zotonic@127.0.0.1` pois IPs não são válidos para "longnames".
**Solução:** Padronizado para `zotonic@abensoft.local`.

### Alterações Realizadas:
* **Arquivo `/etc/hosts`:**
    Adicionadas entradas para simular DNS local:
    ```text
    127.0.0.1 abensoft.local
    127.0.0.1 superleme.abensoft
    ```

* **Correção nos Scripts (Variáveis de Ambiente):**
    * Arquivo `zotonic` (Linha 7): Adicionado `export LNAME=${LNAME:=zotonic@abensoft.local}`
    * Arquivo `GNUmakefile` (Linha 6): Adicionado `export LNAME=zotonic@abensoft.local`
    * Arquivo `run.sh`: Criado script de debug launcher.

### Conectividade Phoenix/Zotonic:
* **Cookie Erlang:** `OMBCSLXTXQYYPBOAIRWT` (Unificado).
* **Nós:** `phoenix@abensoft.local` e `zotonic@abensoft.local` agora se comunicam via hostname local.

---

## 3. Segurança e Senhas de Admin

### Site: `superleme`
* **Arquivo:** `apps_user/superleme/priv/zotonic_site.config`
* **Ajustes de Segurança:**
    ```erlang
    {ip_allowlist_admin, any},
    {ratelimit_enabled, false}
    ```
* **Acesso:** `https://superleme.abensoft:8443/admin`
* **Credenciais:**
    * Usuário: `admin`
    * Senha: `superleme`

### Site: `zotonic_site_status` (Global)
* **Arquivo:** `priv/sites/zotonic_status/config` (ou similar no core)
* **Credenciais Descobertas:**
    * Usuário: `wwwadmin`
    * Senha: `ksU8TAbs42iU0VYo`
    * Local da senha: `~/.config/zotonic/config/1/zotonic.config`
* **Acesso:** `https://127.0.0.1:8443/zotonic/status`

---

## 4. Utilitários Criados
* **Limpeza de Rate Limit:**
    Comando Erlang: `mnesia:clear_table('ratelimit_event-<nomedosite>').`
* **Script de Reset:**
    `reset-admin-password.sh` (Usa RPC para alterar senhas sem shell interativo).
