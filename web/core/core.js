(function () {
  "use strict";

  const core = (window.MZHudCore = window.MZHudCore || {});

  const requiredKeys = [
    "selectOptions",
    "labels",
    "colorPresets",
    "speedometerThemes",
    "minimapQuickPosition",
    "statusGroupQuickPosition",
    "chatQuickPosition",
    "applyMinimapQuickPosition",
    "applyStatusGroupQuickPosition",
    "applyChatQuickPosition",
    "iconAssets",
    "iconMap",
    "bootstrapIconCatalog",
    "getElementIconOptions",
    "renderElementIcon",
    "getVehicleIconOptions",
    "resolveVehicleIconPath",
    "renderVehicleIcon",
    "iconOptionList",
    "escapeHTML",
    "deepClone",
    "setSelectOptions",
    "cacheStaticOptions",
    "getHudPositionClass",
    "getLogoPositionClass",
    "getSpeedometerPositionClass",
    "getItemPositionClass",
    "defaultElementLayout",
    "defaultCommsOptions",
    "withCommsOptions",
    "voiceLevelFromStatus",
    "formatRadioFrequency",
    "withStatusGroupDefaults",
    "statusGroupInlineStyle",
    "getStatusGroupPositionClass",
    "withElementDefaults",
    "withSpeedometerIconDefaults",
    "withSpeedometerDefaults",
    "withWeaponDefaults",
    "withChatDefaults",
    "normalizeConfig",
    "getWeaponPositionClass",
    "weaponImagePath",
    "prettyWeaponName",
  ];

  const missing = requiredKeys.filter((key) => core[key] === undefined);
  if (missing.length > 0) {
    console.warn("[mz_hud] Core incompleto:", missing.join(", "));
  }

  // Compatibilidade: app/editor/módulos antigos ainda podem chamar helpers
  // diretamente no escopo global. Os aliases globais evitam quebra enquanto
  // a HUD migra gradualmente para window.MZHudCore.
  Object.assign(window, core);
})();
