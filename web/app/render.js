(function () {
  "use strict";

  const app = window.MZHudApp;
  if (!app) return;

  const state = app.state;
  const dom = app.dom;
  const core = app.core;
  const h = app.helpers;

  app.voiceLevelFromStatus = function voiceLevelFromStatus() {
    return core.voiceLevelFromStatus
      ? core.voiceLevelFromStatus(state.status)
      : { level: 2, key: "normal", label: "Normal" };
  };

  app.itemInlineStyle = function itemInlineStyle(key, entry) {
    const item = h.withElementDefaults(key, entry);
    const opacity = Math.max(0, Math.min(100, Number(item.opacity) || 0)) / 100;
    const scale = Math.max(40, Math.min(200, Number(item.scale) || 100)) / 100;
    const x = Math.max(0, Math.min(100, Number(item.x) || 0));
    const y = Math.max(0, Math.min(100, Number(item.y) || 0));
    return `--item-accent:${item.color};--item-value:${Math.max(0, Math.min(100, Number(state.status[key]) || 0))};--item-opacity:${opacity};--item-scale:${scale};--item-x:${x}%;--item-y:${y}%`;
  };

  app.renderCommsItem = function renderCommsItem(key, rawEntry) {
    if (key === "voice" && window.MZHudVoice?.render) {
      return window.MZHudVoice.render(rawEntry, {
        state,
        iconMap: h.iconMap,
        renderElementIcon: h.renderElementIcon,
        escapeHTML: h.escapeHTML,
        withElementDefaults: h.withElementDefaults,
        withCommsOptions: h.withCommsOptions,
        itemInlineStyle: app.itemInlineStyle,
        getItemPositionClass: h.getItemPositionClass,
        voiceLevelFromStatus: app.voiceLevelFromStatus,
        resolveVisibility: window.MZHudVisibility?.resolveVisibility,
      });
    }

    if (key === "radio" && window.MZHudRadio?.render) {
      return window.MZHudRadio.render(rawEntry, {
        state,
        iconMap: h.iconMap,
        renderElementIcon: h.renderElementIcon,
        escapeHTML: h.escapeHTML,
        withElementDefaults: h.withElementDefaults,
        withCommsOptions: h.withCommsOptions,
        itemInlineStyle: app.itemInlineStyle,
        getItemPositionClass: h.getItemPositionClass,
        formatRadioFrequency: h.formatRadioFrequency,
        resolveVisibility: window.MZHudVisibility?.resolveVisibility,
      });
    }

    return "";
  };

  app.renderHudItem = function renderHudItem(key, rawEntry, renderMode = "single") {
    if ((key === "voice" || key === "radio") && renderMode !== "group") {
      return app.renderCommsItem(key, rawEntry);
    }

    return window.MZHudStatus?.renderHudItem
      ? window.MZHudStatus.renderHudItem(
          key,
          rawEntry,
          {
            state,
            iconMap: h.iconMap,
            renderElementIcon: h.renderElementIcon,
            escapeHTML: h.escapeHTML,
            withElementDefaults: h.withElementDefaults,
            itemInlineStyle: app.itemInlineStyle,
            getItemPositionClass: h.getItemPositionClass,
            resolveVisibility: window.MZHudVisibility?.resolveVisibility,
          },
          renderMode,
        )
      : "";
  };

  app.renderStatusGroup = function renderStatusGroup(keys, elements) {
    return window.MZHudStatus?.renderStatusGroup
      ? window.MZHudStatus.renderStatusGroup(keys, elements, {
          state,
          iconMap: h.iconMap,
          renderElementIcon: h.renderElementIcon,
          escapeHTML: h.escapeHTML,
          withElementDefaults: h.withElementDefaults,
          itemInlineStyle: app.itemInlineStyle,
          getItemPositionClass: h.getItemPositionClass,
          withStatusGroupDefaults: h.withStatusGroupDefaults,
          statusGroupInlineStyle: h.statusGroupInlineStyle,
          getStatusGroupPositionClass: h.getStatusGroupPositionClass,
          resolveVisibility: window.MZHudVisibility?.resolveVisibility,
        })
      : "";
  };

  app.renderHud = function renderHud() {
    if (!state.config) return;
    if (!state.editorOpen) state.config = h.normalizeConfig(state.config);
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
      (key) => !h.withElementDefaults(key, elements[key]).individual,
    );
    const individualKeys = allStatusKeys.filter(
      (key) => h.withElementDefaults(key, elements[key]).individual,
    );
    const commsHtml = communicationKeys
      .filter((key) => elements[key]?.enabled)
      .map((key) => app.renderHudItem(key, elements[key]))
      .join("");
    dom.hudContainer.innerHTML =
      app.renderStatusGroup(groupedKeys, elements) +
      individualKeys.map((key) => app.renderHudItem(key, elements[key])).join("") +
      commsHtml;
    app.renderLogo();
    app.renderSpeedometer();
    app.renderWeaponHud();
    app.applyVisibility();
  };

  app.renderLogo = function renderLogo() {
    if (!window.MZHudLogo?.render) return;
    window.MZHudLogo.render({
      state,
      dom,
      getLogoPositionClass: h.getLogoPositionClass,
    });
  };

  app.speedometerIcon = function speedometerIcon(name) {
    return window.MZHudSpeedometer.icon(name, state.config?.speedometer || {});
  };

  app.renderSpeedometer = function renderSpeedometer() {
    return window.MZHudSpeedometer.render({
      state,
      dom,
      withSpeedometerDefaults: h.withSpeedometerDefaults,
      getSpeedometerPositionClass: h.getSpeedometerPositionClass,
      escapeHTML: h.escapeHTML,
      renderVehicleIcon: h.renderVehicleIcon,
      resolveVehicleIconPath: h.resolveVehicleIconPath,
    });
  };

  app.renderWeaponHud = function renderWeaponHud() {
    if (!window.MZHudWeapon?.render) return;
    window.MZHudWeapon.render({
      dom,
      state,
      helpers: {
        withWeaponDefaults: h.withWeaponDefaults,
        getWeaponPositionClass: h.getWeaponPositionClass,
        weaponImagePath: h.weaponImagePath,
        prettyWeaponName: h.prettyWeaponName,
        speedometerIcon: app.speedometerIcon,
        escapeHTML: h.escapeHTML,
      },
    });
  };

  app.applyVisibility = function applyVisibility() {
    dom.hudContainer.classList.toggle("hidden", !state.hudVisible);
    if (!state.hudVisible) dom.hudLogo.classList.add("hidden");
    const speedVisibility = window.MZHudVisibility?.resolveVisibility("speedometer", state.config?.speedometer || {}, state, { preview: state.editorPreview });
    if (!state.speedometerVisible || !state.config?.speedometer?.enabled || speedVisibility?.visible === false)
      dom.speedometer.classList.add("hidden");
    if (
      !state.hudVisible ||
      !state.weapon.visible ||
      !state.config?.weapon?.enabled
    )
      dom.weaponHud?.classList.add("hidden");
  };
})();
