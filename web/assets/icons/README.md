# Ícones da mz_hud

A HUD separa **modelo visual** de **ícone**:

- `style` define o formato visual/CSS: `apex`, `circle`, `bar`, etc.
- `icon` define qual desenho será usado dentro do status/velocímetro.

## Padrão automático

Você pode adicionar ícones sem mexer em JS usando este padrão:

```txt
web/assets/icons/status/health/health_1.svg
web/assets/icons/status/health/health_2.svg
web/assets/icons/status/armor/armor_1.svg
web/assets/icons/status/hunger/hunger_1.svg
web/assets/icons/status/thirst/thirst_1.svg

web/assets/icons/vehicle/fuel/fuel_1.svg
web/assets/icons/vehicle/engine/engine_1.svg
web/assets/icons/vehicle/seatbelt/seatbelt_1.svg
web/assets/icons/vehicle/lights/lights_1.svg

web/assets/icons/comms/voice/voice_1.svg
web/assets/icons/comms/radio/radio_1.svg
```

Extensões aceitas: `.svg`, `.png`, `.webp`.

O arquivo `icon_manifest.json` controla quantos índices serão procurados. Por padrão, a HUD procura de `_1` até `_12`.

## Pastas atuais antigas

As pastas `status/default`, `vehicle/default` e `comms/default` guardam os ícones que já existiam antes da modulação. Elas continuam funcionando como fallback.

## Pastas novas

As pastas por função já foram criadas com `.gitkeep`. Você só precisa colocar os arquivos dentro delas.

Exemplo para trocar ícone da vida:

```txt
web/assets/icons/status/health/health_2.svg
```

Depois reinicie o resource e abra `/mzhud`.
