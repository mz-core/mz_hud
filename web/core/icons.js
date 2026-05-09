(function () {
  "use strict";

  const core = (window.MZHudCore = window.MZHudCore || {});

  const ICON_MANIFEST_PATH = "./assets/icons/icon_manifest.json";
  const DEFAULT_EXTENSIONS = ["svg", "png", "webp"];
  const DEFAULT_AUTO_MAX_INDEX = 12;

  const STATUS_CATEGORY_BY_ELEMENT = {
    health: "health",
    armor: "armor",
    hunger: "hunger",
    thirst: "thirst",
    stamina: "stamina",
    oxygen: "oxygen",
    stress: "stress",
    voice: "voice",
    radio: "radio",
  };

  const DEFAULT_ELEMENT_ICON = {
    health: "heart",
    armor: "shield",
    hunger: "utensils",
    thirst: "droplet",
    stamina: "zap",
    oxygen: "wind",
    stress: "brain",
    voice: "mic",
    radio: "radio",
  };

  const VEHICLE_ICON_SLOTS = {
    fuel: { category: "fuel", fallback: "fuel", label: "Combustível" },
    engine: { category: "engine", fallback: "engine", label: "Motor" },
    engine_indicator: { category: "engine", fallback: "turn", label: "Motor ligado" },
    belt: { category: "seatbelt", fallback: "belt", label: "Cinto colocado" },
    unbelt: { category: "seatbelt", fallback: "unbelt", label: "Cinto removido" },
    light: { category: "lights", fallback: "light", label: "Farol baixo" },
    light_high: { category: "lights", fallback: "lightHigh", label: "Farol alto" },
    light_off: { category: "lights", fallback: "lightOff", label: "Farol apagado" },
    lock: { category: "lock", fallback: "lock", label: "Trancado" },
    unlock: { category: "lock", fallback: "unlock", label: "Destrancado" },
    arrow: { category: "arrow", fallback: "arrow", label: "Seta" },
    arrow_active: { category: "arrow", fallback: "arrowActive", label: "Seta ativa" },
    speed: { category: "speed", fallback: "speed", label: "Velocidade" },
    rpm: { category: "rpm", fallback: "rpm", label: "RPM" },
    gear: { category: "gear", fallback: "gear", label: "Marcha" },
    weapon: { category: "weapon", fallback: "weapon", label: "Arma" },
    ammo: { category: "ammo", fallback: "ammo", label: "Munição" },
  };

  const builtinCatalog = {
    status: {
      health: [{ id: "heart", label: "Coração padrão", path: "./assets/icons/status/default/health.svg" }],
      armor: [{ id: "shield", label: "Escudo padrão", path: "./assets/icons/status/default/armor.svg" }],
      hunger: [
        { id: "utensils", label: "Fome padrão", path: "./assets/icons/status/default/hunger.svg" },
        { id: "hunger2", label: "Fome alternativa", path: "./assets/icons/status/default/hunger2.svg" },
      ],
      thirst: [{ id: "droplet", label: "Sede padrão", path: "./assets/icons/status/default/thirst.svg" }],
      stamina: [{ id: "zap", label: "Stamina padrão", path: "./assets/icons/status/default/stamina.svg" }],
      oxygen: [{ id: "wind", label: "Oxigênio padrão", path: "./assets/icons/status/default/oxygen.svg" }],
      stress: [{ id: "brain", label: "Stress padrão", path: "./assets/icons/status/default/stress.svg" }],
    },
    comms: {
      voice: [
        { id: "mic", label: "Microfone", path: "./assets/icons/comms/default/mic.svg" },
        { id: "voice", label: "Voz", path: "./assets/icons/comms/default/voice.svg" },
      ],
      radio: [
        { id: "radio", label: "Rádio", path: "./assets/icons/comms/default/radio.svg" },
        { id: "radio_2", label: "Rádio 2", path: "./assets/icons/comms/radio/radio_2.svg" },
      ],
    },
    vehicle: {
      fuel: [{ id: "fuel", label: "Combustível padrão", path: "./assets/icons/vehicle/default/fuel.svg" }],
      engine: [
        { id: "engine", label: "Motor", path: "./assets/icons/vehicle/default/engine.svg" },
        { id: "turn", label: "Motor ligado", path: "./assets/icons/vehicle/default/turn.svg" },
      ],
      seatbelt: [
        { id: "belt", label: "Cinto colocado", path: "./assets/icons/vehicle/default/belt.svg" },
        { id: "unbelt", label: "Cinto removido", path: "./assets/icons/vehicle/default/unbelt.svg" },
        { id: "seatbelt", label: "Cinto simples", path: "./assets/icons/vehicle/default/seatbelt.svg" },
      ],
      lights: [
        { id: "light", label: "Farol", path: "./assets/icons/vehicle/default/light-spot.svg" },
        { id: "lightHigh", label: "Farol alto", path: "./assets/icons/vehicle/default/light-spot-2.svg" },
        { id: "lightOff", label: "Farol apagado", path: "./assets/icons/vehicle/default/light-spot-off.svg" },
        { id: "lights", label: "Luzes", path: "./assets/icons/vehicle/default/lights.svg" },
      ],
      lock: [
        { id: "lock", label: "Cadeado fechado", path: "./assets/icons/vehicle/default/lock.svg" },
        { id: "unlock", label: "Cadeado aberto", path: "./assets/icons/vehicle/default/unlock.svg" },
      ],
      arrow: [
        { id: "arrow", label: "Seta", path: "./assets/icons/vehicle/default/arrow.svg" },
        { id: "arrowActive", label: "Seta ativa", path: "./assets/icons/vehicle/default/arrowActive.svg" },
      ],
      speed: [{ id: "speed", label: "Velocidade", path: "./assets/icons/vehicle/default/speed.svg" }],
      rpm: [{ id: "rpm", label: "RPM", path: "./assets/icons/vehicle/default/rpm.svg" }],
      gear: [{ id: "gear", label: "Marcha", path: "./assets/icons/vehicle/default/gear.svg" }],
      weapon: [{ id: "weapon", label: "Arma", path: "./assets/icons/vehicle/default/weapon.svg" }],
      ammo: [{ id: "ammo", label: "Munição", path: "./assets/icons/vehicle/default/ammo.svg" }],
    },
  };

  const iconCatalog = deepCloneCatalog(builtinCatalog);
  const autoProbeConfig = {
    enabled: true,
    maxIndex: DEFAULT_AUTO_MAX_INDEX,
    extensions: DEFAULT_EXTENSIONS.slice(),
  };
  let bootstrapPromise = null;
  let catalogReady = false;

  function deepCloneCatalog(catalog) {
    return JSON.parse(JSON.stringify(catalog || {}));
  }

  function normalizeId(value, fallback = "") {
    const text = String(value || fallback || "").trim();
    return /^[a-zA-Z0-9_-]{1,64}$/.test(text) ? text : fallback;
  }

  function normalizePath(path) {
    const text = String(path || "").trim();
    if (!text) return "";
    if (text.startsWith("./assets/icons/") || text.startsWith("assets/icons/")) {
      return text.startsWith("./") ? text : `./${text}`;
    }
    return "";
  }

  function ensureCategory(section, category) {
    iconCatalog[section] = iconCatalog[section] || {};
    iconCatalog[section][category] = iconCatalog[section][category] || [];
    return iconCatalog[section][category];
  }

  function addIconEntry(section, category, entry) {
    const id = normalizeId(entry?.id);
    const path = normalizePath(entry?.path);
    if (!section || !category || !id || !path) return false;
    const list = ensureCategory(section, category);
    const existing = list.find((item) => item.id === id);
    const normalized = {
      id,
      label: String(entry.label || id).trim() || id,
      path,
      source: entry.source || "manual",
    };
    if (existing) Object.assign(existing, normalized);
    else list.push(normalized);
    return true;
  }

  function getEntries(section, category) {
    return iconCatalog?.[section]?.[category] || [];
  }

  function resolveEntry(section, category, id, fallbackId) {
    const safeCategory = category || "default";
    const safeId = normalizeId(id, fallbackId);
    const list = getEntries(section, safeCategory);
    return (
      list.find((entry) => entry.id === safeId) ||
      list.find((entry) => entry.id === fallbackId) ||
      list[0] ||
      null
    );
  }

  function escapeAttr(value) {
    const escapeHTML = core.escapeHTML || ((text) => String(text || ""));
    return escapeHTML(value).replace(/"/g, "&quot;");
  }

  function renderMask(path, className = "hud-icon-mask") {
    const safePath = normalizePath(path);
    if (!safePath) return "";
    return `<span class="${className}" style="--icon-url: url('${escapeAttr(safePath)}')"></span>`;
  }

  function getElementIconCategory(key) {
    return STATUS_CATEGORY_BY_ELEMENT[key] || key || "health";
  }

  function getElementIconSection(key) {
    return key === "voice" || key === "radio" ? "comms" : "status";
  }

  function getElementFallbackIcon(key) {
    return DEFAULT_ELEMENT_ICON[key] || DEFAULT_ELEMENT_ICON.health;
  }

  function resolveElementIconEntry(key, entry = {}) {
    const section = getElementIconSection(key);
    const category = getElementIconCategory(key);
    return resolveEntry(section, category, entry.icon, getElementFallbackIcon(key));
  }

  function resolveElementIconPath(key, entry = {}) {
    return resolveElementIconEntry(key, entry)?.path || "";
  }

  function renderElementIcon(key, entry = {}) {
    return renderMask(resolveElementIconPath(key, entry), "hud-icon-mask");
  }

  function getElementIconOptions(key) {
    const section = getElementIconSection(key);
    const category = getElementIconCategory(key);
    return getEntries(section, category).map((entry) => ({ ...entry }));
  }

  function getVehicleSlot(slot) {
    return VEHICLE_ICON_SLOTS[slot] || VEHICLE_ICON_SLOTS.fuel;
  }

  function getSpeedometerIconValue(speedometer = {}, slot) {
    const icons = speedometer.icons || {};
    const legacy = {
      light_high: "lightHigh",
      light_off: "lightOff",
      arrow_active: "arrowActive",
      engine_indicator: "engineIndicator",
    }[slot];
    return icons[slot] || (legacy ? icons[legacy] : undefined) || getVehicleSlot(slot).fallback;
  }

  function resolveVehicleIconEntry(slot, speedometer = {}) {
    const meta = getVehicleSlot(slot);
    const selected = getSpeedometerIconValue(speedometer, slot);
    return resolveEntry("vehicle", meta.category, selected, meta.fallback);
  }

  function resolveVehicleIconPath(slot, speedometer = {}) {
    return resolveVehicleIconEntry(slot, speedometer)?.path || "";
  }

  function renderVehicleIcon(slot, speedometer = {}) {
    return renderMask(resolveVehicleIconPath(slot, speedometer), "speedometer-icon-mask");
  }

  function getVehicleIconOptions(slot) {
    const meta = getVehicleSlot(slot);
    return getEntries("vehicle", meta.category).map((entry) => ({ ...entry }));
  }

  function iconOptionList(options, selected) {
    const escapeHTML = core.escapeHTML || ((text) => String(text || ""));
    const safeSelected = String(selected || "");
    const list = Array.isArray(options) ? options : [];
    const hasSelected = list.some((option) => option.id === safeSelected);
    const extras = hasSelected || !safeSelected ? [] : [{ id: safeSelected, label: `${safeSelected} (custom)` }];
    return [...list, ...extras]
      .map((option) => {
        const value = escapeHTML(option.id);
        const label = escapeHTML(option.label || option.id);
        return `<option value="${value}" ${option.id === safeSelected ? "selected" : ""}>${label}</option>`;
      })
      .join("");
  }

  function probeImage(path) {
    return new Promise((resolve) => {
      const safePath = normalizePath(path);
      if (!safePath) return resolve(false);
      const image = new Image();
      const done = (ok) => {
        image.onload = null;
        image.onerror = null;
        resolve(ok);
      };
      image.onload = () => done(true);
      image.onerror = () => done(false);
      image.src = safePath;
    });
  }

  function applyManifest(manifest) {
    if (!manifest || typeof manifest !== "object") return;

    const auto = manifest.auto_probe || manifest.autoProbe || {};
    if (typeof auto.enabled === "boolean") autoProbeConfig.enabled = auto.enabled;
    if (Number.isFinite(Number(auto.max_index || auto.maxIndex))) {
      autoProbeConfig.maxIndex = Math.max(0, Math.min(50, Number(auto.max_index || auto.maxIndex)));
    }
    if (Array.isArray(auto.extensions) && auto.extensions.length) {
      autoProbeConfig.extensions = auto.extensions
        .map((ext) => String(ext || "").replace(/^\./, "").toLowerCase())
        .filter((ext) => ["svg", "png", "webp"].includes(ext));
      if (!autoProbeConfig.extensions.length) autoProbeConfig.extensions = DEFAULT_EXTENSIONS.slice();
    }

    ["status", "vehicle", "comms"].forEach((section) => {
      const groups = manifest[section];
      if (!groups || typeof groups !== "object") return;
      Object.keys(groups).forEach((category) => {
        const entries = Array.isArray(groups[category]) ? groups[category] : [];
        entries.forEach((entry) => addIconEntry(section, category, { ...entry, source: "manifest" }));
      });
    });
  }

  async function fetchManifest() {
    try {
      const response = await fetch(ICON_MANIFEST_PATH);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function probeAutoIcons() {
    if (!autoProbeConfig.enabled || autoProbeConfig.maxIndex <= 0) return;
    const jobs = [];
    const sections = {
      status: Object.keys(STATUS_CATEGORY_BY_ELEMENT)
        .filter((key) => !["voice", "radio"].includes(key))
        .map((key) => STATUS_CATEGORY_BY_ELEMENT[key]),
      comms: ["voice", "radio"],
      vehicle: Object.keys(iconCatalog.vehicle || {}),
    };

    Object.entries(sections).forEach(([section, categories]) => {
      Array.from(new Set(categories)).forEach((category) => {
        for (let index = 1; index <= autoProbeConfig.maxIndex; index += 1) {
          const id = `${category}_${index}`;
          autoProbeConfig.extensions.forEach((ext) => {
            const path = `./assets/icons/${section}/${category}/${id}.${ext}`;
            jobs.push(
              probeImage(path).then((exists) => {
                if (exists) addIconEntry(section, category, { id, label: id, path, source: "auto" });
              }),
            );
          });
        }
      });
    });

    await Promise.all(jobs);
  }

  function updateLegacyMaps() {
    const iconAssets = {
      heart: resolveEntry("status", "health", "heart", "heart")?.path,
      shield: resolveEntry("status", "armor", "shield", "shield")?.path,
      utensils: resolveEntry("status", "hunger", "utensils", "utensils")?.path,
      droplet: resolveEntry("status", "thirst", "droplet", "droplet")?.path,
      zap: resolveEntry("status", "stamina", "zap", "zap")?.path,
      wind: resolveEntry("status", "oxygen", "wind", "wind")?.path,
      brain: resolveEntry("status", "stress", "brain", "brain")?.path,
      mic: resolveEntry("comms", "voice", "mic", "mic")?.path,
      radio: resolveEntry("comms", "radio", "radio", "radio")?.path,
    };

    const iconMap = Object.fromEntries(
      Object.entries(iconAssets)
        .filter(([, path]) => Boolean(path))
        .map(([name, path]) => [name, renderMask(path, "hud-icon-mask")]),
    );

    Object.assign(core, { iconAssets, iconMap });
  }

  async function bootstrapIconCatalog() {
    if (bootstrapPromise) return bootstrapPromise;
    bootstrapPromise = (async () => {
      const manifest = await fetchManifest();
      applyManifest(manifest);
      await probeAutoIcons();
      catalogReady = true;
      updateLegacyMaps();
      return getIconCatalogState();
    })();
    return bootstrapPromise;
  }

  function getIconCatalogState() {
    return {
      ready: catalogReady,
      autoProbe: { ...autoProbeConfig },
      catalog: deepCloneCatalog(iconCatalog),
    };
  }

  updateLegacyMaps();

  Object.assign(core, {
    iconCatalog,
    STATUS_CATEGORY_BY_ELEMENT,
    DEFAULT_ELEMENT_ICON,
    VEHICLE_ICON_SLOTS,
    bootstrapIconCatalog,
    getIconCatalogState,
    getElementIconCategory,
    getElementIconSection,
    getElementFallbackIcon,
    getElementIconOptions,
    resolveElementIconPath,
    renderElementIcon,
    getVehicleIconOptions,
    resolveVehicleIconPath,
    renderVehicleIcon,
    iconOptionList,
  });
})();
