(function () {
  "use strict";

const selectOptions = {
  hudPosition: [
    "bottom-left",
    "bottom-center",
    "bottom-right",
    "center-left",
    "center",
    "center-right",
    "top-left",
    "top-center",
    "top-right",
  ],
  minimapStyle: ["circle", "square", "default"],
  minimapVisibility: ["always", "vehicle", "foot", "never"],
  speedometerPosition: [
    "bottom-left",
    "bottom-center",
    "bottom-right",
    "center-left",
    "center",
    "center-right",
    "top-left",
    "top-center",
    "top-right",
  ],
  unit: ["kmh", "mph"],
  speedometerStyle: [
    "digital",
    "analog",
    "minimal",
    "racing",
    "classic",
    "hudzip",
  ],
  logoPosition: [
    "bottom-left",
    "bottom-center",
    "bottom-right",
    "center-left",
    "center",
    "center-right",
    "top-left",
    "top-center",
    "top-right",
  ],
  icon: [
    "heart",
    "shield",
    "utensils",
    "droplet",
    "zap",
    "wind",
    "brain",
    "mic",
    "radio",
  ],
  elementStyle: ["circle", "bar", "square", "pill", "hudzip"],
  itemPosition: [
    "bottom-left",
    "bottom-center",
    "bottom-right",
    "center-left",
    "center",
    "center-right",
    "top-left",
    "top-center",
    "top-right",
  ],
};

const labels = {
  "bottom-left": "Esquerda inferior",
  "bottom-center": "Centro inferior",
  "bottom-right": "Direita inferior",
  "center-left": "Esquerda centro",
  center: "Centro",
  "center-right": "Direita centro",
  "top-left": "Esquerda superior",
  "top-center": "Centro superior",
  "top-right": "Direita superior",
  circle: "Círculo",
  bar: "Barra",
  square: "Quadrado",
  pill: "Pílula",
  default: "Padrão",
  always: "Sempre ativo",
  vehicle: "Só no carro",
  foot: "Só a pé",
  never: "Nunca",
  kmh: "KM/H",
  mph: "MPH",
  digital: "Digital",
  analog: "Analógico",
  minimal: "Minimalista",
  racing: "Racing",
  classic: "Clássico",
  hudzip: "HUD.zip",
};

const colorPresets = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];

const speedometerThemes = {
  blue: {
    primary_color: "#ffffff",
    secondary_color: "#3b82f6",
    accent_color: "#ef4444",
    background_color: "#000000",
  },
  red: {
    primary_color: "#ffffff",
    secondary_color: "#ef4444",
    accent_color: "#f97316",
    background_color: "#080808",
  },
  green: {
    primary_color: "#ffffff",
    secondary_color: "#22c55e",
    accent_color: "#eab308",
    background_color: "#020617",
  },
  purple: {
    primary_color: "#ffffff",
    secondary_color: "#8b5cf6",
    accent_color: "#ec4899",
    background_color: "#050314",
  },
  orange: {
    primary_color: "#ffffff",
    secondary_color: "#f97316",
    accent_color: "#ef4444",
    background_color: "#090604",
  },
  mono: {
    primary_color: "#f8fafc",
    secondary_color: "#94a3b8",
    accent_color: "#ffffff",
    background_color: "#000000",
  },
};

const minimapQuickPosition = {
  "bottom-left": { x: 24, y: 24 },
  "bottom-center": { x: 860, y: 24 },
  "bottom-right": { x: 1660, y: 24 },
  "center-left": { x: 24, y: 420 },
  center: { x: 860, y: 420 },
  "center-right": { x: 1660, y: 420 },
  "top-left": { x: 24, y: 760 },
  "top-center": { x: 860, y: 760 },
  "top-right": { x: 1660, y: 760 },
};

const statusGroupQuickPosition = {
  "bottom-left": { x: 8, y: 94 },
  "bottom-center": { x: 50, y: 94 },
  "bottom-right": { x: 92, y: 94 },
  "center-left": { x: 8, y: 50 },
  center: { x: 50, y: 50 },
  "center-right": { x: 92, y: 50 },
  "top-left": { x: 8, y: 6 },
  "top-center": { x: 50, y: 6 },
  "top-right": { x: 92, y: 6 },
};

function applyMinimapQuickPosition(position) {
  const preset = minimapQuickPosition[position];
  if (!preset) return;
  const x = document.getElementById("general-minimap-x");
  const y = document.getElementById("general-minimap-y");
  if (x) x.value = preset.x;
  if (y) y.value = preset.y;
}

function applyStatusGroupQuickPosition(position) {
  const preset = statusGroupQuickPosition[position];
  if (!preset) return;
  const free = document.getElementById("status-group-free");
  const x = document.getElementById("status-group-x");
  const y = document.getElementById("status-group-y");
  if (free) free.checked = false;
  if (x) x.value = preset.x;
  if (y) y.value = preset.y;
}

const iconAssets = {
  heart: "./assets/icons/status/default/health.svg",
  shield: "./assets/icons/status/default/armor.svg",
  utensils: "./assets/icons/status/default/hunger.svg",
  droplet: "./assets/icons/status/default/thirst.svg",
  zap: "./assets/icons/status/default/stamina.svg",
  wind: "./assets/icons/status/default/oxygen.svg",
  brain: "./assets/icons/status/default/stress.svg",
  mic: "./assets/icons/comms/default/voice.svg",
  radio: "./assets/icons/comms/default/radio.svg",
};

const iconMap = Object.fromEntries(
  Object.keys(iconAssets).map((name) => [
    name,
    '<span class="hud-icon-mask" style="--icon-url: url(\'' + iconAssets[name] + '\')"></span>',
  ]),
);

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function setSelectOptions(select, values) {
  if (!select) return;
  select.innerHTML = values
    .map(
      (value) => `<option value="${value}">${labels[value] || value}</option>`,
    )
    .join("");
}

function cacheStaticOptions() {
  setSelectOptions(
    document.getElementById("general-hud-position"),
    selectOptions.hudPosition,
  );
  setSelectOptions(
    document.getElementById("general-minimap-style"),
    selectOptions.minimapStyle,
  );
  setSelectOptions(
    document.getElementById("general-minimap-visibility"),
    selectOptions.minimapVisibility,
  );
  setSelectOptions(
    document.getElementById("status-group-position"),
    selectOptions.itemPosition,
  );
  setSelectOptions(
    document.getElementById("speedometer-position"),
    selectOptions.speedometerPosition,
  );
  setSelectOptions(
    document.getElementById("speedometer-style"),
    selectOptions.speedometerStyle,
  );
  setSelectOptions(
    document.getElementById("speedometer-unit"),
    selectOptions.unit,
  );
  setSelectOptions(
    document.getElementById("logo-position"),
    selectOptions.logoPosition,
  );
  setSelectOptions(
    document.getElementById("weapon-position"),
    selectOptions.speedometerPosition,
  );
}

function getHudPositionClass(position) {
  return `hud-position-${position || "bottom-left"}`;
}
function getLogoPositionClass(position) {
  return `logo-${position || "top-center"}`;
}
function getSpeedometerPositionClass(position) {
  return `speedometer-${position || "bottom-right"}`;
}
function getItemPositionClass(position) {
  return `hud-anchor-${position || "bottom-center"}`;
}

const defaultElementLayout = {
  stamina: { position: "bottom-center", free: true, x: 42, y: 95, scale: 100 },
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

function getStatusGroupPositionClass(position) {
  return `hud-group-anchor-${position || "bottom-center"}`;
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
    free: entry.free !== undefined ? Boolean(entry.free) : Boolean(layout.free),
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
    show_speed:
      speedometer.show_speed !== undefined
        ? Boolean(speedometer.show_speed)
        : true,
    show_rpm:
      speedometer.show_rpm !== undefined ? Boolean(speedometer.show_rpm) : true,
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

function normalizeConfig(config) {
  if (!config) return config;
  const normalized = deepClone(config);
  normalized.general = normalized.general || {};
  normalized.general.status_group = withStatusGroupDefaults(
    normalized.general.status_group || {},
  );
  normalized.speedometer = withSpeedometerDefaults(
    normalized.speedometer || {},
  );
  normalized.weapon = withWeaponDefaults(normalized.weapon || {});
  normalized.elements = normalized.elements || {};
  Object.keys(normalized.elements).forEach((key) => {
    normalized.elements[key] = withElementDefaults(
      key,
      normalized.elements[key],
    );
  });
  return normalized;
}

function getWeaponPositionClass(position) {
  return `weapon-${position || "bottom-right"}`;
}

function weaponImagePath(name, model = "default") {
  const safe = String(name || "weapon_unarmed")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  const safeModel = String(model || "default")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return `./assets/weapons/${safeModel}/${safe}.png`;
}

function prettyWeaponName(name) {
  return String(name || "weapon")
    .replace(/^weapon_/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}



  window.MZHudCore = {
    selectOptions, labels, colorPresets, speedometerThemes,
    minimapQuickPosition, statusGroupQuickPosition,
    applyMinimapQuickPosition, applyStatusGroupQuickPosition,
    iconAssets, iconMap, escapeHTML, deepClone, setSelectOptions, cacheStaticOptions,
    getHudPositionClass, getLogoPositionClass, getSpeedometerPositionClass, getItemPositionClass,
    defaultElementLayout, defaultCommsOptions, withCommsOptions,
    voiceLevelFromStatus, formatRadioFrequency,
    withStatusGroupDefaults, statusGroupInlineStyle, getStatusGroupPositionClass,
    withElementDefaults, withSpeedometerDefaults, withWeaponDefaults, normalizeConfig,
    getWeaponPositionClass, weaponImagePath, prettyWeaponName,
  };

  // Compatibilidade: alguns trechos antigos do app/editor podem chamar helpers
  // diretamente no escopo global. Mantemos esses aliases para evitar quebra.
  Object.assign(window, window.MZHudCore);
})();
