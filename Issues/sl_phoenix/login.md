# 🔐 INFORMAÇÕES IMPORTANTES (ADMIN & SENHAS)

## Site: **superleme**
- **URL Admin:** https://superleme.abensoft:8443/admin  
- **Usuário:** `admin`  
- **Senha:** `superleme`

## Site: **zotonic_status** (Status Global)
- **URL:** https://127.0.0.1:8443/zotonic/status  
- **Usuário:** `wwwadmin`  
- **Senha:** `ksU8TAbs42iU0VYo`  
- *(Usuário **não** é admin)*

---

# Correções de Configuração — Zotonic & Erlang Distribuído
**Data:** 14 de dezembro de 2025  
**Contexto:** Resolver acesso de Admin, nomeação de nós e conectividade entre Zotonic/Phoenix.

---

## 1. Nomeação de Nós no Erlang Distribuído
**Problema:** Tentativa de usar `zotonic@127.0.0.1` (IPs são inválidos para *longnames*), causando problemas de conectividade.  
**Solução:** Padronização para `zotonic@abensoft.local`, alinhando com o hostname do sistema.

### Configuração do `/etc/hosts`
Adicionado para garantir resolução local do nó e do site:

    127.0.0.1 abensoft.local
    127.0.0.1 superleme.abensoft

### Alinhamento do Cookie
- **Cookie:** `OMBCSLXTXQYYPBOAIRWT`
- **Nó Phoenix:** `phoenix@abensoft.local`
- **Nó Zotonic:** `zotonic@abensoft.local`
- **Status:** Ambos os nós devem compartilhar o mesmo cookie e resolução de hostname para se comunicarem.

---

## 2. Configuração de Ambiente do Zotonic
Scripts de inicialização foram atualizados para forçar a variável de ambiente `LNAME` correta.

### Arquivo: `zotonic` (Linha 7)
Export adicionado para garantir o nome do nó:

    export LNAME=${LNAME:=zotonic@abensoft.local}

### Arquivo: `GNUmakefile` (Linha 6)
Export adicionado para processos de build/make:

    export LNAME=zotonic@abensoft.local

### Arquivo: `run.sh` (Novo)
Launcher simples para debug:

    #!/bin/bash
    # Launcher simples de debug para capturar o env correto
    export LNAME=zotonic@abensoft.local
    ./bin/zotonic debug

---

## 3. Acesso Admin & Segurança
Erros de **“Access Denied”** e **“Peer Not Allowed”** resolvidos abrindo restrições de IP e resetando credenciais manualmente.

### A. Site: `superleme`
- **Arquivo de Config:** `priv/sites/superleme/config` (ou config equivalente)
- **Alterações:**

        {ip_allowlist_admin, any},
        {ratelimit_enabled, false}

- **Comando para Reset de Senha:**

        m_identity:set_by_type(1, username_pw, <<"admin">>, <<"superleme">>, Context)

- **Acesso:** https://superleme.abensoft:8443/admin  
- **Credenciais:** `admin` / `superleme`

---

### B. Site: `zotonic_status` (Status Global)
- **Arquivo de Config:** `priv/sites/zotonic_status/config`
- **Alterações (Linhas 25–26):**

        {ip_allowlist_admin, any},
        {ratelimit_enabled, false}

- **Local das Credenciais:**  
  `~/.config/zotonic/config/1/zotonic.config`

- **Acesso:** https://127.0.0.1:8443/zotonic/status  
- **Credenciais:** `wwwadmin` / `ksU8TAbs42iU0VYo`

---

## 4. Scripts Utilitários & Comandos

### Script de Reset de Senha Admin (`reset-admin-password.sh`)
Script shell criado usando RPC Erlang para resetar senhas sem entrar manualmente no shell.

### Limpar Rate Limits
Se o login for bloqueado por excesso de tentativas, executar no shell Erlang:

    mnesia:clear_table('ratelimit_event-superleme').

*(Substitua `superleme` pelo nome do site alvo)*

---

## 5. Resumo dos Arquivos Modificados
1. `zotonic` — Adicionado export do `LNAME`
2. `GNUmakefile` — Adicionado export do `LNAME`
3. `run.sh` — Criado launcher de debug
4. `/etc/hosts` — Adicionadas entradas de hostname
5. Config do site `superleme` — Ajustes de `ip_allowlist_admin` e `ratelimit`
6. Config do site `zotonic_status` — Ajustes de `ip_allowlist_admin` e `ratelimit`
7. `reset-admin-password.sh` — Script utilitário criado
