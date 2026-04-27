local DebugVoice = false

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
  radioTalkingUntil = 0
}


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

local function notify(payload)
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

local function getVoiceState()
  local playerId = PlayerId()
  local talking = NetworkIsPlayerTalking(playerId) == true

  if DebugVoice then
    print(('[mz_hud voice] network=%s final=%s'):format(
      tostring(talking),
      tostring(talking)
    ))
  end

  local proximityState = LocalPlayer and LocalPlayer.state and LocalPlayer.state.proximity or nil
  local modeIndex = 2

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

  if vehicle == 0 or not speedometerConfig or speedometerConfig.enabled ~= true or not HudState.speedometerVisible then
    return {
      action = 'updateVehicle',
      vehicle = {
        visible = false
      }
    }
  end

  local speed = GetEntitySpeed(vehicle)
  local speedValue = speed * 3.6
  if speedometerConfig.unit == 'mph' then
    speedValue = speed * 2.236936
  end

  local lightsOn, highbeamsOn = GetVehicleLightsState(vehicle)
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
  if speedometerConfig.show_seatbelt == true then
    seatbeltStatus = GetPedConfigFlag(playerPed, 16, true) ~= 0
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
      lights = (lightsOn == 1 or highbeamsOn == 1),
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

  local ped = PlayerPedId()
  local weaponHash = GetSelectedPedWeapon(ped)

  if weaponHash == `WEAPON_UNARMED` then
    return {
      action = 'updateWeapon',
      weapon = { visible = false }
    }
  end

  local ok, ammoInClip = GetAmmoInClip(ped, weaponHash)
  if ok ~= true then
    ammoInClip = 0
  end

  local totalAmmo = GetAmmoInPedWeapon(ped, weaponHash) or 0
  local reserveAmmo = totalAmmo - (ammoInClip or 0)
  if reserveAmmo < 0 then
    reserveAmmo = 0
  end

  return {
    action = 'updateWeapon',
    weapon = {
      visible = true,
      name = getWeaponNameFromHash(weaponHash),
      hash = tostring(weaponHash),
      clip = ammoInClip or 0,
      reserve = reserveAmmo
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

RegisterNetEvent('mz_core:client:hudStateUpdated', function(hudState)
  if type(hudState) == 'table' then
    HudState.coreHUDState = {
      metadata = type(hudState.metadata) == 'table' and hudState.metadata or {}
    }
  end
end)

RegisterNetEvent('mz_hud:client:applyConfig', function(config)
  HudState.config = config
  applyMinimapSettings(true)

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

  applyMinimapSettings(true)

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

  TriggerServerEvent('mz_hud:server:saveConfig', data and data.config or {})
  closeEditor()
  cb({ ok = true })
end)

RegisterNUICallback('resetConfig', function(_, cb)
  if HudState.canManage ~= true then
    cb({ ok = false, error = 'forbidden' })
    return
  end

  TriggerServerEvent('mz_hud:server:resetConfig')
  closeEditor()
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

RegisterKeyMapping('togglehud', 'Mostrar ou esconder HUD', 'keyboard', '')
RegisterKeyMapping('togglespeed', 'Mostrar ou esconder velocimetro', 'keyboard', '')

CreateThread(function()
  while true do
    if HudState.bootstrapDone and HudState.config and HudState.hudVisible then
      sendUI(getStatusPayload())
    end

    Wait(getPolling('hud_ms', 200))
  end
end)

CreateThread(function()
  while true do
    if HudState.bootstrapDone and HudState.config then
      sendUI(getVehiclePayload())
    end

    Wait(getPolling('vehicle_ms', 100))
  end
end)

CreateThread(function()
  while true do
    if HudState.bootstrapDone and HudState.config then
      sendUI(getWeaponPayload())
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
