# Instalação da mz_hud

## Objetivo

Instalar a `mz_hud` como HUD global para servidores `mz_core`.

A HUD não cria preferências individuais por player. O dono/dev do servidor define o visual global.

## Dependências

```txt
ox_lib
mz_core
```

## Ordem recomendada no server.cfg

```cfg
ensure ox_lib
ensure mz_core
ensure mz_hud
```

Se você usa recursos que alimentam fome/sede/stress/voz/rádio por integrações próprias, garanta que eles estejam iniciados conforme a necessidade do seu pacote.

## Permissão administrativa

A HUD usa:

```lua
Config.Admin.principal = 'group.mz_owner'
```

Exemplo conceitual no cfg:

```cfg
add_principal identifier.fivem:SEU_ID group.mz_owner
```

Não troque a permissão padrão se outros scripts do seu pacote já dependem dela.

## Primeiro start

Depois de colocar a pasta `mz_hud` nos resources:

```txt
1. iniciar o servidor
2. entrar com usuário admin/dev
3. rodar /mzhud_diag
4. abrir /mzhud
5. salvar uma configuração ou aplicar um preset
```

## Aplicar preset inicial

```txt
/mzhud_preset list
/mzhud_preset apply apex
```

Outras opções iniciais:

```txt
/mzhud_preset apply clean_minimal
/mzhud_preset apply classic_rp
```

## Backup antes de editar

Antes de mexer em produção:

```txt
/mzhud_backup create instalacao-inicial
```

Depois, se precisar voltar:

```txt
/mzhud_backup restore latest
```

## Arquivos importantes

```txt
config.lua                 padrão inicial
data/runtime_config.json   configuração global salva
data/presets/              presets aplicáveis
data/backups/              backups globais
web/                        NUI/HUD
docs/                       documentação técnica
```

## Teste básico após instalar

```txt
[ ] servidor iniciou sem erro da mz_hud
[ ] /mzhud_diag retornou sem erro grave
[ ] /mzhud abriu o editor
[ ] /mzhud_preset list mostrou presets
[ ] status apareceu
[ ] voz apareceu/atualizou
[ ] rádio apareceu quando aplicável
[ ] logo apareceu sem fundo preto
[ ] arma apareceu/sumiu corretamente
[ ] velocímetro apareceu ao entrar no veículo
[ ] F8 sem erro NUI
[ ] console sem erro Lua
```
