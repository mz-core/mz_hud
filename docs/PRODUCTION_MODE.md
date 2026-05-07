# Modo produção da mz_hud

Este guia define cuidados para usar a `mz_hud` em servidor aberto ao público.

## Princípio

A HUD é global. Uma alteração salva por admin/dev afeta todos os jogadores.

Por isso, em produção:

```txt
- crie backup antes de mexer
- aplique presets em horário controlado
- rode diagnóstico após alterações
- teste em veículo, a pé, armado e com rádio/voz
```

## Antes de alterar visual

```txt
/mzhud_backup create antes-da-alteracao
```

Depois altere com:

```txt
/mzhud
```

ou:

```txt
/mzhud_preset apply <nome>
```

## Depois de alterar

```txt
/mzhud_diag
```

Teste visualmente:

```txt
[ ] HUD a pé
[ ] HUD em veículo
[ ] velocidade/rpm/gasolina
[ ] arma/munição
[ ] voz/rádio
[ ] logo
[ ] minimapa
[ ] editor abre após salvar
```

## Se algo der errado

Volte o backup mais recente:

```txt
/mzhud_backup restore latest
```

Depois rode:

```txt
/mzhud_diag
```

## Arquivos que exigem cuidado máximo

```txt
client/main.lua
server/main.lua
web/app.js
web/core/core.js
web/hud/editor/editor.js
web/index.html
```

Só mexa nesses arquivos com teste em servidor local/dev.

## Arquivos mais seguros para edição visual

```txt
web/hud/status/status.css
web/hud/speedometer/speedometer.css
web/hud/voice/voice.css
web/hud/radio/radio.css
web/hud/weapon/weapon.css
web/hud/logo/logo.css
web/hud/editor/editor.css
```

Mesmo nesses arquivos, mantenha IDs/classes usados pelo JS.

## runtime_config.json

`data/runtime_config.json` é a configuração global salva. Se ele existir e estiver válido, pode sobrescrever valores do `config.lua`.

Se o config.lua parece não aplicar, verifique:

```txt
/mzhud_diag
```

ou restaure/reset:

```txt
/mzhud_reset
```

## Recomendações

```txt
- não edite runtime_config.json com servidor rodando, salvo necessidade real
- não apague data/backups/ sem conferir antes
- não troque group.mz_owner sem revisar o pacote
- não crie sistema por player dentro desta HUD
- mantenha presets globais versionados
```


## Auditoria em produção

Recomendado manter auditoria ativa para comandos administrativos:

```lua
Config.Audit.enabled = true
Config.Audit.log_permission_denied = true
```

Para reduzir ruído, você pode desativar logs de diagnóstico:

```lua
Config.Audit.log_diagnostics = false
```

O log fica em:

```txt
data/audit/mz_hud_audit.log
```
