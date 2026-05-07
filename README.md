# mz_hud

`mz_hud` é a HUD global oficial pensada para servidores que usam `mz_core`.

A proposta do resource é simples:

```txt
O dono/desenvolvedor do servidor escolhe o visual da HUD.
Todos os jogadores recebem a mesma configuração global.
Player comum não possui personalização individual de HUD.
```

## Recursos principais

```txt
- Editor global dentro do jogo pelo comando /mzhud
- Configuração salva em data/runtime_config.json
- Presets globais aplicáveis por comando administrativo
- Backups globais antes de alterações importantes
- Diagnóstico administrativo da instalação
- CSS organizado por módulos
- Catálogo documentado de estilos/modelos visuais
- Compatibilidade mantida com a permissão atual group.mz_owner
```

## Dependências

```txt
ox_lib
mz_core
```

Ordem recomendada no `server.cfg`:

```cfg
ensure ox_lib
ensure mz_core
ensure mz_hud
```

## Comandos administrativos

A permissão padrão continua sendo:

```lua
Config.Admin.principal = 'group.mz_owner'
```

Comandos principais:

```txt
/mzhud                     abre o editor global
/mzhud_reload              recarrega a configuração salva
/mzhud_reset               reseta para o padrão do config.lua
/mzhud_preset list         lista presets disponíveis
/mzhud_preset apply <nome> aplica um preset global
/mzhud_backup list         lista backups globais
/mzhud_backup create       cria backup manual
/mzhud_backup restore latest restaura o backup mais recente
/mzhud_diag                mostra diagnóstico administrativo
```

Guia completo: `docs/COMMANDS.md`.

## Configuração global

A HUD usa dois níveis principais:

```txt
config.lua                 padrão inicial do resource
data/runtime_config.json   configuração global salva pelo editor/comandos
```

Quando `data/runtime_config.json` existe e é válido, ele pode sobrescrever o padrão de `config.lua` durante o runtime.

## Presets

Presets operacionais ficam em:

```txt
data/presets/
```

Presets documentais/exemplos ficam em:

```txt
docs/presets/
```

Aplicação:

```txt
/mzhud_preset apply apex
/mzhud_preset apply clean_minimal
/mzhud_preset apply classic_rp
/mzhud_preset apply setup_debug
```

## Backups

Backups globais ficam em:

```txt
data/backups/
```

Eles protegem a configuração global antes de salvar pelo editor, aplicar preset, resetar ou restaurar outro backup.

## Diagnóstico

Use:

```txt
/mzhud_diag
```

Esse comando apenas lê o estado do resource. Ele não salva, não aplica preset, não cria backup e não altera o visual.

## Documentação recomendada

```txt
docs/INSTALLATION.md       instalação e ordem de start
docs/COMMANDS.md           comandos administrativos
docs/PRODUCTION_MODE.md    cuidados para produção
docs/RELEASE_CHECKLIST.md  checklist antes de entregar/atualizar
docs/SAFE_EDITING.md       arquivos sensíveis e regras de edição
docs/STYLES_CATALOG.md     estilos/modelos oficiais
docs/PRESETS.md            guia de presets
docs/BACKUPS.md            guia de backups
docs/DIAGNOSTICS.md        guia de diagnóstico
```

## Regra de ouro

```txt
Não altere client/main.lua, server/main.lua, web/app.js, web/core/core.js ou editor.js sem testar no servidor.
```

Esses arquivos sustentam a comunicação Lua ↔ NUI, salvamento, bootstrap e renderização dos módulos.


## Auditoria administrativa

A HUD registra ações administrativas locais em:

```txt
data/audit/mz_hud_audit.log
```

Comando útil:

```txt
/mzhud_audit recent
```

Mais detalhes em `docs/AUDIT_LOGS.md`.


## Ícones configuráveis

O sistema de ícones configuráveis fica documentado em `docs/ICON_SYSTEM.md`. Os arquivos de ícones entram em `web/assets/icons/` e o editor `/mzhud` detecta opções sequenciais como `health_1.svg`, `fuel_1.svg`, etc.
