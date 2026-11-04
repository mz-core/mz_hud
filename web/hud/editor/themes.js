(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MZHudThemes = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  // Papéis semânticos da paleta global (Wave 1). Ordem estável e não traduzida.
  const ROLES = [
    "primary",
    "secondary",
    "accent",
    "text",
    "background",
    "border",
    "success",
    "warning",
    "danger",
  ];

  // Elementos de status/comunicação que aceitam override por componente.
  const STATUS_KEYS = [
    "stamina",
    "armor",
    "health",
    "hunger",
    "thirst",
    "oxygen",
    "stress",
    "voice",
    "radio",
  ];

  // Mapeamento slot concreto do velocímetro -> papel semântico.
  // primary_color é o texto/aro dominante; secondary_color é a cor de marca
  // (barras/marcha); accent_color é o "quente" (combustível baixo/corte);
  // background_color é o painel.
  const SPEEDOMETER_SLOT_ROLES = {
    primary_color: "text",
    secondary_color: "primary",
    accent_color: "danger",
    background_color: "background",
  };
  const SPEEDOMETER_ROLES = [
    "text",
    "primary",
    "danger",
    "background",
  ];

  // Papéis consumidos por status/voz/rádio (override permitido).
  const ELEMENT_ROLES = ["primary", "secondary", "background", "text", "border"];

  // Presets imutáveis de tema. Paletas coerentes, com texto claro sobre fundo escuro.
  const THEME_PRESETS = {
    mz_cyan: {
      label: "MZ Cyan",
      palette: {
        primary: "#22d3ee",
        secondary: "#67e8f9",
        accent: "#38bdf8",
        text: "#f0fdfa",
        background: "#020617",
        border: "#164e63",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
    },
    midnight: {
      label: "Midnight",
      palette: {
        primary: "#60a5fa",
        secondary: "#93c5fd",
        accent: "#38bdf8",
        text: "#eff6ff",
        background: "#0b1220",
        border: "#1e3a5f",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    },
    arctic: {
      label: "Arctic",
      palette: {
        primary: "#7dd3fc",
        secondary: "#bae6fd",
        accent: "#a5f3fc",
        text: "#f8fafc",
        background: "#0c1a2b",
        border: "#27496b",
        success: "#4ade80",
        warning: "#fcd34d",
        danger: "#fb7185",
      },
    },
    emerald: {
      label: "Emerald",
      palette: {
        primary: "#34d399",
        secondary: "#6ee7b7",
        accent: "#2dd4bf",
        text: "#ecfdf5",
        background: "#031711",
        border: "#065f46",
        success: "#4ade80",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    },
    amber: {
      label: "Amber",
      palette: {
        primary: "#f59e0b",
        secondary: "#fbbf24",
        accent: "#fb923c",
        text: "#fffbeb",
        background: "#1a1203",
        border: "#78350f",
        success: "#34d399",
        warning: "#f97316",
        danger: "#ef4444",
      },
    },
    crimson: {
      label: "Crimson",
      palette: {
        primary: "#f43f5e",
        secondary: "#fb7185",
        accent: "#f97316",
        text: "#fff1f2",
        background: "#1c0406",
        border: "#7f1d1d",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#dc2626",
      },
    },
    violet: {
      label: "Violet",
      palette: {
        primary: "#a78bfa",
        secondary: "#c4b5fd",
        accent: "#818cf8",
        text: "#f5f3ff",
        background: "#120518",
        border: "#4c1d95",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    },
    monochrome: {
      label: "Monochrome",
      palette: {
        primary: "#f8fafc",
        secondary: "#cbd5e1",
        accent: "#94a3b8",
        text: "#f1f5f9",
        background: "#020617",
        border: "#334155",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    },
  };

  const DEFAULT_THEME_ID = "mz_cyan";
  const DEFAULT_PALETTE = THEME_PRESETS[DEFAULT_THEME_ID].palette;

  const SPEEDOMETER_DEFAULT_SLOTS = {
    primary_color: "#ffffff",
    secondary_color: "#3b82f6",
    accent_color: "#ef4444",
    background_color: "#000000",
  };

  function isValidHex(value) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function normalizeHex(value) {
    return isValidHex(value) ? value.toLowerCase() : null;
  }

  function getComponentRoles(componentId) {
    if (componentId === "speedometer") return SPEEDOMETER_ROLES;
    if (STATUS_KEYS.indexOf(componentId) !== -1) return ELEMENT_ROLES;
    return null;
  }

  // Normaliza a aparência fechando enums, preenchendo a paleta e limpando
  // overrides fora da whitelist. Chaves desconhecidas são descartadas.
  function normalizeAppearance(appearance) {
    const source = appearance && typeof appearance === "object" ? appearance : {};
    const mode = ["legacy", "preset", "custom"].indexOf(source.mode) !== -1
      ? source.mode
      : "legacy";
    const theme = mode === "preset" && THEME_PRESETS[source.theme]
      ? source.theme
      : "";

    // Em modo preset a paleta é canônica do preset (evita estado inconsistente).
    const paletteSource = (mode === "preset" && THEME_PRESETS[theme])
      ? THEME_PRESETS[theme].palette
      : (source.palette && typeof source.palette === "object" ? source.palette : {});
    const palette = {};
    for (let i = 0; i < ROLES.length; i += 1) {
      const role = ROLES[i];
      palette[role] = normalizeHex(paletteSource[role]) || DEFAULT_PALETTE[role];
    }

    const overrides = {};
    if (source.overrides && typeof source.overrides === "object") {
      Object.keys(source.overrides).forEach((componentId) => {
        const allowed = getComponentRoles(componentId);
        if (!allowed) return;
        const entry = source.overrides[componentId];
        if (!entry || typeof entry !== "object") return;
        const cleaned = {};
        for (let i = 0; i < allowed.length; i += 1) {
          const role = allowed[i];
          const hex = normalizeHex(entry[role]);
          if (hex) cleaned[role] = hex;
        }
        if (Object.keys(cleaned).length) overrides[componentId] = cleaned;
      });
    }

    return { mode, theme, palette, overrides };
  }

  // Resolve a cor efetiva de um papel para um componente.
  // Precedência: override -> tema -> valor legado (fallback).
  function resolveColor(appearance, componentId, role, legacyValue) {
    if (!appearance || appearance.mode === "legacy") {
      return legacyValue || null;
    }
    const override = appearance.overrides
      && appearance.overrides[componentId]
      && appearance.overrides[componentId][role];
    if (isValidHex(override)) return override;
    const paletteColor = appearance.palette && appearance.palette[role];
    if (isValidHex(paletteColor)) return paletteColor;
    return legacyValue || null;
  }

  // Resolve os 4 slots concretos do velocímetro a partir da aparência.
  function resolveSpeedometerSlots(config, speedometer) {
    const legacy = SPEEDOMETER_DEFAULT_SLOTS;
    const slots = {
      primary_color: (speedometer && speedometer.primary_color) || legacy.primary_color,
      secondary_color: (speedometer && speedometer.secondary_color) || legacy.secondary_color,
      accent_color: (speedometer && speedometer.accent_color) || legacy.accent_color,
      background_color: (speedometer && speedometer.background_color) || legacy.background_color,
    };
    const appearance = config && config.general && config.general.appearance;
    if (!appearance || appearance.mode === "legacy") return slots;

    Object.keys(SPEEDOMETER_SLOT_ROLES).forEach((slot) => {
      const role = SPEEDOMETER_SLOT_ROLES[slot];
      const resolved = resolveColor(appearance, "speedometer", role, slots[slot]);
      if (resolved) slots[slot] = resolved;
    });
    return slots;
  }

  // Resolve as cores de um status/voz/rádio. Cada chave pode ser null (sem valor),
  // indicando que o CSS deve usar o fallback legado.
  function resolveElementColors(config, componentId, legacyColor) {
    const result = {
      accent: legacyColor || null,
      track: null,
      background: null,
      text: null,
      border: null,
    };
    const appearance = config && config.general && config.general.appearance;
    if (!appearance || appearance.mode === "legacy") return result;
    result.accent = resolveColor(appearance, componentId, "primary", legacyColor);
    result.track = resolveColor(appearance, componentId, "secondary", null);
    result.background = resolveColor(appearance, componentId, "background", null);
    result.text = resolveColor(appearance, componentId, "text", null);
    result.border = resolveColor(appearance, componentId, "border", null);
    return result;
  }

  return {
    ROLES,
    STATUS_KEYS,
    SPEEDOMETER_SLOT_ROLES,
    SPEEDOMETER_ROLES,
    ELEMENT_ROLES,
    THEME_PRESETS,
    DEFAULT_THEME_ID,
    DEFAULT_PALETTE,
    SPEEDOMETER_DEFAULT_SLOTS,
    isValidHex,
    normalizeHex,
    getComponentRoles,
    normalizeAppearance,
    resolveColor,
    resolveSpeedometerSlots,
    resolveElementColors,
  };
});
