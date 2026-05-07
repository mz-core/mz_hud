# mz_hud - Guia do editor global

O comando `/mzhud` abre o editor global da HUD. Ele existe para o dono/desenvolvedor do servidor configurar o visual padrão da framework `mz_core`.

O player comum não escolhe tema, posição ou preset individual. Ele apenas recebe a configuração global definida pelo servidor.

## Fluxo do editor

```txt
/mzhud
  ↓
abre o painel administrativo da HUD
  ↓
dev/admin ajusta módulos, posições, estilos, cores e visibilidade
  ↓
Salvar e Aplicar
  ↓
server/main.lua salva em data/runtime_config.json
  ↓
broadcast aplica a HUD para todos os jogadores
```

## Botões principais

### Preview

Dispara uma prévia de notificação para conferir posicionamento/visual sem alterar a lógica principal da HUD.

### Resetar

Volta para a configuração padrão do `config.lua`, respeitando a sanitização do servidor.

### Salvar e Aplicar

Grava a configuração global em `data/runtime_config.json` e aplica para todos os jogadores conectados.

### Fechar

Fecha o painel sem salvar novas alterações pendentes.

## Áreas do editor

### Geral

Controla minimapa, visibilidade global, opacidade e escala geral. Use para ajustes amplos; ajuste fino deve ficar nos módulos específicos.

### HUD de status

Controla o grupo principal de status, como vida, colete, fome, sede e afins. Os itens individuais aparecem na área `Elementos`.

### Velocímetro

Controla modelo, unidade, posição, visibilidade de velocidade, RPM, combustível, marcha, cinto, luzes e motor.

### Visual do velocímetro

Controla cores rápidas do velocímetro. Não substitui o sistema `style` e não altera outros módulos da HUD.

### Armas

Controla exibição da arma equipada, imagem, nome e munição.

### Chat

Envia layout para o `mz_chat`. O chat padrão do FiveM não é alterado por este editor.

### Logo

Controla a imagem global do servidor/framework. Para evitar fundo quadrado atrás da logo, prefira imagens PNG/WebP transparentes.

### Voz e Rádio

Controla apenas indicadores de voz e rádio. Não altera status, minimapa, logo ou velocímetro.

### Elementos

Controla itens individuais de status, incluindo ícone, cor, estilo, posição, escala e opacidade.

## Regras de segurança

```txt
- Não usar o editor como preferência individual de player
- Não renomear IDs do HTML sem atualizar editor.js
- Não renomear callbacks NUI sem atualizar client/main.lua
- Não trocar style por theme nesta fase
- Não apagar runtime_config.json sem backup
- Não editar runtime_config.json ao mesmo tempo em que o editor está salvando
```

## Teste rápido depois de mexer no editor

```txt
[ ] /mzhud abre
[ ] Preview funciona
[ ] Salvar e Aplicar funciona
[ ] Resetar funciona
[ ] Fechar funciona
[ ] F8 não mostra erro NUI
[ ] Console do servidor não mostra erro Lua
[ ] HUD continua aparecendo para todos
```
