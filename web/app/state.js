(function () {
  "use strict";

  const resourceName =
    typeof GetParentResourceName === "function"
      ? GetParentResourceName()
      : "mz_hud";

  const state = {
    config: null,
    editorDefaults: null,
    status: {
      health: 100,
      armor: 0,
      hunger: 100,
      thirst: 100,
      stamina: 100,
      oxygen: 100,
      oxygenActive: false,
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
      locked: false,
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
    editorPreview: "normal",
    canManage: false,
    selectedElement: "health",
    editorPresetManager: null,
  };

  const dom = {
    hudRoot: document.getElementById("hud-root"),
    hudContainer: document.getElementById("hud-container"),
    hudLogo: document.getElementById("hud-logo"),
    speedometer: document.getElementById("speedometer"),
    weaponHud: document.getElementById("weapon-hud"),
    medicalHud: document.getElementById("medical-hud"),
    editorOverlay: document.getElementById("editor-overlay"),
  };

  const core = window.MZHudCore || {};

  window.MZHudApp = {
    resourceName,
    state,
    dom,
    core,
    helpers: {
      selectOptions: core.selectOptions,
      labels: core.labels,
      colorPresets: core.colorPresets,
      speedometerThemes: core.speedometerThemes,
      applyMinimapQuickPosition: core.applyMinimapQuickPosition,
      applyStatusGroupQuickPosition: core.applyStatusGroupQuickPosition,
      applyChatQuickPosition: core.applyChatQuickPosition,
      iconMap: core.iconMap,
      bootstrapIconCatalog: core.bootstrapIconCatalog,
      getIconCatalogState: core.getIconCatalogState,
      getElementIconOptions: core.getElementIconOptions,
      renderElementIcon: core.renderElementIcon,
      getVehicleIconOptions: core.getVehicleIconOptions,
      resolveVehicleIconPath: core.resolveVehicleIconPath,
      renderVehicleIcon: core.renderVehicleIcon,
      iconOptionList: core.iconOptionList,
      escapeHTML: core.escapeHTML,
      deepClone: core.deepClone,
      cacheStaticOptions: core.cacheStaticOptions,
      getHudPositionClass: core.getHudPositionClass,
      getLogoPositionClass: core.getLogoPositionClass,
      getSpeedometerPositionClass: core.getSpeedometerPositionClass,
      getItemPositionClass: core.getItemPositionClass,
      withCommsOptions: core.withCommsOptions,
      formatRadioFrequency: core.formatRadioFrequency,
      withStatusGroupDefaults: core.withStatusGroupDefaults,
      statusGroupInlineStyle: core.statusGroupInlineStyle,
      getStatusGroupPositionClass: core.getStatusGroupPositionClass,
      withElementDefaults: core.withElementDefaults,
      withSpeedometerDefaults: core.withSpeedometerDefaults,
      withWeaponDefaults: core.withWeaponDefaults,
      withChatDefaults: core.withChatDefaults,
      normalizeConfig: core.normalizeConfig,
      getWeaponPositionClass: core.getWeaponPositionClass,
      weaponImagePath: core.weaponImagePath,
      prettyWeaponName: core.prettyWeaponName,
    },
  };
})();
