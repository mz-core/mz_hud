# mz_hud — Catálogo de modelos de velocímetro (Wave 2)

Este documento registra os modelos visuais de velocímetro do `mz_hud`, a origem de
cada um, os dados que consomem e as regras de fallback/atribuição.

## Modelos disponíveis

| ID | Origem | Descrição | Dados consumidos | Tematização |
|---|---|---|---|---|
| `digital` | MZ (legado) | Digital simples | speed, rpm, fuel, gear + indicadores | `--speed-*` |
| `analog` | MZ (legado) | Analógico circular | speed, rpm, fuel, gear, engine/saúde | `--speed-*` |
| `minimal` | MZ (legado) | Compacto | speed, gear, fuel, rpm | `--speed-*` |
| `racing` | MZ (legado) | Esportivo | speed, rpm, gear, fuel + indicadores | `--speed-*` |
| `classic` | MZ (legado) | Clássico | speed, rpm, fuel, gear, engine | `--speed-*` |
| `apex` | MZ (legado) | Modelo principal Apex | speed, rpm, fuel, gear, engine/saúde, setas, cinto, luzes, trava | `--speed-*` |
| `vector` | MZ (legado) | Linha de velocidade | speed, rpm, gear, fuel, engine, setas, cinto, luzes, trava | `--speed-*` |
| `auren_felon` | Auren FELON (portado) | Cluster circular RPM + velocidade digital + faixa de combustível | speed, rpm, gear, fuel, cinto, motor/saúde, faróis, setas | `--model-text` / `--model-accent` |
| `auren_truck` | Auren Truck (portado) | Painel de caminhão: mostradores speed/RPM/combustível/MOTOR + fita de marcha | speed, rpm, gear, fuel, engineHealth (MOTOR), cinto, faróis, setas | `--model-text` / `--model-accent` |
| `auren_aton` | Auren ATON (portado) | Cluster analógico (RPM) + velocidade/marcha digitais + medidor de combustível | speed, rpm, gear, fuel, cinto, motor/saúde, setas | `--model-text` / `--model-accent` |

## Mapeamento de dados (payload canônico `updateVehicle`)

O `mz_hud` entrega um único payload de telemetria:
`vehicle = { visible, speed, rpm(0..100), throttle, fuel(0..100), gear, seatbelt,
seatbeltAvailable, lights, lightsHigh, lightsState, indicatorLeft, indicatorRight,
locked, engine, engineHealth(0..100) }`.

- `rpm` 0..100 é normalizado para 0..1 no adapter (`toModelVehicle`).
- `engine` é normalizado para booleano (o native pode retornar `1`/`0`).
- `engineHealth` 0..100 é normalizado para 0..1 no adapter; o mostrador **MOTOR**
  do Truck representa **saúde/estado do motor** (não temperatura).

**Dados sem fonte canônica MZ** (ocultos, nunca simulados): temperatura, odômetro/
trip, GPS/ETA/autonomia, ABS, tração, freio de mão, óleo, bateria, porta, nitro.

## Tematização e precedência

Todos os modelos portados reutilizam `general.appearance` da Wave 1, com
precedência **override por componente > tema global > legado**:
- `--model-text` ← slot `primary_color` (papel `text`).
- `--model-accent` ← slot `accent_color` (papel `danger`).

Nenhum dos 8 presets de tema foi alterado.

## Fallback

Estilos desconhecidos em `speedometer.style` caem para `digital` (comportamento
anterior preservado). A whitelist do servidor (`server/main.lua`
`ALLOWED_SPEED_STYLES`) e o frontend (`web/core/constants.js`,
`web/hud/editor/visual.js`) precisam conhecer exatamente os mesmos IDs — manter
sincronia ao adicionar um modelo.

## Atribuição e licenças

- **`auren_felon` / `auren_truck` / `auren_aton`**: portados de
  `ref/Auren_Speedometer-main` (Auren_Speedometer, autor Apex). O autor é colega do
  operador e **autorizou o uso no projeto**.
  - **Uso local autorizado.** NÃO redistribuir o código/artefato publicamente em
    release/framework comercial sem autorização expressa do autor.
  - Fonte Rajdhani (ATON/Truck) e fontes do FELON **não foram copiadas** (sistema).
  - Textura carbon-fiber (Truck) é CC0; **não foi incorporada** (substituída por
    gradiente próprio).
  - Dígitos/ícones rastreados do ATON (`reference-digits.js`) **não foram copiados**;
    usam-se os glyphs vetoriais do `design.js` e ícones simples próprios.

## Verificação

- Estática: `tests/auren_models_contract.test.js` (markup, whitelists, fallback, namespace).
- Renderização real (Playwright/Chromium): `tests/render_auren_felon.cjs`
  (montagem, dimensões, dados, ponteiros, troca de estilos, tema, ciclo completo).
- Runtime dentro do FiveM: **PENDENTE** (ver checklist no relatório da wave).
