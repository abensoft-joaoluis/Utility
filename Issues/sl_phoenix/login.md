# Resumo de Alterações e Soluções
**Objetivo Principal:** Configurar o Zotonic para rodar com a nomeação correta de nós Erlang distribuídos e redefinir as senhas de administrador tanto para o site `superleme` quanto para o `zotonic_site_status`.

## Principais Problemas Resolvidos

### 1. Nomeação de Nó Erlang Distribuído (Distributed Erlang Node Naming)
**Problema:** Inicialmente tentou-se usar `zotonic@127.0.0.1`, mas endereços IP não são FQDNs válidos para "longnames".
**Solução:** Utilizado `zotonic@abensoft.local` (correspondendo ao hostname do sistema).

* **Alterações no arquivo Hosts:** Adicionado o seguinte ao `/etc/hosts`:
    ```text
    127.0.0.1 abensoft.local
    127.0.0.1 superleme.abensoft
    ```

### 2. Configuração do Nome do Nó
Modificados os scripts de build e execução para forçar a variável correta do nome do nó.

* **Arquivo `zotonic` (Linha 7):**
    ```bash
    export LNAME=${LNAME:=zotonic@abensoft.local}
    ```
* **Arquivo `GNUmakefile` (Linha 6):**
    ```makefile
    export LNAME=zotonic@abensoft.local
    ```
* **Arquivo `run.sh`:** Criado um script de launcher simples para debug.

### 3. Conectividade Phoenix/Zotonic
Ambos os nós precisavam usar o mesmo cookie Erlang.
* **Cookie:** `OMBCSLXTXQYYPBOAIRWT` (já estava definido)
* **Nó Phoenix:** `phoenix@abensoft.local`
* **Nó Zotonic:** `zotonic@abensoft.local`
* **Resolução:** Conectividade resolvida após adicionar `abensoft.local` ao arquivo hosts.

### 4. Senha de Admin e Segurança

#### Para o site `superleme`:
* **Arquivo de Config:** `zotonic_site.config`
* **Alterações:**
    ```erlang
    {ip_allowlist_admin, any},
    {ratelimit_enabled, false}
    ```
* **Porta:** Hostname fixado na porta `8443`.
* **Comando de Reset de Senha:**
    ```erlang
    m_identity:set_by_type(1, username_pw, <<"admin">>, <<"superleme">>, Context)
    ```
* **Acesso:** `https://superleme.abensoft:8443/admin`
* **Credenciais:** `admin` / `superleme`

#### Para o `zotonic_site_status`:
* **Arquivo de Config:** `zotonic_site.config` (Linhas 25-26)
* **Alterações:**
    ```erlang
    {ip_allowlist_admin, any},
    {ratelimit_enabled, false}
    ```
* **Localização das Credenciais:** Descoberto que usa uma conta especial `wwwadmin`.
    * Arquivo de senha: `~/.config/zotonic/config/1/zotonic.config`
* **Acesso:** `https://127.0.0.1:8443/zotonic/status`
* **Credenciais:** `wwwadmin` / `ksU8TAbs42iU0VYo`

### 5. Gerenciamento de Rate Limit
* **Comando para limpar Rate Limits:**
    ```erlang
    mnesia:clear_table('ratelimit_event-<nomedosite>').
    ```
* **Script Utilitário:** Criado `reset-admin-password.sh` usando Erlang RPC para lidar com resets de senha.

---

## Arquivos Modificados
1.  **zotonic** - Adicionado export de `LNAME`.
2.  **GNUmakefile** - Adicionado export de `LNAME`.
3.  **run.sh** - Criado launcher de debug.
4.  **zotonic_site.config** (superleme) - Adicionadas configurações de segurança.
5.  **zotonic_site.config** (status) - Adicionadas configurações de segurança.
6.  **reset-admin-password.sh** - Criado utilitário de reset de senha.
7.  **hosts** - Adicionadas entradas de hostname.
