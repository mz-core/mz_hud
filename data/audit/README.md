# Auditoria local da mz_hud

Esta pasta guarda os registros locais de ações administrativas da HUD.

Arquivo padrão:

```txt
data/audit/mz_hud_audit.log
```

A auditoria é opcional e configurada em `Config.Audit` no `config.lua`.

O log registra ações como abertura do editor, salvamento global, reset, reload, aplicação de presets, criação/restauração de backups, diagnóstico e tentativas sem permissão.

Não coloque tokens, webhooks, senhas ou dados sensíveis neste arquivo.
