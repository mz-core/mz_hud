Config = Config or {}

--[[
  mz_hud - HUD global do mz_core

  Esta HUD é configurada pelo dono/desenvolvedor do servidor.
  O player comum não possui configuração individual de tema/layout.

  Fluxo de configuração:
    1. config.lua define o padrão inicial do resource.
    2. data/runtime_config.json guarda o preset global salvo pelo /mzhud.
    3. Quando existir, o runtime_config.json pode sobrescrever o padrão deste arquivo.

  Importante:
    - Não trocar a permissão atual sem revisar os demais scripts.
    - Não mudar o schema de Config.DefaultHUD sem manter compatibilidade com o editor/NUI.
]]

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

Config.Debug = Config.Debug or false
Config.EnableVoiceDebugCommand = Config.EnableVoiceDebugCommand or false

Config.Presets = {
  -- Comando administrativo para aplicar presets globais preparados em data/presets/.
  -- Continua usando a mesma permissao de Config.Admin.principal.
  enabled = true,
  command = 'mzhud_preset',
  manifest_file = 'data/presets/presets_manifest.json'
}


Config.Diagnostics = {
  -- Comando administrativo para diagnosticar rapidamente a HUD global do servidor.
  -- Nao altera configuracao, nao aplica preset e nao salva arquivo.
  -- Continua usando a mesma permissao de Config.Admin.principal.
  enabled = true,
  command = 'mzhud_diag',
  print_console_details = true
}


Config.Audit = {
  -- Auditoria local das ações administrativas da HUD.
  -- Nao envia webhook e nao adiciona dependencia externa.
  -- Registra alteracoes globais, presets, backups, diagnosticos e tentativas sem permissao.
  enabled = true,
  command = 'mzhud_audit',
  file = 'data/audit/mz_hud_audit.log',
  max_file_bytes = 512000,
  log_permission_denied = true,
  log_diagnostics = true,
  print_recent_count = 12
}

Config.Backups = {
  -- Sistema administrativo de backup da configuracao global da HUD.
  -- Util para voltar uma configuracao anterior apos salvar no editor, resetar ou aplicar preset.
  -- Continua usando a mesma permissao de Config.Admin.principal.
  enabled = true,
  command = 'mzhud_backup',
  directory = 'data/backups',
  index_file = 'data/backups/index.json',
  max_index_entries = 15,

  -- Backups automaticos antes de a configuracao global ser sobrescrita.
  auto_before_editor_save = true,
  auto_before_reset = true,
  auto_before_preset = true,
  auto_before_restore = true
}

Config.Polling = {
  hud_ms = 200,
  vehicle_ms = 100,
  weapon_ms = 50
}

Config.StatusAlerts = {
  enabled = true,
  cooldownMs = 60000,
  hunger = { threshold = 20, direction = 'low', title = 'Fome crítica' },
  thirst = { threshold = 20, direction = 'low', title = 'Sede crítica' },
  stress = { threshold = 80, direction = 'high', title = 'Estresse elevado' }
}

Config.Visibility = {
  hide_gta_hud = true
}

Config.Voice = {
  -- O pma-voice nao emite evento de fala local para a HUD. Quando as natives
  -- nao retornarem true, este fallback usa controles comuns de push-to-talk.
  ptt_fallback = true,
  ptt_controls = { 249 },
  talking_hold_ms = 650
}

-- Configuração visual padrão.
-- O editor global (/mzhud) salva alterações em Config.Storage.runtime_file.
-- Mantenha os nomes atuais das chaves para preservar compatibilidade com a NUI.
--
-- Catálogo rápido de modelos oficiais:
--   minimap_style: circle | square | default
--   speedometer.style: digital | analog | minimal | racing | classic | apex | vector
--   elements.*.style: circle | bar | square | pill | apex | comms
--   elements.*.icon: nome do icone no catalogo, ex: heart, health_1, armor_2
--   speedometer.icons.*: nomes do catalogo vehicle, ex: fuel, fuel_1, engine_2
--
-- Observação:
--   "apex" é o nome oficial do modelo visual principal da mz_hud.
--   Presets globais de exemplo ficam em docs/PRESETS.md, docs/presets/ e data/presets/.
Config.DefaultHUD = {
  general = {
    show_minimap = true,
    minimap_style = 'square', -- circle | square | default
    minimap_visibility = 'vehicle', -- always | vehicle | foot | never
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
    free = true,
    x = 88,
    y = 82,
    style = 'apex', -- modelos oficiais: digital | analog | minimal | racing | classic | apex | vector
    unit = 'kmh',
    icons = {
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
    },
    show_speed = true,
    show_rpm = true,
    show_fuel = true,
    show_gear = true,
    show_seatbelt = true,
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
  chat = {
    enabled = true,
    preset = 'left-top',
    free = false,
    x = 2,
    y = 3,
    scale = 1.0,
    opacity = 1.0
  },
  elements = {
    health = {
      enabled = true,
      label = 'Vida',
      icon = 'heart',
      style = 'circle', -- modelos oficiais: circle | bar | square | pill | apex
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
      style = 'comms', -- modelo oficial para voz/radio nesta fase
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
      style = 'comms', -- modelo oficial para voz/radio nesta fase
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
