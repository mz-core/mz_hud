(function () {
  "use strict";

  const app = window.MZHudApp;
  if (!app) return;

  const state = app.state;
  const dom = app.dom;
  const h = app.helpers;

  app.bindActions = function bindActions() {
    dom.closeEditor.addEventListener("click", () => app.nui("closeEditor"));
    dom.saveConfig.addEventListener("click", () =>
      app.nui("saveConfig", { config: app.collectConfig() }),
    );
    dom.resetConfig.addEventListener("click", () =>
      app.nui(
        "resetConfig",
        state.selectedElement === "chat" ? { module: "chat" } : {},
      ),
    );
    dom.previewNotify.addEventListener("click", () =>
      app.nui("notifyPreview", {
        type: "inform",
        description: "Preview local do editor da HUD.",
      }),
    );

    app.getEditorPresetModule()?.bind();

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
      app.applyEditorPreview();
    });

    dom.editorOverlay.addEventListener("change", (event) => {
      const target = event.target;
      if (target?.closest?.(".chat-editor-card")) {
        state.selectedElement = "chat";
      }
      if (target && target.id === "general-hud-position") {
        h.applyMinimapQuickPosition(target.value);
      }
      if (target && target.id === "status-group-position") {
        h.applyStatusGroupQuickPosition(target.value);
      }
      if (target && target.id === "chat-preset") {
        h.applyChatQuickPosition(target.value);
      }
      app.applyEditorPreview();
    });

    dom.editorOverlay.addEventListener("click", (event) => {
      if (event.target.closest(".chat-editor-card")) {
        state.selectedElement = "chat";
      }
      const elementButton = event.target.closest("[data-select-element]");
      if (elementButton) {
        state.selectedElement = elementButton.dataset.selectElement;
        state.config = app.collectConfig();
        app.renderElementsEditor(state.config);
        app.renderVoiceEditor(state.config);
        app.renderHud();
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
        app.applyEditorPreview();
        return;
      }
      const colorPreset = event.target.closest("[data-color-preset]");
      if (colorPreset) {
        const card = colorPreset.closest(".element-card");
        const color = colorPreset.dataset.colorPreset;
        card.querySelector('[data-field="color"]').value = color;
        card.querySelector('[data-field="color_text"]').value = color;
        app.applyEditorPreview();
        return;
      }
      const speedTheme = event.target.closest("[data-speed-theme]");
      if (speedTheme) {
        const theme = h.speedometerThemes[speedTheme.dataset.speedTheme];
        if (theme) {
          app.setFormValue("speedometer-primary-color", theme.primary_color);
          app.setFormValue("speedometer-secondary-color", theme.secondary_color);
          app.setFormValue("speedometer-accent-color", theme.accent_color);
          app.setFormValue("speedometer-background-color", theme.background_color);
          app.applyEditorPreview();
        }
      }
    });

    dom.hudRoot.addEventListener("click", (event) => {
      if (!state.editorOpen) return;
      const item = event.target.closest("[data-hud-select]");
      if (item) {
        state.selectedElement = item.dataset.hudSelect;
        state.config = app.collectConfig();
        app.renderElementsEditor(state.config);
        app.renderVoiceEditor(state.config);
        app.renderHud();
      }
    });
  };

  app.handleMessage = function handleMessage(event) {
    const data = event.data || {};
    if (data.action === "bootstrap") {
      state.config = h.normalizeConfig(data.config);
      app.applyChatLayoutPreview(state.config.chat);
      state.canManage = Boolean(data.canManage);
      state.hudVisible = data.hudVisible !== false;
      state.speedometerVisible = data.speedometerVisible !== false;
      app.markUIReady();
      app.renderHud();
      return;
    }
    if (data.action === "applyConfig") {
      state.config = h.normalizeConfig(data.config);
      app.applyChatLayoutPreview(state.config.chat);
      app.renderHud();
      if (state.editorOpen) app.getEditorPresetModule()?.refresh();
      return;
    }
    if (data.action === "updateStatus") {
      state.status = { ...state.status, ...(data.status || {}) };
      app.renderHud();
      return;
    }
    if (data.action === "updateMedical") {
      const medical = data.medical || {};
      const target = dom.medicalHud;
      if (!target) return;
      const stateName = String(medical.state || "alive");
      if (stateName === "alive") {
        target.classList.add("hidden");
        target.innerHTML = "";
        return;
      }
      const remaining = Math.max(0, Number(medical.remaining) || 0);
      const minutes = Math.floor(remaining / 60);
      const seconds = String(Math.floor(remaining % 60)).padStart(2, "0");
      const title = stateName === "downed" ? "INCAPACITADO" : stateName === "dead" ? "MORTO" : "RESPAWN EM ANDAMENTO";
      const instructions = [];
      if (medical.treatment) instructions.push("Atendimento em andamento");
      if (medical.helpEnabled && stateName !== "respawning") instructions.push("H - pedir ajuda");
      if (medical.respawnAvailable && stateName === "dead") instructions.push("E - respawn hospitalar");
      target.className = `medical-hud medical-${stateName}`;
      target.innerHTML = `<strong>${h.escapeHTML(title)}</strong><span>${minutes}:${seconds}</span><small>${h.escapeHTML(instructions.join(" · "))}</small>`;
      return;
    }
    if (data.action === "updateVehicle") {
      const incoming = data.vehicle || {};
      if (!state.editorOpen) {
        state.vehicle = { ...state.vehicle, ...incoming };
        state.realVehicleVisible = state.vehicle.visible;
      }
      app.renderSpeedometer();
      app.renderLogo();
      app.applyVisibility();
      return;
    }
    if (data.action === "updateWeapon") {
      const incoming = data.weapon || {};
      if (!state.editorOpen) {
        state.weapon = { ...state.weapon, ...incoming };
      }
      app.renderWeaponHud();
      app.applyVisibility();
      return;
    }
    if (data.action === "setHudVisible") {
      state.hudVisible = Boolean(data.visible);
      app.applyVisibility();
      return;
    }
    if (data.action === "setSpeedometerVisible") {
      state.speedometerVisible = Boolean(data.visible);
      app.applyVisibility();
      return;
    }
    if (data.action === "openEditor") {
      state.config = h.normalizeConfig(data.config || state.config);
      app.applyChatLayoutPreview(state.config.chat);
      state.canManage = Boolean(data.canManage ?? state.canManage);
      app.openEditor(state.config);
      return;
    }
    if (data.action === "closeEditor") app.closeEditor();
  };
})();
