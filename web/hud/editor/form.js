(function () {
  "use strict";

  function create(ctx) {
    const {
      withStatusGroupDefaults,
      withSpeedometerDefaults,
      getVehicleIconOptions,
      iconOptionList,
      withWeaponDefaults,
      withChatDefaults,
    } = ctx;

    function setFormValue(id, value) {
      const field = document.getElementById(id);
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value;
    }

    function setIconSelectValue(id, slot, value) {
      const field = document.getElementById(id);
      if (!field) return;
      const options =
        typeof getVehicleIconOptions === "function"
          ? getVehicleIconOptions(slot)
          : [];
      if (typeof iconOptionList === "function") {
        field.innerHTML = iconOptionList(options, value);
      }
      field.value = value || field.value;
    }

    function populateSpeedometerIconSelects(speedometer) {
      const icons = speedometer.icons || {};
      setIconSelectValue("speedometer-icon-fuel", "fuel", icons.fuel || "fuel");
      setIconSelectValue("speedometer-icon-engine", "engine", icons.engine || "engine");
      setIconSelectValue("speedometer-icon-engine-indicator", "engine_indicator", icons.engine_indicator || "turn");
      setIconSelectValue("speedometer-icon-belt", "belt", icons.belt || "belt");
      setIconSelectValue("speedometer-icon-unbelt", "unbelt", icons.unbelt || "unbelt");
      setIconSelectValue("speedometer-icon-light", "light", icons.light || "light");
      setIconSelectValue("speedometer-icon-light-high", "light_high", icons.light_high || "lightHigh");
      setIconSelectValue("speedometer-icon-light-off", "light_off", icons.light_off || "lightOff");
      setIconSelectValue("speedometer-icon-lock", "lock", icons.lock || "lock");
      setIconSelectValue("speedometer-icon-unlock", "unlock", icons.unlock || "unlock");
      setIconSelectValue("speedometer-icon-arrow", "arrow", icons.arrow || "arrow");
      setIconSelectValue("speedometer-icon-arrow-active", "arrow_active", icons.arrow_active || "arrowActive");
    }

    function populateEditor(config, renderElementsEditor, renderVoiceEditor) {
      setFormValue(
        "general-hud-position",
        config.general.minimap_position ||
          config.general.hud_position ||
          "bottom-left",
      );
      setFormValue("general-minimap-style", config.general.minimap_style);
      setFormValue("general-show-minimap", config.general.show_minimap);
      setFormValue(
        "general-minimap-visibility",
        config.general.minimap_visibility || "always",
      );
      setFormValue("general-minimap-x", config.general.minimap_x ?? 24);
      setFormValue("general-minimap-y", config.general.minimap_y ?? 24);

      const statusGroup = withStatusGroupDefaults(
        config.general.status_group || {},
      );
      setFormValue("status-group-enabled", statusGroup.enabled);
      setFormValue("status-group-position", statusGroup.position);
      setFormValue("status-group-free", statusGroup.free);
      setFormValue("status-group-x", statusGroup.x);
      setFormValue("status-group-y", statusGroup.y);
      setFormValue("status-group-scale", statusGroup.scale);
      setFormValue("status-group-opacity", statusGroup.opacity);
      setFormValue("status-group-gap", statusGroup.gap);
      setFormValue("general-global-opacity", config.general.global_opacity);
      setFormValue("general-scale", config.general.scale);

      config.speedometer = withSpeedometerDefaults(config.speedometer || {});
      setFormValue("speedometer-enabled", config.speedometer.enabled);
      setFormValue("speedometer-position", config.speedometer.position);
      setFormValue("speedometer-free", config.speedometer.free);
      setFormValue("speedometer-x", config.speedometer.x);
      setFormValue("speedometer-y", config.speedometer.y);
      setFormValue("speedometer-style", config.speedometer.style);
      setFormValue("speedometer-unit", config.speedometer.unit);
      setFormValue("speedometer-show-speed", config.speedometer.show_speed);
      setFormValue("speedometer-show-rpm", config.speedometer.show_rpm);
      setFormValue("speedometer-show-fuel", config.speedometer.show_fuel);
      setFormValue("speedometer-show-gear", config.speedometer.show_gear);
      setFormValue("speedometer-show-seatbelt", config.speedometer.show_seatbelt);
      setFormValue("speedometer-show-lights", config.speedometer.show_lights);
      setFormValue("speedometer-show-lock", config.speedometer.show_lock);
      setFormValue("speedometer-show-engine", config.speedometer.show_engine);
      setFormValue("speedometer-opacity", config.speedometer.opacity);
      setFormValue("speedometer-scale", config.speedometer.scale);
      setFormValue("speedometer-primary-color", config.speedometer.primary_color);
      setFormValue(
        "speedometer-secondary-color",
        config.speedometer.secondary_color,
      );
      setFormValue("speedometer-accent-color", config.speedometer.accent_color);
      setFormValue(
        "speedometer-background-color",
        config.speedometer.background_color,
      );
      populateSpeedometerIconSelects(config.speedometer);

      config.weapon = withWeaponDefaults(config.weapon || {});
      setFormValue("weapon-enabled", config.weapon.enabled);
      setFormValue("weapon-position", config.weapon.position);
      setFormValue("weapon-free", config.weapon.free);
      setFormValue("weapon-x", config.weapon.x);
      setFormValue("weapon-y", config.weapon.y);
      setFormValue("weapon-show-image", config.weapon.show_image);
      setFormValue("weapon-show-ammo", config.weapon.show_ammo);
      setFormValue("weapon-show-name", config.weapon.show_name);
      setFormValue("weapon-opacity", config.weapon.opacity);
      setFormValue("weapon-scale", config.weapon.scale);

      config.chat = withChatDefaults(config.chat || {});
      setFormValue("chat-enabled", config.chat.enabled);
      setFormValue("chat-preset", config.chat.preset);
      setFormValue("chat-free", config.chat.free);
      setFormValue("chat-x", config.chat.x);
      setFormValue("chat-y", config.chat.y);
      setFormValue("chat-scale", config.chat.scale);
      setFormValue("chat-opacity", config.chat.opacity);

      setFormValue("logo-enabled", config.logo.enabled);
      setFormValue("logo-image-url", config.logo.image_url);
      setFormValue("logo-position", config.logo.position);
      setFormValue("logo-show-only-in-vehicle", config.logo.show_only_in_vehicle);
      setFormValue("logo-width", config.logo.width);
      setFormValue("logo-height", config.logo.height);
      setFormValue("logo-opacity", config.logo.opacity);

      renderElementsEditor(config);
      renderVoiceEditor(config);
    }

    return {
      setFormValue,
      populateEditor,
    };
  }

  window.MZHudEditorForm = { create };
})();
