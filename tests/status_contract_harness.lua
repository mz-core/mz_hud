local function expect(condition, message)
  if not condition then error(message, 2) end
end

dofile('config.lua')
dofile('client/status_contract.lua')

expect(tonumber(Config.Polling and Config.Polling.weapon_ms) <= 50, 'polling de arma introduz atraso perceptivel na HUD')

local runtime = MZHudStatusContract.create(Config.StatusAlerts)
local function payload(revision, hunger, thirst, stress, deathState)
  return {
    revision = revision,
    status = { hunger = hunger, thirst = thirst, stress = stress, health = 175, armor = 25 },
    death = {
      state = deathState or 'alive',
      isdead = deathState == 'dead' or deathState == 'respawning',
      inlaststand = deathState == 'downed'
    }
  }
end

local ok, result = MZHudStatusContract.apply(runtime, payload(1, 50, 50, 10, 'alive'), 1000)
expect(ok and result.metadata.hunger == 50 and result.metadata.thirst == 50 and result.metadata.stress == 10,
  'HUD nao recebeu status canonicos')
expect(result.metadata.health == 175 and result.metadata.armor == 25, 'HUD nao recebeu vitais canonicos')

ok, result = MZHudStatusContract.apply(runtime, payload(2, 20, 19, 80, 'alive'), 2000)
expect(ok and #result.alerts == 3, 'entrada nas tres faixas nao alertou')
ok, result = MZHudStatusContract.apply(runtime, payload(3, 19, 18, 90, 'alive'), 3000)
expect(ok and #result.alerts == 0, 'alerta repetiu dentro da faixa')
ok, result = MZHudStatusContract.apply(runtime, payload(2, 99, 99, 0, 'alive'), 4000)
expect(not ok and result == 'stale_revision' and runtime.metadata.hunger == 19, 'revision antiga sobrescreveu HUD')

ok = MZHudStatusContract.apply(runtime, payload(4, 50, 50, 10, 'alive'), 5000)
expect(ok, 'saida da faixa foi recusada')
ok, result = MZHudStatusContract.apply(runtime, payload(5, 10, 10, 90, 'alive'), 70000)
expect(ok and #result.alerts == 3, 'alerta nao resetou ao sair da faixa/cooldown')
ok, result = MZHudStatusContract.apply(runtime, payload(6, 0, 0, 100, 'dead'), 140000)
expect(ok and #result.alerts == 0, 'morto recebeu alerta comum')

local main = assert(io.open('client/main.lua', 'rb')):read('*a')
expect(main:find("RegisterNetEvent('mz_core:client:playerStateSync'", 1, true) ~= nil,
  'consumer do snapshot canonico ausente')
expect(not main:find("SetStatus", 1, true) and not main:find("ApplyStatusPatch", 1, true),
  'HUD escreve status')
expect(not main:find('SetEntityHealth(playerPed', 1, true), 'dano de colisao ainda altera health diretamente')
local clipResultCheck = assert(main:find("if type(clip) == 'number' then", 1, true))
local boolResultCheck = assert(main:find("if type(ok) == 'number' then", 1, true))
expect(clipResultCheck < boolResultCheck, 'HUD usa o BOOL numerico como quantidade do pente')
expect(main:find('if nativeTotalAmmo == nil then', 1, true) ~= nil, 'HUD ainda troca zero bala por um snapshot antigo')
expect(main:find('local reserveAmmo = tonumber(CoreWeaponHudState.reserveAmmo)', 1, true) ~= nil,
  'HUD nao exibe as balas restantes no inventario')

print('status_contract_harness: ok')
