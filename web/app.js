const resourceName =
  typeof GetParentResourceName === "function"
    ? GetParentResourceName()
    : "mz_hud";

const state = {
  config: null,
  status: {
    health: 100,
    armor: 0,
    hunger: 100,
    thirst: 100,
    stamina: 100,
    oxygen: 100,
    stress: 0,
    voice: 66,
    voiceLabel: "Normal",
    talking: false,
    radio: 0,
    radioLabel: "Fora do rádio",
    radioActive: false,
    radioTalking: false,
    radioChannel: 0,
  },
  vehicle: {
    visible: false,
    speed: 87,
    rpm: 65,
    fuel: 72,
    gear: "4",
    seatbelt: true,
    seatbeltAvailable: true,
    lights: true,
    engine: true,
  },
  weapon: {
    visible: false,
    name: "weapon_pistol",
    clip: 12,
    reserve: 48,
  },
  realVehicleVisible: false,
  hudVisible: true,
  speedometerVisible: true,
  editorOpen: false,
  canManage: false,
  selectedElement: "health",
};

const dom = {
  hudRoot: document.getElementById("hud-root"),
  hudContainer: document.getElementById("hud-container"),
  hudLogo: document.getElementById("hud-logo"),
  speedometer: document.getElementById("speedometer"),
  weaponHud: document.getElementById("weapon-hud"),
  editorOverlay: document.getElementById("editor-overlay"),
  editorShell: document.querySelector(".editor-shell"),
  elementsEditor: document.getElementById("elements-editor"),
  voiceEditor: document.getElementById("voice-editor"),
  saveConfig: document.getElementById("save-config"),
  resetConfig: document.getElementById("reset-config"),
  previewNotify: document.getElementById("preview-notify"),
  closeEditor: document.getElementById("close-editor"),
};

const core = window.MZHudCore || {};
const {
  selectOptions,
  labels,
  colorPresets,
  speedometerThemes,
  applyMinimapQuickPosition,
  applyStatusGroupQuickPosition,
  applyChatQuickPosition,
  iconMap,
  escapeHTML,
  deepClone,
  cacheStaticOptions,
  getHudPositionClass,
  getLogoPositionClass,
  getSpeedometerPositionClass,
  getItemPositionClass,
  withCommsOptions,
  formatRadioFrequency,
  withStatusGroupDefaults,
  statusGroupInlineStyle,
  getStatusGroupPositionClass,
  withElementDefaults,
  withSpeedometerDefaults,
  withWeaponDefaults,
  withChatDefaults,
  normalizeConfig,
  getWeaponPositionClass,
  weaponImagePath,
  prettyWeaponName,
} = core;

function voiceLevelFromStatus() {
  return core.voiceLevelFromStatus
    ? core.voiceLevelFromStatus(state.status)
    : { level: 2, key: "normal", label: "Normal" };
}

function nui(action, data = {}) {
  return fetch(`https://${resourceName}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch(() => ({ ok: false }));
}

function applyChatLayoutPreview(config) {
  if (!config) return;
  nui("applyChatLayout", { config });
}

function markUIReady() {
  document.documentElement.style.background = "transparent";
  document.body.style.background = "transparent";
  document.body.classList.remove("hud-initializing");
}



function itemInlineStyle(key, entry) {
  const item = withElementDefaults(key, entry);
  const opacity = Math.max(0, Math.min(100, Number(item.opacity) || 0)) / 100;
  const scale = Math.max(40, Math.min(200, Number(item.scale) || 100)) / 100;
  const x = Math.max(0, Math.min(100, Number(item.x) || 0));
  const y = Math.max(0, Math.min(100, Number(item.y) || 0));
  return `--item-accent:${item.color};--item-value:${Math.max(0, Math.min(100, Number(state.status[key]) || 0))};--item-opacity:${opacity};--item-scale:${scale};--item-x:${x}%;--item-y:${y}%`;
}

function renderCommsItem(key, rawEntry) {
  if (key === "voice" && window.MZHudVoice?.render) {
    return window.MZHudVoice.render(rawEntry, {
      state,
      iconMap,
      escapeHTML,
      withElementDefaults,
      withCommsOptions,
      itemInlineStyle,
      getItemPositionClass,
      voiceLevelFromStatus,
    });
  }

  if (key === "radio" && window.MZHudRadio?.render) {
    return window.MZHudRadio.render(rawEntry, {
      state,
      iconMap,
      escapeHTML,
      withElementDefaults,
      withCommsOptions,
      itemInlineStyle,
      getItemPositionClass,
      formatRadioFrequency,
    });
  }

  return "";
}


function renderHudItem(key, rawEntry, renderMode = "single") {
  if ((key === "voice" || key === "radio") && renderMode !== "group") {
    return renderCommsItem(key, rawEntry);
  }

  return window.MZHudStatus?.renderHudItem
    ? window.MZHudStatus.renderHudItem(
        key,
        rawEntry,
        {
          state,
          iconMap,
          escapeHTML,
          withElementDefaults,
          itemInlineStyle,
          getItemPositionClass,
        },
        renderMode,
      )
    : "";
}


function renderStatusGroup(keys, elements) {
  return window.MZHudStatus?.renderStatusGroup
    ? window.MZHudStatus.renderStatusGroup(keys, elements, {
        state,
        iconMap,
        escapeHTML,
        withElementDefaults,
        itemInlineStyle,
        getItemPositionClass,
        withStatusGroupDefaults,
        statusGroupInlineStyle,
        getStatusGroupPositionClass,
      })
    : "";
}


function renderHud() {
  if (!state.config) return;
  state.config = normalizeConfig(state.config);
  const general = state.config.general || {};
  const elements = state.config.elements || {};
  dom.hudContainer.className = "hud-container hud-layout-free";
  dom.hudContainer.style.opacity = `${(general.global_opacity || 100) / 100}`;
  dom.hudContainer.style.transform = "none";
  const orderedKeys = [
    "stamina",
    "armor",
    "health",
    "hunger",
    "thirst",
    "oxygen",
    "stress",
  ];
  const communicationKeys = ["voice", "radio"];
  const known = orderedKeys.filter((key) => elements[key]);
  const rest = Object.keys(elements).filter(
    (key) => !known.includes(key) && !communicationKeys.includes(key),
  );
  const allStatusKeys = [...known, ...rest].filter(
    (key) => elements[key]?.enabled,
  );
  const groupedKeys = allStatusKeys.filter(
    (key) => !withElementDefaults(key, elements[key]).individual,
  );
  const individualKeys = allStatusKeys.filter(
    (key) => withElementDefaults(key, elements[key]).individual,
  );
  const commsHtml = communicationKeys
    .filter((key) => elements[key]?.enabled)
    .map((key) => renderHudItem(key, elements[key]))
    .join("");
  dom.hudContainer.innerHTML =
    renderStatusGroup(groupedKeys, elements) +
    individualKeys.map((key) => renderHudItem(key, elements[key])).join("") +
    commsHtml;
  renderLogo();
  renderSpeedometer();
  renderWeaponHud();
  applyVisibility();
}

function renderLogo() {
  if (!window.MZHudLogo?.render) return;
  window.MZHudLogo.render({
    state,
    dom,
    getLogoPositionClass,
  });
}


function speedometerIcon(name) {
  return window.MZHudSpeedometer.icon(name);
}

function renderSpeedometer() {
  return window.MZHudSpeedometer.render({
    state,
    dom,
    withSpeedometerDefaults,
    getSpeedometerPositionClass,
    escapeHTML,
  });
}



function renderWeaponHud() {
  if (!window.MZHudWeapon?.render) return;
  window.MZHudWeapon.render({
    dom,
    state,
    helpers: {
      withWeaponDefaults,
      getWeaponPositionClass,
      weaponImagePath,
      prettyWeaponName,
      speedometerIcon,
      escapeHTML,
    },
  });
}


function applyVisibility() {
  dom.hudContainer.classList.toggle("hidden", !state.hudVisible);
  if (!state.hudVisible) dom.hudLogo.classList.add("hidden");
  if (
    !state.speedometerVisible ||
    !state.vehicle.visible ||
    !state.config?.speedometer?.enabled
  )
    dom.speedometer.classList.add("hidden");
  if (
    !state.hudVisible ||
    !state.weapon.visible ||
    !state.config?.weapon?.enabled
  )
    dom.weaponHud?.classList.add("hidden");
}

let editorModule = null;

function getEditorModule() {
  if (!editorModule) {
    editorModule = window.MZHudEditor.create({
      state,
      dom,
      labels,
      selectOptions,
      colorPresets,
      iconMap,
      escapeHTML,
      deepClone,
      normalizeConfig,
      withElementDefaults,
      withCommsOptions,
      withStatusGroupDefaults,
      withSpeedometerDefaults,
      withWeaponDefaults,
      withChatDefaults,
      renderHud,
      applyChatLayoutPreview,
    });
  }
  return editorModule;
}

function setFormValue(id, value) {
  return getEditorModule().setFormValue(id, value);
}

function renderElementsEditor(config) {
  return getEditorModule().renderElementsEditor(config);
}

function renderVoiceEditor(config) {
  return getEditorModule().renderVoiceEditor(config);
}

function populateEditor(config) {
  return getEditorModule().populateEditor(config);
}

function collectElementConfig() {
  return getEditorModule().collectElementConfig();
}

function collectConfig() {
  return getEditorModule().collectConfig();
}

function applyEditorPreview() {
  return getEditorModule().applyEditorPreview();
}

function openEditor(config) {
  return getEditorModule().openEditor(config);
}

function closeEditor() {
  return getEditorModule().closeEditor();
}

function bindActions() {
  dom.closeEditor.addEventListener("click", () => nui("closeEditor"));
  dom.saveConfig.addEventListener("click", () =>
    nui("saveConfig", { config: collectConfig() }),
  );
  dom.resetConfig.addEventListener("click", () =>
    nui(
      "resetConfig",
      state.selectedElement === "chat" ? { module: "chat" } : {},
    ),
  );
  dom.previewNotify.addEventListener("click", () =>
    nui("notifyPreview", {
      type: "inform",
      description: "Preview local do editor da HUD.",
    }),
  );

  dom.editorOverlay.addEventListener("input", (event) => {
    const target = event.target;
    if (target?.closest?.(".chat-editor-card")) {
      state.selectedElement = "chat";
    }
    if (target?.dataset?.field === "color") {
      const text = target
        .closest(".element-card")
        ?.querySelector('[data-field="color_text"]');
      if (text) text.value = target.value;
    }
    if (target?.dataset?.field === "color_text") {
      const picker = target
        .closest(".element-card")
        ?.querySelector('[data-field="color"]');
      if (picker && /^#[0-9a-fA-F]{6}$/.test(target.value))
        picker.value = target.value;
    }
    applyEditorPreview();
  });

  dom.editorOverlay.addEventListener("change", (event) => {
    const target = event.target;
    if (target?.closest?.(".chat-editor-card")) {
      state.selectedElement = "chat";
    }
    if (target && target.id === "general-hud-position") {
      applyMinimapQuickPosition(target.value);
    }
    if (target && target.id === "status-group-position") {
      applyStatusGroupQuickPosition(target.value);
    }
    if (target && target.id === "chat-preset") {
      applyChatQuickPosition(target.value);
    }
    applyEditorPreview();
  });

  dom.editorOverlay.addEventListener("click", (event) => {
    if (event.target.closest(".chat-editor-card")) {
      state.selectedElement = "chat";
    }
    const elementButton = event.target.closest("[data-select-element]");
    if (elementButton) {
      state.selectedElement = elementButton.dataset.selectElement;
      state.config = collectConfig();
      renderElementsEditor(state.config);
      renderVoiceEditor(state.config);
      renderHud();
      return;
    }
    const styleButton = event.target.closest("[data-style]");
    if (styleButton) {
      const card = styleButton.closest(".element-card");
      card.querySelector('[data-field="style"]').value =
        styleButton.dataset.style;
      card
        .querySelectorAll(".style-option")
        .forEach((btn) => btn.classList.toggle("active", btn === styleButton));
      applyEditorPreview();
      return;
    }
    const colorPreset = event.target.closest("[data-color-preset]");
    if (colorPreset) {
      const card = colorPreset.closest(".element-card");
      const color = colorPreset.dataset.colorPreset;
      card.querySelector('[data-field="color"]').value = color;
      card.querySelector('[data-field="color_text"]').value = color;
      applyEditorPreview();
      return;
    }
    const speedTheme = event.target.closest("[data-speed-theme]");
    if (speedTheme) {
      const theme = speedometerThemes[speedTheme.dataset.speedTheme];
      if (theme) {
        setFormValue("speedometer-primary-color", theme.primary_color);
        setFormValue("speedometer-secondary-color", theme.secondary_color);
        setFormValue("speedometer-accent-color", theme.accent_color);
        setFormValue("speedometer-background-color", theme.background_color);
        applyEditorPreview();
      }
    }
  });

  dom.hudRoot.addEventListener("click", (event) => {
    if (!state.editorOpen) return;
    const item = event.target.closest("[data-hud-select]");
    if (item) {
      state.selectedElement = item.dataset.hudSelect;
      state.config = collectConfig();
      renderElementsEditor(state.config);
      renderVoiceEditor(state.config);
      renderHud();
    }
  });
}

function handleMessage(event) {
  const data = event.data || {};
  if (data.action === "bootstrap") {
    state.config = normalizeConfig(data.config);
    applyChatLayoutPreview(state.config.chat);
    state.canManage = Boolean(data.canManage);
    state.hudVisible = data.hudVisible !== false;
    state.speedometerVisible = data.speedometerVisible !== false;
    markUIReady();
    renderHud();
    return;
  }
  if (data.action === "applyConfig") {
    state.config = normalizeConfig(data.config);
    applyChatLayoutPreview(state.config.chat);
    renderHud();
    return;
  }
  if (data.action === "updateStatus") {
    state.status = { ...state.status, ...(data.status || {}) };
    renderHud();
    return;
  }
  if (data.action === "updateVehicle") {
    const incoming = data.vehicle || {};
    if (!state.editorOpen) {
      state.vehicle = { ...state.vehicle, ...incoming };
      state.realVehicleVisible = state.vehicle.visible;
    }
    renderSpeedometer();
    renderLogo();
    applyVisibility();
    return;
  }
  if (data.action === "updateWeapon") {
    const incoming = data.weapon || {};
    if (!state.editorOpen) {
      state.weapon = { ...state.weapon, ...incoming };
    }
    renderWeaponHud();
    applyVisibility();
    return;
  }
  if (data.action === "setHudVisible") {
    state.hudVisible = Boolean(data.visible);
    applyVisibility();
    return;
  }
  if (data.action === "setSpeedometerVisible") {
    state.speedometerVisible = Boolean(data.visible);
    applyVisibility();
    return;
  }
  if (data.action === "openEditor") {
    state.config = normalizeConfig(data.config || state.config);
    applyChatLayoutPreview(state.config.chat);
    state.canManage = Boolean(data.canManage ?? state.canManage);
    openEditor(state.config);
    return;
  }
  if (data.action === "closeEditor") closeEditor();
}

window.addEventListener("message", handleMessage);
window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.background = "transparent";
  document.body.style.background = "transparent";
  cacheStaticOptions();
  bindActions();
  nui("ready");
});
