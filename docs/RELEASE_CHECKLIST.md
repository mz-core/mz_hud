# Checklist de release da mz_hud

Use antes de publicar, atualizar ou entregar a HUD em um pacote `mz_core`.

## Arquivos essenciais

```txt
[ ] fxmanifest.lua existe
[ ] config.lua existe
[ ] client/main.lua existe
[ ] server/main.lua existe
[ ] web/index.html existe
[ ] web/app.js existe
[ ] web/core/core.js existe
[ ] data/runtime_config.json existe e é JSON válido
[ ] data/presets/presets_manifest.json existe e é JSON válido
[ ] data/backups/index.json existe e é JSON válido
```

## Documentação

```txt
[ ] README.md atualizado
[ ] docs/INSTALLATION.md atualizado
[ ] docs/COMMANDS.md atualizado
[ ] docs/PRODUCTION_MODE.md atualizado
[ ] docs/RELEASE_CHECKLIST.md atualizado
[ ] docs/SAFE_EDITING.md atualizado
[ ] docs/STYLES_CATALOG.md atualizado
[ ] docs/PRESETS.md atualizado
[ ] docs/BACKUPS.md atualizado
[ ] docs/DIAGNOSTICS.md atualizado
```

## Permissão

```txt
[ ] Config.Admin.principal continua group.mz_owner
[ ] /mzhud respeita permissão
[ ] /mzhud_preset respeita permissão
[ ] /mzhud_backup respeita permissão
[ ] /mzhud_diag respeita permissão
```

## Comandos

```txt
[ ] /mzhud abre o editor
[ ] /mzhud_reload recarrega
[ ] /mzhud_reset reseta
[ ] /mzhud_preset list lista presets
[ ] /mzhud_preset apply apex aplica
[ ] /mzhud_backup create cria backup
[ ] /mzhud_backup list lista backups
[ ] /mzhud_backup restore latest restaura
[ ] /mzhud_diag diagnostica
```

## Testes visuais

```txt
[ ] HUD aparece a pé
[ ] status atualiza vida/colete/fome/sede/stamina
[ ] voz atualiza estados
[ ] rádio aparece conforme estado
[ ] logo aparece sem fundo preto
[ ] arma aparece quando armada
[ ] arma some quando desarmada
[ ] velocímetro aparece no veículo
[ ] velocímetro some fora do veículo
[ ] velocidade atualiza
[ ] rpm atualiza
[ ] gasolina atualiza
[ ] marcha atualiza
[ ] cinto/luzes aparecem quando habilitados
[ ] minimapa respeita estilo/visibilidade
```

## Console/F8

```txt
[ ] F8 sem erro JS/NUI
[ ] console do servidor sem erro Lua
[ ] /mzhud_diag sem arquivos ausentes
[ ] runtime_config.json válido
[ ] presets do manifesto encontrados
```

## Segurança de edição

```txt
[ ] Nenhum ID/classe usado por JS foi removido
[ ] actions NUI mantidas
[ ] callbacks NUI mantidos
[ ] salvamento global mantido
[ ] player comum não ganhou config individual
[ ] backups funcionam antes de alterações críticas
```

## Antes de enviar para produção

```txt
[ ] criar backup final: /mzhud_backup create release-final
[ ] rodar /mzhud_diag
[ ] aplicar preset padrão desejado
[ ] testar em resolução comum
[ ] testar em veículo e fora do veículo
[ ] salvar ZIP/commit da versão aprovada
```


## Auditoria

```txt
[ ] Config.Audit.enabled revisado
[ ] /mzhud_audit executa com group.mz_owner
[ ] Tentativa sem permissão gera registro se log_permission_denied=true
[ ] data/audit/mz_hud_audit.log não contém tokens/senhas/webhooks
[ ] Tamanho máximo do log revisado em Config.Audit.max_file_bytes
```
