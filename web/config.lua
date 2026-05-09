--[[
  ARQUIVO LEGADO / NÃO USADO

  Este arquivo foi mantido apenas para histórico.
  Ele NÃO é carregado pelo fxmanifest.lua e NÃO deve ser usado
  como fonte ativa de configuração da mz_hud.

  Configuração ativa:
    - config.lua
    - data/runtime_config.json, quando salvo pelo editor /mzhud

  Evite editar este arquivo para configurar a HUD.
]]

Config = Config or {}

Config.Admin = {
  -- Principal padrao do starter. O recurso checa se algum identifier do player
  -- herda este grupo via add_principal no cfg/permissions.cfg.
  principal = 'group.mz_owner',
  allow_console = true,
  open_command = 'mzhud',
  reload_command = 'mzhud_reload',
  reset_command = 'mzhud_reset'
}

Config.Storage = {
  runtime_file = 'data/runtime_config.json'
}

Config.Polling = {
  hud_ms = 200,
  vehicle_ms = 100,
  weapon_ms = 200
}

Config.Visibility = {
  hide_gta_hud = true
}

Config.DefaultHUD = {
  general = {
    show_minimap = true,
    minimap_style = 'circle', -- circle | square | default
    minimap_visibility = 'always', -- always | vehicle | foot | never
    minimap_x = 24,
    minimap_y = 24,
    hud_position = 'bottom-left',
    status_group = { enabled = true, position = 'bottom-center', free = true, x = 50, y = 94, opacity = 100, scale = 100, gap = 8 },
    global_opacity = 100,
    scale = 100
  },
  logo = {
    enabled = true,
    image_url = 'https://raw.githubusercontent.com/mz-core/mz_core/refs/heads/main/assets/logo.png',
    width = 140,
    height = 44,
    opacity = 90,
    position = 'top-center',
    show_only_in_vehicle = false
  },
  speedometer = {
    enabled = true,
    position = 'bottom-right',
    free = false,
    x = 88,
    y = 82,
    style = 'digital', -- digital | analog | minimal | racing | classic | apex | vector
    unit = 'kmh',
    show_speed = true,
    show_rpm = true,
    show_fuel = true,
    show_gear = true,
    show_seatbelt = false,
    show_lights = true,
    show_lock = true,
    show_engine = true,
    primary_color = '#ffffff',
    secondary_color = '#3b82f6',
    accent_color = '#ef4444',
    background_color = '#000000',
    opacity = 94,
    scale = 100
  },
  weapon = {
    enabled = true,
    position = 'bottom-right',
    free = true,
    x = 88,
    y = 78,
    show_image = true,
    show_ammo = true,
    show_name = false,
    icon_model = 'default',
    image_model = 'default',
    opacity = 92,
    scale = 100
  },
  elements = {
    health = {
      enabled = true,
      label = 'Vida',
      icon = 'heart',
      style = 'circle', -- circle | bar | square | pill | apex
      color = '#ef4444',
      opacity = 100,
      position = 'bottom-center',
      free = true,
      x = 48,
      y = 95,
      scale = 100,
      individual = false
    },
    armor = {
      enabled = true,
      label = 'Colete',
      icon = 'shield',
      style = 'circle',
      color = '#3b82f6',
      opacity = 100,
      position = 'bottom-center',
      free = true,
      x = 45,
      y = 95,
      scale = 100,
      individual = false
    },
    hunger = {
      enabled = true,
      label = 'Fome',
      icon = 'utensils',
      style = 'circle',
      color = '#f97316',
      opacity = 100,
      position = 'bottom-center',
      free = true,
      x = 54,
      y = 95,
      scale = 100,
      individual = false
    },
    thirst = {
      enabled = true,
      label = 'Sede',
      icon = 'droplet',
      style = 'circle',
      color = '#06b6d4',
      opacity = 100,
      position = 'bottom-center',
      free = true,
      x = 57,
      y = 95,
      scale = 100,
      individual = false
    },
    stamina = {
      enabled = true,
      label = 'Stamina',
      icon = 'zap',
      style = 'circle',
      color = '#eab308',
      opacity = 100,
      position = 'bottom-center',
      free = true,
      x = 42,
      y = 95,
      scale = 100,
      individual = false
    },
    oxygen = {
      enabled = false,
      label = 'Oxigenio',
      icon = 'wind',
      style = 'circle',
      color = '#8b5cf6',
      opacity = 100,
      position = 'bottom-center',
      free = true,
      x = 60,
      y = 95,
      scale = 100,
      individual = false
    },
    stress = {
      enabled = false,
      label = 'Stress',
      icon = 'brain',
      style = 'circle',
      color = '#ec4899',
      opacity = 100,
      position = 'bottom-center',
      free = true,
      x = 63,
      y = 95,
      scale = 100,
      individual = false
    },
    voice = {
      enabled = true,
      label = 'Voz',
      icon = 'mic',
      style = 'comms',
      color = '#22c55e',
      opacity = 100,
      position = 'top-right',
      free = true,
      x = 90,
      y = 10,
      scale = 100,
      individual = true,
      comms_options = {
        show_label = true,
        show_level_text = true,
        show_talking_text = true,
        inactive_opacity = 72
      }
    },
    radio = {
      enabled = true,
      label = 'Radio',
      icon = 'radio',
      style = 'comms',
      color = '#14b8a6',
      opacity = 100,
      position = 'top-right',
      free = true,
      x = 80,
      y = 10,
      scale = 100,
      individual = true,
      comms_options = {
        show_frequency = true,
        show_inactive = true,
        show_talking_text = true,
        inactive_text = 'OFF',
        frequency_suffix = 'MHz'
      }
    }
  }
}
