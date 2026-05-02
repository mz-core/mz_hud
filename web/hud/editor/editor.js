(function () {
  "use strict";

  function create(ctx) {
    const {
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
    } = ctx;

function setFormValue(id, value) {
  const field = document.getElementById(id);
  if (!field) return;
  if (field.type === "checkbox") field.checked = Boolean(value);
  else field.value = value;
}

function elementSummary(key, entry) {
  return `${entry.enabled ? "Ativado" : "Desativado"} • ${labels[entry.style || "circle"] || "Círculo"} • ${entry.individual || key === "voice" || key === "radio" ? "Separado" : "No grupo"}`;
}

function renderElementsEditor(config) {
  const elements = config.elements || {};
  const orderedKeys = [
    "stamina",
    "armor",
    "health",
    "hunger",
    "thirst",
    "oxygen",
    "stress",
  ];
  const blocked = ["voice", "radio"];
  const keys = [
    ...orderedKeys.filter((key) => elements[key]),
    ...Object.keys(elements).filter(
      (key) => !orderedKeys.includes(key) && !blocked.includes(key),
    ),
  ];
  dom.elementsEditor.innerHTML = keys
    .map((key) => {
      const entry = withElementDefaults(key, elements[key]);
      const expanded = state.selectedElement === key;
      const isVoice = key === "voice" || key === "radio";
      return `
      <div class="element-card ${expanded ? "expanded" : ""} ${isVoice ? "voice-card" : ""}" data-element="${key}" style="--item-accent:${entry.color}">
        <button class="element-card-head" type="button" data-select-element="${key}">
          <span class="element-icon-preview">${iconMap[entry.icon] || iconMap.heart}</span>
          <span><strong>${escapeHTML(entry.label)}${isVoice ? " <em>aba voz</em>" : ""}</strong><small>${escapeHTML(elementSummary(key, entry))}</small></span>
          <input data-field="enabled" type="checkbox" ${entry.enabled ? "checked" : ""} title="Ativado">
        </button>
        <div class="element-card-body">
          <div class="editor-mini-grid">
            <label><span>Ícone</span><select data-field="icon">${selectOptions.icon.map((icon) => `<option value="${icon}" ${icon === entry.icon ? "selected" : ""}>${icon}</option>`).join("")}</select></label>
            <label><span>Posição rápida</span><select data-field="position">${selectOptions.itemPosition.map((position) => `<option value="${position}" ${position === entry.position ? "selected" : ""}>${labels[position]}</option>`).join("")}</select></label>
          </div>
          <label><span>Formato</span><div class="style-options">${selectOptions.elementStyle.map((style) => `<button type="button" class="style-option ${style === (entry.style || "circle") ? "active" : ""}" data-style="${style}">${labels[style]}</button>`).join("")}</div><input data-field="style" type="hidden" value="${escapeHTML(entry.style || "circle")}"></label>
          ${!isVoice ? `<label class="toggle-row"><span>Mover separado do grupo</span><input data-field="individual" type="checkbox" ${entry.individual ? "checked" : ""}></label>` : `<input data-field="individual" type="hidden" value="true">`}
          <label class="toggle-row"><span>Posição livre em porcentagem</span><input data-field="free" type="checkbox" ${entry.free ? "checked" : ""}></label>
          <div class="editor-mini-grid">
            <label><span>X (%)</span><input data-field="x" type="number" min="0" max="100" step="0.1" value="${entry.x}"></label>
            <label><span>Y (%)</span><input data-field="y" type="number" min="0" max="100" step="0.1" value="${entry.y}"></label>
          </div>
          <label><span>Cor</span><div class="color-line"><input data-field="color" type="color" value="${entry.color}"><input data-field="color_text" type="text" value="${escapeHTML(entry.color)}"></div><div class="preset-colors">${colorPresets.map((color) => `<button type="button" data-color-preset="${color}" style="--preset:${color}"></button>`).join("")}</div></label>
          <div class="editor-mini-grid">
            <label><span>Tamanho</span><input data-field="scale" type="range" min="50" max="180" value="${entry.scale}"></label>
            <label><span>Opacidade</span><input data-field="opacity" type="range" min="0" max="100" value="${entry.opacity}"></label>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function renderVoiceEditor(config) {
  if (!dom.voiceEditor) return;
  const elements = config.elements || {};
  const keys = ["voice", "radio"].filter(function (key) {
    return elements[key];
  });
  dom.voiceEditor.innerHTML = keys
    .map(function (key) {
      const entry = withElementDefaults(key, elements[key]);
      const opts = withCommsOptions(key, entry.comms_options || {});
      const expanded = state.selectedElement === key;
      const iconOptions = selectOptions.icon
        .map(function (icon) {
          return (
            '<option value="' +
            icon +
            '" ' +
            (icon === entry.icon ? "selected" : "") +
            ">" +
            icon +
            "</option>"
          );
        })
        .join("");
      const positionOptions = selectOptions.itemPosition
        .map(function (position) {
          return (
            '<option value="' +
            position +
            '" ' +
            (position === entry.position ? "selected" : "") +
            ">" +
            labels[position] +
            "</option>"
          );
        })
        .join("");
      const presets = colorPresets
        .map(function (color) {
          return (
            '<button type="button" data-color-preset="' +
            color +
            '" style="--preset:' +
            color +
            '"></button>'
          );
        })
        .join("");
      const behavior =
        key === "voice"
          ? '<div class="voice-options-box"><strong>Comportamento da voz</strong>' +
            '<label class="toggle-row"><span>Mostrar nome Voz</span><input data-comms-field="show_label" type="checkbox" ' +
            (opts.show_label ? "checked" : "") +
            "></label>" +
            '<label class="toggle-row"><span>Mostrar Baixo/Normal/Alto</span><input data-comms-field="show_level_text" type="checkbox" ' +
            (opts.show_level_text ? "checked" : "") +
            "></label>" +
            '<label class="toggle-row"><span>Mostrar Falando/Silêncio</span><input data-comms-field="show_talking_text" type="checkbox" ' +
            (opts.show_talking_text ? "checked" : "") +
            "></label>" +
            '<label><span>Opacidade parado</span><input data-comms-field="inactive_opacity" type="range" min="25" max="100" value="' +
            (opts.inactive_opacity || 72) +
            '"></label></div>'
          : '<div class="voice-options-box"><strong>Comportamento do rádio</strong>' +
            '<label class="toggle-row"><span>Mostrar frequência/MHz</span><input data-comms-field="show_frequency" type="checkbox" ' +
            (opts.show_frequency ? "checked" : "") +
            "></label>" +
            '<label class="toggle-row"><span>Aparecer mesmo desconectado</span><input data-comms-field="show_inactive" type="checkbox" ' +
            (opts.show_inactive ? "checked" : "") +
            "></label>" +
            '<label class="toggle-row"><span>Mostrar estado falando/online</span><input data-comms-field="show_talking_text" type="checkbox" ' +
            (opts.show_talking_text ? "checked" : "") +
            "></label>" +
            '<label><span>Texto desconectado</span><input data-comms-field="inactive_text" type="text" value="' +
            escapeHTML(opts.inactive_text || "OFF") +
            '"></label>' +
            '<label><span>Sufixo da frequência</span><input data-comms-field="frequency_suffix" type="text" value="' +
            escapeHTML(opts.frequency_suffix || "MHz") +
            '"></label></div>';
      return (
        '<div class="element-card voice-card comms-card ' +
        (expanded ? "expanded" : "") +
        '" data-element="' +
        key +
        '" style="--item-accent:' +
        entry.color +
        '">' +
        '<button class="element-card-head" type="button" data-select-element="' +
        key +
        '"><span class="element-icon-preview">' +
        (iconMap[entry.icon] ||
          (key === "radio" ? iconMap.radio : iconMap.mic)) +
        "</span><span><strong>" +
        escapeHTML(entry.label) +
        "</strong><small>Módulo próprio • " +
        (key === "radio" ? "rádio/MHz" : "voz 3 níveis") +
        '</small></span><input data-field="enabled" type="checkbox" ' +
        (entry.enabled ? "checked" : "") +
        ' title="Ativado"></button>' +
        '<div class="element-card-body"><div class="editor-mini-grid"><label><span>Ícone</span><select data-field="icon">' +
        iconOptions +
        '</select></label><label><span>Posição rápida</span><select data-field="position">' +
        positionOptions +
        "</select></label></div>" +
        '<input data-field="style" type="hidden" value="comms"><input data-field="individual" type="hidden" value="true">' +
        '<label class="toggle-row"><span>Posição livre em porcentagem</span><input data-field="free" type="checkbox" ' +
        (entry.free ? "checked" : "") +
        "></label>" +
        '<div class="editor-mini-grid"><label><span>X (%)</span><input data-field="x" type="number" min="0" max="100" step="0.1" value="' +
        entry.x +
        '"></label><label><span>Y (%)</span><input data-field="y" type="number" min="0" max="100" step="0.1" value="' +
        entry.y +
        '"></label></div>' +
        '<label><span>Cor principal</span><div class="color-line"><input data-field="color" type="color" value="' +
        entry.color +
        '"><input data-field="color_text" type="text" value="' +
        escapeHTML(entry.color) +
        '"></div><div class="preset-colors">' +
        presets +
        "</div></label>" +
        '<div class="editor-mini-grid"><label><span>Tamanho</span><input data-field="scale" type="range" min="50" max="180" value="' +
        entry.scale +
        '"></label><label><span>Opacidade</span><input data-field="opacity" type="range" min="0" max="100" value="' +
        entry.opacity +
        '"></label></div>' +
        behavior +
        "</div></div>"
      );
    })
    .join("");
}

function populateEditor(config) {
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
  setFormValue("speedometer-enabled", config.speedometer.enabled);
  config.speedometer = withSpeedometerDefaults(config.speedometer || {});
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

function collectElementConfig() {
  const elements = {};
  [dom.elementsEditor, dom.voiceEditor].filter(Boolean).forEach((container) => {
    container.querySelectorAll(".element-card").forEach((card) => {
      const key = card.dataset.element;
      if (!key) return;
      elements[key] = {
        enabled: card.querySelector('[data-field="enabled"]').checked,
        label: state.config?.elements?.[key]?.label || key,
        icon: card.querySelector('[data-field="icon"]').value,
        style: card.querySelector('[data-field="style"]').value || "circle",
        color: card.querySelector('[data-field="color_text"]').value,
        position:
          card.querySelector('[data-field="position"]').value ||
          "bottom-center",
        individual:
          card.querySelector('[data-field="individual"]')?.type === "hidden"
            ? true
            : Boolean(card.querySelector('[data-field="individual"]')?.checked),
        free: card.querySelector('[data-field="free"]').checked,
        x: Number(card.querySelector('[data-field="x"]').value),
        y: Number(card.querySelector('[data-field="y"]').value),
        scale: Number(card.querySelector('[data-field="scale"]').value),
        opacity: Number(card.querySelector('[data-field="opacity"]').value),
      };
      const commsFields = card.querySelectorAll("[data-comms-field]");
      if (commsFields.length) {
        elements[key].comms_options = {};
        commsFields.forEach((field) => {
          const name = field.dataset.commsField;
          if (!name) return;
          if (field.type === "checkbox")
            elements[key].comms_options[name] = field.checked;
          else if (field.type === "range" || field.type === "number")
            elements[key].comms_options[name] = Number(field.value);
          else elements[key].comms_options[name] = field.value;
        });
      } else if (state.config?.elements?.[key]?.comms_options) {
        elements[key].comms_options = state.config.elements[key].comms_options;
      }
    });
  });
  return elements;
}

function collectConfig() {
  return {
    general: {
      hud_position: document.getElementById("general-hud-position").value,
      minimap_style: document.getElementById("general-minimap-style").value,
      show_minimap: document.getElementById("general-show-minimap").checked,
      minimap_visibility: document.getElementById("general-minimap-visibility")
        .value,
      minimap_x: Number(document.getElementById("general-minimap-x").value),
      minimap_y: Number(document.getElementById("general-minimap-y").value),
      status_group: {
        enabled: document.getElementById("status-group-enabled").checked,
        position: document.getElementById("status-group-position").value,
        free: document.getElementById("status-group-free").checked,
        x: Number(document.getElementById("status-group-x").value),
        y: Number(document.getElementById("status-group-y").value),
        scale: Number(document.getElementById("status-group-scale").value),
        opacity: Number(document.getElementById("status-group-opacity").value),
        gap: Number(document.getElementById("status-group-gap").value),
      },
      global_opacity: Number(
        document.getElementById("general-global-opacity").value,
      ),
      scale: Number(document.getElementById("general-scale").value),
    },
    speedometer: {
      enabled: document.getElementById("speedometer-enabled").checked,
      position: document.getElementById("speedometer-position").value,
      free: document.getElementById("speedometer-free")?.checked ?? false,
      x: Number(document.getElementById("speedometer-x")?.value ?? 88),
      y: Number(document.getElementById("speedometer-y")?.value ?? 82),
      style: document.getElementById("speedometer-style").value,
      unit: document.getElementById("speedometer-unit").value,
      show_speed: document.getElementById("speedometer-show-speed").checked,
      show_rpm: document.getElementById("speedometer-show-rpm").checked,
      show_fuel: document.getElementById("speedometer-show-fuel").checked,
      show_gear: document.getElementById("speedometer-show-gear").checked,
      show_seatbelt:
        document.getElementById("speedometer-show-seatbelt")?.checked || false,
      show_lights: document.getElementById("speedometer-show-lights").checked,
      show_engine: document.getElementById("speedometer-show-engine").checked,
      opacity: Number(document.getElementById("speedometer-opacity").value),
      scale: Number(document.getElementById("speedometer-scale").value),
      primary_color: document.getElementById("speedometer-primary-color").value,
      secondary_color: document.getElementById("speedometer-secondary-color")
        .value,
      accent_color: document.getElementById("speedometer-accent-color").value,
      background_color: document.getElementById("speedometer-background-color")
        .value,
    },
    weapon: {
      enabled: document.getElementById("weapon-enabled")?.checked ?? true,
      position: document.getElementById("weapon-position")?.value || "bottom-right",
      free: document.getElementById("weapon-free")?.checked ?? true,
      x: Number(document.getElementById("weapon-x")?.value ?? 88),
      y: Number(document.getElementById("weapon-y")?.value ?? 78),
      show_image: document.getElementById("weapon-show-image")?.checked ?? true,
      show_ammo: document.getElementById("weapon-show-ammo")?.checked ?? true,
      show_name: document.getElementById("weapon-show-name")?.checked ?? false,
      icon_model: "default",
      image_model: "default",
      opacity: Number(document.getElementById("weapon-opacity")?.value ?? 94),
      scale: Number(document.getElementById("weapon-scale")?.value ?? 100),
    },
    chat: {
      enabled: document.getElementById("chat-enabled")?.checked ?? true,
      preset: document.getElementById("chat-preset")?.value || "left-top",
      free: document.getElementById("chat-free")?.checked ?? false,
      x: Number(document.getElementById("chat-x")?.value ?? 2),
      y: Number(document.getElementById("chat-y")?.value ?? 3),
      scale: Number(document.getElementById("chat-scale")?.value ?? 1),
      opacity: Number(document.getElementById("chat-opacity")?.value ?? 1),
    },
    logo: {
      enabled: document.getElementById("logo-enabled").checked,
      image_url: document.getElementById("logo-image-url").value.trim(),
      position: document.getElementById("logo-position").value,
      show_only_in_vehicle: document.getElementById("logo-show-only-in-vehicle")
        .checked,
      width: Number(document.getElementById("logo-width").value),
      height: Number(document.getElementById("logo-height").value),
      opacity: Number(document.getElementById("logo-opacity").value),
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
  state.weapon = { ...state.weapon, visible: true, name: "weapon_pistol", clip: 12, reserve: 48 };
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
      setFormValue,
      elementSummary,
      renderElementsEditor,
      renderVoiceEditor,
      populateEditor,
      collectElementConfig,
      collectConfig,
      applyEditorPreview,
      openEditor,
      closeEditor,
    };
  }

  window.MZHudEditor = { create };
})();
