# mz_hud - Estrutura atual

A `mz_hud` é a HUD global da framework `mz_core`. Ela foi pensada para ser configurada pelo dono/desenvolvedor do servidor, não individualmente por cada player.

O editor `/mzhud` altera a configuração global do resource. Ao salvar, a configuração é gravada em `data/runtime_config.json` e aplicada para todos os jogadores conectados.

## Fluxo principal

```txt
config.lua
  ↓
server/main.lua carrega data/runtime_config.json quando existir
  ↓
client/main.lua recebe o bootstrap do servidor
  ↓
web/app.js recebe a action bootstrap/applyConfig
  ↓
módulos em web/hud/* renderizam status, velocímetro, voz, rádio, logo e arma
```

## Estrutura de pastas

```txt
mz_hud/
├─ fxmanifest.lua
├─ config.lua
├─ client/
│  └─ main.lua
├─ server/
│  └─ main.lua
├─ data/
│  ├─ runtime_config.json
│  └─ presets/
│     ├─ README.md
│     ├─ presets_manifest.json
│     ├─ apex.json
│     ├─ clean_minimal.json
│     ├─ classic_rp.json
│     └─ setup_debug.json
├─ docs/
│  ├─ STRUCTURE.md
│  ├─ SAFE_EDITING.md
│  ├─ CSS_ORGANIZATION.md
│  ├─ EDITOR_GUIDE.md
│  ├─ COMMANDS.md
│  ├─ INSTALLATION.md
│  ├─ PRODUCTION_MODE.md
│  ├─ RELEASE_CHECKLIST.md
│  ├─ CHANGELOG.md
│  ├─ DIAGNOSTICS.md
│  ├─ BACKUPS.md
│  ├─ PRESETS.md
│  ├─ PRESET_COMMANDS.md
│  ├─ PRESET_PIPELINE.md
│  ├─ STYLES_CATALOG.md
│  └─ THEMES.md
├─ stream/
│  ├─ circlemap.ytd
│  ├─ minimap.gfx
│  ├─ minimap.ytd
│  └─ squaremap.ytd
└─ web/
   ├─ index.html
   ├─ style.css
   ├─ app.js
   ├─ app/
   │  ├─ state.js
   │  ├─ nui.js
   │  ├─ render.js
   │  ├─ editor_bridge.js
   │  └─ events.js
   ├─ config.lua
   ├─ shared/
   │  ├─ variables.css
   │  ├─ animations.css
   │  └─ helpers.css
   ├─ core/
   │  ├─ constants.js
   │  ├─ utils.js
   │  ├─ positions.js
   │  ├─ icons.js
   │  ├─ defaults.js
   │  ├─ weapons.js
   │  └─ core.js
   ├─ assets/
   │  ├─ icons/
   │  └─ weapons/
   └─ hud/
      ├─ editor/
      │  ├─ schema.js
      │  ├─ store.js
      │  ├─ visibility.js
      │  ├─ visual.js
      │  ├─ editor.js
      │  └─ presets.js
      ├─ logo/
      ├─ radio/
      ├─ speedometer/
      ├─ status/
      ├─ voice/
      └─ weapon/
```

## Responsabilidade dos arquivos principais

### `config.lua`
Configuração padrão do resource. É carregado pelo `fxmanifest.lua` como `shared_script`.

### `data/runtime_config.json`
Configuração global salva pelo editor. Quando existe, ela sobrescreve os valores padrão do `config.lua` no runtime.

### `client/main.lua`
Controla polling de HUD, status, veículo, arma, minimapa, comandos e comunicação NUI.

### `server/main.lua`
Controla permissão do editor, bootstrap, carregamento/salvamento da configuração global, comando administrativo de presets e broadcast para os players.

### `web/style.css`
Base global da NUI/HUD. Deve cuidar apenas de reset, transparência, `hud-root`, `hud-container` e posições globais. CSS específico deve ficar nos módulos.

### `web/shared/*.css`
CSS compartilhado entre módulos:

```txt
variables.css   → tokens e variáveis globais
animations.css  → keyframes compartilhados
helpers.css     → ícones/masks e base compartilhada de voz/rádio
```

### `web/app.js` e `web/app/*`
`app.js` é o bootstrap. A pasta `web/app/` separa estado, NUI callbacks, render, eventos e ponte com o editor.

### `web/core/*`
Centraliza constantes, helpers, posições, ícones, defaults, armas e uma fachada compatível em `core.js`.

### `web/hud/editor/*`
Editor global dividido por responsabilidade: formulários, elementos/status/voz, ciclo abrir/fechar/preview, fachada compatível e presets.

### `web/hud/*`
Cada pasta representa um módulo visual da HUD. Os módulos já possuem JS/CSS próprios e são chamados pelo app/render.

## Actions NUI recebidas pelo front

Essas actions são enviadas por `client/main.lua` para `web/app.js` e devem permanecer compatíveis:

```txt
bootstrap
applyConfig
updateStatus
updateVehicle
updateWeapon
setHudVisible
setSpeedometerVisible
openEditor
closeEditor
```

## Callbacks NUI chamados pelo front

Esses callbacks são registrados em `client/main.lua` e chamados pela NUI:

```txt
ready
closeEditor
saveConfig
resetConfig
applyChatLayout
notifyPreview
```

## Observação sobre `web/config.lua`

O arquivo `web/config.lua` é legado. Ele não é carregado pelo `fxmanifest.lua` e não deve ser usado como fonte de configuração ativa. A configuração válida fica em `config.lua` e `data/runtime_config.json`.


## Catálogo de estilos

A lista oficial de modelos visuais fica em:

```txt
docs/STYLES_CATALOG.md
```

Regra atual: manter a chave `style` por compatibilidade. A HUD não usa preferência individual por player.

## Presets globais de servidor

A pasta `docs/presets/` contém receitas JSON para visuais globais da HUD. Esses presets são documentação e não são carregados automaticamente pelo resource.

```txt
docs/presets/
├─ apex.json
├─ clean_minimal.json
├─ classic_rp.json
└─ setup_debug.json
```

Use `docs/PRESETS.md` como guia antes de copiar qualquer preset para `data/runtime_config.json`.



## Editor global `/mzhud`

O editor global foi melhorado para deixar claro que as alterações são de servidor, não de player. O guia de uso fica em:

```txt
docs/EDITOR_GUIDE.md
```

A Fase 5 adicionou textos de orientação, avisos de salvamento global e referências rápidas de estilos dentro do painel, sem alterar callbacks, actions, permissões ou lógica de salvamento.


## Fase 6 - Presets preparados

A estrutura agora separa presets de documentação e presets operacionais preparados:

```txt
docs/presets/   -> exemplos/documentação
data/presets/   -> presets operacionais usados pelo comando /mzhud_preset
```

Arquivos novos:

```txt
docs/PRESET_PIPELINE.md
data/presets/README.md
data/presets/presets_manifest.json
data/presets/apex.json
data/presets/clean_minimal.json
data/presets/classic_rp.json
data/presets/setup_debug.json
```

Nenhum desses arquivos é carregado automaticamente no start. A partir da Fase 7, o admin/dev pode aplicar um preset explicitamente com `/mzhud_preset`. A HUD continua salvando o resultado final em `data/runtime_config.json`.


## Fase 7 - Comando administrativo de presets

O comando administrativo ativo é:

```txt
/mzhud_preset list
/mzhud_preset apply [nome]
/mzhud_preset [nome]
```

Ele usa `Config.Presets` em `config.lua`, mantém a permissão atual `Config.Admin.principal`, sanitiza o preset e salva o resultado em `data/runtime_config.json`.

Guia completo:

```txt
docs/PRESET_COMMANDS.md
```

## Backups administrativos

A partir da Fase 8, a HUD possui uma camada simples de backup global:

```txt
data/backups/
├─ README.md
├─ index.json
└─ <backup_id>.json
```

Uso principal:

```txt
/mzhud_backup list
/mzhud_backup create
/mzhud_backup restore latest
/mzhud_backup restore <id>
```

Esse sistema não cria preferência por player. Ele protege apenas a configuração global do servidor.


## Diagnóstico administrativo

A partir da Fase 9, a HUD possui comando administrativo de diagnóstico:

```txt
/mzhud_diag
```

Ele usa `Config.Diagnostics` em `config.lua`, mantém a mesma permissão `Config.Admin.principal` e apenas lê o estado da HUD. Não salva, não aplica preset, não cria backup e não altera a NUI.

Guia completo:

```txt
docs/DIAGNOSTICS.md
```

## Fase 10 - Fechamento de release

A Fase 10 adiciona documentação final para instalação, comandos, produção e release:

```txt
README.md
docs/COMMANDS.md
docs/INSTALLATION.md
docs/PRODUCTION_MODE.md
docs/RELEASE_CHECKLIST.md
docs/CHANGELOG.md
```

Essa fase não altera lógica de HUD, NUI, salvamento, permissões, actions ou callbacks. O objetivo é deixar o resource pronto para ser usado como parte oficial do pacote `mz_core`.

Leitura recomendada para dono/dev de servidor:

```txt
1. README.md
2. docs/INSTALLATION.md
3. docs/COMMANDS.md
4. docs/PRODUCTION_MODE.md
5. docs/RELEASE_CHECKLIST.md
```


## Auditoria local

A partir da Fase 11, a HUD possui auditoria local para comandos administrativos.

```txt
data/audit/
├─ README.md
└─ mz_hud_audit.log
```

Documentação relacionada:

```txt
docs/AUDIT_LOGS.md
```

A auditoria não altera a NUI e não adiciona webhook obrigatório. Ela apenas registra ações administrativas em arquivo local.


## Ícones configuráveis

O sistema de ícones configuráveis fica documentado em `docs/ICON_SYSTEM.md`. Os arquivos de ícones entram em `web/assets/icons/` e o editor `/mzhud` detecta opções sequenciais como `health_1.svg`, `fuel_1.svg`, etc.
