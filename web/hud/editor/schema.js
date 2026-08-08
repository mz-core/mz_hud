(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MZHudEditorSchema = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  const SCHEMA_VERSION = 2;
  const anchors = ["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"];
  const visibilityModes = ["always", "smart", "hidden"];
  const statusKeys = ["stamina", "armor", "health", "hunger", "thirst", "oxygen", "stress", "voice", "radio"];
  const smartDefaults = new Set(["armor", "stamina", "oxygen"]);

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function clamp(value, minimum, maximum, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(minimum, Math.min(maximum, numeric)) : fallback;
  }

  function oneOf(value, values, fallback) {
    return values.includes(value) ? value : fallback;
  }

  function normalizeElement(key, entry = {}) {
    const fallbackMode = smartDefaults.has(key) ? "smart" : "always";
    return {
      ...entry,
      enabled: entry.enabled !== false,
      position: oneOf(entry.position, anchors, "bottom-center"),
      free: entry.free !== false,
      x: clamp(entry.x, 0, 100, 50),
      y: clamp(entry.y, 0, 100, 50),
      scale: clamp(entry.scale, 50, 180, 100),
      opacity: clamp(entry.opacity, 0, 100, 100),
      individual: key === "voice" || key === "radio" ? true : entry.individual === true,
      visibilityMode: oneOf(entry.visibilityMode, visibilityModes, fallbackMode),
      locked: entry.locked === true,
      collapseWhenHidden: entry.collapseWhenHidden === true,
    };
  }

  function normalizeConfig(input = {}) {
    const config = clone(input) || {};
    config.schema_version = SCHEMA_VERSION;
    config.revision = Math.max(0, Math.floor(clamp(config.revision, 0, 2147483647, 0)));
    config.general = config.general || {};
    const group = config.general.status_group || {};
    config.general.status_group = {
      ...group,
      enabled: group.enabled !== false,
      position: oneOf(group.position, anchors, "bottom-center"),
      free: group.free !== false,
      x: clamp(group.x, 0, 100, 50),
      y: clamp(group.y, 0, 100, 94),
      scale: clamp(group.scale, 50, 180, 100),
      opacity: clamp(group.opacity, 0, 100, 100),
      gap: clamp(group.gap, 0, 40, 8),
      orientation: oneOf(group.orientation, ["horizontal", "vertical"], "horizontal"),
      alignment: oneOf(group.alignment, ["start", "center", "end"], "center"),
      locked: group.locked === true,
    };
    config.elements = config.elements || {};
    Object.keys(config.elements).forEach((key) => {
      config.elements[key] = normalizeElement(key, config.elements[key]);
    });
    config.speedometer = normalizeModule(config.speedometer, { x: 88, y: 82, minScale: 60, maxScale: 150, visibilityMode: "smart" });
    config.weapon = normalizeModule(config.weapon, { x: 88, y: 78, minScale: 60, maxScale: 150, visibilityMode: "smart" });
    config.logo = normalizeModule(config.logo, { x: 50, y: 6, minScale: 50, maxScale: 180, visibilityMode: "always", free: false });
    config.logo.width = clamp(config.logo.width, 40, 400, 140);
    config.logo.height = clamp(config.logo.height, 20, 200, 44);
    config.chat = {
      ...(config.chat || {}),
      enabled: config.chat?.enabled !== false,
      free: config.chat?.free === true,
      x: clamp(config.chat?.x, 0, 100, 2),
      y: clamp(config.chat?.y, 0, 100, 3),
      scale: clamp(config.chat?.scale, 0.5, 1.8, 1),
      opacity: clamp(config.chat?.opacity, 0, 1, 1),
      locked: config.chat?.locked === true,
    };
    return config;
  }

  function normalizeModule(raw, options) {
    const entry = raw || {};
    return {
      ...entry,
      enabled: entry.enabled !== false,
      position: oneOf(entry.position, anchors, "bottom-right"),
      free: entry.free !== undefined ? entry.free === true : options.free !== false,
      x: clamp(entry.x, 0, 100, options.x),
      y: clamp(entry.y, 0, 100, options.y),
      scale: clamp(entry.scale, options.minScale, options.maxScale, 100),
      opacity: clamp(entry.opacity, 0, 100, 100),
      visibilityMode: oneOf(entry.visibilityMode, visibilityModes, options.visibilityMode),
      locked: entry.locked === true,
    };
  }

  function target(config, id) {
    if (!config) return null;
    if (id === "statusGroup") return config.general?.status_group || null;
    if (statusKeys.includes(id) || config.elements?.[id]) return config.elements?.[id] || null;
    if (["speedometer", "weapon", "logo", "chat"].includes(id)) return config[id] || null;
    return null;
  }

  return { SCHEMA_VERSION, anchors, visibilityModes, statusKeys, clamp, clone, normalizeElement, normalizeConfig, target };
});
