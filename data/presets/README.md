# mz_hud - Presets globais preparados

Esta pasta guarda presets globais prontos para uso por comando administrativo.

Nenhum preset é carregado automaticamente no start do resource; a aplicação precisa ser feita de forma explícita pelo comando administrativo.
A HUD continua usando o fluxo atual:

```txt
config.lua -> data/runtime_config.json -> NUI
```

## Arquivos

```txt
presets_manifest.json
apex.json
clean_minimal.json
classic_rp.json
setup_debug.json
```

## Regra

A `mz_hud` é global por servidor. Estes presets são para o dono/dev do servidor, não para escolha individual de player.

## Uso manual seguro

Para testar manualmente:

```txt
1. Pare o resource ou o servidor.
2. Faça backup de data/runtime_config.json.
3. Copie o conteúdo de um preset desta pasta.
4. Cole em data/runtime_config.json.
5. Inicie/reinicie mz_hud.
6. Teste /mzhud, salvar, reload e reset.
```

## Comando administrativo

A Fase 7 ativa o comando administrativo:

```txt
/mzhud_preset apex
/mzhud_preset clean_minimal
/mzhud_preset classic_rp
/mzhud_preset setup_debug
```

O comando usa a mesma permissão administrativa atual da HUD e salva o resultado em data/runtime_config.json.
