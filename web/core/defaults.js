(function () {
  "use strict";

  const core = (window.MZHudCore = window.MZHudCore || {});

  const defaultElementLayout = {
    stamina: {
      position: "bottom-center",
      free: true,
      x: 42,
      y: 95,
      scale: 100,
    },
    armor: { position: "bottom-center", free: true, x: 45, y: 95, scale: 100 },
    health: { position: "bottom-center", free: true, x: 48, y: 95, scale: 100 },
    voice: { position: "top-right", free: true, x: 90, y: 10, scale: 100 },
    radio: { position: "top-right", free: true, x: 80, y: 10, scale: 100 },
    hunger: { position: "bottom-center", free: true, x: 54, y: 95, scale: 100 },
    thirst: { position: "bottom-center", free: true, x: 57, y: 95, scale: 100 },
    oxygen: { position: "bottom-center", free: true, x: 60, y: 95, scale: 100 },
    stress: { position: "bottom-center", free: true, x: 63, y: 95, scale: 100 },
  };

  const defaultCommsOptions = {
    voice: {
      show_label: true,
      show_level_text: true,
      show_talking_text: true,
      inactive_opacity: 72,
    },
    radio: {
      show_frequency: true,
      show_inactive: true,
      show_talking_text: true,
      inactive_text: "OFF",
      frequency_suffix: "MHz",
    },
  };

  function withCommsOptions(key, options = {}) {
    return { ...(defaultCommsOptions[key] || {}), ...(options || {}) };
  }

  function voiceLevelFromStatus(status = {}) {
    const raw = String(
      status.voiceMode || status.voiceLabel || "",
    ).toLowerCase();
    const value = Number(status.voice) || 66;
    if (
      raw.includes("baixo") ||
      raw.includes("baixa") ||
      raw.includes("whisper") ||
      value <= 40
    )
      return { level: 1, key: "low", label: "Baixo" };
    if (
      raw.includes("alto") ||
      raw.includes("alta") ||
      raw.includes("shout") ||
      value >= 90
    )
      return { level: 3, key: "high", label: "Alto" };
    return { level: 2, key: "normal", label: "Normal" };
  }

  function formatRadioFrequency(channel, suffix = "MHz") {
    const numeric = Number(channel);
    if (!numeric || numeric <= 0) return "";
    const text = Number.isInteger(numeric)
      ? String(numeric)
      : numeric.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return `${text} ${suffix || "MHz"}`;
  }

  function withStatusGroupDefaults(group = {}) {
    return {
      enabled: group.enabled !== undefined ? Boolean(group.enabled) : true,
      position: group.position || "bottom-center",
      free: group.free !== undefined ? Boolean(group.free) : true,
      x: Number(group.x ?? 50),
      y: Number(group.y ?? 94),
      opacity: Number(group.opacity ?? 100),
      scale: Number(group.scale ?? 100),
      gap: Number(group.gap ?? 8),
    };
  }

  function statusGroupInlineStyle(group = {}) {
    const item = withStatusGroupDefaults(group);
    const opacity = Math.max(0, Math.min(100, Number(item.opacity) || 0)) / 100;
    const scale = Math.max(40, Math.min(200, Number(item.scale) || 100)) / 100;
    const x = Math.max(0, Math.min(100, Number(item.x) || 0));
    const y = Math.max(0, Math.min(100, Number(item.y) || 0));
    const gap = Math.max(0, Math.min(40, Number(item.gap) || 0));
    return `--group-opacity:${opacity};--group-scale:${scale};--group-x:${x}%;--group-y:${y}%;--group-gap:${gap}px`;
  }

  function withElementDefaults(key, entry = {}) {
    const layout = defaultElementLayout[key] || {
      position: "bottom-center",
      free: true,
      x: 50,
      y: 95,
      scale: 100,
    };
    return {
      ...entry,
      position: entry.position || layout.position,
      free:
        entry.free !== undefined ? Boolean(entry.free) : Boolean(layout.free),
      x: Number(entry.x ?? layout.x),
      y: Number(entry.y ?? layout.y),
      scale: Number(entry.scale ?? layout.scale),
      opacity: Number(entry.opacity ?? 100),
      individual:
        entry.individual !== undefined
          ? Boolean(entry.individual)
          : key === "voice" || key === "radio",
      comms_options:
        key === "voice" || key === "radio"
          ? withCommsOptions(key, entry.comms_options || {})
          : entry.comms_options,
    };
  }


  function withSpeedometerIconDefaults(icons = {}) {
    const defaults = {
      fuel: "fuel",
      engine: "engine",
      engine_indicator: "turn",
      belt: "belt",
      unbelt: "unbelt",
      light: "light",
      light_high: "lightHigh",
      light_off: "lightOff",
      arrow: "arrow",
      arrow_active: "arrowActive",
      speed: "speed",
      rpm: "rpm",
      gear: "gear",
      weapon: "weapon",
      ammo: "ammo",
    };
    return { ...defaults, ...(icons || {}) };
  }

  function withSpeedometerDefaults(speedometer = {}) {
    return {
      enabled:
        speedometer.enabled !== undefined ? Boolean(speedometer.enabled) : true,
      position: speedometer.position || "bottom-right",
      free: speedometer.free !== undefined ? Boolean(speedometer.free) : false,
      x: Number(speedometer.x ?? 88),
      y: Number(speedometer.y ?? 82),
      style: speedometer.style || "digital",
      unit: speedometer.unit || "kmh",
      icons: withSpeedometerIconDefaults(speedometer.icons || {}),
      show_speed:
        speedometer.show_speed !== undefined
          ? Boolean(speedometer.show_speed)
          : true,
      show_rpm:
        speedometer.show_rpm !== undefined
          ? Boolean(speedometer.show_rpm)
          : true,
      show_fuel:
        speedometer.show_fuel !== undefined
          ? Boolean(speedometer.show_fuel)
          : true,
      show_gear:
        speedometer.show_gear !== undefined
          ? Boolean(speedometer.show_gear)
          : true,
      show_seatbelt: speedometer.show_seatbelt === true,
      show_lights:
        speedometer.show_lights !== undefined
          ? Boolean(speedometer.show_lights)
          : true,
      show_engine:
        speedometer.show_engine !== undefined
          ? Boolean(speedometer.show_engine)
          : true,
      primary_color: speedometer.primary_color || "#ffffff",
      secondary_color: speedometer.secondary_color || "#3b82f6",
      accent_color: speedometer.accent_color || "#ef4444",
      background_color: speedometer.background_color || "#000000",
      opacity: Number(speedometer.opacity ?? 94),
      scale: Number(speedometer.scale ?? 100),
    };
  }

  function withWeaponDefaults(weapon = {}) {
    return {
      enabled: weapon.enabled !== undefined ? Boolean(weapon.enabled) : true,
      position: weapon.position || "bottom-right",
      free: weapon.free !== undefined ? Boolean(weapon.free) : true,
      x: Number(weapon.x ?? 88),
      y: Number(weapon.y ?? 78),
      show_image:
        weapon.show_image !== undefined ? Boolean(weapon.show_image) : true,
      show_ammo:
        weapon.show_ammo !== undefined ? Boolean(weapon.show_ammo) : true,
      show_name: weapon.show_name === true,
      icon_model: weapon.icon_model || "default",
      image_model: weapon.image_model || "default",
      opacity: Number(weapon.opacity ?? 92),
      scale: Number(weapon.scale ?? 100),
    };
  }

  function withChatDefaults(chat = {}) {
    return {
      enabled: chat.enabled !== undefined ? Boolean(chat.enabled) : true,
      preset: chat.preset || "left-top",
      free: chat.free !== undefined ? Boolean(chat.free) : false,
      x: Number(chat.x ?? 2),
      y: Number(chat.y ?? 3),
      scale: Number(chat.scale ?? 1.0),
      opacity: Number(chat.opacity ?? 1.0),
    };
  }

  function normalizeConfig(config) {
    if (!config) return config;
    const normalized = core.deepClone(config);
    normalized.general = normalized.general || {};
    normalized.general.status_group = withStatusGroupDefaults(
      normalized.general.status_group || {},
    );
    normalized.speedometer = withSpeedometerDefaults(
      normalized.speedometer || {},
    );
    normalized.weapon = withWeaponDefaults(normalized.weapon || {});
    normalized.chat = withChatDefaults(normalized.chat || {});
    normalized.elements = normalized.elements || {};
    Object.keys(normalized.elements).forEach((key) => {
      normalized.elements[key] = withElementDefaults(
        key,
        normalized.elements[key],
      );
    });
    return normalized;
  }

  Object.assign(core, {
    defaultElementLayout,
    defaultCommsOptions,
    withCommsOptions,
    voiceLevelFromStatus,
    formatRadioFrequency,
    withStatusGroupDefaults,
    statusGroupInlineStyle,
    withElementDefaults,
    withSpeedometerIconDefaults,
    withSpeedometerDefaults,
    withWeaponDefaults,
    withChatDefaults,
    normalizeConfig,
  });
})();
