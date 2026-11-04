# mz_hud - Guia do editor visual

O comando `/mzhud` abre o editor administrativo global diretamente sobre a HUD. O mundo continua como preview e nada é persistido até **Salvar e Aplicar**.

## Fluxo

```text
/mzhud
  -> servidor valida group.mz_owner
  -> NUI recebe config ativa + defaults
  -> editor cria draft local
  -> seleção/drag/resize/inspector alteram apenas o draft
  -> Salvar e Aplicar
  -> servidor valida permissão + revisão + schema
  -> backup -> runtime_config.json -> broadcast
```

## Seleção e controles

- Clique diretamente em um item da HUD.
- Use o seletor superior para alcançar elementos desativados ou difíceis de clicar.
- Arraste o elemento ou use **Mover** na toolbar contextual.
- Use o handle inferior direito para resize.
- Setas movem 1 unidade percentual; Shift+setas movem 10.
- O inspector edita aparência, posição, visibilidade e propriedades específicas.
  - **Velocímetro**: modelo, unidade, indicadores (incluindo faróis, cadeado e motor), quatro cores e ícone por slot.
  - **Voz e rádio**: opções de `comms_options` (rótulos, textos e frequência).
  - **Arma**: exibição, nome, munição e modelo da imagem.
  - **Chat**: preset de posição. **Geral**: opacidade global.
- No grupo de status, **Alinhamento** define a direção (Início = esq→dir / cima→baixo, Fim = dir→esq / baixo→cima) e **Modelo dos status → Aplicar a todos** define o modelo de todos os status de uma vez; cada status continua editável individualmente.
- Status ocultos com "Colapsar quando oculto" fecham o vão na direção configurada; sem colapso, o espaço é preservado.
- O navegador superior inclui `Geral`, `Chat`, `Mapa`, `Velocímetro`, `Arma` e `Logo`.
- `statusGroup` move e dimensiona os status agrupados como unidade.

## Dock

- Undo/Redo: histórico local de até 50 operações.
- Grid/Snap/Safe: guias visuais; snap considera grade, centro e posições de outros itens.
- Preview: Normal, Todos, Veículo, Baixo status e Submerso.
- Presets: aplica card ao draft.
- Resetar: coloca os defaults no draft após confirmação.
- Salvar e Aplicar: único caminho de persistência do editor.
- Fechar: pede confirmação quando há alterações não salvas.

## Preview

Preview é somente estado NUI. Não altera vida, fome, sede, posição, veículo ou oxigênio reais do ped. `Todos` revela itens SMART/HIDDEN com badges e opacidade reduzida.

## Atalhos

- `Ctrl+Z`: desfazer.
- `Ctrl+Y` ou `Ctrl+Shift+Z`: refazer.
- `Esc`: fecha primeiro o inspector/modal; depois tenta fechar o editor.
- Setas / Shift+setas: ajuste fino.

## Persistência e segurança

A NUI não concede permissão. O client apenas encaminha o draft. Toda gravação passa novamente pelo ACE no servidor, por revisão otimista, backup e sanitização do schema fechado.

Para arquitetura, schema, SMART visibility, extensão e checklist completo, consulte [VISUAL_EDITOR.md](VISUAL_EDITOR.md).

Status de teste real: **PENDENTE DE VALIDAÇÃO RUNTIME FIVEM**.
