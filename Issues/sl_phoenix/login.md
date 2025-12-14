# Registro de Intervenções e Diagnóstico de Infraestrutura Zotonic
**Data:** 14 de Dezembro de 2025
**Objetivo:** Tentativa de estabilização da comunicação entre nós Erlang (Phoenix/Zotonic) e recuperação de acesso.

## 1. Problema Central e Contexto
O objetivo inicial era unificar o "Erlang Cookie" entre os serviços. Durante o processo, identificou-se que a discrepância de cookies mascarava um problema estrutural de nomenclatura de nós (`zotonic@127.0.0.1` vs `phoenix@localhost`), o que inviabilizava a comunicação direta, independentemente do cookie utilizado.

## 2. Obstáculo: Nomenclatura de Nós (Node Naming)
**Diagnóstico:** O uso de endereços IP em "longnames" Erlang impediu a inicialização correta da VM.
**Medida Adotada (Contorno):** Para contornar a limitação sem reconfigurar a rede inteira, optou-se por simular um FQDN local.

* **Alteração em `/etc/hosts`:**
    Inserção de entradas manuais para forçar a resolução de nomes locais:
    ```text
    127.0.0.1 abensoft.local
    127.0.0.1 superleme.abensoft
    ```

## 3. Obstáculo: Persistência de Variáveis de Ambiente
**Diagnóstico:** Os scripts nativos de inicialização do Zotonic ignoravam as variáveis exportadas no shell, revertendo o nome do nó para o padrão incorreto.
**Intervenção nos Scripts:** Foram realizadas edições diretas (hardcoded) para forçar o ambiente a aceitar a nova nomenclatura.

* **Arquivo `zotonic`:** Inserção de export forçado.
    `export LNAME=${LNAME:=zotonic@abensoft.local}`
* **Arquivo `GNUmakefile`:** Definição explícita para o processo de build.
    `export LNAME=zotonic@abensoft.local`
* **Script `run.sh`:** Criação de um executável alternativo para bypassar o launcher padrão.

## 4. Obstáculo: Bloqueio de Segurança (IP/Peer)
**Diagnóstico:** Após forçar a subida do nó com o novo nome, o sistema de segurança do Zotonic bloqueou o acesso administrativo (`peer_not_allowed`), interpretando a nova origem como ameaça externa.
**Ação de Mitigação:** Desativação temporária das restrições de segurança no arquivo de configuração (`priv/sites/superleme/config`) para permitir testes de conexão:
    ```erlang
    {ip_allowlist_admin, any},
    {ratelimit_enabled, false}
    ```

## 5. Obstáculo: Travamento de Credenciais (Database Lock)
**Diagnóstico:** Mesmo com acesso de rede liberado, a redefinição de senha falhava com `{error, eacces}`. Identificou-se que a presença do parâmetro `admin_password` no arquivo de configuração cria uma trava que impede a escrita no banco de dados.
**Procedimento de Execução:**
1.  Tentativa de uso de `m_identity` via shell (Falha: bloqueado pela config).
2.  Tentativa de criação de usuário secundário (Sucesso parcial, mas não resolve o user ID 1).
3.  **Execução Final:** Edição manual do arquivo para remover a trava, seguida de injeção direta de credenciais via RPC e limpeza da tabela de `ratelimit` no Mnesia.

## 6. Conclusão das Intervenções
As ações acima não constituem uma correção definitiva da arquitetura, mas sim um conjunto de medidas paliativas necessárias para:
1.  Forçar a compatibilidade de nomes de host.
2.  Bypassar os mecanismos de defesa padrão do Zotonic.
3.  Viabilizar o login administrativo para diagnósticos futuros.
