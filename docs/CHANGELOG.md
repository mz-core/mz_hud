# Changelog da organização da mz_hud

## Fase 14 - Preview do mapa fiel ao cliente

```txt
- proxy do mapa passa a usar a geometria real do cliente por estilo
  (base + tamanho: square 0.1638x0.183, circle 0.180x0.258, default 0.150x0.188888)
- minimap_x/minimap_y tratados como deslocamento a partir de (24,24), com o mesmo
  minimapOffset de ultrawide usado pelo cliente
- cliente envia minimapInset (recuo do safezone) para o proxy alinhar com a borda
  real do minimapa no jogo
- eixo Y corrigido no cliente (era invertido em relação ao editor): positivo sobe
- editor.css deixa de fixar largura/altura do proxy
```

Testes: `tests/minimap_proxy_contract.test.js`.

## Fase 13 - Alinhamento/colapso do grupo de status e modelo em lote

```txt
- grupo de status ancora a direção de crescimento pelo alignment
  (start esq→dir / cima→baixo, center, end dir→esq / baixo→cima)
- status oculto com collapseWhenHidden sai do fluxo (display:none), fechando o
  vão e reancorando o grupo sem espaçamento residual
- inspector do grupo recebe "Modelo dos status → Aplicar a todos"; cada status
  continua editável individualmente
```

Testes: `tests/status_group_alignment_contract.test.js`.

## Fase 12 - Editor completo, ícones Lucide e correções do velocímetro

```txt
- inspector expõe opções já suportadas pelo schema: indicadores do velocímetro
  (faróis, cadeado, motor), cores secundária/fundo, ícone por slot, comms_options
  de voz/rádio, modelo de imagem da arma e preset do chat
- navegador do editor inclui Geral (opacidade global) e Chat
- conjunto curado de ícones Lucide adicionado e registrado em icon_manifest.json
- setas de apex/analog/classic passam a herdar a cor do tema via máscara CSS,
  removendo a cor base fixa do SVG
- indicador de motor separa barra e ícone: aro/arco segue a saúde, ícone segue
  ligado/desligado
```

Testes: `tests/editor_harness.js` e `tests/hud_editor_extended.test.js`.
Validação runtime FiveM continua pendente.

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
