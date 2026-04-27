local RESOURCE_NAME = GetCurrentResourceName()

local RuntimeConfig = nil

local ALLOWED_POSITIONS = {
  ['bottom-left'] = true,
  ['bottom-center'] = true,
  ['bottom-right'] = true,
  ['center-left'] = true,
  ['center'] = true,
  ['center-right'] = true,
  ['top-left'] = true,
  ['top-center'] = true,
  ['top-right'] = true
}

local ALLOWED_HUD_POSITIONS = ALLOWED_POSITIONS

local ALLOWED_SPEED_POSITIONS = ALLOWED_POSITIONS

local ALLOWED_WEAPON_POSITIONS = ALLOWED_POSITIONS

local ALLOWED_MINIMAP_STYLES = {
  circle = true,
  square = true,
  default = true
}

local ALLOWED_LOGO_POSITIONS = ALLOWED_POSITIONS

local ALLOWED_UNITS = {
  kmh = true,
  mph = true
}

local ALLOWED_SPEED_STYLES = {
  digital = true,
  analog = true,
  minimal = true,
  racing = true,
  classic = true,
  hudzip = true
}

local ALLOWED_ICONS = {
  heart = true,
  shield = true,
  utensils = true,
  droplet = true,
  zap = true,
  wind = true,
  brain = true,
  mic = true,
  radio = true
}

local ALLOWED_ELEMENT_STYLES = {
  circle = true,
  bar = true,
  square = true,
  pill = true,
  hudzip = true,
  comms = true
}

local function deepCopy(value)
  if type(value) ~= 'table' then
    return value
  end

  local out = {}
  for key, inner in pairs(value) do
    out[key] = deepCopy(inner)
  end
  return out
end

local function deepMerge(base, patch)
  local merged = deepCopy(base)
  for key, value in pairs(patch or {}) do
    if type(value) == 'table' and type(merged[key]) == 'table' then
      merged[key] = deepMerge(merged[key], value)
    else
      merged[key] = deepCopy(value)
    end
  end
  return merged
end

local function clampNumber(value, minValue, maxValue, fallback)
  local numeric = tonumber(value)
  if not numeric then
    return fallback
  end

  if numeric < minValue then
    return minValue
  end

  if numeric > maxValue then
    return maxValue
  end

  return numeric
end

local function sanitizeBool(value, fallback)
  if type(value) == 'boolean' then
    return value
  end
  return fallback
end

local function defaultBool(value, fallback)
  if value == nil then
    return fallback
  end
  return value == true
end

local function sanitizeEnum(value, allowed, fallback)
  if type(value) == 'string' and allowed[value] then
    return value
  end
  return fallback
end

local function sanitizeColor(value, fallback)
  if type(value) == 'string' and value:match('^#%x%x%x%x%x%x$') then
    return value:lower()
  end
  return fallback
end

local function sanitizeText(value, fallback, maxLength)
  local text = tostring(value or fallback or '')
  text = text:gsub('[\r\n\t]', ' '):gsub('[<>]', ''):gsub('%s+', ' ')
  text = text:match('^%s*(.-)%s*$') or ''

  if text == '' then
    text = tostring(fallback or '')
  end

  if tonumber(maxLength) and #text > maxLength then
    text = text:sub(1, maxLength)
  end

  return text
end

local function sanitizeImageUrl(value, fallback)
  local text = sanitizeText(value, fallback, 512)
  if text == '' then
    return ''
  end

  if text:match('^https?://') or text:match('^data:image/') or text:match('^[%w%._/%-]+$') then
    return text
  end

  return sanitizeText(fallback, '', 512)
end

local function getDefaults()
  return deepCopy(Config.DefaultHUD or {})
end

local function sanitizeCommsOptions(key, incoming, defaultOptions)
  if key ~= 'voice' and key ~= 'radio' then
    return nil
  end

  local options = type(incoming) == 'table' and incoming or {}
  local defaults = defaultOptions or {}

  if key == 'voice' then
    return {
      show_label = sanitizeBool(options.show_label, defaults.show_label ~= false),
      show_level_text = sanitizeBool(options.show_level_text, defaults.show_level_text ~= false),
      show_talking_text = sanitizeBool(options.show_talking_text, defaults.show_talking_text ~= false),
      inactive_opacity = clampNumber(options.inactive_opacity, 0, 100, defaults.inactive_opacity or 72)
    }
  elseif key == 'radio' then
    return {
      show_frequency = sanitizeBool(options.show_frequency, defaults.show_frequency ~= false),
      show_inactive = sanitizeBool(options.show_inactive, defaults.show_inactive ~= false),
      show_talking_text = sanitizeBool(options.show_talking_text, defaults.show_talking_text ~= false),
      inactive_text = sanitizeText(options.inactive_text, defaults.inactive_text or 'OFF', 12),
      frequency_suffix = sanitizeText(options.frequency_suffix, defaults.frequency_suffix or 'MHz', 12)
    }
  end

  return nil
end

local function sanitizeElements(defaults, incoming)
  local elements = {}

  for key, defaultElement in pairs(defaults.elements or {}) do
    local entry = type(incoming) == 'table' and incoming[key] or {}
    local sanitized = {
      enabled = sanitizeBool(entry.enabled, defaultElement.enabled),
      label = sanitizeText(entry.label, defaultElement.label or key, 24),
      icon = sanitizeEnum(entry.icon, ALLOWED_ICONS, defaultElement.icon),
      style = sanitizeEnum(entry.style, ALLOWED_ELEMENT_STYLES, defaultElement.style or 'circle'),
      color = sanitizeColor(entry.color, defaultElement.color),
      position = sanitizeEnum(entry.position, ALLOWED_POSITIONS, defaultElement.position or 'bottom-center'),
      free = sanitizeBool(entry.free, defaultElement.free == true),
      x = clampNumber(entry.x, 0, 100, defaultElement.x or 50),
      y = clampNumber(entry.y, 0, 100, defaultElement.y or 95),
      scale = clampNumber(entry.scale, 50, 180, defaultElement.scale or 100),
      opacity = clampNumber(entry.opacity, 0, 100, defaultElement.opacity),
      individual = (key == 'voice' or key == 'radio') and true or sanitizeBool(entry.individual, defaultElement.individual == true)
    }

    if key == 'voice' or key == 'radio' then
      sanitized.comms_options = sanitizeCommsOptions(key, entry.comms_options, defaultElement.comms_options)
    end

    elements[key] = sanitized
  end

  return elements
end

local function sanitizeStatusGroup(defaults, incoming)
  local defaultGroup = defaults.general and defaults.general.status_group or {}
  local group = type(incoming) == 'table' and incoming or {}

  return {
    enabled = sanitizeBool(group.enabled, defaultGroup.enabled ~= false),
    position = sanitizeEnum(group.position, ALLOWED_POSITIONS, defaultGroup.position or 'bottom-center'),
    free = sanitizeBool(group.free, defaultGroup.free == true),
    x = clampNumber(group.x, 0, 100, defaultGroup.x or 50),
    y = clampNumber(group.y, 0, 100, defaultGroup.y or 94),
    scale = clampNumber(group.scale, 50, 180, defaultGroup.scale or 100),
    opacity = clampNumber(group.opacity, 0, 100, defaultGroup.opacity or 100),
    gap = clampNumber(group.gap, 0, 40, defaultGroup.gap or 8)
  }
end

local function sanitizeHudConfig(incoming)
  local defaults = getDefaults()
  local general = type(incoming) == 'table' and incoming.general or {}
  local logo = type(incoming) == 'table' and incoming.logo or {}
  local speedometer = type(incoming) == 'table' and incoming.speedometer or {}
  local weapon = type(incoming) == 'table' and incoming.weapon or {}

  return {
    general = {
      show_minimap = sanitizeBool(general.show_minimap, defaults.general.show_minimap),
      minimap_style = sanitizeEnum(general.minimap_style, ALLOWED_MINIMAP_STYLES, defaults.general.minimap_style),
      minimap_visibility = sanitizeEnum(general.minimap_visibility, { always = true, vehicle = true, foot = true, never = true }, defaults.general.minimap_visibility or 'always'),
      minimap_x = clampNumber(general.minimap_x, -300, 500, defaults.general.minimap_x or 24),
      minimap_y = clampNumber(general.minimap_y, -300, 500, defaults.general.minimap_y or 24),
      hud_position = sanitizeEnum(general.hud_position, ALLOWED_HUD_POSITIONS, defaults.general.hud_position),
      status_group = sanitizeStatusGroup(defaults, general.status_group),
      global_opacity = clampNumber(general.global_opacity, 0, 100, defaults.general.global_opacity),
      scale = clampNumber(general.scale, 60, 140, defaults.general.scale)
    },
    logo = {
      enabled = sanitizeBool(logo.enabled, defaults.logo.enabled),
      image_url = sanitizeImageUrl(logo.image_url, defaults.logo.image_url or ''),
      width = clampNumber(logo.width, 40, 400, defaults.logo.width),
      height = clampNumber(logo.height, 20, 200, defaults.logo.height),
      opacity = clampNumber(logo.opacity, 0, 100, defaults.logo.opacity),
      position = sanitizeEnum(logo.position, ALLOWED_LOGO_POSITIONS, defaults.logo.position),
      show_only_in_vehicle = sanitizeBool(logo.show_only_in_vehicle, defaults.logo.show_only_in_vehicle)
    },
    speedometer = {
      enabled = sanitizeBool(speedometer.enabled, defaults.speedometer.enabled),
      position = sanitizeEnum(speedometer.position, ALLOWED_SPEED_POSITIONS, defaults.speedometer.position),
      free = sanitizeBool(speedometer.free, defaultBool(defaults.speedometer and defaults.speedometer.free, false)),
      x = clampNumber(speedometer.x, 0, 100, defaults.speedometer and defaults.speedometer.x or 88),
      y = clampNumber(speedometer.y, 0, 100, defaults.speedometer and defaults.speedometer.y or 82),
      style = sanitizeEnum(speedometer.style, ALLOWED_SPEED_STYLES, defaults.speedometer.style or 'digital'),
      unit = sanitizeEnum(speedometer.unit, ALLOWED_UNITS, defaults.speedometer.unit),
      show_speed = sanitizeBool(speedometer.show_speed, defaults.speedometer.show_speed ~= false),
      show_rpm = sanitizeBool(speedometer.show_rpm, defaults.speedometer.show_rpm),
      show_fuel = sanitizeBool(speedometer.show_fuel, defaults.speedometer.show_fuel),
      show_gear = sanitizeBool(speedometer.show_gear, defaults.speedometer.show_gear),
      show_seatbelt = sanitizeBool(speedometer.show_seatbelt, defaults.speedometer.show_seatbelt),
      show_lights = sanitizeBool(speedometer.show_lights, defaults.speedometer.show_lights),
      show_engine = sanitizeBool(speedometer.show_engine, defaults.speedometer.show_engine),
      primary_color = sanitizeColor(speedometer.primary_color, defaults.speedometer.primary_color or '#ffffff'),
      secondary_color = sanitizeColor(speedometer.secondary_color, defaults.speedometer.secondary_color or '#3b82f6'),
      accent_color = sanitizeColor(speedometer.accent_color, defaults.speedometer.accent_color or '#ef4444'),
      background_color = sanitizeColor(speedometer.background_color, defaults.speedometer.background_color or '#000000'),
      opacity = clampNumber(speedometer.opacity, 0, 100, defaults.speedometer.opacity),
      scale = clampNumber(speedometer.scale, 60, 150, defaults.speedometer.scale)
    },
    weapon = {
      enabled = sanitizeBool(weapon.enabled, defaultBool(defaults.weapon and defaults.weapon.enabled, true)),
      position = sanitizeEnum(weapon.position, ALLOWED_WEAPON_POSITIONS, defaults.weapon and defaults.weapon.position or 'bottom-right'),
      free = sanitizeBool(weapon.free, defaultBool(defaults.weapon and defaults.weapon.free, false)),
      x = clampNumber(weapon.x, 0, 100, defaults.weapon and defaults.weapon.x or 88),
      y = clampNumber(weapon.y, 0, 100, defaults.weapon and defaults.weapon.y or 78),
      show_image = sanitizeBool(weapon.show_image, defaultBool(defaults.weapon and defaults.weapon.show_image, true)),
      show_ammo = sanitizeBool(weapon.show_ammo, defaultBool(defaults.weapon and defaults.weapon.show_ammo, true)),
      show_name = sanitizeBool(weapon.show_name, defaultBool(defaults.weapon and defaults.weapon.show_name, false)),
      icon_model = sanitizeText(weapon.icon_model, defaults.weapon and defaults.weapon.icon_model or 'default', 24),
      image_model = sanitizeText(weapon.image_model, defaults.weapon and defaults.weapon.image_model or 'default', 24),
      opacity = clampNumber(weapon.opacity, 0, 100, defaults.weapon and defaults.weapon.opacity or 92),
      scale = clampNumber(weapon.scale, 60, 150, defaults.weapon and defaults.weapon.scale or 100)
    },
    elements = sanitizeElements(defaults, type(incoming) == 'table' and incoming.elements or nil)
  }
end

local function getStoragePath()
  return (Config.Storage and Config.Storage.runtime_file) or 'data/runtime_config.json'
end

local function loadRuntimeConfig()
  local raw = LoadResourceFile(RESOURCE_NAME, getStoragePath())
  local defaults = getDefaults()

  if not raw or raw == '' then
    RuntimeConfig = defaults
    return
  end

  local ok, decoded = pcall(json.decode, raw)
  if not ok or type(decoded) ~= 'table' then
    print(('[mz_hud] failed to decode %s, using defaults'):format(getStoragePath()))
    RuntimeConfig = defaults
    return
  end

  RuntimeConfig = sanitizeHudConfig(deepMerge(defaults, decoded))
end

local function saveRuntimeConfig()
  if not RuntimeConfig then
    RuntimeConfig = getDefaults()
  end

  local encoded = json.encode(RuntimeConfig)
  SaveResourceFile(RESOURCE_NAME, getStoragePath(), encoded, -1)
end

local function hasAdminAccess(source)
  if source == 0 then
    return Config.Admin and Config.Admin.allow_console == true
  end

  local adminPrincipal = Config.Admin and Config.Admin.principal
  if type(adminPrincipal) ~= 'string' or adminPrincipal == '' then
    return false
  end

  return IsPlayerAceAllowed(source, adminPrincipal)
end

local function notifyClient(source, payload)
  TriggerClientEvent('mz_hud:client:notify', source, payload)
end

local function broadcastConfig(target)
  local payload = deepCopy(RuntimeConfig or getDefaults())
  TriggerClientEvent('mz_hud:client:applyConfig', target or -1, payload)
end

lib.callback.register('mz_hud:server:getBootstrap', function(source)
  return {
    config = deepCopy(RuntimeConfig or getDefaults()),
    can_manage = hasAdminAccess(source)
  }
end)

RegisterNetEvent('mz_hud:server:saveConfig', function(payload)
  local source = source
  if not hasAdminAccess(source) then
    notifyClient(source, {
      type = 'error',
      title = 'HUD',
      message = 'Sem permissao para editar a HUD.'
    })
    return
  end

  RuntimeConfig = sanitizeHudConfig(payload)
  saveRuntimeConfig()
  broadcastConfig(-1)

  notifyClient(source, {
    type = 'success',
    title = 'HUD',
    message = 'Configuracao da HUD aplicada para todos.'
  })
end)

RegisterNetEvent('mz_hud:server:resetConfig', function()
  local source = source
  if not hasAdminAccess(source) then
    notifyClient(source, {
      type = 'error',
      title = 'HUD',
      message = 'Sem permissao para resetar a HUD.'
    })
    return
  end

  RuntimeConfig = getDefaults()
  saveRuntimeConfig()
  broadcastConfig(-1)

  notifyClient(source, {
    type = 'success',
    title = 'HUD',
    message = 'HUD resetada para o padrao.'
  })
end)

local function registerAdminCommand(name, handler)
  if type(name) ~= 'string' or name == '' then
    return
  end

  RegisterCommand(name, function(source)
    handler(source)
  end, false)
end

registerAdminCommand(Config.Admin and Config.Admin.open_command, function(source)
  if source == 0 then
    print('[mz_hud] use este comando dentro do jogo.')
    return
  end

  if not hasAdminAccess(source) then
    notifyClient(source, {
      type = 'error',
      title = 'HUD',
      message = 'Sem permissao para abrir o editor.'
    })
    return
  end

  TriggerClientEvent('mz_hud:client:openEditor', source, deepCopy(RuntimeConfig or getDefaults()))
end)

registerAdminCommand(Config.Admin and Config.Admin.reload_command, function(source)
  if not hasAdminAccess(source) then
    if source ~= 0 then
      notifyClient(source, {
        type = 'error',
        title = 'HUD',
        message = 'Sem permissao para recarregar a HUD.'
      })
    end
    return
  end

  loadRuntimeConfig()
  broadcastConfig(-1)

  if source == 0 then
    print('[mz_hud] configuracao recarregada e enviada para todos.')
  else
    notifyClient(source, {
      type = 'success',
      title = 'HUD',
      message = 'Configuracao recarregada para todos.'
    })
  end
end)

registerAdminCommand(Config.Admin and Config.Admin.reset_command, function(source)
  if not hasAdminAccess(source) then
    if source ~= 0 then
      notifyClient(source, {
        type = 'error',
        title = 'HUD',
        message = 'Sem permissao para resetar a HUD.'
      })
    end
    return
  end

  RuntimeConfig = getDefaults()
  saveRuntimeConfig()
  broadcastConfig(-1)

  if source == 0 then
    print('[mz_hud] configuracao resetada para o padrao.')
  else
    notifyClient(source, {
      type = 'success',
      title = 'HUD',
      message = 'HUD resetada e enviada para todos.'
    })
  end
end)

AddEventHandler('onResourceStart', function(resourceName)
  if resourceName ~= RESOURCE_NAME then
    return
  end

  loadRuntimeConfig()
  SetTimeout(1000, function()
    broadcastConfig(-1)
  end)
end)
