local DebugVoice = false
local DebugSeatbelt = false

local HudState = {
  config = nil,
  canManage = false,
  hudVisible = true,
  speedometerVisible = true,
  editorOpen = false,
  bootstrapDone = false,
  coreHUDState = {
    metadata = {}
  }
}

local VoiceRuntime = {
  radioTalking = false,
  radioTalkingUntil = 0,
  voiceTalkingUntil = 0,
  modeIndex = nil
}

local SeatbeltRuntime = {
  enabled = false,
  lastVehicle = 0,
  lastSpeedKmh = 0,
  lastCrashAt = 0,
  lastExitBlockNotify = 0
}

local CoreWeaponHudState = {
  known = false,
  equipped = false
}
local CoreWeaponStateLastAt = 0
local LastWeaponHudDebugAt = 0

local SeatbeltCrashConfig = {
  enabled = true,
  minSpeedKmh = 65,
  damageDeltaKmh = 38,
  ejectDeltaKmh = 62,
  strongEjectDeltaKmh = 85,
  ejectChance = 70,
  cooldownMs = 1800,
  beltDamageReduction = 0.75,
  maxDamage = 45
}

local notify

local function resetSeatbeltRuntime(vehicle)
  SeatbeltRuntime.enabled = false
  SeatbeltRuntime.lastVehicle = vehicle or 0
  SeatbeltRuntime.lastSpeedKmh = 0
  SeatbeltRuntime.lastCrashAt = 0
  SeatbeltRuntime.lastExitBlockNotify = 0
end

local function IsSeatbeltVehicle(vehicle)
  if not vehicle or vehicle == 0 then
    return false
  end

  local class = GetVehicleClass(vehicle)

  local blockedClasses = {
    [8] = true,   -- motos
    [13] = true,  -- bicicletas
    [14] = true,  -- barcos
    [15] = true,  -- helicopteros
    [16] = true,  -- avioes
    [21] = true   -- trens
  }

  return not blockedClasses[class]
end

local WeaponHashToName = {
  [`WEAPON_PISTOL`] = 'weapon_pistol',
  [`WEAPON_PISTOL_MK2`] = 'weapon_pistol_mk2',
  [`WEAPON_COMBATPISTOL`] = 'weapon_combatpistol',
  [`WEAPON_APPISTOL`] = 'weapon_appistol',
  [`WEAPON_PISTOL50`] = 'weapon_pistol50',
  [`WEAPON_SNSPISTOL`] = 'weapon_snspistol',
  [`WEAPON_SNSPISTOL_MK2`] = 'weapon_snspistol_mk2',
  [`WEAPON_HEAVYPISTOL`] = 'weapon_heavypistol',
  [`WEAPON_VINTAGEPISTOL`] = 'weapon_vintagepistol',
  [`WEAPON_CERAMICPISTOL`] = 'weapon_ceramicpistol',
  [`WEAPON_REVOLVER`] = 'weapon_revolver',
  [`WEAPON_REVOLVER_MK2`] = 'weapon_revolver_mk2',
  [`WEAPON_DOUBLEACTION`] = 'weapon_doubleaction',
  [`WEAPON_MICROSMG`] = 'weapon_microsmg',
  [`WEAPON_SMG`] = 'weapon_smg',
  [`WEAPON_SMG_MK2`] = 'weapon_smg_mk2',
  [`WEAPON_ASSAULTSMG`] = 'weapon_assaultsmg',
  [`WEAPON_COMBATPDW`] = 'weapon_combatpdw',
  [`WEAPON_MACHINEPISTOL`] = 'weapon_machinepistol',
  [`WEAPON_MINISMG`] = 'weapon_minismg',
  [`WEAPON_ASSAULTRIFLE`] = 'weapon_assaultrifle',
  [`WEAPON_ASSAULTRIFLE_MK2`] = 'weapon_assaultrifle_mk2',
  [`WEAPON_CARBINERIFLE`] = 'weapon_carbinerifle',
  [`WEAPON_CARBINERIFLE_MK2`] = 'weapon_carbinerifle_mk2',
  [`WEAPON_ADVANCEDRIFLE`] = 'weapon_advancedrifle',
  [`WEAPON_SPECIALCARBINE`] = 'weapon_specialcarbine',
  [`WEAPON_SPECIALCARBINE_MK2`] = 'weapon_specialcarbine_mk2',
  [`WEAPON_BULLPUPRIFLE`] = 'weapon_bullpuprifle',
  [`WEAPON_BULLPUPRIFLE_MK2`] = 'weapon_bullpuprifle_mk2',
  [`WEAPON_COMPACTRIFLE`] = 'weapon_compactrifle',
  [`WEAPON_MILITARYRIFLE`] = 'weapon_militaryrifle',
  [`WEAPON_HEAVYRIFLE`] = 'weapon_heavyrifle',
  [`WEAPON_PUMPSHOTGUN`] = 'weapon_pumpshotgun',
  [`WEAPON_PUMPSHOTGUN_MK2`] = 'weapon_pumpshotgun_mk2',
  [`WEAPON_SAWNOFFSHOTGUN`] = 'weapon_sawnoffshotgun',
  [`WEAPON_ASSAULTSHOTGUN`] = 'weapon_assaultshotgun',
  [`WEAPON_BULLPUPSHOTGUN`] = 'weapon_bullpupshotgun',
  [`WEAPON_DBSHOTGUN`] = 'weapon_dbshotgun',
  [`WEAPON_HEAVYSHOTGUN`] = 'weapon_heavyshotgun',
  [`WEAPON_COMBATSHOTGUN`] = 'weapon_combatshotgun',
  [`WEAPON_MG`] = 'weapon_mg',
  [`WEAPON_COMBATMG`] = 'weapon_combatmg',
  [`WEAPON_COMBATMG_MK2`] = 'weapon_combatmg_mk2',
  [`WEAPON_GUSENBERG`] = 'weapon_gusenberg',
  [`WEAPON_SNIPERRIFLE`] = 'weapon_sniperrifle',
  [`WEAPON_HEAVYSNIPER`] = 'weapon_heavysniper',
  [`WEAPON_HEAVYSNIPER_MK2`] = 'weapon_heavysniper_mk2',
  [`WEAPON_MARKSMANRIFLE`] = 'weapon_marksmanrifle',
  [`WEAPON_MARKSMANRIFLE_MK2`] = 'weapon_marksmanrifle_mk2',
  [`WEAPON_STUNGUN`] = 'weapon_stungun',
  [`WEAPON_KNIFE`] = 'weapon_knife',
  [`WEAPON_NIGHTSTICK`] = 'weapon_nightstick',
  [`WEAPON_HAMMER`] = 'weapon_hammer',
  [`WEAPON_BAT`] = 'weapon_bat',
  [`WEAPON_CROWBAR`] = 'weapon_crowbar',
  [`WEAPON_GOLFCLUB`] = 'weapon_golfclub',
  [`WEAPON_BOTTLE`] = 'weapon_bottle',
  [`WEAPON_DAGGER`] = 'weapon_dagger',
  [`WEAPON_HATCHET`] = 'weapon_hatchet',
  [`WEAPON_MACHETE`] = 'weapon_machete',
  [`WEAPON_SWITCHBLADE`] = 'weapon_switchblade',
  [`WEAPON_BATTLEAXE`] = 'weapon_battleaxe',
  [`WEAPON_POOLCUE`] = 'weapon_poolcue',
  [`WEAPON_WRENCH`] = 'weapon_wrench',
  [`WEAPON_STONE_HATCHET`] = 'weapon_stone_hatchet',
  [`WEAPON_FLASHLIGHT`] = 'weapon_flashlight',
  [`WEAPON_KNUCKLE`] = 'weapon_knuckle',
  [`WEAPON_UNARMED`] = 'weapon_unarmed'
}

local function getWeaponNameFromHash(hash)
  return WeaponHashToName[hash] or ('weapon_' .. tostring(hash))
end

local function getWeaponHashFromName(weaponName)
  weaponName = tostring(weaponName or ''):upper():gsub('^%s+', ''):gsub('%s+$', '')
  if weaponName == '' then
    return nil
  end

  local getHashKey = rawget(_G, 'GetHashKey')
  if type(getHashKey) == 'function' then
    local ok, result = pcall(function()
      return getHashKey(weaponName)
    end)

    if ok and result then
      return result
    end
  end

  local ok, result = pcall(function()
    return joaat(weaponName)
  end)

  if ok and result then
    return result
  end

  return nil
end

local function getWeaponClipAmmo(ped, weaponHash)
  if not ped or not weaponHash then
    return 0, false
  end

  local ok, clip = GetAmmoInClip(ped, weaponHash)
  if ok == true and type(clip) == 'number' then
    return math.max(math.floor(clip), 0), true
  end

  if type(ok) == 'number' then
    return math.max(math.floor(ok), 0), true
  end

  return 0, false
end

local function getWeaponHudClipAmmo(ped, weaponHash, totalAmmo, clipSize, preferredClip)
  totalAmmo = math.max(0, math.floor(tonumber(totalAmmo) or 0))
  clipSize = math.max(0, math.floor(tonumber(clipSize) or 0))

  local nativeClip, nativeOk = getWeaponClipAmmo(ped, weaponHash)
  if nativeOk and not (nativeClip == 0 and totalAmmo > 0) then
    return nativeClip, true
  end

  local coreClip = tonumber(preferredClip)
  if coreClip and coreClip > 0 then
    return math.min(math.floor(coreClip), totalAmmo), false
  end

  if totalAmmo > 0 and clipSize > 0 then
    return math.min(totalAmmo, clipSize), false
  end

  if totalAmmo > 0 then
    return math.min(totalAmmo, 30), false
  end

  return 0, nativeOk == true
end

local function applySeatbeltCrashEffect(playerPed, vehicle, deltaKmh, hadSeatbelt)
  local health = GetEntityHealth(playerPed)
  local damage = 0
  local shouldEject = false
  
  if hadSeatbelt then
    -- Com cinto: dano reduzido, nunca ejetar
    if deltaKmh >= SeatbeltCrashConfig.damageDeltaKmh then
      damage = math.floor(math.min(SeatbeltCrashConfig.maxDamage, deltaKmh * 0.35) * (1 - SeatbeltCrashConfig.beltDamageReduction))
    end
  else
    -- Sem cinto: dano maior e risco de ejeção
    if deltaKmh >= SeatbeltCrashConfig.damageDeltaKmh then
      damage = math.floor(math.min(SeatbeltCrashConfig.maxDamage, deltaKmh * 0.55))
      
      -- Verificar ejeção obrigatória ou por chance
      if deltaKmh >= SeatbeltCrashConfig.strongEjectDeltaKmh then
        shouldEject = true
      elseif deltaKmh >= SeatbeltCrashConfig.ejectDeltaKmh then
        shouldEject = math.random(1, 100) <= SeatbeltCrashConfig.ejectChance
      end
    end
  end
  
  -- Aplicar dano
  if damage > 0 then
    local newHealth = math.max(101, health - damage)
    SetEntityHealth(playerPed, newHealth)
  end
  
  -- Ejetar se necessário
  if shouldEject then
    local coords = GetEntityCoords(playerPed)
    local velocity = GetEntityVelocity(vehicle)
    
    TaskLeaveVehicle(playerPed, vehicle, 4160)
    Wait(50)
    SetEntityCoords(playerPed, coords.x, coords.y, coords.z + 0.5, true, true, true, false)
    SetPedToRagdoll(playerPed, 3000, 3000, 0, false, false, false)
    SetEntityVelocity(playerPed, velocity.x * 1.8, velocity.y * 1.8, velocity.z + 2.0)
    
    notify({
      type = 'error',
      title = 'Colisão',
      message = 'Você foi arremessado por estar sem cinto.'
    })
  elseif damage > 0 and not hadSeatbelt then
    notify({
      type = 'warning',
      title = 'Colisão',
      message = 'Impacto forte sem cinto.'
    })
  end
end

local function updateSeatbeltCrash(vehicle, playerPed)
  if SeatbeltCrashConfig.enabled ~= true then
    return
  end
  
  if vehicle == 0 then
    SeatbeltRuntime.lastSpeedKmh = 0
    return
  end

  if not IsSeatbeltVehicle(vehicle) then
    SeatbeltRuntime.enabled = false
    SeatbeltRuntime.lastSpeedKmh = 0
    return
  end
  
  -- Focar no motorista por enquanto
  if GetPedInVehicleSeat(vehicle, -1) ~= playerPed then
    return
  end
  
  local currentSpeedKmh = GetEntitySpeed(vehicle) * 3.6
  local deltaKmh = SeatbeltRuntime.lastSpeedKmh - currentSpeedKmh
  local now = GetGameTimer()
  
  -- Verificar se teve queda de velocidade significativa
  if SeatbeltRuntime.lastSpeedKmh >= SeatbeltCrashConfig.minSpeedKmh and
     deltaKmh >= SeatbeltCrashConfig.damageDeltaKmh and
     (now - SeatbeltRuntime.lastCrashAt) >= SeatbeltCrashConfig.cooldownMs then
    
    applySeatbeltCrashEffect(playerPed, vehicle, deltaKmh, SeatbeltRuntime.enabled == true)
    SeatbeltRuntime.lastCrashAt = now
  end
  
  -- Sempre atualizar velocidade atual
  SeatbeltRuntime.lastSpeedKmh = currentSpeedKmh
end


local function setRadioTalkingState(active)
  VoiceRuntime.radioTalking = active == true
  if VoiceRuntime.radioTalking then
    VoiceRuntime.radioTalkingUntil = GetGameTimer() + 900
  end
end

RegisterNetEvent('pma-voice:radioActive', function(active)
  setRadioTalkingState(active)
end)

RegisterNetEvent('pma-voice:setTalkingOnRadio', function(_, active)
  setRadioTalkingState(active)
end)

RegisterNetEvent('pma-voice:setPlayerRadio', function()
  setRadioTalkingState(false)
end)

RegisterNetEvent('pma-voice:setTalkingMode', function(mode)
  VoiceRuntime.modeIndex = tonumber(mode) or VoiceRuntime.modeIndex
end)

local function clamp(value, minValue, maxValue)
  if value < minValue then
    return minValue
  end
  if value > maxValue then
    return maxValue
  end
  return value
end

local function getPolling(name, fallback)
  local polling = Config.Polling or {}
  return tonumber(polling[name] or fallback) or fallback
end

notify = function(payload)
  local message = payload or {}
  local title = tostring(message.title or 'HUD')
  local text = tostring(message.message or message.description or '')
  local notifyType = tostring(message.type or 'inform')

  if GetResourceState('mz_notify') == 'started' then
    exports['mz_notify']:Notify({
      title = title,
      message = text,
      type = notifyType
    })
    return
  end

  lib.notify({
    title = title,
    description = text,
    type = notifyType
  })
end

local function sendUI(payload)
  SendNUIMessage(payload)
end

local NuiPayloadCache = {}

local NuiPayloadForceInterval = {
  updateStatus = 1200,
  updateVehicle = 500,
  updateWeapon = 1000,
  updateVoice = 1500,
  updateRadio = 1500,
  updateLogo = 1500,
  setVisible = 1000
}

local function buildPayloadSignature(value)
  local valueType = type(value)

  if valueType == 'table' then
    local keys = {}
    for key in pairs(value) do
      keys[#keys + 1] = key
    end

    table.sort(keys, function(left, right)
      return tostring(left) < tostring(right)
    end)

    local parts = {}
    for _, key in ipairs(keys) do
      parts[#parts + 1] = tostring(key) .. '=' .. buildPayloadSignature(value[key])
    end

    return '{' .. table.concat(parts, ',') .. '}'
  end

  if valueType == 'number' then
    return tostring(math.floor(value * 100 + 0.5) / 100)
  end

  return tostring(value)
end

local function clearNuiPayloadCache()
  NuiPayloadCache = {}
end

local function shouldSendHudPayload(action, payload, forceIntervalMs)
  if type(action) ~= 'string' or action == '' then
    return true
  end

  local now = GetGameTimer()
  local signature = buildPayloadSignature(payload)
  local cache = NuiPayloadCache[action]
  local interval = tonumber(forceIntervalMs or NuiPayloadForceInterval[action] or 1000) or 1000

  if not cache then
    NuiPayloadCache[action] = {
      signature = signature,
      sentAt = now
    }
    return true
  end

  if cache.signature ~= signature or (now - cache.sentAt) >= interval then
    cache.signature = signature
    cache.sentAt = now
    return true
  end

  return false
end

local function sendHudMessageIfChanged(payload, options)
  if type(payload) ~= 'table' then
    return false
  end

  local action = tostring(payload.action or '')
  local interval = type(options) == 'table' and options.forceIntervalMs or nil

  if shouldSendHudPayload(action, payload, interval) then
    sendUI(payload)
    return true
  end

  return false
end

local function dispatchChatLayout(config)
  if type(config) ~= 'table' then
    return
  end

  if GetResourceState('mz_chat') ~= 'started' then
    return
  end

  local ok, err = pcall(function()
    exports['mz_chat']:ApplyLayout(config)
  end)

  if not ok then
    print(('[mz_hud] falha ao aplicar layout no mz_chat: %s'):format(tostring(err)))
  end
end

local function applyChatLayout(config)
  if type(config) ~= 'table' then
    return
  end

  TriggerEvent('mz_hud:client:chatLayoutChanged', config)
  dispatchChatLayout(config)
end

local function getPlayerMetadataValue(key, fallback)
  local metadata = HudState.coreHUDState and HudState.coreHUDState.metadata or {}
  local value = metadata and metadata[key]

  if value == nil then
    local hudState = exports['mz_core']:GetHUDState()
    local hudMetadata = hudState and hudState.metadata or {}
    value = hudMetadata and hudMetadata[key]
  end

  local numeric = tonumber(value)
  if numeric == nil then
    return fallback
  end

  return clamp(math.floor(numeric), 0, 100)
end

local function isVoicePttPressed()
  local voiceConfig = Config.Voice or {}
  if voiceConfig.ptt_fallback == false then
    return false
  end

  local controls = voiceConfig.ptt_controls
  if type(controls) ~= 'table' then
    controls = { 249 }
  end

  for _, control in ipairs(controls) do
    local controlId = tonumber(control)
    if controlId and (
      IsControlPressed(0, controlId) or
      IsDisabledControlPressed(0, controlId) or
      IsControlPressed(1, controlId) or
      IsDisabledControlPressed(1, controlId) or
      IsControlPressed(2, controlId) or
      IsDisabledControlPressed(2, controlId)
    ) then
      return true
    end
  end

  return false
end

local function getVoiceState()
  -- Debug: calcula separadamente para investigação
  local mumbleExists = type(MumbleIsPlayerTalking) == 'function'
  local networkExists = type(NetworkIsPlayerTalking) == 'function'
  local mumbleTalking = false
  local networkTalking = false
  local stateTalking = false
  local pttTalking = false
  local playerState = LocalPlayer and LocalPlayer.state or nil
  
  if mumbleExists then
    mumbleTalking = MumbleIsPlayerTalking(PlayerId()) == true
  end
  
  if networkExists then
    networkTalking = NetworkIsPlayerTalking(PlayerId()) == true
  end

  if playerState then
    stateTalking =
      playerState.talking == true or
      playerState.isTalking == true or
      playerState.voiceTalking == true or
      playerState.proximityTalking == true or
      playerState.mumbleTalking == true
  end
  
  -- Prioridade real: Mumble se existir, senão Network
  pttTalking = isVoicePttPressed()

  local isActuallyTalking = mumbleTalking or networkTalking or stateTalking or pttTalking
  
  -- Timeout que NUNCA fica preso
  local now = GetGameTimer()
  
  if isActuallyTalking then
    VoiceRuntime.voiceTalkingUntil = now + (tonumber(Config.Voice and Config.Voice.talking_hold_ms) or 650)
  elseif VoiceRuntime.voiceTalkingUntil < now then
    VoiceRuntime.voiceTalkingUntil = 0
  end
  
  local talking = isActuallyTalking or (VoiceRuntime.voiceTalkingUntil > now)
  
  -- Debug controlado
  if DebugVoice then
    print(("[mz_hud voice] mumbleExists=%s mumble=%s network=%s state=%s ptt=%s until=%s now=%s final=%s"):format(
      tostring(mumbleExists),
      tostring(mumbleTalking),
      tostring(networkTalking),
      tostring(stateTalking),
      tostring(pttTalking),
      tostring(VoiceRuntime.voiceTalkingUntil),
      tostring(now),
      tostring(talking)
    ))
  end
  
  local proximityState = LocalPlayer and LocalPlayer.state and LocalPlayer.state.proximity or nil
  local modeIndex = tonumber(VoiceRuntime.modeIndex) or 2

  if type(proximityState) == 'table' then
    modeIndex = tonumber(proximityState.index or proximityState.mode or proximityState.level or modeIndex) or modeIndex
  elseif tonumber(proximityState) then
    modeIndex = tonumber(proximityState) or modeIndex
  end

  local value = 66
  local modeLabel = 'Normal'
  local modeKey = 'normal'

  if modeIndex <= 1 then
    value = 33
    modeLabel = 'Baixo'
    modeKey = 'low'
  elseif modeIndex == 2 then
    value = 66
    modeLabel = 'Normal'
    modeKey = 'normal'
  else
    value = 100
    modeLabel = 'Alto'
    modeKey = 'high'
  end

  return {
    value = value,
    label = modeLabel,
    mode = modeKey,
    talking = talking
  }
end

local function formatRadioLabel(channel)
  if not channel or channel <= 0 then
    return 'Fora do radio'
  end

  local text = tostring(channel)
  if channel == math.floor(channel) then
    text = tostring(math.floor(channel))
  end

  return text .. ' MHz'
end

local function getRadioState()
  local playerState = LocalPlayer and LocalPlayer.state or nil
  local radioChannel = playerState and (playerState.radioChannel or playerState.radio) or nil
  local channel = tonumber(radioChannel) or 0
  local active = channel > 0
  local talking = false

  if playerState then
    talking = playerState.radioTalking == true or playerState.isTalkingOnRadio == true or playerState.radioActive == true
  end

  -- Only use the timer-based talking state if it hasn't expired yet
  if VoiceRuntime.radioTalkingUntil > GetGameTimer() then
    talking = true
  end

  return {
    value = active and 100 or 0,
    label = formatRadioLabel(channel),
    active = active,
    talking = active and talking or false,
    channel = channel
  }
end

local function getStatusPayload()
  local playerPed = PlayerPedId()
  local currentHealth = math.max(0, GetEntityHealth(playerPed) - 100)
  local maxHealth = math.max(1, GetEntityMaxHealth(playerPed) - 100)
  local oxygen = 100
  local underwaterTime = GetPlayerUnderwaterTimeRemaining(PlayerId())

  if IsPedSwimmingUnderWater(playerPed) then
    oxygen = clamp(math.floor((underwaterTime or 0.0) * 10.0), 0, 100)
  end

  local voice = getVoiceState()
  local radio = getRadioState()

  return {
    action = 'updateStatus',
    status = {
      health = clamp(math.floor((currentHealth / maxHealth) * 100), 0, 100),
      armor = clamp(GetPedArmour(playerPed), 0, 100),
      hunger = getPlayerMetadataValue('hunger', 100),
      thirst = getPlayerMetadataValue('thirst', 100),
      stress = getPlayerMetadataValue('stress', 0),
      stamina = clamp(100 - math.floor(GetPlayerSprintStaminaRemaining(PlayerId()) or 0), 0, 100),
      oxygen = oxygen,
      voice = voice.value,
      voiceLabel = voice.label,
      voiceMode = voice.mode,
      talking = voice.talking,
      radio = radio.value,
      radioLabel = radio.label,
      radioActive = radio.active,
      radioTalking = radio.talking,
      radioChannel = radio.channel
    }
  }
end

local function getVehiclePayload()
  local playerPed = PlayerPedId()
  local vehicle = GetVehiclePedIsIn(playerPed, false)
  local speedometerConfig = HudState.config and HudState.config.speedometer or nil

  if vehicle == 0 then
    resetSeatbeltRuntime(0)
    return {
      action = 'updateVehicle',
      vehicle = {
        visible = false,
        seatbelt = false,
        seatbeltAvailable = false
      }
    }
  end

  if not speedometerConfig or speedometerConfig.enabled ~= true or not HudState.speedometerVisible then
    return {
      action = 'updateVehicle',
      vehicle = {
        visible = false,
        seatbelt = false,
        seatbeltAvailable = false
      }
    }
  end

  -- Detectar mudança de veículo e resetar cinto
  if SeatbeltRuntime.lastVehicle ~= vehicle then
    resetSeatbeltRuntime(vehicle)
  end

  -- Verificar colisão sem cinto
  local seatbeltAvailable = IsSeatbeltVehicle(vehicle)
  if not seatbeltAvailable then
    SeatbeltRuntime.enabled = false
    SeatbeltRuntime.lastSpeedKmh = 0
  end

  if seatbeltAvailable then
    updateSeatbeltCrash(vehicle, playerPed)
  end

  local speed = GetEntitySpeed(vehicle)
  local speedValue = speed * 3.6
  if speedometerConfig.unit == 'mph' then
    speedValue = speed * 2.236936
  end

  local _, lightsOn, highbeamsOn = GetVehicleLightsState(vehicle)
  local lightsActive = lightsOn == true or lightsOn == 1
  local highbeamsActive = highbeamsOn == true or highbeamsOn == 1
  local indicatorState = GetVehicleIndicatorLights(vehicle)
  local indicatorLeft = indicatorState == 1 or indicatorState == 3
  local indicatorRight = indicatorState == 2 or indicatorState == 3
  local engineHealth = clamp(math.floor((GetVehicleEngineHealth(vehicle) or 0.0) / 10), 0, 100)
  local throttle = clamp(math.floor((GetControlNormal(0, 71) or 0.0) * 100), 0, 100)
  local gear = GetVehicleCurrentGear(vehicle)
  local gearLabel = tostring(gear)
  if gear == 0 then
    gearLabel = 'R'
  elseif speed < 0.5 then
    gearLabel = 'N'
  end

  local seatbeltStatus = false
  if seatbeltAvailable and speedometerConfig.show_seatbelt == true then
    seatbeltStatus = SeatbeltRuntime.enabled == true
  end

  return {
    action = 'updateVehicle',
    vehicle = {
      visible = true,
      speed = math.floor(speedValue + 0.5),
      rpm = clamp(math.floor((GetVehicleCurrentRpm(vehicle) or 0.0) * 100), 0, 100),
      throttle = throttle,
      fuel = clamp(math.floor(GetVehicleFuelLevel(vehicle) or 0.0), 0, 100),
      gear = gearLabel,
      seatbelt = seatbeltStatus,
      seatbeltAvailable = seatbeltAvailable,
      lights = lightsActive or highbeamsActive,
      lightsHigh = highbeamsActive,
      lightsState = highbeamsActive and 'high' or (lightsActive and 'on' or 'off'),
      indicatorLeft = indicatorLeft,
      indicatorRight = indicatorRight,
      engine = GetIsVehicleEngineRunning(vehicle),
      engineHealth = engineHealth
    }
  }
end


local function getWeaponPayload()
  local weaponConfig = HudState.config and HudState.config.weapon or nil

  if not weaponConfig or weaponConfig.enabled ~= true or HudState.hudVisible ~= true then
    return {
      action = 'updateWeapon',
      weapon = { visible = false }
    }
  end

  if CoreWeaponHudState.known == true then
    if CoreWeaponHudState.equipped ~= true then
      return {
        action = 'updateWeapon',
        weapon = { visible = false }
      }
    end

    local weaponHash = tonumber(CoreWeaponHudState.weaponHash) or getWeaponHashFromName(CoreWeaponHudState.weapon)
    local totalAmmo = tonumber(CoreWeaponHudState.ammo)
    totalAmmo = math.max(0, math.floor(tonumber(totalAmmo) or 0))
    local clipSize = tonumber(CoreWeaponHudState.clipSize) or 0
    local clipAmmo = tonumber(CoreWeaponHudState.clipAmmo)
    local reserveAmmo = tonumber(CoreWeaponHudState.reserveAmmo)
    if clipAmmo ~= nil and reserveAmmo ~= nil then
      clipAmmo = math.max(0, math.floor(clipAmmo))
      reserveAmmo = math.max(0, math.floor(reserveAmmo))
    else
      if totalAmmo > 0 and clipSize > 0 then
        clipAmmo = math.min(totalAmmo, clipSize)
      elseif totalAmmo > 0 then
        clipAmmo = math.min(totalAmmo, 30)
      else
        clipAmmo = 0
      end
      reserveAmmo = math.max(totalAmmo - clipAmmo, 0)
    end

    local itemName = tostring(CoreWeaponHudState.item or '')
    if itemName == '' and weaponHash then
      itemName = getWeaponNameFromHash(weaponHash)
    end

    local ammoText = tostring(CoreWeaponHudState.ammoText or '')
    if ammoText == '' then
      ammoText = ('%d / %d'):format(clipAmmo, reserveAmmo)
    end
    if Config and Config.Debug == true and (GetGameTimer() - LastWeaponHudDebugAt) >= 1000 then
      LastWeaponHudDebugAt = GetGameTimer()
      print(('[mz_hud][weapon] weapon=%s hash=%s total=%s clipSize=%s clip=%s nativeOk=%s reserve=%s text=%s'):format(
        tostring(CoreWeaponHudState.weapon or ''),
        tostring(weaponHash or ''),
        tostring(totalAmmo),
        tostring(clipSize),
        tostring(clipAmmo),
        'core',
        tostring(reserveAmmo),
        ammoText
      ))
    end

    return {
      action = 'updateWeapon',
      weapon = {
        visible = true,
        name = itemName ~= '' and itemName or 'weapon',
        label = CoreWeaponHudState.label,
        weapon = CoreWeaponHudState.weapon,
        hash = weaponHash and tostring(weaponHash) or tostring(CoreWeaponHudState.weaponHash or ''),
        clip = clipAmmo,
        reserve = reserveAmmo,
        clipAmmo = clipAmmo,
        reserveAmmo = reserveAmmo,
        totalAmmo = totalAmmo,
        maxAmmo = tonumber(CoreWeaponHudState.maxAmmo) or nil,
        clipSize = clipSize > 0 and clipSize or nil,
        ammoText = ammoText
      }
    }
  end

  local ped = PlayerPedId()
  local weaponHash = GetSelectedPedWeapon(ped)

  if weaponHash == `WEAPON_UNARMED` then
    return {
      action = 'updateWeapon',
      weapon = { visible = false }
    }
  end

  local totalAmmo = GetAmmoInPedWeapon(ped, weaponHash) or 0
  totalAmmo = math.max(0, math.floor(tonumber(totalAmmo) or 0))
  local ammoInClip = getWeaponHudClipAmmo(ped, weaponHash, totalAmmo, 0, nil)
  local reserveAmmo = totalAmmo - (ammoInClip or 0)
  if reserveAmmo < 0 then
    reserveAmmo = 0
  end

  ammoInClip = math.max(0, math.floor(tonumber(ammoInClip) or 0))
  reserveAmmo = math.max(0, math.floor(tonumber(reserveAmmo) or 0))
  local ammoText = ('%d / %d'):format(ammoInClip, reserveAmmo)

  return {
    action = 'updateWeapon',
    weapon = {
      visible = true,
      name = getWeaponNameFromHash(weaponHash),
      hash = tostring(weaponHash),
      clip = ammoInClip,
      reserve = reserveAmmo,
      clipAmmo = ammoInClip,
      reserveAmmo = reserveAmmo,
      totalAmmo = totalAmmo,
      ammoText = ammoText
    }
  }
end

local minimapScaleform = nil
local lastMinimapStyle = nil
local lastMinimapSignature = nil
local lastRadarVisible = nil
local minimapAppliedOnce = false

local function getMinimapScaleform()
  if minimapScaleform and HasScaleformMovieLoaded(minimapScaleform) then
    return minimapScaleform
  end

  minimapScaleform = RequestScaleformMovie('minimap')
  while not HasScaleformMovieLoaded(minimapScaleform) do
    Wait(0)
  end

  return minimapScaleform
end

local function hideMinimapHealthAndArmor()
  local minimap = getMinimapScaleform()
  BeginScaleformMovieMethod(minimap, 'SETUP_HEALTH_ARMOUR')
  ScaleformMovieMethodAddParamInt(3)
  EndScaleformMovieMethod()
end

local function shouldShowMinimap(general)
  if not general or general.show_minimap ~= true then
    return false
  end

  local mode = tostring(general.minimap_visibility or 'always')
  local inVehicle = IsPedInAnyVehicle(PlayerPedId(), false)

  if mode == 'never' then return false end
  if mode == 'vehicle' then return inVehicle end
  if mode == 'foot' then return not inVehicle end

  return true
end

local function loadMapTexture(style)
  if style == 'square' then
    RequestStreamedTextureDict('squaremap', false)
    while not HasStreamedTextureDictLoaded('squaremap') do Wait(0) end
    SetMinimapClipType(0)
    AddReplaceTexture('platform:/textures/graphics', 'radarmasksm', 'squaremap', 'radarmasksm')
    AddReplaceTexture('platform:/textures/graphics', 'radarmask1g', 'squaremap', 'radarmasksm')
    return
  end

  if style == 'circle' then
    RequestStreamedTextureDict('circlemap', false)
    while not HasStreamedTextureDictLoaded('circlemap') do Wait(0) end
    SetMinimapClipType(1)
    AddReplaceTexture('platform:/textures/graphics', 'radarmasksm', 'circlemap', 'radarmasksm')
    AddReplaceTexture('platform:/textures/graphics', 'radarmask1g', 'circlemap', 'radarmasksm')
    return
  end

  -- Padrao GTA. Nao remove replace texture aqui, pois pode deixar o mapa invisivel apos reload.
  SetMinimapClipType(0)
end

local function applyMinimapPositions(general)
  local style = tostring(general.minimap_style or 'circle')

  local defaultAspectRatio = 1920 / 1080
  local resolutionX, resolutionY = GetActiveScreenResolution()
  local aspectRatio = resolutionX / resolutionY
  local minimapOffset = 0.0
  if aspectRatio > defaultAspectRatio then
    minimapOffset = ((defaultAspectRatio - aspectRatio) / 3.6) - 0.008
  end

  local x = tonumber(general.minimap_x or 24) or 24
  local y = tonumber(general.minimap_y or 24) or 24
  local dx = (x - 24.0) / 1920.0
  local dy = (y - 24.0) / 1080.0

  if style == 'square' then
    SetMinimapComponentPosition('minimap', 'L', 'B', 0.0 + minimapOffset + dx, -0.047 - dy, 0.1638, 0.183)
    SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.0 + minimapOffset + dx, 0.0 - dy, 0.128, 0.20)
    SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.01 + minimapOffset + dx, 0.025 - dy, 0.262, 0.300)
  elseif style == 'circle' then
    SetMinimapComponentPosition('minimap', 'L', 'B', -0.0100 + minimapOffset + dx, -0.030 - dy, 0.180, 0.258)
    SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.200 + minimapOffset + dx, 0.0 - dy, 0.065, 0.20)
    SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.00 + minimapOffset + dx, 0.015 - dy, 0.252, 0.338)
  else
    SetMinimapClipType(0)
    SetMinimapComponentPosition('minimap', 'L', 'B', -0.0045 + minimapOffset + dx, 0.002 - dy, 0.150, 0.188888)
    SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.020 + minimapOffset + dx, 0.032 - dy, 0.111, 0.159)
    SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.03 + minimapOffset + dx, 0.022 - dy, 0.266, 0.237)
  end

  SetBlipAlpha(GetNorthRadarBlip(), 0)
  SetRadarZoom(1000)
end

local function buildMinimapSignature(general, visible)
  return table.concat({
    tostring(visible),
    tostring(general.minimap_style or 'circle'),
    tostring(general.minimap_x or 24),
    tostring(general.minimap_y or 24)
  }, '|')
end

local function applyMinimapSettings(force)
  local general = HudState.config and HudState.config.general or {}
  local visible = shouldShowMinimap(general)
  local signature = buildMinimapSignature(general, visible)

  if lastRadarVisible ~= visible then
    DisplayRadar(visible)
    lastRadarVisible = visible
  end

  if not visible then
    lastMinimapSignature = signature
    return
  end

  if force ~= true and lastMinimapSignature == signature and minimapAppliedOnce == true then
    hideMinimapHealthAndArmor()
    return
  end

  local style = tostring(general.minimap_style or 'circle')

  loadMapTexture(style)
  lastMinimapStyle = style
  applyMinimapPositions(general)
  hideMinimapHealthAndArmor()

  -- SetBigmapActive recria o minimapa.
  -- Rodar isso em loop causa piscada, então só roda quando a configuração muda.
  SetBigmapActive(true, false)
  Wait(50)
  SetBigmapActive(false, false)

  DisplayRadar(true)
  hideMinimapHealthAndArmor()

  lastRadarVisible = true
  lastMinimapSignature = signature
  minimapAppliedOnce = true
end
local function closeEditor()
  HudState.editorOpen = false
  SetNuiFocus(false, false)
  sendUI({
    action = 'closeEditor'
  })
end

RegisterNetEvent('mz_hud:client:notify', function(payload)
  notify(payload)
end)

AddEventHandler('onClientResourceStart', function(resourceName)
  if resourceName == 'mz_chat' and HudState.config then
    applyChatLayout(HudState.config.chat)
  end
end)

RegisterNetEvent('mz_core:client:hudStateUpdated', function(hudState)
  if type(hudState) == 'table' then
    HudState.coreHUDState = {
      metadata = type(hudState.metadata) == 'table' and hudState.metadata or {}
    }
  end
end)

AddEventHandler('mz_core:client:weaponHudState', function(payload)
  payload = type(payload) == 'table' and payload or {}
  CoreWeaponHudState = payload
  CoreWeaponHudState.known = true
  CoreWeaponStateLastAt = GetGameTimer()

  if CoreWeaponHudState.equipped ~= true then
    sendHudMessageIfChanged({
      action = 'updateWeapon',
      weapon = { visible = false }
    }, { forceIntervalMs = 0 })
  end
end)

RegisterNetEvent('mz_hud:client:applyConfig', function(config)
  HudState.config = config
  clearNuiPayloadCache()
  applyMinimapSettings(true)
  applyChatLayout(HudState.config and HudState.config.chat or nil)

  sendUI({
    action = 'applyConfig',
    config = HudState.config
  })
end)

RegisterNetEvent('mz_hud:client:openEditor', function(config)
  if config then
    HudState.config = config
  end

  HudState.editorOpen = true
  HudState.canManage = true

  sendUI({
    action = 'openEditor',
    config = HudState.config,
    canManage = HudState.canManage
  })

  SetNuiFocus(true, true)
end)

RegisterNUICallback('ready', function(_, cb)
  local bootstrap = lib.callback.await('mz_hud:server:getBootstrap', false)
  HudState.config = bootstrap and bootstrap.config or HudState.config
  HudState.canManage = bootstrap and bootstrap.can_manage == true or false
  HudState.bootstrapDone = true
  HudState.coreHUDState = exports['mz_core']:GetHUDState() or HudState.coreHUDState
  clearNuiPayloadCache()

  applyMinimapSettings(true)
  applyChatLayout(HudState.config and HudState.config.chat or nil)

  sendUI({
    action = 'bootstrap',
    config = HudState.config,
    canManage = HudState.canManage,
    hudVisible = HudState.hudVisible,
    speedometerVisible = HudState.speedometerVisible
  })

  cb({ ok = true })
end)

RegisterNUICallback('closeEditor', function(_, cb)
  closeEditor()
  cb({ ok = true })
end)

RegisterNUICallback('saveConfig', function(data, cb)
  if HudState.canManage ~= true then
    cb({ ok = false, error = 'forbidden' })
    return
  end

  TriggerServerEvent('mz_hud:server:saveSettings', data and data.config or {})
  applyChatLayout(data and data.config and data.config.chat or nil)
  closeEditor()
  cb({ ok = true })
end)

RegisterNUICallback('resetConfig', function(data, cb)
  if HudState.canManage ~= true then
    cb({ ok = false, error = 'forbidden' })
    return
  end

  TriggerServerEvent('mz_hud:server:resetConfig', data or {})
  closeEditor()
  cb({ ok = true })
end)

RegisterNUICallback('getEditorPresetManager', function(_, cb)
  if HudState.canManage ~= true then
    cb({ ok = false, error = 'forbidden' })
    return
  end

  local result = lib.callback.await('mz_hud:server:getEditorPresetManager', false)
  cb(result or { ok = false, error = 'empty_response' })
end)

RegisterNUICallback('applyPresetFromEditor', function(data, cb)
  if HudState.canManage ~= true then
    cb({ ok = false, error = 'forbidden' })
    return
  end

  local presetName = data and data.preset or nil
  local result = lib.callback.await('mz_hud:server:applyPresetFromEditor', false, presetName)

  if result and result.ok == true and type(result.config) == 'table' then
    HudState.config = result.config
    applyMinimapSettings(true)
    applyChatLayout(HudState.config.chat)
    sendUI({
      action = 'applyConfig',
      config = HudState.config
    })
  end

  cb(result or { ok = false, error = 'empty_response' })
end)

RegisterNUICallback('createEditorBackup', function(_, cb)
  if HudState.canManage ~= true then
    cb({ ok = false, error = 'forbidden' })
    return
  end

  local result = lib.callback.await('mz_hud:server:createBackupFromEditor', false)
  cb(result or { ok = false, error = 'empty_response' })
end)

RegisterNUICallback('applyChatLayout', function(data, cb)
  applyChatLayout(data and data.config or nil)
  cb({ ok = true })
end)

RegisterNUICallback('notifyPreview', function(data, cb)
  notify({
    type = data and data.type or 'inform',
    title = 'HUD',
    description = data and data.description or 'Preview'
  })
  cb({ ok = true })
end)

RegisterCommand('togglehud', function()
  HudState.hudVisible = not HudState.hudVisible
  sendUI({
    action = 'setHudVisible',
    visible = HudState.hudVisible
  })
end, false)

RegisterCommand('togglespeed', function()
  HudState.speedometerVisible = not HudState.speedometerVisible
  sendUI({
    action = 'setSpeedometerVisible',
    visible = HudState.speedometerVisible
  })
end, false)

RegisterCommand('seatbelt', function()
  local ped = PlayerPedId()
  local vehicle = GetVehiclePedIsIn(ped, false)

  if vehicle == 0 then
    resetSeatbeltRuntime(0)
    return
  end

  if SeatbeltRuntime.lastVehicle ~= vehicle then
    resetSeatbeltRuntime(vehicle)
  end

  if not IsSeatbeltVehicle(vehicle) then
    resetSeatbeltRuntime(vehicle)
    return
  end

  SeatbeltRuntime.enabled = not SeatbeltRuntime.enabled

  if SeatbeltRuntime.enabled then
    notify({
      type = 'success',
      title = 'Cinto',
      message = 'Cinto colocado.'
    })
  else
    notify({
      type = 'inform',
      title = 'Cinto',
      message = 'Cinto removido.'
    })
  end
end, false)

RegisterCommand('mzhud_voice_debug', function()
  if Config.Debug ~= true and Config.EnableVoiceDebugCommand ~= true then
    return
  end

  DebugVoice = not DebugVoice
  notify({
    type = DebugVoice and 'success' or 'inform',
    title = 'HUD Voz',
    message = DebugVoice and 'Debug de voz ativado no F8.' or 'Debug de voz desativado.'
  })
end, false)

RegisterKeyMapping('togglehud', 'Mostrar ou esconder HUD', 'keyboard', '')
RegisterKeyMapping('togglespeed', 'Mostrar ou esconder velocimetro', 'keyboard', '')
RegisterKeyMapping('seatbelt', 'Colocar/remover cinto de segurança', 'keyboard', 'G')

CreateThread(function()
  while true do
    if HudState.bootstrapDone and HudState.config and HudState.hudVisible then
      sendHudMessageIfChanged(getStatusPayload(), { forceIntervalMs = 1200 })
    end

    Wait(getPolling('hud_ms', 200))
  end
end)

CreateThread(function()
  while true do
    if HudState.bootstrapDone and HudState.config then
      sendHudMessageIfChanged(getVehiclePayload(), { forceIntervalMs = 500 })
    end

    Wait(getPolling('vehicle_ms', 100))
  end
end)

CreateThread(function()
  while true do
    if SeatbeltRuntime.enabled == true then
      local ped = PlayerPedId()
      local vehicle = GetVehiclePedIsIn(ped, false)

      if vehicle == 0 then
        resetSeatbeltRuntime(0)
      elseif not IsSeatbeltVehicle(vehicle) then
        resetSeatbeltRuntime(vehicle)
      else
        if SeatbeltRuntime.lastVehicle ~= 0 and SeatbeltRuntime.lastVehicle ~= vehicle then
          resetSeatbeltRuntime(vehicle)
        else
          SeatbeltRuntime.lastVehicle = vehicle
          DisableControlAction(0, 75, true)
          DisableControlAction(27, 75, true)

          if IsDisabledControlJustPressed(0, 75) or IsDisabledControlJustPressed(27, 75) then
            local now = GetGameTimer()
            if (now - SeatbeltRuntime.lastExitBlockNotify) > 1500 then
              SeatbeltRuntime.lastExitBlockNotify = now
              notify({
                type = 'warning',
                title = 'Cinto',
                message = 'Remova o cinto para sair do veiculo.'
              })
            end
          end
        end
      end

      Wait(0)
    else
      Wait(300)
    end
  end
end)

CreateThread(function()
  while true do
    if HudState.bootstrapDone and HudState.config then
      sendHudMessageIfChanged(getWeaponPayload(), { forceIntervalMs = 1000 })
    end

    Wait(getPolling('weapon_ms', 200))
  end
end)

CreateThread(function()
  while true do
    if Config.Visibility and Config.Visibility.hide_gta_hud == true then
      HideHudComponentThisFrame(1)
      HideHudComponentThisFrame(2)
      HideHudComponentThisFrame(3)
      HideHudComponentThisFrame(4)
      HideHudComponentThisFrame(6)
      HideHudComponentThisFrame(7)
      HideHudComponentThisFrame(8)
      HideHudComponentThisFrame(9)
      HideHudComponentThisFrame(13)
      HideHudComponentThisFrame(17)
      HideHudComponentThisFrame(20)
      hideMinimapHealthAndArmor()
    end

    Wait(0)
  end
end)

CreateThread(function()
  while true do
    if HudState.bootstrapDone and HudState.config then
      applyMinimapSettings()
    end

    Wait(750)
  end
end)
