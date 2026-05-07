# Comandos administrativos da mz_hud

A `mz_hud` é uma HUD global de servidor. Os comandos abaixo são voltados para dono/dev/admin do servidor, não para player comum personalizar layout individual.

## Permissão

A permissão padrão permanece:

```lua
Config.Admin.principal = 'group.mz_owner'
```

Não altere essa permissão sem revisar os demais resources que dependem dela.

## Editor global

### `/mzhud`

Abre o editor global da HUD.

```txt
/mzhud
```

Uso esperado:

```txt
1. Admin/dev abre /mzhud.
2. Ajusta visual global da HUD.
3. Salva.
4. Todos os jogadores recebem a mesma configuração.
```

### `/mzhud_reload`

Recarrega a configuração global salva em `data/runtime_config.json`.

```txt
/mzhud_reload
```

Use quando editar/validar configuração salva ou após restaurar arquivo manualmente.

### `/mzhud_reset`

Reseta a configuração global para o padrão do `config.lua`.

```txt
/mzhud_reset
```

Se backups estiverem ativos, a HUD cria backup antes do reset.

## Presets globais

### Listar presets

```txt
/mzhud_preset
/mzhud_preset list
```

### Aplicar preset

```txt
/mzhud_preset apply apex
/mzhud_preset apply clean_minimal
/mzhud_preset apply classic_rp
/mzhud_preset apply setup_debug
```

Atalho aceito:

```txt
/mzhud_preset apex
```

O preset é global, sanitizado e salvo em `data/runtime_config.json`.

## Backups globais

### Listar backups

```txt
/mzhud_backup
/mzhud_backup list
```

### Criar backup manual

```txt
/mzhud_backup create
/mzhud_backup create antes de testar novo tema
```

### Restaurar último backup

```txt
/mzhud_backup restore latest
/mzhud_backup latest
```

### Restaurar backup específico

```txt
/mzhud_backup restore <id>
```

O ID aparece na listagem de backups.

## Diagnóstico

```txt
/mzhud_diag
```

Verifica runtime, presets, backups, arquivos essenciais e estado atual provável da HUD.

Esse comando não altera nada.

## Auditoria local

```txt
/mzhud_audit
/mzhud_audit recent
/mzhud_audit recent 20
```

Mostra os últimos registros de auditoria no console do servidor.

A auditoria registra ações administrativas como abertura do editor, salvamento, reset, reload, presets, backups, diagnóstico e tentativas sem permissão.

Arquivo padrão:

```txt
data/audit/mz_hud_audit.log
```

## Fluxo recomendado para alterar visual em produção

```txt
1. /mzhud_backup create antes-da-mudanca
2. /mzhud_preset apply clean_minimal ou abrir /mzhud
3. /mzhud_diag
4. testar status/voz/radio/arma/logo/veiculo
5. se algo ficar ruim: /mzhud_backup restore latest
```

## Comandos por finalidade

```txt
Editar visual:       /mzhud
Recarregar config:   /mzhud_reload
Voltar ao padrão:    /mzhud_reset
Aplicar modelo:      /mzhud_preset apply <nome>
Proteger config:     /mzhud_backup create
Desfazer mudança:    /mzhud_backup restore latest
Diagnosticar:        /mzhud_diag
Auditar ações:       /mzhud_audit recent
```
