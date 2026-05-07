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

## Regras

- Não coloque CSS para cada ícone.
- O CSS fica nos modelos visuais (`apex`, `circle`, `bar`, etc.).
- Os ícones ficam em `web/assets/icons/`.
- O `fxmanifest.lua` já carrega `web/assets/**`, então os arquivos adicionados entram no resource.
- Reinicie o resource após adicionar novos arquivos.
