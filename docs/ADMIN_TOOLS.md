# Ferramentas administrativas da mz_hud

A `mz_hud` possui três ferramentas principais para administradores e desenvolvedores gerenciarem a configuração global da HUD.

## Permissão requerida

Todas as ferramentas usam a mesma permissão:

```lua
Config.Admin.principal = 'group.mz_owner'
```

---

## 1. Editor global - `/mzhud`

Abre a interface de configuração visual da HUD.

### Uso

```txt
/mzhud
```

### O que faz

1. Admin/dev abre o editor visual sobre a HUD
2. Ajusta módulos, posições, cores e visibilidade
3. Clica "Salvar e Aplicar"
4. Configuração é gravada em `data/runtime_config.json`
5. Todos os players recebem a nova HUD

### Botões principais

- **Preview**: Testa visual sem alterar configuração
- **Resetar**: Volta para padrão do `config.lua`
- **Salvar e Aplicar**: Grava e aplica para todos
- **Fechar**: Fecha sem salvar alterações

### Áreas do editor

- Geral (minimapa, opacidade global, escala)
- HUD de status (vida, colete, fome, sede, stamina)
- Velocímetro (modelo, unidade, RPM, combustível)
- Visual do velocímetro (cores rápidas)
- Armas (visibilidade, imagem, munição)
- Chat (layout)
- Logo (imagem do servidor)
- Voz e Rádio (indicadores)
- Elementos (items de status individuais)

---

## 2. Presets globais - `/mzhud_preset`

Aplica configurações prontas para a HUD.

### Listar presets

```txt
/mzhud_preset
/mzhud_preset list
```

### Aplicar preset

```txt
/mzhud_preset apply apex
/mzhud_preset apply clean_minimal
/mzhud_preset apply classic_rp
/mzhud_preset apply setup_debug
```

Atalho aceito:

```txt
/mzhud_preset apex
```

### O que acontece ao aplicar

1. Verifica permissão administrativa
2. Lê manifesto de presets
3. Valida o nome do preset
4. Carrega JSON do preset
5. Aplica sanitização
6. Salva em `data/runtime_config.json`
7. Envia nova HUD para todos

### Presets disponíveis

- **apex**: Visual principal moderno, status circulares, velocímetro Apex
- **clean_minimal**: Discreto, status em pílula, velocímetro minimalista
- **classic_rp**: RP tradicional, status em barra, velocímetro clássico
- **setup_debug**: Teste visual, não recomendado como final

---

## 3. Diagnóstico administrativo - `/mzhud_diag`

Verifica a saúde da HUD sem alterar nada.

### Uso

```txt
/mzhud_diag
```

Também funciona no console do servidor se `Config.Admin.allow_console = true`.

### O que verifica

- Arquivos de configuração existem e são válidos
- `data/runtime_config.json` é JSON válido
- `data/presets/presets_manifest.json` existe
- Presets listados no manifesto existem
- Backups existem e estão válidos
- Arquivos críticos estão presentes
- Não há erros de permissão

### O que NÃO faz

- Não altera configuração
- Não aplica preset
- Não cria backup
- Não muda visual

---

## Comandos relacionados

### Recarregar configuração

```txt
/mzhud_reload
```

Recarrega `data/runtime_config.json` sem abrir o editor.

### Resetar para padrão

```txt
/mzhud_reset
```

Volta para configuração padrão de `config.lua`. Se backups estiverem ativados, cria backup antes de resetar.

---

## Backups globais - `/mzhud_backup`

Sistema de proteção para a configuração global.

### Listar backups

```txt
/mzhud_backup
/mzhud_backup list
```

### Criar backup manual

```txt
/mzhud_backup create
/mzhud_backup create descricao-do-backup
```

### Restaurar backup

```txt
/mzhud_backup restore latest
/mzhud_backup latest
```

### Quando backups são criados automaticamente

Se `Config.Backups.auto_*` estiver ativado:

- Antes de abrir o editor (`auto_before_editor_save`)
- Antes de resetar (`auto_before_reset`)
- Antes de aplicar preset (`auto_before_preset`)
- Antes de restaurar backup (`auto_before_restore`)

---

## Auditoria - Arquivo `data/audit/mz_hud_audit.log`

Registro de ações administrativas para rastrear:

```txt
Quem aplicou um preset?
Quem resetou a HUD?
Quem restaurou um backup?
Quem tentou usar comando sem permissão?
Quando a configuração foi salva?
```

### Formato do log

```txt
[2026-05-03 18:40:22] action=preset_apply result=success actor="source:1 name:Mazus" preset=clean_minimal
[2026-05-03 18:42:10] action=backup_restore result=success actor="source:1 name:Mazus" backup=latest
[2026-05-03 18:45:03] action=editor_open result=denied actor="source:8 name:Player"
```

### Configuração

```lua
Config.Audit = {
  enabled = true,
  command = 'mzhud_audit',
  file = 'data/audit/mz_hud_audit.log',
  max_file_bytes = 512000,
  log_permission_denied = true,
  log_diagnostics = true,
  print_recent_count = 12
}
```

---

## Fluxo de trabalho recomendado

### Antes de qualquer alteração

```txt
1. /mzhud_backup create descricao-mudanca
2. /mzhud_diag (verificar saúde)
```

### Alterando visual

```txt
1. /mzhud (abrir editor)
2. Fazer ajustes
3. Preview (testar)
4. Salvar e Aplicar
5. /mzhud_diag (verificar resultado)
```

### Se algo der errado

```txt
1. /mzhud_backup restore latest
2. /mzhud_diag (confirmar restauração)
```

### Aplicando preset

```txt
1. /mzhud_preset list (ver opções)
2. /mzhud_preset apply clean_minimal
3. /mzhud_diag (verificar aplicação)
```

---

## Checklist após alterações

```txt
[ ] HUD aparece visualmente correta
[ ] Status atualiza (vida, colete, fome, sede)
[ ] Velocímetro funciona em veículo
[ ] Voz e rádio indicam corretamente
[ ] Logo aparece sem fundo preto
[ ] Arma e munição aparecem quando armado
[ ] F8 não mostra erros JS/NUI
[ ] Console servidor não mostra erros Lua
[ ] /mzhud_diag sem avisos de arquivo faltante
```
