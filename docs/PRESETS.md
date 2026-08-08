# mz_hud - Presets globais de servidor

A `mz_hud` é uma HUD global da framework `mz_core`. Os presets desta pasta são exemplos prontos para o dono/desenvolvedor do servidor usar como referência de visual.

O player comum não escolhe preset. O preset é uma decisão do servidor.

## Onde ficam os presets

```txt
docs/presets/
├─ apex.json
├─ clean_minimal.json
├─ classic_rp.json
└─ setup_debug.json
```

Esses arquivos são documentação/receitas. Além deles, existem cópias operacionais em `data/presets/`, usadas pelo comando administrativo `/mzhud_preset`.

Nenhum preset é carregado automaticamente no start do resource. A aplicação precisa ser feita explicitamente por admin/dev.


## Presets operacionais

A pasta abaixo foi criada para separar documentação de dados operacionais:

```txt
data/presets/
├─ presets_manifest.json
├─ apex.json
├─ clean_minimal.json
├─ classic_rp.json
└─ setup_debug.json
```

Esses arquivos são usados pelo comando administrativo de presets.

Leia também:

```txt
docs/PRESET_PIPELINE.md
```

## Presets disponíveis

### apex.json

Preset mais próximo da identidade atual da HUD:

```txt
- status circulares
- velocímetro apex/Apex
- logo mz_core ativada
- rádio e voz no topo direito
- minimapa quadrado visível no veículo
```

Uso recomendado:

```txt
Servidor padrão mz_core / visual moderno principal.
```

### clean_minimal.json

Preset mais discreto:

```txt
- status em pílula
- velocímetro minimal
- logo desligada
- menos elementos extras no velocímetro
- escala levemente menor
```

Uso recomendado:

```txt
Servidor que quer HUD limpa e pouco invasiva.
```

### classic_rp.json

Preset mais tradicional de roleplay:

```txt
- status em barra
- velocímetro classic
- logo ativada
- minimapa circular sempre visível
```

Uso recomendado:

```txt
Servidor RP clássico, com leitura mais direta e visual mais familiar.
```

### setup_debug.json

Preset de conferência visual:

```txt
- elementos maiores
- oxygen/stress ativados
- velocímetro digital grande
- opacidade alta
```

Uso recomendado:

```txt
Teste rápido durante instalação/configuração. Não é recomendado como visual final.
```

## Como aplicar

### Opção A — comando administrativo `/mzhud_preset`

Listar presets:

```txt
/mzhud_preset list
```

Aplicar preset:

```txt
/mzhud_preset apply apex
/mzhud_preset apply clean_minimal
/mzhud_preset apply classic_rp
/mzhud_preset apply setup_debug
```

O comando usa a permissão atual da HUD e salva a configuração em `data/runtime_config.json`.

### Opção B — pelo editor `/mzhud`

Abra **Presets**, escolha um card e clique em **Aplicar ao Draft**. O preset altera apenas o draft local; ele só é validado, salvo e transmitido depois de **Salvar e Aplicar**.

```txt
1. Entrar no servidor com permissão administrativa atual da HUD
2. Usar /mzhud
3. Ajustar os módulos conforme o preset desejado
4. Clicar em Salvar e Aplicar
```

Essa é a forma mais segura.

### Opção C — copiando para runtime_config.json

Somente faça isso com o resource parado ou antes de iniciar o servidor.

```txt
1. Fazer backup de data/runtime_config.json
2. Copiar o conteúdo de um arquivo docs/presets/*.json
3. Colar em data/runtime_config.json
4. Iniciar/reiniciar o resource mz_hud
5. Testar /mzhud_reload, se necessário
```

Importante: `runtime_config.json` sobrescreve o padrão do `config.lua` quando existe.

## Regras de segurança

```txt
- Não aplicar preset enquanto edita o arquivo com o servidor salvando ao mesmo tempo
- Não remover chaves do JSON sem revisar a sanitização
- Não renomear style sem atualizar server/main.lua e editor
- Não usar preset por player; a HUD é global
- Sempre manter backup do runtime_config.json antes de testar preset manual
```

## Checklist após aplicar um preset

```txt
[ ] HUD carrega ao entrar no servidor
[ ] /mzhud abre normalmente
[ ] Salvar e Aplicar funciona
[ ] /mzhud_reload funciona
[ ] Status aparecem corretamente
[ ] Voz e rádio aparecem corretamente
[ ] Logo respeita ativado/desativado
[ ] Arma aparece/some corretamente
[ ] Velocímetro aparece no veículo
[ ] F8 sem erro NUI
[ ] Console do servidor sem erro Lua
```


Leia também:

```txt
docs/PRESET_COMMANDS.md
```
