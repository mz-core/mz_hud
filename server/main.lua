local RESOURCE_NAME = GetCurrentResourceName()

local RuntimeConfig = nil
local SCHEMA_VERSION = 2

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

local ALLOWED_CHAT_PRESETS = {
  ['left-top'] = true,
  ['left-center'] = true,
  ['left-bottom'] = true,
  ['center-top'] = true,
  center = true,
  ['center-bottom'] = true,
  ['right-top'] = true,
  ['right-center'] = true,
  ['right-bottom'] = true
}

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
  apex = true,
  vector = true
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
  apex = true,
  comms = true
}

local ALLOWED_VISIBILITY_MODES = {
  always = true,
  smart = true,
  hidden = true
}

local ALLOWED_GROUP_ORIENTATIONS = { horizontal = true, vertical = true }
local ALLOWED_GROUP_ALIGNMENTS = { start = true, center = true, ['end'] = true }

local SPEEDOMETER_ICON_DEFAULTS = {
  fuel = 'fuel',
  engine = 'engine',
  engine_indicator = 'turn',
  belt = 'belt',
  unbelt = 'unbelt',
  light = 'light',
  light_high = 'lightHigh',
  light_off = 'lightOff',
  lock = 'lock',
  unlock = 'unlock',
  arrow = 'arrow',
  arrow_active = 'arrowActive',
  speed = 'speed',
  rpm = 'rpm',
  gear = 'gear',
  weapon = 'weapon',
  ammo = 'ammo'
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

local function sanitizeIconName(value, fallback)
  local text = tostring(value or fallback or '')
  text = text:gsub('%s+', '')

  if text:match('^[%w_%-]+$') and #text <= 64 then
    return text
  end

  return tostring(fallback or '')
end

local function sanitizeSpeedometerIcons(incoming, defaults)
  local icons = type(incoming) == 'table' and incoming or {}
  local defaultIcons = type(defaults) == 'table' and defaults or {}
  local out = {}

  for key, fallback in pairs(SPEEDOMETER_ICON_DEFAULTS) do
    out[key] = sanitizeIconName(icons[key], defaultIcons[key] or fallback)
  end

  -- Compatibilidade com nomes antigos em camelCase, caso algum runtime manual tenha usado.
  out.light_high = sanitizeIconName(icons.light_high or icons.lightHigh, out.light_high)
  out.light_off = sanitizeIconName(icons.light_off or icons.lightOff, out.light_off)
  out.arrow_active = sanitizeIconName(icons.arrow_active or icons.arrowActive, out.arrow_active)
  out.engine_indicator = sanitizeIconName(icons.engine_indicator or icons.engineIndicator, out.engine_indicator)

  return out
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
      icon = sanitizeIconName(entry.icon, defaultElement.icon),
      style = sanitizeEnum(entry.style, ALLOWED_ELEMENT_STYLES, defaultElement.style or 'circle'),
      color = sanitizeColor(entry.color, defaultElement.color),
      position = sanitizeEnum(entry.position, ALLOWED_POSITIONS, defaultElement.position or 'bottom-center'),
      free = sanitizeBool(entry.free, defaultElement.free == true),
      x = clampNumber(entry.x, 0, 100, defaultElement.x or 50),
      y = clampNumber(entry.y, 0, 100, defaultElement.y or 95),
      scale = clampNumber(entry.scale, 50, 180, defaultElement.scale or 100),
      opacity = clampNumber(entry.opacity, 0, 100, defaultElement.opacity),
      individual = (key == 'voice' or key == 'radio') and true or sanitizeBool(entry.individual, defaultElement.individual == true),
      visibilityMode = sanitizeEnum(entry.visibilityMode, ALLOWED_VISIBILITY_MODES, defaultElement.visibilityMode or 'always'),
      locked = sanitizeBool(entry.locked, defaultElement.locked == true),
      collapseWhenHidden = sanitizeBool(entry.collapseWhenHidden, defaultElement.collapseWhenHidden == true)
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
    gap = clampNumber(group.gap, 0, 40, defaultGroup.gap or 8),
    orientation = sanitizeEnum(group.orientation, ALLOWED_GROUP_ORIENTATIONS, defaultGroup.orientation or 'horizontal'),
    alignment = sanitizeEnum(group.alignment, ALLOWED_GROUP_ALIGNMENTS, defaultGroup.alignment or 'center'),
    locked = sanitizeBool(group.locked, defaultGroup.locked == true)
  }
end

local function sanitizeChatConfig(defaults, incoming)
  local defaultChat = defaults.chat or {}
  local chat = type(incoming) == 'table' and incoming or {}

  return {
    enabled = sanitizeBool(chat.enabled, defaultBool(defaultChat.enabled, true)),
    preset = sanitizeEnum(chat.preset, ALLOWED_CHAT_PRESETS, defaultChat.preset or 'left-top'),
    free = sanitizeBool(chat.free, defaultBool(defaultChat.free, false)),
    x = clampNumber(chat.x, 0, 100, defaultChat.x or 2),
    y = clampNumber(chat.y, 0, 100, defaultChat.y or 3),
    scale = clampNumber(chat.scale, 0.5, 1.8, defaultChat.scale or 1.0),
    opacity = clampNumber(chat.opacity, 0, 1, defaultChat.opacity or 1.0),
    locked = sanitizeBool(chat.locked, defaultChat.locked == true)
  }
end

local function sanitizeHudConfig(incoming)
  local defaults = getDefaults()
  local general = type(incoming) == 'table' and incoming.general or {}
  local logo = type(incoming) == 'table' and incoming.logo or {}
  local speedometer = type(incoming) == 'table' and incoming.speedometer or {}
  local weapon = type(incoming) == 'table' and incoming.weapon or {}
  local chat = type(incoming) == 'table' and incoming.chat or {}

  return {
    schema_version = SCHEMA_VERSION,
    revision = math.max(0, math.floor(clampNumber(type(incoming) == 'table' and incoming.revision, 0, 2147483647, defaults.revision or 0))),
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
      scale = clampNumber(logo.scale, 50, 180, defaults.logo.scale or 100),
      position = sanitizeEnum(logo.position, ALLOWED_LOGO_POSITIONS, defaults.logo.position),
      free = sanitizeBool(logo.free, defaultBool(defaults.logo.free, false)),
      x = clampNumber(logo.x, 0, 100, defaults.logo.x or 50),
      y = clampNumber(logo.y, 0, 100, defaults.logo.y or 6),
      locked = sanitizeBool(logo.locked, defaults.logo.locked == true),
      visibilityMode = sanitizeEnum(logo.visibilityMode, ALLOWED_VISIBILITY_MODES, defaults.logo.visibilityMode or 'always'),
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
      icons = sanitizeSpeedometerIcons(speedometer.icons, defaults.speedometer and defaults.speedometer.icons or nil),
      show_speed = sanitizeBool(speedometer.show_speed, defaults.speedometer.show_speed ~= false),
      show_rpm = sanitizeBool(speedometer.show_rpm, defaults.speedometer.show_rpm),
      show_fuel = sanitizeBool(speedometer.show_fuel, defaults.speedometer.show_fuel),
      show_gear = sanitizeBool(speedometer.show_gear, defaults.speedometer.show_gear),
      show_seatbelt = sanitizeBool(speedometer.show_seatbelt, defaults.speedometer.show_seatbelt),
      show_lights = sanitizeBool(speedometer.show_lights, defaults.speedometer.show_lights),
      show_lock = sanitizeBool(speedometer.show_lock, defaults.speedometer.show_lock),
      show_engine = sanitizeBool(speedometer.show_engine, defaults.speedometer.show_engine),
      primary_color = sanitizeColor(speedometer.primary_color, defaults.speedometer.primary_color or '#ffffff'),
      secondary_color = sanitizeColor(speedometer.secondary_color, defaults.speedometer.secondary_color or '#3b82f6'),
      accent_color = sanitizeColor(speedometer.accent_color, defaults.speedometer.accent_color or '#ef4444'),
      background_color = sanitizeColor(speedometer.background_color, defaults.speedometer.background_color or '#000000'),
      opacity = clampNumber(speedometer.opacity, 0, 100, defaults.speedometer.opacity),
      scale = clampNumber(speedometer.scale, 60, 150, defaults.speedometer.scale),
      locked = sanitizeBool(speedometer.locked, defaults.speedometer.locked == true),
      visibilityMode = sanitizeEnum(speedometer.visibilityMode, ALLOWED_VISIBILITY_MODES, defaults.speedometer.visibilityMode or 'smart')
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
      scale = clampNumber(weapon.scale, 60, 150, defaults.weapon and defaults.weapon.scale or 100),
      locked = sanitizeBool(weapon.locked, defaults.weapon and defaults.weapon.locked == true),
      visibilityMode = sanitizeEnum(weapon.visibilityMode, ALLOWED_VISIBILITY_MODES, defaults.weapon and defaults.weapon.visibilityMode or 'smart')
    },
    chat = sanitizeChatConfig(defaults, chat),
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

local function sendAdminFeedback(source, payload)
  local messageType = payload and payload.type or 'info'
  local title = payload and payload.title or 'HUD'
  local message = payload and payload.message or ''

  if source == 0 then
    print(('[mz_hud] %s: %s'):format(title, message))
    return
  end

  notifyClient(source, {
    type = messageType,
    title = title,
    message = message
  })
end

local function broadcastConfig(target)
  local payload = deepCopy(RuntimeConfig or getDefaults())
  TriggerClientEvent('mz_hud:client:applyConfig', target or -1, payload)
end

local function isSafeResourcePath(path)
  if type(path) ~= 'string' or path == '' then
    return false
  end

  if path:find('..', 1, true) or path:sub(1, 1) == '/' or path:sub(1, 1) == '\\' then
    return false
  end

  return true
end

local function getAuditConfig()
  return Config.Audit or {}
end

local function isAuditEnabled()
  return getAuditConfig().enabled == true
end

local function getAuditFilePath()
  local configured = getAuditConfig().file or 'data/audit/mz_hud_audit.log'
  configured = tostring(configured):gsub('\\', '/')

  if not isSafeResourcePath(configured) then
    return 'data/audit/mz_hud_audit.log'
  end

  return configured
end

local function getAuditMaxFileBytes()
  return clampNumber(getAuditConfig().max_file_bytes, 4096, 5242880, 512000)
end

local function getAuditTimestamp()
  return os.date('%Y-%m-%d %H:%M:%S') or tostring(os.time())
end

local function normalizeAuditValue(value)
  if value == nil then
    return 'nil'
  end

  if type(value) == 'boolean' then
    return value and 'true' or 'false'
  end

  if type(value) == 'table' then
    local ok, encoded = pcall(json.encode, value)
    if ok and encoded then
      return sanitizeText(encoded, '{}', 220)
    end
    return 'table'
  end

  return sanitizeText(tostring(value), '', 220)
end

local function formatAuditMeta(meta)
  if type(meta) ~= 'table' then
    return ''
  end

  local keys = {}
  for key in pairs(meta) do
    keys[#keys + 1] = key
  end
  table.sort(keys, function(left, right)
    return tostring(left) < tostring(right)
  end)

  local parts = {}
  for _, key in ipairs(keys) do
    local cleanKey = tostring(key):gsub('[^%w_%-]', '')
    if cleanKey ~= '' then
      parts[#parts + 1] = ('%s=%s'):format(cleanKey, normalizeAuditValue(meta[key]))
    end
  end

  return table.concat(parts, ' ')
end

local function getAuditActor(source)
  local numericSource = tonumber(source) or -1
  if numericSource == 0 then
    return 'console'
  end

  if numericSource > 0 then
    local name = GetPlayerName(numericSource) or 'unknown'
    return ('source:%s name:%s'):format(tostring(numericSource), sanitizeText(name, 'unknown', 64))
  end

  return 'system'
end

local function writeAudit(action, source, result, meta)
  if not isAuditEnabled() then
    return false, 'disabled'
  end

  if action == 'diagnostic_run' and getAuditConfig().log_diagnostics ~= true then
    return false, 'diagnostics_disabled'
  end

  if result == 'denied' and getAuditConfig().log_permission_denied ~= true then
    return false, 'denied_disabled'
  end

  local safeAction = sanitizeText(action, 'unknown', 48):gsub('%s+', '_')
  local safeResult = sanitizeText(result, 'info', 32):gsub('%s+', '_')
  local metaText = formatAuditMeta(meta)
  local line = ('[%s] action=%s result=%s actor="%s"%s%s'):format(
    getAuditTimestamp(),
    safeAction,
    safeResult,
    getAuditActor(source),
    metaText ~= '' and ' ' or '',
    metaText
  )

  local path = getAuditFilePath()
  local raw = LoadResourceFile(RESOURCE_NAME, path) or ''
  local maxBytes = getAuditMaxFileBytes()
  local combined = raw ~= '' and (raw .. '\n' .. line) or line

  if #combined > maxBytes then
    local keepBytes = math.floor(maxBytes * 0.70)
    combined = combined:sub(math.max(1, #combined - keepBytes))
    combined = ('[trimmed %s]\n%s'):format(getAuditTimestamp(), combined)
  end

  local saved = SaveResourceFile(RESOURCE_NAME, path, combined, -1)
  if saved == false then
    print(('[mz_hud] falha ao gravar auditoria em %s'):format(path))
    return false, 'save_failed'
  end

  return true
end

local function getAuditRecentLines(limit)
  local raw = LoadResourceFile(RESOURCE_NAME, getAuditFilePath()) or ''
  local lines = {}
  for line in raw:gmatch('[^\r\n]+') do
    lines[#lines + 1] = line
  end

  local count = clampNumber(limit, 1, 50, getAuditConfig().print_recent_count or 12)
  local startIndex = math.max(1, #lines - count + 1)
  local recent = {}
  for i = startIndex, #lines do
    recent[#recent + 1] = lines[i]
  end

  return recent, #lines
end

local function showAuditRecent(source, limit)
  if not isAuditEnabled() then
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Auditoria',
      message = 'Auditoria local esta desativada no config.lua.'
    })
    return
  end

  local recent, total = getAuditRecentLines(limit)

  print(('[mz_hud] auditoria recente (%s linhas totais):'):format(tostring(total)))
  if #recent == 0 then
    print(('  nenhum registro em %s'):format(getAuditFilePath()))
  else
    for _, line in ipairs(recent) do
      print(('  %s'):format(line))
    end
  end

  sendAdminFeedback(source, {
    type = 'info',
    title = 'HUD Auditoria',
    message = source == 0 and ('Arquivo: %s'):format(getAuditFilePath()) or ('Ultimos registros enviados ao console do servidor. Arquivo: %s'):format(getAuditFilePath())
  })
end

local function loadJsonResourceFile(path)
  if not isSafeResourcePath(path) then
    return nil, 'invalid_path'
  end

  local raw = LoadResourceFile(RESOURCE_NAME, path)
  if not raw or raw == '' then
    return nil, 'file_not_found'
  end

  local ok, decoded = pcall(json.decode, raw)
  if not ok or type(decoded) ~= 'table' then
    return nil, 'invalid_json'
  end

  return decoded, nil
end

local function getBackupConfig()
  return Config.Backups or {}
end

local function areBackupsEnabled()
  return getBackupConfig().enabled == true
end

local function getBackupDirectory()
  local directory = getBackupConfig().directory or 'data/backups'
  directory = tostring(directory):gsub('\\', '/')

  if not isSafeResourcePath(directory) then
    return 'data/backups'
  end

  return directory:gsub('/+$', '')
end

local function getBackupIndexPath()
  local configured = getBackupConfig().index_file
  if type(configured) == 'string' and configured ~= '' and isSafeResourcePath(configured) then
    return configured
  end

  return ('%s/index.json'):format(getBackupDirectory())
end

local function getMaxBackupIndexEntries()
  return clampNumber(getBackupConfig().max_index_entries, 1, 100, 15)
end

local function normalizeBackupId(value)
  local backupId = tostring(value or ''):lower():gsub('%.json$', ''):gsub('[^%w_%-]', '')
  if backupId == '' then
    return nil
  end

  return backupId
end

local function getBackupTimestamp()
  return os.date('%Y%m%d_%H%M%S') or tostring(os.time())
end

local function getReadableBackupTimestamp()
  return os.date('%Y-%m-%d %H:%M:%S') or tostring(os.time())
end

local function loadBackupIndex()
  local raw = LoadResourceFile(RESOURCE_NAME, getBackupIndexPath())
  if not raw or raw == '' then
    return { version = 1, backups = {} }
  end

  local ok, decoded = pcall(json.decode, raw)
  if not ok or type(decoded) ~= 'table' or type(decoded.backups) ~= 'table' then
    return { version = 1, backups = {} }
  end

  return decoded
end

local function saveBackupIndex(index)
  local encoded = json.encode(index or { version = 1, backups = {} })
  local saved = SaveResourceFile(RESOURCE_NAME, getBackupIndexPath(), encoded, -1)
  if saved == false then
    return false, 'save_index_failed'
  end

  return true
end

local function trimBackupIndex(index)
  local maxEntries = getMaxBackupIndexEntries()
  local backups = {}

  for i, entry in ipairs(index.backups or {}) do
    if i <= maxEntries then
      backups[#backups + 1] = entry
    end
  end

  index.backups = backups
  return index
end

local function createRuntimeBackup(reason, source, meta)
  if not areBackupsEnabled() then
    return false, 'disabled'
  end

  local backupId = ('%s_%04d'):format(getBackupTimestamp(), math.random(0, 9999))
  local backupPath = ('%s/%s.json'):format(getBackupDirectory(), backupId)
  local currentConfig = sanitizeHudConfig(RuntimeConfig or getDefaults())

  local backupPayload = {
    meta = {
      id = backupId,
      created_at = getReadableBackupTimestamp(),
      reason = sanitizeText(reason, 'manual', 48),
      source = source == 0 and 'console' or tostring(source or 'system'),
      data = type(meta) == 'table' and meta or {}
    },
    config = currentConfig
  }

  local encoded = json.encode(backupPayload)
  local saved = SaveResourceFile(RESOURCE_NAME, backupPath, encoded, -1)
  if saved == false then
    return false, 'save_backup_failed'
  end

  local index = loadBackupIndex()
  table.insert(index.backups, 1, {
    id = backupId,
    file = backupPath,
    created_at = backupPayload.meta.created_at,
    reason = backupPayload.meta.reason,
    source = backupPayload.meta.source
  })

  trimBackupIndex(index)
  local ok, err = saveBackupIndex(index)
  if not ok then
    return false, err
  end

  return true, backupId
end

local function createAutoBackup(reason, source, meta)
  local ok, backupIdOrErr = createRuntimeBackup(reason, source, meta)
  if ok then
    writeAudit('backup_auto', source, 'success', { reason = reason or 'unknown', backup = backupIdOrErr })
  elseif backupIdOrErr ~= 'disabled' then
    writeAudit('backup_auto', source, 'failed', { reason = reason or 'unknown', error = backupIdOrErr or 'unknown' })
    print(('[mz_hud] backup automatico falhou (%s): %s'):format(reason or 'unknown', backupIdOrErr or 'unknown'))
  end

  return ok, backupIdOrErr
end

local function getBackupEntry(index, backupId)
  for _, entry in ipairs(index.backups or {}) do
    if entry.id == backupId then
      return entry
    end
  end

  return nil
end

local function showBackupList(source)
  if not areBackupsEnabled() then
    writeAudit('backup_list', source, 'blocked', { reason = 'disabled' })
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Backups',
      message = 'Sistema de backups esta desativado no config.lua.'
    })
    return
  end

  local index = loadBackupIndex()
  local backups = index.backups or {}

  if #backups == 0 then
    sendAdminFeedback(source, {
      type = 'info',
      title = 'HUD Backups',
      message = 'Nenhum backup encontrado. Use /mzhud_backup create.'
    })
    return
  end

  if source == 0 then
    print('[mz_hud] backups disponiveis:')
    for i, entry in ipairs(backups) do
      print(('  %02d. %s | %s | %s | %s'):format(i, entry.id or 'unknown', entry.created_at or '', entry.reason or '', entry.source or ''))
    end
    return
  end

  local names = {}
  for i, entry in ipairs(backups) do
    if i <= 5 then
      names[#names + 1] = entry.id or 'unknown'
    end
  end

  sendAdminFeedback(source, {
    type = 'info',
    title = 'HUD Backups',
    message = ('Ultimos backups: %s'):format(table.concat(names, ', '))
  })
end

local function restoreBackupForSource(source, requestedBackupId)
  if not areBackupsEnabled() then
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Backups',
      message = 'Sistema de backups esta desativado no config.lua.'
    })
    return
  end

  local index = loadBackupIndex()
  local backups = index.backups or {}
  if #backups == 0 then
    writeAudit('backup_restore', source, 'failed', { reason = 'empty_index', backup = requestedBackupId or 'latest' })
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Backups',
      message = 'Nenhum backup encontrado para restaurar.'
    })
    return
  end

  local backupId = tostring(requestedBackupId or 'latest')
  local entry
  if backupId == 'latest' or backupId == 'ultimo' then
    entry = backups[1]
    backupId = entry and entry.id or nil
  else
    backupId = normalizeBackupId(backupId)
    entry = backupId and getBackupEntry(index, backupId) or nil
  end

  if not entry then
    writeAudit('backup_restore', source, 'failed', { reason = 'not_found', backup = requestedBackupId or 'latest' })
    sendAdminFeedback(source, {
      type = 'error',
      title = 'HUD Backups',
      message = ('Backup nao encontrado: %s'):format(tostring(requestedBackupId or 'latest'))
    })
    return
  end

  local backup, err = loadJsonResourceFile(entry.file)
  if not backup then
    writeAudit('backup_restore', source, 'failed', { reason = err or 'unknown', backup = entry.id or requestedBackupId or 'latest' })
    sendAdminFeedback(source, {
      type = 'error',
      title = 'HUD Backups',
      message = ('Falha ao carregar backup: %s'):format(err or 'unknown')
    })
    return
  end

  local backupConfig = type(backup.config) == 'table' and backup.config or backup

  if getBackupConfig().auto_before_restore == true then
    createAutoBackup('before_restore', source, { restore_target = entry.id })
  end

  local previousRevision = tonumber(RuntimeConfig and RuntimeConfig.revision) or 0
  RuntimeConfig = sanitizeHudConfig(deepMerge(getDefaults(), backupConfig))
  RuntimeConfig.revision = previousRevision + 1
  saveRuntimeConfig()
  broadcastConfig(-1)

  writeAudit('backup_restore', source, 'success', { backup = entry.id or backupId or 'latest' })

  sendAdminFeedback(source, {
    type = 'success',
    title = 'HUD Backups',
    message = ('Backup restaurado para todos: %s'):format(entry.id or backupId or 'latest')
  })
end

local function getPresetManifestPath()
  return (Config.Presets and Config.Presets.manifest_file) or 'data/presets/presets_manifest.json'
end

local function loadPresetManifest()
  local manifest, err = loadJsonResourceFile(getPresetManifestPath())
  if not manifest then
    return nil, err
  end

  if type(manifest.presets) ~= 'table' then
    return nil, 'invalid_manifest'
  end

  return manifest, nil
end

local function normalizePresetName(value)
  local name = tostring(value or ''):lower():gsub('[^%w_%-]', '')
  if name == '' then
    return nil
  end

  return name
end

local function getSortedPresetNames(manifest)
  local names = {}
  for name in pairs(manifest.presets or {}) do
    names[#names + 1] = name
  end
  table.sort(names)
  return names
end

local function getPresetEntry(manifest, presetName)
  if not manifest or type(manifest.presets) ~= 'table' then
    return nil
  end

  return manifest.presets[presetName]
end

local function loadPresetConfig(presetName)
  local manifest, manifestErr = loadPresetManifest()
  if not manifest then
    return nil, nil, manifestErr
  end

  local entry = getPresetEntry(manifest, presetName)
  if type(entry) ~= 'table' then
    return nil, manifest, 'preset_not_found'
  end

  local presetFile = entry.file
  if not isSafeResourcePath(presetFile) then
    return nil, manifest, 'invalid_preset_path'
  end

  local preset, presetErr = loadJsonResourceFile(presetFile)
  if not preset then
    return nil, manifest, presetErr
  end

  return preset, manifest, nil
end

local function showPresetList(source)
  local manifest, err = loadPresetManifest()
  if not manifest then
    sendAdminFeedback(source, {
      type = 'error',
      title = 'HUD Presets',
      message = ('Falha ao carregar manifesto: %s'):format(err or 'unknown')
    })
    return
  end

  local names = getSortedPresetNames(manifest)
  if #names == 0 then
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Presets',
      message = 'Nenhum preset encontrado no manifesto.'
    })
    return
  end

  if source == 0 then
    print('[mz_hud] presets disponiveis:')
    for _, name in ipairs(names) do
      local entry = manifest.presets[name] or {}
      print(('  - %s | %s | %s'):format(name, entry.label or name, entry.recommended_for or ''))
    end
    return
  end

  sendAdminFeedback(source, {
    type = 'info',
    title = 'HUD Presets',
    message = ('Disponiveis: %s'):format(table.concat(names, ', '))
  })
end

local function applyPresetForSource(source, requestedName)
  if not hasAdminAccess(source) then
    writeAudit('preset_apply', source, 'denied', { preset = requestedName or '' })
    sendAdminFeedback(source, {
      type = 'error',
      title = 'HUD Presets',
      message = 'Sem permissao para aplicar presets.'
    })
    return false, 'forbidden'
  end

  if not (Config.Presets and Config.Presets.enabled == true) then
    writeAudit('preset_apply', source, 'blocked', { reason = 'disabled', preset = requestedName or '' })
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Presets',
      message = 'Sistema de presets esta desativado no config.lua.'
    })
    return false, 'disabled'
  end

  local presetName = normalizePresetName(requestedName)
  if not presetName then
    writeAudit('preset_apply', source, 'failed', { reason = 'missing_name' })
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Presets',
      message = 'Uso: /mzhud_preset list ou /mzhud_preset apply [nome]'
    })
    return false, 'missing_name'
  end

  local preset, manifest, err = loadPresetConfig(presetName)
  if not preset then
    writeAudit('preset_apply', source, 'failed', { preset = presetName, reason = err or 'unknown' })
    if err == 'preset_not_found' and manifest then
      local names = getSortedPresetNames(manifest)
      sendAdminFeedback(source, {
        type = 'error',
        title = 'HUD Presets',
        message = ('Preset "%s" nao encontrado. Disponiveis: %s'):format(presetName, table.concat(names, ', '))
      })
    else
      sendAdminFeedback(source, {
        type = 'error',
        title = 'HUD Presets',
        message = ('Falha ao carregar preset "%s": %s'):format(presetName, err or 'unknown')
      })
    end
    return false, err or 'unknown'
  end

  local entry = getPresetEntry(manifest, presetName) or {}
  if getBackupConfig().auto_before_preset == true then
    createAutoBackup('before_preset', source, { preset = presetName })
  end

  local previousRevision = tonumber(RuntimeConfig and RuntimeConfig.revision) or 0
  RuntimeConfig = sanitizeHudConfig(deepMerge(getDefaults(), preset))
  RuntimeConfig.revision = previousRevision + 1
  saveRuntimeConfig()
  broadcastConfig(-1)

  writeAudit('preset_apply', source, 'success', { preset = presetName })

  sendAdminFeedback(source, {
    type = 'success',
    title = 'HUD Presets',
    message = ('Preset aplicado para todos: %s'):format(entry.label or presetName)
  })

  return true, deepCopy(RuntimeConfig), entry.label or presetName
end


local function tableDeepEqual(left, right)
  if type(left) ~= type(right) then
    return false
  end

  if type(left) ~= 'table' then
    return left == right
  end

  for key, value in pairs(left) do
    if not tableDeepEqual(value, right[key]) then
      return false
    end
  end

  for key in pairs(right) do
    if left[key] == nil then
      return false
    end
  end

  return true
end

local function countTableEntries(value)
  local count = 0
  if type(value) ~= 'table' then
    return count
  end

  for _ in pairs(value) do
    count = count + 1
  end

  return count
end

local function resourceFileExists(path)
  if not isSafeResourcePath(path) then
    return false
  end

  local raw = LoadResourceFile(RESOURCE_NAME, path)
  return raw ~= nil
end

local function getRequiredHudFiles()
  local files = {
    'fxmanifest.lua',
    'config.lua',
    'client/main.lua',
    'server/main.lua',
    'web/index.html',
    'web/shared/variables.css',
    'web/shared/animations.css',
    'web/shared/helpers.css',
    'web/style.css',
    'web/core/constants.js',
    'web/core/utils.js',
    'web/core/positions.js',
    'web/core/icons.js',
    'web/core/defaults.js',
    'web/core/weapons.js',
    'web/core/core.js',
    'web/hud/editor/editor.css',
    'web/hud/editor/schema.js',
    'web/hud/editor/visibility.js',
    'web/hud/editor/store.js',
    'web/hud/editor/visual.js',
    'web/hud/editor/editor.js',
    'web/hud/editor/presets.js',
    'web/hud/status/status.css',
    'web/hud/status/status.js',
    'web/hud/speedometer/speedometer.css',
    'web/hud/speedometer/speedometer.js',
    'web/hud/voice/voice.css',
    'web/hud/voice/voice.js',
    'web/hud/radio/radio.css',
    'web/hud/radio/radio.js',
    'web/hud/logo/logo.css',
    'web/hud/logo/logo.js',
    'web/hud/weapon/weapon.css',
    'web/hud/weapon/weapon.js',
    'web/app/state.js',
    'web/app/nui.js',
    'web/app/render.js',
    'web/app/editor_bridge.js',
    'web/app/events.js',
    'web/app.js',
    getStoragePath()
  }

  if Config.Presets and Config.Presets.enabled == true then
    files[#files + 1] = getPresetManifestPath()
  end

  return files
end

local function checkRequiredHudFiles()
  local missing = {}
  for _, path in ipairs(getRequiredHudFiles()) do
    if not resourceFileExists(path) then
      missing[#missing + 1] = path
    end
  end
  return missing
end

local function getRuntimeFileStatus()
  local path = getStoragePath()
  local raw = LoadResourceFile(RESOURCE_NAME, path)
  if not raw or raw == '' then
    return {
      path = path,
      exists = raw ~= nil,
      valid = false,
      reason = raw == '' and 'empty_file' or 'file_not_found'
    }
  end

  local ok, decoded = pcall(json.decode, raw)
  return {
    path = path,
    exists = true,
    valid = ok and type(decoded) == 'table',
    reason = ok and type(decoded) == 'table' and 'ok' or 'invalid_json'
  }
end

local function detectMatchingPreset()
  if not (Config.Presets and Config.Presets.enabled == true) then
    return nil, 'disabled'
  end

  local manifest, err = loadPresetManifest()
  if not manifest then
    return nil, err or 'manifest_error'
  end

  local currentConfig = sanitizeHudConfig(RuntimeConfig or getDefaults())
  currentConfig.revision = 0
  local names = getSortedPresetNames(manifest)
  for _, presetName in ipairs(names) do
    local preset = loadPresetConfig(presetName)
    if preset then
      local candidate = sanitizeHudConfig(deepMerge(getDefaults(), preset))
      candidate.revision = 0
      if tableDeepEqual(currentConfig, candidate) then
        return presetName, nil
      end
    end
  end

  return nil, 'custom'
end

local function buildDiagnosticReport()
  local runtimeStatus = getRuntimeFileStatus()
  local missingFiles = checkRequiredHudFiles()
  local manifest, manifestErr = loadPresetManifest()
  local presetCount = manifest and countTableEntries(manifest.presets) or 0
  local matchedPreset, presetStatus = detectMatchingPreset()
  local backupIndex = loadBackupIndex()
  local backupCount = type(backupIndex.backups) == 'table' and #backupIndex.backups or 0
  local config = RuntimeConfig or getDefaults()

  return {
    resource = RESOURCE_NAME,
    admin_principal = Config.Admin and Config.Admin.principal or 'undefined',
    open_command = Config.Admin and Config.Admin.open_command or 'undefined',
    runtime = runtimeStatus,
    missing_files = missingFiles,
    presets = {
      enabled = Config.Presets and Config.Presets.enabled == true,
      command = Config.Presets and Config.Presets.command or 'disabled',
      manifest = getPresetManifestPath(),
      valid_manifest = manifest ~= nil,
      manifest_error = manifestErr,
      count = presetCount,
      matched = matchedPreset,
      status = presetStatus or 'ok'
    },
    backups = {
      enabled = areBackupsEnabled(),
      command = Config.Backups and Config.Backups.command or 'disabled',
      index = getBackupIndexPath(),
      count = backupCount,
      max_index_entries = getMaxBackupIndexEntries()
    },
    audit = {
      enabled = isAuditEnabled(),
      command = Config.Audit and Config.Audit.command or 'disabled',
      file = getAuditFilePath()
    },
    active = {
      minimap = config.general and config.general.minimap_style or 'undefined',
      minimap_visibility = config.general and config.general.minimap_visibility or 'undefined',
      speedometer = config.speedometer and config.speedometer.style or 'undefined',
      speedometer_enabled = config.speedometer and config.speedometer.enabled == true,
      weapon_enabled = config.weapon and config.weapon.enabled == true,
      logo_enabled = config.logo and config.logo.enabled == true
    }
  }
end


local function buildEditorPresetManager()
  local manifest, manifestErr = loadPresetManifest()
  local presets = {}

  if manifest then
    for _, presetName in ipairs(getSortedPresetNames(manifest)) do
      local entry = manifest.presets[presetName] or {}
      presets[#presets + 1] = {
        name = presetName,
        label = sanitizeText(entry.label, presetName, 64),
        recommended_for = sanitizeText(entry.recommended_for, '', 120),
        status_style = sanitizeText(entry.status_style, '', 24),
        speedometer_style = sanitizeText(entry.speedometer_style, '', 24),
        safe_for_production = entry.safe_for_production == true
      }
    end
  end

  local matchedPreset, presetStatus = detectMatchingPreset()
  local backupIndex = loadBackupIndex()
  local backupList = {}

  for i, entry in ipairs(backupIndex.backups or {}) do
    if i <= 5 then
      backupList[#backupList + 1] = {
        id = entry.id or 'unknown',
        created_at = entry.created_at or '',
        reason = entry.reason or '',
        source = entry.source or ''
      }
    end
  end

  return {
    ok = true,
    presets_enabled = Config.Presets and Config.Presets.enabled == true,
    manifest_error = manifest and nil or manifestErr,
    active_preset = matchedPreset or 'custom',
    preset_status = presetStatus or 'ok',
    presets = presets,
    backups = {
      enabled = areBackupsEnabled(),
      count = type(backupIndex.backups) == 'table' and #backupIndex.backups or 0,
      latest = backupList[1],
      recent = backupList
    },
    commands = {
      preset = Config.Presets and Config.Presets.command or 'mzhud_preset',
      backup = Config.Backups and Config.Backups.command or 'mzhud_backup'
    }
  }
end

local function printDiagnosticReport(report)
  print('[mz_hud] diagnostico:')
  print(('  resource: %s'):format(report.resource or 'unknown'))
  print(('  permissao/admin: %s'):format(report.admin_principal or 'undefined'))
  print(('  comando editor: /%s'):format(report.open_command or 'undefined'))
  print(('  runtime: %s | exists=%s | valid=%s | status=%s'):format(
    report.runtime.path or 'unknown',
    tostring(report.runtime.exists == true),
    tostring(report.runtime.valid == true),
    report.runtime.reason or 'unknown'
  ))
  print(('  config ativa: minimap=%s/%s | speedometer=%s | logo=%s | weapon=%s'):format(
    report.active.minimap or 'undefined',
    report.active.minimap_visibility or 'undefined',
    report.active.speedometer or 'undefined',
    tostring(report.active.logo_enabled == true),
    tostring(report.active.weapon_enabled == true)
  ))
  print(('  presets: enabled=%s | command=/%s | count=%s | matched=%s | status=%s'):format(
    tostring(report.presets.enabled == true),
    report.presets.command or 'disabled',
    tostring(report.presets.count or 0),
    report.presets.matched or 'custom',
    report.presets.status or 'unknown'
  ))
  print(('  backups: enabled=%s | command=/%s | count=%s | max_index=%s'):format(
    tostring(report.backups.enabled == true),
    report.backups.command or 'disabled',
    tostring(report.backups.count or 0),
    tostring(report.backups.max_index_entries or 0)
  ))
  print(('  auditoria: enabled=%s | command=/%s | file=%s'):format(
    tostring(report.audit.enabled == true),
    report.audit.command or 'disabled',
    report.audit.file or 'undefined'
  ))

  if #report.missing_files > 0 then
    print('[mz_hud] arquivos ausentes:')
    for _, path in ipairs(report.missing_files) do
      print(('  - %s'):format(path))
    end
  else
    print('[mz_hud] arquivos essenciais: ok')
  end
end

local function runDiagnosticsForSource(source)
  if not hasAdminAccess(source) then
    writeAudit('diagnostic_run', source, 'denied')
    sendAdminFeedback(source, {
      type = 'error',
      title = 'HUD Diagnostico',
      message = 'Sem permissao para diagnosticar a HUD.'
    })
    return
  end

  local report = buildDiagnosticReport()
  if source == 0 or (Config.Diagnostics and Config.Diagnostics.print_console_details == true) then
    printDiagnosticReport(report)
  end

  local health = 'OK'
  local messageType = 'success'
  if not report.runtime.valid or #report.missing_files > 0 then
    health = 'ATENCAO'
    messageType = 'warning'
  end

  writeAudit('diagnostic_run', source, messageType == 'success' and 'success' or 'warning', { runtime = report.runtime.reason or 'unknown', missing = #report.missing_files })

  if source ~= 0 then
    sendAdminFeedback(source, {
      type = messageType,
      title = 'HUD Diagnostico',
      message = ('%s | runtime=%s | preset=%s | backups=%s | ausentes=%s'):format(
        health,
        report.runtime.reason or 'unknown',
        report.presets.matched or 'custom',
        tostring(report.backups.count or 0),
        tostring(#report.missing_files)
      )
    })
  end
end

lib.callback.register('mz_hud:server:getBootstrap', function(source)
  return {
    config = deepCopy(RuntimeConfig or getDefaults()),
    defaults = deepCopy(getDefaults()),
    can_manage = hasAdminAccess(source)
  }
end)

lib.callback.register('mz_hud:server:getEditorPresetManager', function(source)
  if not hasAdminAccess(source) then
    writeAudit('editor_preset_meta', source, 'denied')
    return { ok = false, error = 'forbidden' }
  end

  writeAudit('editor_preset_meta', source, 'success')
  return buildEditorPresetManager()
end)

lib.callback.register('mz_hud:server:applyPresetFromEditor', function(source, presetName)
  if not hasAdminAccess(source) then
    writeAudit('editor_preset_apply', source, 'denied', { preset = presetName or '' })
    return { ok = false, error = 'forbidden' }
  end

  if not (Config.Presets and Config.Presets.enabled == true) then
    return { ok = false, error = 'disabled' }
  end

  local normalizedName = normalizePresetName(presetName)
  local preset, manifest, err = loadPresetConfig(normalizedName)
  if not preset then
    writeAudit('editor_preset_draft', source, 'failed', { preset = normalizedName or '', reason = err or 'unknown' })
    return { ok = false, error = err or 'unknown' }
  end

  local entry = getPresetEntry(manifest, normalizedName) or {}
  local draft = sanitizeHudConfig(deepMerge(getDefaults(), preset))
  draft.revision = tonumber(RuntimeConfig and RuntimeConfig.revision) or 0
  writeAudit('editor_preset_draft', source, 'success', { preset = normalizedName })
  return {
    ok = true,
    config = deepCopy(draft),
    label = entry.label or normalizedName or 'preset',
    manager = buildEditorPresetManager()
  }
end)

lib.callback.register('mz_hud:server:createBackupFromEditor', function(source)
  if not hasAdminAccess(source) then
    writeAudit('editor_backup_create', source, 'denied')
    return { ok = false, error = 'forbidden' }
  end

  local ok, backupIdOrErr = createRuntimeBackup('editor_manual', source, { note = 'editor_presets_card' })
  writeAudit('editor_backup_create', source, ok and 'success' or 'failed', { backup = ok and backupIdOrErr or '', reason = ok and 'manual' or (backupIdOrErr or 'unknown') })

  if not ok then
    return { ok = false, error = backupIdOrErr or 'unknown' }
  end

  return {
    ok = true,
    backup = backupIdOrErr,
    manager = buildEditorPresetManager()
  }
end)

local function saveConfigForSource(source, payload, requireRevision)
  if not hasAdminAccess(source) then
    writeAudit('editor_save', source, 'denied')
    notifyClient(source, {
      type = 'error',
      title = 'HUD',
      message = 'Sem permissao para editar a HUD.'
    })
    return false, 'forbidden'
  end

  local currentRevision = tonumber(RuntimeConfig and RuntimeConfig.revision) or 0
  local incomingRevision = type(payload) == 'table' and tonumber(payload.revision) or nil
  if requireRevision == true and incomingRevision ~= currentRevision then
    writeAudit('editor_save', source, 'conflict', { expected = currentRevision, received = incomingRevision or 'missing' })
    return false, 'revision_conflict', { revision = currentRevision, config = deepCopy(RuntimeConfig or getDefaults()) }
  end

  if getBackupConfig().auto_before_editor_save == true then
    local backupOk, backupErr = createAutoBackup('before_editor_save', source)
    if areBackupsEnabled() and not backupOk then
      writeAudit('editor_save', source, 'failed', { reason = backupErr or 'backup_failed' })
      return false, backupErr or 'backup_failed'
    end
  end

  local sanitized = sanitizeHudConfig(payload)
  sanitized.revision = currentRevision + 1
  RuntimeConfig = sanitized
  saveRuntimeConfig()
  broadcastConfig(-1)

  writeAudit('editor_save', source, 'success', { revision = RuntimeConfig.revision })

  notifyClient(source, {
    type = 'success',
    title = 'HUD',
    message = 'Configuracao da HUD aplicada para todos.'
  })
  return true, nil, deepCopy(RuntimeConfig)
end

lib.callback.register('mz_hud:server:saveEditorConfig', function(source, payload)
  local ok, err, extra = saveConfigForSource(source, payload, true)
  if not ok then
    return { ok = false, error = err or 'unknown', revision = extra and extra.revision, config = extra and extra.config }
  end
  return { ok = true, config = extra, revision = extra and extra.revision }
end)

RegisterNetEvent('mz_hud:server:saveConfig', function(payload)
  saveConfigForSource(source, payload, false)
end)

RegisterNetEvent('mz_hud:server:saveSettings', function(payload)
  saveConfigForSource(source, payload, false)
end)

RegisterNetEvent('mz_hud:server:resetConfig', function(payload)
  local source = source
  if not hasAdminAccess(source) then
    writeAudit('reset_event', source, 'denied')
    notifyClient(source, {
      type = 'error',
      title = 'HUD',
      message = 'Sem permissao para resetar a HUD.'
    })
    return
  end

  local module = type(payload) == 'table' and payload.module or nil
  local previousRevision = tonumber(RuntimeConfig and RuntimeConfig.revision) or 0
  if getBackupConfig().auto_before_reset == true then
    createAutoBackup(module == 'chat' and 'before_chat_reset' or 'before_reset', source, { module = module or 'all' })
  end

  if module == 'chat' then
    local defaults = getDefaults()
    RuntimeConfig = sanitizeHudConfig(RuntimeConfig or defaults)
    RuntimeConfig.chat = deepCopy(defaults.chat or {})
  else
    RuntimeConfig = getDefaults()
  end
  RuntimeConfig.revision = previousRevision + 1
  saveRuntimeConfig()
  broadcastConfig(-1)

  writeAudit('reset_event', source, 'success', { module = module or 'all' })

  notifyClient(source, {
    type = 'success',
    title = 'HUD',
    message = module == 'chat' and 'Chat resetado para o padrao.' or 'HUD resetada para o padrao.'
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
    writeAudit('editor_open', source, 'console_blocked')
    print('[mz_hud] use este comando dentro do jogo.')
    return
  end

  if not hasAdminAccess(source) then
    writeAudit('editor_open', source, 'denied')
    notifyClient(source, {
      type = 'error',
      title = 'HUD',
      message = 'Sem permissao para abrir o editor.'
    })
    return
  end

  writeAudit('editor_open', source, 'success')
  TriggerClientEvent('mz_hud:client:openEditor', source, deepCopy(RuntimeConfig or getDefaults()), deepCopy(getDefaults()))
end)

registerAdminCommand(Config.Admin and Config.Admin.reload_command, function(source)
  if not hasAdminAccess(source) then
    writeAudit('reload', source, 'denied')
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

  writeAudit('reload', source, 'success')

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
    writeAudit('reset_command', source, 'denied')
    if source ~= 0 then
      notifyClient(source, {
        type = 'error',
        title = 'HUD',
        message = 'Sem permissao para resetar a HUD.'
      })
    end
    return
  end

  if getBackupConfig().auto_before_reset == true then
    createAutoBackup('before_reset_command', source)
  end

  local previousRevision = tonumber(RuntimeConfig and RuntimeConfig.revision) or 0
  RuntimeConfig = getDefaults()
  RuntimeConfig.revision = previousRevision + 1
  saveRuntimeConfig()
  broadcastConfig(-1)

  writeAudit('reset_command', source, 'success')

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

if Config.Presets and Config.Presets.enabled == true and type(Config.Presets.command) == 'string' and Config.Presets.command ~= '' then
  RegisterCommand(Config.Presets.command, function(source, args)
    if not hasAdminAccess(source) then
      writeAudit('preset_command', source, 'denied', { args = table.concat(args or {}, ' ') })
      sendAdminFeedback(source, {
        type = 'error',
        title = 'HUD Presets',
        message = 'Sem permissao para usar presets da HUD.'
      })
      return
    end

    local subcommand = normalizePresetName(args and args[1] or nil)

    if not subcommand or subcommand == 'list' then
      showPresetList(source)
      return
    end

    if subcommand == 'apply' then
      applyPresetForSource(source, args and args[2] or nil)
      return
    end

    applyPresetForSource(source, subcommand)
  end, false)
end

if Config.Backups and Config.Backups.enabled == true and type(Config.Backups.command) == 'string' and Config.Backups.command ~= '' then
  RegisterCommand(Config.Backups.command, function(source, args)
    if not hasAdminAccess(source) then
      writeAudit('backup_command', source, 'denied', { args = table.concat(args or {}, ' ') })
      sendAdminFeedback(source, {
        type = 'error',
        title = 'HUD Backups',
        message = 'Sem permissao para usar backups da HUD.'
      })
      return
    end

    local subcommand = normalizePresetName(args and args[1] or nil)

    if not subcommand or subcommand == 'list' then
      showBackupList(source)
      return
    end

    if subcommand == 'create' or subcommand == 'save' then
      local note = ''
      if args and #args >= 2 then
        note = table.concat(args, ' ', 2)
      end

      local ok, backupIdOrErr = createRuntimeBackup('manual', source, { note = sanitizeText(note, '', 80) })
      writeAudit('backup_create', source, ok and 'success' or 'failed', { backup = ok and backupIdOrErr or '', reason = ok and 'manual' or (backupIdOrErr or 'unknown') })
      sendAdminFeedback(source, {
        type = ok and 'success' or 'error',
        title = 'HUD Backups',
        message = ok and ('Backup criado: %s'):format(backupIdOrErr) or ('Falha ao criar backup: %s'):format(backupIdOrErr or 'unknown')
      })
      return
    end

    if subcommand == 'restore' then
      restoreBackupForSource(source, args and args[2] or 'latest')
      return
    end

    if subcommand == 'latest' or subcommand == 'ultimo' then
      restoreBackupForSource(source, 'latest')
      return
    end

    writeAudit('backup_command', source, 'failed', { reason = 'invalid_usage', args = table.concat(args or {}, ' ') })
    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Backups',
      message = 'Uso: /mzhud_backup list | create | restore latest | restore [id]'
    })
  end, false)
end


if Config.Diagnostics and Config.Diagnostics.enabled == true and type(Config.Diagnostics.command) == 'string' and Config.Diagnostics.command ~= '' then
  RegisterCommand(Config.Diagnostics.command, function(source)
    runDiagnosticsForSource(source)
  end, false)
end


if Config.Audit and Config.Audit.enabled == true and type(Config.Audit.command) == 'string' and Config.Audit.command ~= '' then
  RegisterCommand(Config.Audit.command, function(source, args)
    if not hasAdminAccess(source) then
      writeAudit('audit_command', source, 'denied', { args = table.concat(args or {}, ' ') })
      sendAdminFeedback(source, {
        type = 'error',
        title = 'HUD Auditoria',
        message = 'Sem permissao para ver auditoria da HUD.'
      })
      return
    end

    local subcommand = normalizePresetName(args and args[1] or nil)
    if not subcommand or subcommand == 'recent' or subcommand == 'list' then
      local limit = tonumber(args and args[2]) or getAuditConfig().print_recent_count or 12
      writeAudit('audit_command', source, 'success', { mode = 'recent', limit = limit })
      showAuditRecent(source, limit)
      return
    end

    sendAdminFeedback(source, {
      type = 'warning',
      title = 'HUD Auditoria',
      message = 'Uso: /mzhud_audit ou /mzhud_audit recent [quantidade]'
    })
  end, false)
end

AddEventHandler('onResourceStart', function(resourceName)
  if resourceName ~= RESOURCE_NAME then
    return
  end

  loadRuntimeConfig()
  SetTimeout(1000, function()
    broadcastConfig(-1)
  end)
end)
