(function () {
  "use strict";

  function create(ctx) {
    const {
      state,
      dom,
      deepClone,
      normalizeConfig,
      collectElementConfig,
      populateEditor,
      renderHud,
      applyChatLayoutPreview,
    } = ctx;

    function boolField(id, fallback) {
      const field = document.getElementById(id);
      return field ? field.checked : fallback;
    }

    function numberField(id, fallback) {
      const field = document.getElementById(id);
      return Number(field ? field.value : fallback);
    }

    function valueField(id, fallback) {
      const field = document.getElementById(id);
      return field ? field.value : fallback;
    }

    function collectSpeedometerIcons() {
      return {
        fuel: valueField("speedometer-icon-fuel", "fuel"),
        engine: valueField("speedometer-icon-engine", "engine"),
        engine_indicator: valueField("speedometer-icon-engine-indicator", "turn"),
        belt: valueField("speedometer-icon-belt", "belt"),
        unbelt: valueField("speedometer-icon-unbelt", "unbelt"),
        light: valueField("speedometer-icon-light", "light"),
        light_high: valueField("speedometer-icon-light-high", "lightHigh"),
        light_off: valueField("speedometer-icon-light-off", "lightOff"),
        arrow: valueField("speedometer-icon-arrow", "arrow"),
        arrow_active: valueField("speedometer-icon-arrow-active", "arrowActive"),
      };
    }

    function collectConfig() {
      return {
        general: {
          hud_position: valueField("general-hud-position", "bottom-left"),
          minimap_style: valueField("general-minimap-style", "circle"),
          show_minimap: boolField("general-show-minimap", true),
          minimap_visibility: valueField("general-minimap-visibility", "always"),
          minimap_x: numberField("general-minimap-x", 24),
          minimap_y: numberField("general-minimap-y", 24),
          status_group: {
            enabled: boolField("status-group-enabled", true),
            position: valueField("status-group-position", "bottom-center"),
            free: boolField("status-group-free", false),
            x: numberField("status-group-x", 50),
            y: numberField("status-group-y", 92),
            scale: numberField("status-group-scale", 100),
            opacity: numberField("status-group-opacity", 100),
            gap: numberField("status-group-gap", 8),
          },
          global_opacity: numberField("general-global-opacity", 100),
          scale: numberField("general-scale", 100),
        },
        speedometer: {
          enabled: boolField("speedometer-enabled", true),
          position: valueField("speedometer-position", "bottom-right"),
          free: boolField("speedometer-free", false),
          x: numberField("speedometer-x", 88),
          y: numberField("speedometer-y", 82),
          style: valueField("speedometer-style", "apex"),
          unit: valueField("speedometer-unit", "kmh"),
          icons: collectSpeedometerIcons(),
          show_speed: boolField("speedometer-show-speed", true),
          show_rpm: boolField("speedometer-show-rpm", true),
          show_fuel: boolField("speedometer-show-fuel", true),
          show_gear: boolField("speedometer-show-gear", true),
          show_seatbelt: boolField("speedometer-show-seatbelt", false),
          show_lights: boolField("speedometer-show-lights", true),
          show_engine: boolField("speedometer-show-engine", true),
          opacity: numberField("speedometer-opacity", 100),
          scale: numberField("speedometer-scale", 100),
          primary_color: valueField("speedometer-primary-color", "#22c7ff"),
          secondary_color: valueField("speedometer-secondary-color", "#7c4dff"),
          accent_color: valueField("speedometer-accent-color", "#ffcc4d"),
          background_color: valueField("speedometer-background-color", "rgba(0,0,0,0.36)"),
        },
        weapon: {
          enabled: boolField("weapon-enabled", true),
          position: valueField("weapon-position", "bottom-right"),
          free: boolField("weapon-free", true),
          x: numberField("weapon-x", 88),
          y: numberField("weapon-y", 78),
          show_image: boolField("weapon-show-image", true),
          show_ammo: boolField("weapon-show-ammo", true),
          show_name: boolField("weapon-show-name", false),
          icon_model: "default",
          image_model: "default",
          opacity: numberField("weapon-opacity", 94),
          scale: numberField("weapon-scale", 100),
        },
        chat: {
          enabled: boolField("chat-enabled", true),
          preset: valueField("chat-preset", "left-top"),
          free: boolField("chat-free", false),
          x: numberField("chat-x", 2),
          y: numberField("chat-y", 3),
          scale: numberField("chat-scale", 1),
          opacity: numberField("chat-opacity", 1),
        },
        logo: {
          enabled: boolField("logo-enabled", true),
          image_url: valueField("logo-image-url", "").trim(),
          position: valueField("logo-position", "top-center"),
          show_only_in_vehicle: boolField("logo-show-only-in-vehicle", false),
          width: numberField("logo-width", 140),
          height: numberField("logo-height", 70),
          opacity: numberField("logo-opacity", 100),
        },
        elements: collectElementConfig(),
      };
    }

    function applyEditorPreview() {
      if (!state.editorOpen) return;
      state.config = collectConfig();
      state.vehicle.visible = true;
      renderHud();
      if (typeof applyChatLayoutPreview === "function") {
        applyChatLayoutPreview(state.config.chat);
      }
    }

    function openEditor(config) {
      if (!state.canManage || !config) return;
      state.editorOpen = true;
      state.realVehicleVisible = state.vehicle.visible;
      state.vehicle.visible = true;
      state.weapon = {
        ...state.weapon,
        visible: true,
        name: "weapon_pistol",
        clip: 12,
        reserve: 48,
      };
      state.status = {
        ...state.status,
        voice: state.status.voice || 66,
        voiceLabel: state.status.voiceLabel || "Normal",
        radioActive: state.status.radioActive || true,
        radioChannel: state.status.radioChannel || 91.7,
      };
      state.config = normalizeConfig(deepClone(config));
      dom.editorOverlay.classList.remove("hidden");
      dom.hudRoot.classList.add("editor-preview-mode");
      populateEditor(state.config);
      renderHud();
    }

    function closeEditor() {
      state.editorOpen = false;
      state.vehicle.visible = state.realVehicleVisible;
      dom.editorOverlay.classList.add("hidden");
      dom.hudRoot.classList.remove("editor-preview-mode");
      renderHud();
    }

    return {
      collectConfig,
      applyEditorPreview,
      openEditor,
      closeEditor,
    };
  }

  window.MZHudEditorLifecycle = { create };
})();
