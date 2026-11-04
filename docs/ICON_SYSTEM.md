# Sistema de ícones da mz_hud

A HUD usa dois conceitos separados:

```txt
style = modelo visual / CSS
icon  = desenho exibido dentro do modelo
```

Exemplo: o status `health` pode usar `style = apex` com `icon = heart`, `health_1` ou `medical_cross`.

## Onde colocar ícones novos

### Status

```txt
web/assets/icons/status/health/health_1.svg
web/assets/icons/status/armor/armor_1.svg
web/assets/icons/status/hunger/hunger_1.svg
web/assets/icons/status/thirst/thirst_1.svg
web/assets/icons/status/stamina/stamina_1.svg
web/assets/icons/status/oxygen/oxygen_1.svg
web/assets/icons/status/stress/stress_1.svg
```

### Velocímetro

```txt
web/assets/icons/vehicle/fuel/fuel_1.svg
web/assets/icons/vehicle/engine/engine_1.svg
web/assets/icons/vehicle/seatbelt/seatbelt_1.svg
web/assets/icons/vehicle/lights/lights_1.svg
web/assets/icons/vehicle/arrow/arrow_1.svg
```

### Voz e rádio

```txt
web/assets/icons/comms/voice/voice_1.svg
web/assets/icons/comms/radio/radio_1.svg
```

## Como aparece no editor

Quando o arquivo segue o padrão `categoria_1.svg`, `categoria_2.svg`, etc., o editor `/mzhud` tenta detectar automaticamente e adiciona na lista de ícones.

Por padrão ele procura até `_12`. Para mudar, edite:

```txt
web/assets/icons/icon_manifest.json
```

## Manifesto manual

Use `web/assets/icons/icon_manifest.json` quando quiser um nome fora do padrão.

Exemplo:

```json
{
  "vehicle": {
    "fuel": [
      {
        "id": "galon",
        "label": "Galão",
        "path": "./assets/icons/vehicle/fuel/galon.svg"
      }
    ]
  }
}
```

## Ícones Lucide

Um conjunto curado de ícones Lucide foi incluído e registrado em `web/assets/icons/icon_manifest.json`, portanto aparece na lista de ícones do editor sem depender do padrão `categoria_N.svg`.

```txt
status/health:  heart-pulse, activity, cross
status/armor:   shield-check, shield-half
status/hunger:  drumstick, beef, utensils-crossed
status/thirst:  droplets, glass-water, cup-soda
status/stamina: battery-charging, footprints, gauge
status/oxygen:  cloud
status/stress:  brain-circuit, triangle-alert
comms/voice:    mic-off, audio-lines, volume-2
comms/radio:    radio-tower, antenna, signal
vehicle/fuel:   fuel (id fuel-lucide)
vehicle/engine: settings, cog
vehicle/lights: lightbulb
vehicle/lock:   lock-open
vehicle/arrow:  arrow-right
vehicle/speed:  gauge
vehicle/rpm:    activity
vehicle/gear:   cog
vehicle/weapon: crosshair
vehicle/ammo:   box
```

Os SVGs Lucide são desenhados por traço e são usados como máscara CSS (`mask`), recebendo a cor do tema via `currentColor`. Para adicionar outros, copie o SVG para a pasta da categoria e registre `id`, `label` e `path` no manifesto.

## Regras

- Não coloque CSS para cada ícone.
- O CSS fica nos modelos visuais (`apex`, `circle`, `bar`, etc.).
- Os ícones ficam em `web/assets/icons/`.
- O `fxmanifest.lua` já carrega `web/assets/**`, então os arquivos adicionados entram no resource.
- Reinicie o resource após adicionar novos arquivos.
