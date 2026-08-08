MZHudStatusContract = MZHudStatusContract or {}

local function clamp(value, minimum, maximum, fallback)
  local number = tonumber(value)
  if not number then return fallback end
  number = math.floor(number)
  if number < minimum then return minimum end
  if number > maximum then return maximum end
  return number
end

function MZHudStatusContract.create(alertConfig)
  return {
    revision = -1,
    deathState = 'alive',
    metadata = {},
    alerts = {},
    config = type(alertConfig) == 'table' and alertConfig or {}
  }
end

function MZHudStatusContract.apply(runtime, payload, current)
  if type(runtime) ~= 'table' or type(payload) ~= 'table' or type(payload.revision) ~= 'number'
    or type(payload.status) ~= 'table' or type(payload.death) ~= 'table' then return false, 'invalid_payload' end
  local revision = math.floor(payload.revision)
  if revision <= (tonumber(runtime.revision) or -1) then return false, 'stale_revision' end
  local deathState = tostring(payload.death.state or 'alive')
  if deathState ~= 'alive' and deathState ~= 'downed' and deathState ~= 'dead' and deathState ~= 'respawning' then
    return false, 'invalid_death_state'
  end
  local metadata = {
    hunger = clamp(payload.status.hunger, 0, 100, 100),
    thirst = clamp(payload.status.thirst, 0, 100, 100),
    stress = clamp(payload.status.stress, 0, 100, 0),
    health = clamp(payload.status.health, 0, 200, 200),
    armor = clamp(payload.status.armor, 0, 100, 0),
    deathState = deathState,
    isdead = payload.death.isdead == true,
    inlaststand = payload.death.inlaststand == true
  }
  runtime.revision = revision
  runtime.deathState = deathState
  runtime.metadata = metadata
  local triggered = {}
  local cfg = runtime.config or {}
  if cfg.enabled == false or deathState ~= 'alive' then
    runtime.alerts = {}
    return true, { metadata = metadata, alerts = triggered }
  end
  current = tonumber(current) or 0
  for _, name in ipairs({ 'hunger', 'thirst', 'stress' }) do
    local definition = cfg[name] or {}
    local value, threshold = metadata[name], tonumber(definition.threshold)
    local inRange = threshold and (
      (definition.direction == 'high' and value >= threshold)
      or (definition.direction ~= 'high' and value <= threshold)
    ) or false
    local state = runtime.alerts[name] or { active = false, lastAt = -1000000 }
    if inRange and not state.active and current - state.lastAt >= (tonumber(cfg.cooldownMs) or 60000) then
      triggered[#triggered + 1] = { name = name, value = value, title = definition.title or name }
      state.lastAt = current
    end
    state.active = inRange
    runtime.alerts[name] = state
  end
  return true, { metadata = metadata, alerts = triggered }
end
