# Zotonic & Distributed Erlang Configuration Fixes
**Date:** December 14, 2025
**Context:** Resolving Admin Access, Node Naming, and Connectivity between Zotonic/Phoenix.

## 1. Distributed Erlang Node Naming
**Problem:** Tried using `zotonic@127.0.0.1` (IPs are invalid for longnames) and had connectivity issues.
**Solution:** Standardized on `zotonic@abensoft.local` to match system hostname.

### `/etc/hosts` Configuration
Added the following to ensure local resolution for the node and site:

    127.0.0.1 abensoft.local
    127.0.0.1 superleme.abensoft

### Cookie Alignment
* **Cookie:** `OMBCSLXTXQYYPBOAIRWT`
* **Phoenix Node:** `phoenix@abensoft.local`
* **Zotonic Node:** `zotonic@abensoft.local`
* *Status:* Both nodes must share the cookie and hostname resolution to communicate.

---

## 2. Zotonic Environment Configuration
Updated the launch scripts to force the correct `LNAME` environment variable.

### File: `zotonic` (Line 7)
Added export to enforce node name:

    export LNAME=${LNAME:=zotonic@abensoft.local}

### File: `GNUmakefile` (Line 6)
Added export for build/make processes:

    export LNAME=zotonic@abensoft.local

### File: `run.sh` (New)
Created a simple debug launcher:

    #!/bin/bash
    # Simple debug launcher to capture correct env
    export LNAME=zotonic@abensoft.local
    ./bin/zotonic debug

---

## 3. Admin Access & Security
Resolved "Access Denied" and "Peer Not Allowed" errors by opening IP restrictions and resetting credentials manually.

### A. Site: `superleme`
* **Config File:** `priv/sites/superleme/config` (or similar site config)
* **Changes:**
  
      {ip_allowlist_admin, any},
      {ratelimit_enabled, false}

* **Password Reset Command:**

      m_identity:set_by_type(1, username_pw, <<"admin">>, <<"superleme">>, Context)

* **Access:** `https://superleme.abensoft:8443/admin`
* **Credentials:** `admin` / `superleme`

### B. Site: `zotonic_status` (Global Status)
* **Config File:** `priv/sites/zotonic_status/config`
* **Changes (Lines 25-26):**

      {ip_allowlist_admin, any},
      {ratelimit_enabled, false}

* **Credentials Location:**
  Found in `~/.config/zotonic/config/1/zotonic.config` (User is **not** admin).
* **Access:** `https://127.0.0.1:8443/zotonic/status`
* **Credentials:** `wwwadmin` / `ksU8TAbs42iU0VYo`

---

## 4. Utility Scripts & Commands

### Reset Admin Password Script (`reset-admin-password.sh`)
Created a shell script using Erlang RPC to reset passwords without entering the shell manually.

### Clearing Rate Limits
If login is blocked due to too many attempts, run this in the Erlang shell:

    mnesia:clear_table('ratelimit_event-superleme').

*(Replace `superleme` with target site name)*

---

## 5. Summary of Modified Files
1. `zotonic` (script) - Added LNAME export.
2. `GNUmakefile` - Added LNAME export.
3. `run.sh` - Created new debug launcher.
4. `/etc/hosts` - Added hostname entries.
5. `superleme` site config - Added `ip_allowlist_admin` & `ratelimit` settings.
6. `zotonic_status` site config - Added `ip_allowlist_admin` & `ratelimit` settings.
7. `reset-admin-password.sh` - Created utility.
