# Changelog da organização da mz_hud

## Fase 10 - Release, produção e documentação final

```txt
- adicionado README.md principal
- adicionado docs/COMMANDS.md
- adicionado docs/INSTALLATION.md
- adicionado docs/PRODUCTION_MODE.md
- adicionado docs/RELEASE_CHECKLIST.md
- adicionado docs/CHANGELOG.md
- atualizado docs/STRUCTURE.md com documentação final
```

Nenhuma lógica NUI/Lua foi alterada nesta fase.

## Fase 9 - Diagnóstico administrativo

```txt
- adicionado /mzhud_diag
- adicionado docs/DIAGNOSTICS.md
```

## Fase 8 - Backups globais

```txt
- adicionado /mzhud_backup
- adicionada pasta data/backups/
- adicionado docs/BACKUPS.md
```

## Fase 7 - Comando de presets

```txt
- adicionado /mzhud_preset
- presets globais passam a ser aplicáveis por comando administrativo
```

## Fase 6 - Presets preparados

```txt
- adicionada pasta data/presets/
- adicionado manifesto de presets
```

## Fase 5 - Editor global melhorado

```txt
- editor /mzhud recebeu avisos de configuração global
- adicionado docs/EDITOR_GUIDE.md
```

## Fase 4 - Presets globais documentados

```txt
- adicionados exemplos de presets em docs/presets/
- adicionado docs/PRESETS.md
```

## Fase 3 - Catálogo de estilos

```txt
- adicionado docs/STYLES_CATALOG.md
- docs/THEMES.md expandido
```

## Fase 2 - Organização CSS

```txt
- CSS global separado de CSS por módulo
- adicionados web/shared/*.css
```

## Fase 1 - Documentação e segurança

```txt
- adicionados docs/STRUCTURE.md, docs/SAFE_EDITING.md e docs/THEMES.md
- web/config.lua marcado como legado/não usado
```


## Fase 11 - Auditoria administrativa local

Adicionado:

```txt
Config.Audit
/mzhud_audit
data/audit/mz_hud_audit.log
data/audit/README.md
docs/AUDIT_LOGS.md
```

A auditoria registra ações administrativas da HUD, incluindo salvamento global, reset, reload, presets, backups, diagnóstico e tentativas sem permissão.

Não altera visual, NUI, permissões ou personalização por player.
