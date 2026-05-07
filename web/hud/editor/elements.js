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
      getElementIconOptions,
      renderElementIcon,
      iconOptionList,
      escapeHTML,
      withElementDefaults,
      withCommsOptions,
    } = ctx;

    function elementSummary(key, entry) {
      return `${entry.enabled ? "Ativado" : "Desativado"} • ${labels[entry.style || "circle"] || "Círculo"} • ${entry.individual || key === "voice" || key === "radio" ? "Separado" : "No grupo"}`;
    }

    function optionList(options, activeValue, labelResolver) {
      return options
        .map(function (value) {
          const label = labelResolver ? labelResolver(value) : value;
          return `<option value="${value}" ${value === activeValue ? "selected" : ""}>${label}</option>`;
        })
        .join("");
    }

    function renderIconOptions(key, activeIcon) {
      if (typeof getElementIconOptions === "function" && typeof iconOptionList === "function") {
        return iconOptionList(getElementIconOptions(key), activeIcon);
      }
      return optionList(selectOptions.icon, activeIcon);
    }

    function renderIconPreview(key, entry) {
      if (typeof renderElementIcon === "function") return renderElementIcon(key, entry);
      return iconMap?.[entry.icon] || iconMap?.heart || "";
    }

    function colorPresetButtons() {
      return colorPresets
        .map(function (color) {
          return `<button type="button" data-color-preset="${color}" style="--preset:${color}"></button>`;
        })
        .join("");
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
          <span class="element-icon-preview">${renderIconPreview(key, entry)}</span>
          <span><strong>${escapeHTML(entry.label)}${isVoice ? " <em>aba voz</em>" : ""}</strong><small>${escapeHTML(elementSummary(key, entry))}</small></span>
          <input data-field="enabled" type="checkbox" ${entry.enabled ? "checked" : ""} title="Ativado">
        </button>
        <div class="element-card-body">
          <div class="editor-mini-grid">
            <label><span>Ícone</span><select data-field="icon">${renderIconOptions(key, entry.icon)}</select></label>
            <label><span>Posição rápida</span><select data-field="position">${optionList(selectOptions.itemPosition, entry.position, (position) => labels[position])}</select></label>
          </div>
          <label><span>Formato</span><div class="style-options">${selectOptions.elementStyle.map((style) => `<button type="button" class="style-option ${style === (entry.style || "circle") ? "active" : ""}" data-style="${style}">${labels[style]}</button>`).join("")}</div><input data-field="style" type="hidden" value="${escapeHTML(entry.style || "circle")}"></label>
          ${!isVoice ? `<label class="toggle-row"><span>Mover separado do grupo</span><input data-field="individual" type="checkbox" ${entry.individual ? "checked" : ""}></label>` : `<input data-field="individual" type="hidden" value="true">`}
          <label class="toggle-row"><span>Posição livre em porcentagem</span><input data-field="free" type="checkbox" ${entry.free ? "checked" : ""}></label>
          <div class="editor-mini-grid">
            <label><span>X (%)</span><input data-field="x" type="number" min="0" max="100" step="0.1" value="${entry.x}"></label>
            <label><span>Y (%)</span><input data-field="y" type="number" min="0" max="100" step="0.1" value="${entry.y}"></label>
          </div>
          <label><span>Cor</span><div class="color-line"><input data-field="color" type="color" value="${entry.color}"><input data-field="color_text" type="text" value="${escapeHTML(entry.color)}"></div><div class="preset-colors">${colorPresetButtons()}</div></label>
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
          const iconOptions = renderIconOptions(key, entry.icon);
          const positionOptions = optionList(
            selectOptions.itemPosition,
            entry.position,
            function (position) {
              return labels[position];
            },
          );
          const presets = colorPresetButtons();
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
            renderIconPreview(key, entry) +
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

    return {
      elementSummary,
      renderElementsEditor,
      renderVoiceEditor,
      collectElementConfig,
    };
  }

  window.MZHudEditorElements = { create };
})();
