# Ícones da mz_hud

Padrão de organização:

```txt
icons/[bloco]/[modelo]/[icone].svg
```

Blocos atuais:
- `status/default`: vida, colete, fome, sede, stress, stamina e oxigênio.
- `vehicle/default`: combustível, cinto, faróis e motor.
- `comms/default`: voz e rádio.

Todos os SVGs usam `currentColor` e são aplicados pelo CSS com mask, então continuam herdando a cor da HUD/editor.
Para criar novos modelos, mantenha os mesmos nomes de arquivos dentro de outra pasta de modelo.
