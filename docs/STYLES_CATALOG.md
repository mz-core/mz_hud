# mz_hud - Catálogo oficial de estilos

Este catálogo define os modelos visuais oficiais da `mz_hud` nesta fase do projeto.

A HUD é global: quem escolhe o visual é o dono/desenvolvedor do servidor pelo `config.lua` ou pelo editor `/mzhud`. O player comum apenas recebe o visual definido pelo servidor.

## Regra de estabilidade

O nome da chave continua sendo `style`.

Não trocar para `theme` nesta fase, porque `style` já é usado pelo `config.lua`, pelo `runtime_config.json`, pelo editor, pelo front e pela sanitização do servidor.

## Minimap

Chave:

```lua
Config.DefaultHUD.general.minimap_style
```

Valores oficiais:

```txt
circle
square
default
```

Observação: o comportamento de visibilidade do minimap é controlado separadamente por `minimap_visibility`.

## Status

Chave por elemento:

```lua
Config.DefaultHUD.elements.<elemento>.style
```

Elementos de status principais:

```txt
health
armor
hunger
thirst
stamina
oxygen
stress
```

Valores oficiais:

```txt
circle
bar
square
pill
apex
```

Descrição rápida:

```txt
circle  -> ícone/status circular
bar     -> status em barra
square  -> status em bloco quadrado
pill    -> status em formato pílula
apex   -> modelo visual principal Apex
```

## Voz

Chave:

```lua
Config.DefaultHUD.elements.voice.style
```

Valor oficial atual:

```txt
comms
```

A voz possui opções específicas em:

```lua
Config.DefaultHUD.elements.voice.comms_options
```

Opções atuais:

```txt
show_label
show_level_text
show_talking_text
inactive_opacity
```

## Rádio

Chave:

```lua
Config.DefaultHUD.elements.radio.style
```

Valor oficial atual:

```txt
comms
```

O rádio possui opções específicas em:

```lua
Config.DefaultHUD.elements.radio.comms_options
```

Opções atuais:

```txt
show_frequency
show_inactive
show_talking_text
inactive_text
frequency_suffix
```

## Velocímetro

Chave:

```lua
Config.DefaultHUD.speedometer.style
```

Valores oficiais:

```txt
digital
analog
minimal
racing
classic
apex
```

Descrição rápida:

```txt
digital -> velocímetro digital simples
analog  -> velocímetro analógico/circular
minimal -> velocímetro compacto
racing  -> modelo esportivo
classic -> modelo clássico
apex   -> modelo visual principal Apex
```

## Arma

A arma ainda não usa `style` principal como o status/velocímetro. Nesta fase ela usa modelos de asset:

```lua
Config.DefaultHUD.weapon.icon_model
Config.DefaultHUD.weapon.image_model
```

Valor oficial atual:

```txt
default
```

## Logo

A logo não usa `style` nesta fase. Ela é controlada por:

```lua
Config.DefaultHUD.logo.enabled
Config.DefaultHUD.logo.image_url
Config.DefaultHUD.logo.width
Config.DefaultHUD.logo.height
Config.DefaultHUD.logo.opacity
Config.DefaultHUD.logo.position
```

Regra visual importante: manter a logo sem fundo preto por padrão.

## Onde esses valores aparecem no código

```txt
config.lua                -> valores padrão oficiais
server/main.lua           -> sanitização dos valores aceitos
web/core/core.js          -> opções e labels do editor/front
web/hud/editor/editor.js  -> montagem visual do editor
web/hud/*/*.css           -> aparência dos modelos
web/hud/*/*.js            -> renderização de cada módulo
```

---

# Como criar novo estilo

Este guia explica como adicionar novos modelos visuais sem quebrar a HUD.

## Conceito

A `mz_hud` é uma HUD global do servidor. O dono/desenvolvedor escolhe o visual no `config.lua` ou pelo editor `/mzhud`, e todos os players recebem o mesmo layout.

A chave oficial continua sendo:

```txt
style
```

Não trocar para `theme` nesta fase.

## Tipos de customização

### 1. Novo visual usando o mesmo HTML

É o caminho mais seguro.

Use quando o novo estilo só muda:

```txt
- cor
- tamanho
- borda
- sombra
- espaçamento
- opacidade
- animação
```

Nesse caso, normalmente basta criar CSS novo e garantir que o `style` gere uma classe compatível.

### 2. Novo visual com HTML diferente

É mais sensível.

Use apenas quando o modelo precisa de estrutura nova, por exemplo:

```txt
- novo arco SVG
- novo bloco de combustível
- nova área de marcha/rpm
- novo formato de status
```

Nesse caso, além do CSS, será necessário ajustar o JS do módulo correspondente.

## Arquivos envolvidos

### Status

```txt
web/hud/status/status.js
web/hud/status/status.css
```

Config:

```lua
Config.DefaultHUD.elements.health.style
Config.DefaultHUD.elements.armor.style
Config.DefaultHUD.elements.hunger.style
Config.DefaultHUD.elements.thirst.style
Config.DefaultHUD.elements.stamina.style
Config.DefaultHUD.elements.oxygen.style
Config.DefaultHUD.elements.stress.style
```

### Velocímetro

```txt
web/hud/speedometer/speedometer.js
web/hud/speedometer/speedometer.css
```

Config:

```lua
Config.DefaultHUD.speedometer.style
```

### Voz e rádio

```txt
web/hud/voice/voice.js
web/hud/voice/voice.css
web/hud/radio/radio.js
web/hud/radio/radio.css
```

Config:

```lua
Config.DefaultHUD.elements.voice.style
Config.DefaultHUD.elements.radio.style
```

### Arma

```txt
web/hud/weapon/weapon.js
web/hud/weapon/weapon.css
web/assets/weapons/default/
```

Nesta fase, arma usa `icon_model` e `image_model`, não `style` principal.

## Pontos obrigatórios ao adicionar estilo

### 1. Server sanitization

Se o estilo for novo, ele precisa ser aceito no servidor.

Arquivo:

```txt
server/main.lua
```

Procure pelas listas de estilos permitidos, como:

```txt
ALLOWED_ELEMENT_STYLES
ALLOWED_SPEED_STYLES
```

Sem isso, o servidor pode trocar o estilo novo por fallback.

### 2. Opções/labels do front

Arquivo:

```txt
web/core/core.js
```

Procure por:

```txt
selectOptions
labels
```

O editor usa essas listas para mostrar as opções corretamente.

### 3. Editor

Arquivo:

```txt
web/hud/editor/editor.js
```

Normalmente o editor já usa as opções do `core.js`. Só mexa aqui se o novo estilo precisar de campos específicos.

### 4. Runtime existente

Lembre que:

```txt
data/runtime_config.json
```

pode sobrescrever o `config.lua`. Se um estilo novo não aparecer no jogo, teste também com reset/reload do editor.

## Checklist seguro

```txt
[ ] Escolher nome interno do style
[ ] Documentar no docs/STYLES_CATALOG.md
[ ] Adicionar no config.lua, se será padrão
[ ] Adicionar na sanitização do server/main.lua
[ ] Adicionar em selectOptions/labels do web/core/core.js
[ ] Criar CSS no módulo correto
[ ] Só alterar JS do módulo se o HTML novo exigir
[ ] Não renomear classes usadas por JS
[ ] Não remover estilos oficiais sem atualizar config, editor e sanitização
[ ] Testar /mzhud
[ ] Testar salvar
[ ] Testar reload
[ ] Testar reset
[ ] Testar F8 sem erro
```

## Regra especial para ícones

As classes sensíveis de mask/ícones devem continuar em `web/style.css` quando usam caminhos `./assets/...`.

Não mover essas regras para subpastas sem ajustar os caminhos, pois os ícones podem sumir no NUI/FiveM.

## Checklist para adicionar um novo estilo

Antes de adicionar um novo `style`, siga esta ordem:

```txt
[ ] Definir o nome interno do estilo, sem espaços e em minúsculo
[ ] Adicionar o valor no config.lua, se ele puder ser padrão
[ ] Adicionar o valor na sanitização do server/main.lua
[ ] Adicionar o valor nas opções/labels do web/core/core.js
[ ] Criar CSS compatível com classes/IDs existentes
[ ] Alterar render JS somente se o estilo precisar de HTML diferente
[ ] Manter todos os estilos oficiais funcionando
[ ] Testar /mzhud, salvar, reload e reset
[ ] Testar com runtime_config.json existente
[ ] Testar com runtime_config.json limpo
```

## O que não fazer

```txt
- Não remover estilos oficiais sem atualizar config, editor e sanitização
- Não renomear apex sem atualizar config, editor, CSS, JS, presets e sanitização
- Não trocar style por theme sem compatibilidade
- Não misturar preferência individual por player
- Não mudar schema do runtime_config.json sem migração
```

## Presets relacionados

Os estilos deste catálogo são peças individuais. Para composições completas de servidor, consulte:

```txt
docs/PRESETS.md
docs/presets/*.json
```

Exemplo: um preset pode combinar `status.style = circle`, `speedometer.style = apex`, logo ativada e rádio/voz em `comms`.
