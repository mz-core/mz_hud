# mz_hud - Guia de edição segura

Este guia existe para evitar que a HUD quebre durante reorganizações futuras.

## Regra principal

A `mz_hud` é uma HUD global para servidores `mz_core`. O player comum não escolhe o próprio tema. Quem configura é o dono/desenvolvedor do servidor usando o editor administrativo `/mzhud`.

## Não alterar na primeira fase

Evite refatorar estes arquivos sem uma rodada de testes completa:

```txt
client/main.lua
server/main.lua
web/app.js
web/core/core.js
web/hud/editor/editor.js
```

Esses arquivos concentram a lógica de:

```txt
- bootstrap da HUD
- envio de status
- envio de dados de veículo
- envio de arma/munição
- abertura e fechamento do editor
- salvamento global
- reset global
- permissões
- aplicação da configuração para todos
```

## Permissão

Não trocar a permissão atual sem revisar os demais scripts da framework.

Padrão atual:

```lua
Config.Admin.principal = 'group.mz_owner'
```

Essa permissão deve continuar sendo respeitada porque outros resources podem depender dela.

## Configuração global

O fluxo correto é:

```txt
config.lua = padrão inicial do resource
runtime_config.json = configuração global salva pelo editor
```

Se `runtime_config.json` existir, ele pode fazer parecer que mudanças no `config.lua` não foram aplicadas. Nesse caso, use o fluxo de reset/reload do próprio resource antes de concluir que o config está errado.

## Arquivo legado

`web/config.lua` não deve ser editado como configuração ativa. Ele está marcado como legado para evitar confusão.

## O que pode ser mexido com menor risco

```txt
- documentação
- comentários do config.lua
- assets visuais
- CSS de módulos, sem trocar classes/IDs usados pelo JS
- novos estilos visuais usando o schema atual de style
```

## O que exige cuidado alto

```txt
- mudar IDs do index.html
- mudar nomes de actions NUI
- mudar callbacks NUI
- mudar schema do runtime_config.json
- trocar style por theme sem compatibilidade
- alterar normalizeConfig/with*Defaults sem testar tudo
- remover runtime_config.json
```

## Checklist de teste após qualquer mudança

```txt
[ ] HUD carrega ao entrar no servidor
[ ] /mzhud abre o editor
[ ] Salvar aplica visual para todos
[ ] Reset volta a configuração global
[ ] Reload recarrega runtime_config.json
[ ] Vida/colete/fome/sede atualizam
[ ] Voz atualiza corretamente
[ ] Rádio aparece e atualiza corretamente
[ ] Velocímetro aparece nas condições configuradas
[ ] Velocidade/RPM/gasolina/motor atualizam
[ ] Arma e munição aparecem corretamente
[ ] Logo aparece sem fundo preto
[ ] F8 não mostra erro JS/NUI
[ ] Console do servidor não mostra erro Lua
```

---

## Organização CSS

A Fase 2 separa o CSS sem alterar lógica Lua/NUI/JS principal.

### Regra

`web/style.css` deve ficar apenas com base global:

```txt
- transparência NUI
- reset básico
- body/html
- hud-root
- hud-container
- posições globais da HUD de status
```

CSS específico de cada parte deve ficar no módulo:

```txt
web/hud/status/status.css
web/hud/speedometer/speedometer.css
web/hud/voice/voice.css
web/hud/radio/radio.css
web/hud/logo/logo.css
web/hud/weapon/weapon.css
web/hud/editor/editor.css
```

CSS compartilhado fica em:

```txt
web/shared/variables.css
web/shared/animations.css
web/shared/helpers.css
```

### O que foi separado na Fase 2

```txt
- Variáveis globais foram para web/shared/variables.css
- Keyframes compartilhados foram para web/shared/animations.css
- Ícones/masks e base de voz/rádio foram para web/shared/helpers.css
- CSS restante do status foi concentrado em web/hud/status/status.css
- CSS restante do velocímetro foi concentrado em web/hud/speedometer/speedometer.css
```

### Cuidado com classes CSS

Não renomear classes/IDs usados pelo JavaScript. Essa organização é estrutural, não é uma troca de comportamento.

### Correção importante dos ícones

As classes `.hud-icon-mask` e `.speedometer-icon-mask` devem permanecer em `web/style.css`, não em `web/shared/helpers.css`.

Motivo: os ícones usam caminhos como `./assets/icons/...` dentro de `--icon-url`. No ambiente NUI/FiveM, mover a regra `mask` para `web/shared/helpers.css` pode fazer o navegador tentar resolver os assets a partir de `web/shared/`, causando ícones invisíveis.

Regra segura:

```txt
web/style.css                 -> base de masks/ícones com caminhos ./assets
web/shared/helpers.css        -> helpers compartilhados que não dependem de caminho relativo ./assets
```
