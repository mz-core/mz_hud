# Editor visual da mz_hud

## Estado inicial auditado

A `mz_hud` já possuía NUI vanilla modular, configuração global em `Config.DefaultHUD`, persistência em `data/runtime_config.json`, presets em `data/presets`, backups indexados, auditoria local e autorização ACE por `group.mz_owner`.

O editor anterior era um formulário fixo grande em `web/index.html`. O fluxo de preset chamava o servidor e persistia imediatamente; o save usava um net event sem resposta de validação e fechava a NUI antes da confirmação do servidor.

Contratos encontrados:

- Lua para NUI: `bootstrap`, `applyConfig`, `openEditor`, `closeEditor`, `updateStatus`, `updateVehicle`, `updateWeapon`, `updateMedical`, `setHudVisible` e `setSpeedometerVisible`.
- NUI para Lua: `ready`, `closeEditor`, `saveConfig`, `getEditorPresetManager`, `applyPresetFromEditor`, `createEditorBackup`, `applyChatLayout` e `notifyPreview`.
- Persistência: `LoadResourceFile`/`SaveResourceFile` em `data/runtime_config.json`.
- Permissão: `IsPlayerAceAllowed(source, Config.Admin.principal)` no servidor.
- Backup: snapshot antes de save/reset/preset/restore, conforme `Config.Backups`.
- Presets: manifesto fechado em `data/presets/presets_manifest.json`.

Estados canônicos utilizados:

- Vida, colete, fome, sede e stress: `mz_core:client:playerStateSync`, com fallbacks já existentes.
- Oxigênio: `IsPedSwimmingUnderWater` e `GetPlayerUnderwaterTimeRemaining`.
- Stamina: `GetPlayerSprintStaminaRemaining`, conforme payload preexistente.
- Voz e rádio: player state e eventos do `pma-voice` já consumidos.
- Veículo, combustível, cinto, motor, luzes e trava: payload veicular central existente.
- Arma e munição: `mz_core:client:weaponHudState`, com fallbacks existentes.

## Arquitetura final

O editor é ativado somente por `openEditor`. Fora desse modo, a HUD permanece sem hitboxes e sem listeners de drag ativos.

- `web/hud/editor/schema.js`: schema v2, normalização e migração de configs v1.
- `web/hud/editor/store.js`: draft, dirty state e histórico de 50 operações.
- `web/hud/editor/visibility.js`: resolvedor central de `visibilityMode`.
- `web/hud/editor/visual.js`: seleção, inspector, drag, resize, teclado, grid, snap, safezone, preview e modais.
- `web/hud/editor/presets.js`: cards e aplicação somente ao draft.
- `web/hud/editor/editor.css`: apresentação contextual.

O formulário lateral e os módulos antigos `form.js`, `elements.js` e `lifecycle.js` foram removidos. `editor.js` é apenas o ponto de composição.

## Draft, history e save

Ao abrir, a configuração persistida vira `store.persisted`, uma cópia normalizada vira `store.draft` e defaults do servidor ficam em `store.defaults`. Estados de preview são cópias visuais e nunca são enviados ao gameplay.

Drag e resize consolidam um snapshot no `pointerup`. Inputs consolidam no `change`. Undo/redo guardam no máximo 50 snapshots.

`Salvar e Aplicar` chama `mz_hud:server:saveEditorConfig`. O servidor:

1. valida novamente o ACE;
2. compara a `revision` do draft;
3. cria backup automático;
4. sanitiza pelo schema fechado;
5. incrementa a revisão;
6. salva o runtime;
7. transmite a configuração;
8. retorna sucesso ou erro à NUI.

Conflito de revisão mantém o editor aberto e não sobrescreve silenciosamente a configuração mais nova.

## Schema v2

O formato responsivo canônico mantém `position` como uma das nove âncoras e usa `x/y` percentuais quando `free=true`; não depende de pixels absolutos.

```json
{
  "schema_version": 2,
  "revision": 4,
  "elements": {
    "oxygen": {
      "position": "bottom-center",
      "free": true,
      "x": 60,
      "y": 95,
      "scale": 100,
      "visibilityMode": "smart",
      "locked": false,
      "collapseWhenHidden": false
    }
  },
  "general": {
    "status_group": {
      "orientation": "horizontal",
      "alignment": "center",
      "gap": 8,
      "locked": false
    }
  }
}
```

O servidor ignora propriedades desconhecidas e não aceita CSS, HTML ou JavaScript vindos da NUI.

## VisibilityMode e SMART

- `always`: visível enquanto habilitado.
- `smart`: passa pela regra central.
- `hidden`: oculto no gameplay.
- Preview `Todos`: revela SMART/HIDDEN apenas no editor e exibe badge textual.

Regras implementadas:

- Armor: `armor > 0`.
- Oxygen: `oxygenActive`, `oxygenInUse` ou oxigênio abaixo de 100.
- Stamina: payload indicando consumo.
- Speedometer: payload veicular ativo.
- Weapon: payload de arma ativo.

Oxygen não cria estado scuba. `oxygenActive` deriva de `IsPedSwimmingUnderWater`; o valor continua vindo de `GetPlayerUnderwaterTimeRemaining`.

Itens ocultos preservam espaço por padrão para evitar saltos. `collapseWhenHidden=true` permite colapso com transição curta.

## Groups

`statusGroup` pode ser movido, redimensionado, bloqueado e resetado como unidade. Suporta `orientation`, `alignment`, `gap`, `scale`, `opacity`, anchor e posição percentual. Itens podem continuar no grupo ou usar `individual=true`.

O `alignment` define a direção de crescimento do grupo, ancorando a aresta inicial/central/final no ponto escolhido:

- horizontal: `start` cresce da esquerda para a direita, `center` centraliza, `end` cresce da direita para a esquerda;
- vertical: `start` cresce de cima para baixo, `center` centraliza, `end` cresce de baixo para cima.

Status ocultos com `collapseWhenHidden` saem do fluxo (`display: none`), então o grupo se reancora e fecha o vão na direção configurada sem espaçamento residual. Itens ocultos sem colapso preservam o espaço.

No inspector do grupo há ainda **Modelo dos status → Aplicar a todos**, que define `style` de todos os status (vida, colete, fome, sede, stamina, oxigênio, stress) de uma vez. Voz e rádio mantêm o modelo `comms` e cada status continua editável individualmente.

## Editor do mapa

O item `Mapa`, no navegador superior, seleciona um proxy visual do minimapa nativo. O proxy pode ser arrastado ou ajustado pelas setas e expõe no inspector: ativar, formato quadrado/circular/padrão GTA, regra de exibição, deslocamentos X/Y e bloqueio.

O draft continua usando o contrato legado `general.show_minimap`, `minimap_style`, `minimap_visibility`, `minimap_x` e `minimap_y`; apenas `minimap_locked` é estado adicional do editor. O desenho real do radar depende das natives do FiveM e é aplicado pelo cliente depois de salvar.

O proxy agora espelha a mesma geometria que o cliente aplica (`SetMinimapComponentPosition`), por estilo:

- base e tamanho por estilo: `square` 0.1638×0.183, `circle` 0.180×0.258 (círculo) e `default` 0.150×0.188888;
- `minimap_x`/`minimap_y` são deslocamentos a partir do padrão (24,24): positivo = direita/cima;
- o mesmo `minimapOffset` de ultrawide é aplicado ao proxy;
- o cliente envia `minimapInset` (recuo do safezone via `GetSafeZoneSize`) e a caixa visível é ancorada nesse recuo — a base negativa dos estilos é a área das barras de vida/colete, que ficam ocultas.

Assim, o contorno no editor fica no mesmo lugar e tamanho do minimapa real, em vez do retângulo fixo antigo.

## Inspector completo

O inspector é montado a partir do schema fechado; cada seção edita somente chaves que o servidor já sanitiza. Cobertura atual:

- Posicionamento e aparência (comum): ativado, âncora, posição livre, X/Y, escala, opacidade, visibilidade e bloqueio.
- Status e comunicação: nome, ícone (catálogo), estilo, cor, mover separado e colapsar quando oculto; voz e rádio também expõem `comms_options` (rótulo, textos, opacidade inativo, frequência e sufixo).
- Grupo de status: orientação, alinhamento e espaçamento.
- Velocímetro: modelo, unidade, indicadores (velocidade, RPM, combustível, marcha, cinto, faróis, cadeado e motor), cores (principal, destaque, secundária e fundo) e ícone por slot (`speedometer.icons.*`).
- Arma: imagem, munição, nome e modelo da imagem (`image_model`).
- Logo: imagem, largura, altura e exibição apenas em veículo.
- Chat: preset de posição.
- Navegador superior: `Geral` (opacidade global) e `Chat` além de status, grupo, mapa, velocímetro, arma e logo.

Nenhuma opção cria chave fora do schema sanitizado no servidor.

## Setas e indicador de motor

Nos modelos `apex`, `analog` e `classic`, as setas passam a usar `<span>` com `speedometer-icon-mask` em vez de `<img>`, herdando a cor do tema: inativas em `primary-soft`, ativas em `accent`. Isso remove a cor base fixa do SVG antigo.

O indicador de motor separa barra e ícone: o aro/arco segue a saúde do motor (`is-ok` / `is-warning` / `is-critical`) e somente o ícone reflete ligado/desligado (`is-on` / `is-off`).

## Presets e reset

`applyPresetFromEditor` apenas carrega, sanitiza e devolve o preset; não salva nem transmite. A persistência ocorre no save normal.

Há reset de elemento, do grupo selecionado e da HUD inteira. O reset global pede confirmação e atua primeiro no draft. Os comandos server-side de preset/reset/backup mantêm sua semântica explícita.

## Adicionar elemento, regra SMART ou preset

Novo elemento:

1. adicione o default em `Config.DefaultHUD.elements`;
2. adicione render/ícone no módulo apropriado;
3. atualize ordem em `web/app/render.js`, se necessário;
4. adicione ranges em `schema.js` e sanitização no servidor;
5. para SMART, use somente estado já entregue à NUI;
6. adicione casos em `tests/editor_harness.js`.

Novo preset:

1. crie o JSON em `data/presets`;
2. registre em `presets_manifest.json`;
3. use apenas chaves do schema fechado;
4. execute o harness;
5. valide em Preview `Todos`.

## Testes

```powershell
node tests/editor_harness.js
node --test tests/hud_editor_extended.test.js tests/status_group_alignment_contract.test.js tests/minimap_proxy_contract.test.js tests/medical_presentation_contract.test.js tests/presentation_visibility_contract.test.js
Get-ChildItem -Recurse -Filter *.js web | ForEach-Object { node --check $_.FullName }
lua tests/status_contract_harness.lua
```

Preview local: abra `tests/editor_preview.html` em navegador com acesso a arquivos locais. Ele não valida foco NUI, callbacks CEF, natives, ACE, broadcast ou persistência real.

## Checklist manual no FiveM

1. Testar `/mzhud` com e sem `group.mz_owner`.
2. Confirmar cursor/foco, HUD visível e seleção direta.
3. Testar item, grupo, velocímetro, arma e logo.
4. Testar drag, resize, setas, Shift+setas, lock, grid, snap e safezone.
5. Testar inspector, undo/redo e resets sem gravação antecipada.
6. Aplicar preset e confirmar que outros players não recebem antes do save.
7. Testar previews sem alterar o ped.
8. Salvar e conferir backup, revisão, runtime e broadcast.
9. Abrir dois editores e confirmar conflito de revisão.
10. Testar ESC, descarte e cleanup em stop/restart.
11. Validar 1920x1080, 2560x1440 e 3440x1440.

Status: **PENDENTE DE VALIDAÇÃO RUNTIME FIVEM**.
