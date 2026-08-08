(function () {
  "use strict";

  const app = window.MZHudApp;
  if (!app) return;
  const { state, dom } = app;
  const h = app.helpers;

  app.bindActions = function bindActions() {
    app.getEditorModule();
    app.getEditorPresetModule();
  };

  function renderMedical(medical) {
    const target = dom.medicalHud;
    if (!target) return;
    const stateName = String(medical.state || "alive");
    if (stateName === "alive") {
      target.classList.add("hidden");
      target.innerHTML = "";
      return;
    }
    const remaining = Math.max(0, Number(medical.remaining) || 0);
    const title = stateName === "downed" ? "INCAPACITADO" : stateName === "dead" ? "MORTO" : "RESPAWN EM ANDAMENTO";
    const notes = [];
    if (medical.treatment) notes.push("Atendimento em andamento");
    if (medical.helpEnabled && stateName !== "respawning") notes.push("H - pedir ajuda");
    if (medical.respawnAvailable && stateName === "dead") notes.push("E - respawn hospitalar");
    target.className = `medical-hud medical-${stateName}`;
    target.innerHTML = `<strong>${h.escapeHTML(title)}</strong><span>${Math.floor(remaining / 60)}:${String(Math.floor(remaining % 60)).padStart(2, "0")}</span><small>${h.escapeHTML(notes.join(" · "))}</small>`;
  }

  app.handleMessage = function handleMessage(event) {
    const data = event.data || {};
    if (data.action === "bootstrap") {
      state.config = h.normalizeConfig(data.config);
      state.editorDefaults = h.normalizeConfig(data.defaults || data.config);
      app.applyChatLayoutPreview(state.config.chat);
      state.canManage = Boolean(data.canManage);
      state.hudVisible = data.hudVisible !== false;
      state.speedometerVisible = data.speedometerVisible !== false;
      app.markUIReady();
      app.renderHud();
      return;
    }
    if (data.action === "applyConfig") {
      if (state.editorOpen) return;
      state.config = h.normalizeConfig(data.config);
      app.applyChatLayoutPreview(state.config.chat);
      app.renderHud();
      return;
    }
    if (data.action === "updateStatus") {
      if (state.editorOpen) return;
      state.status = { ...state.status, ...(data.status || {}) };
      app.renderHud();
      return;
    }
    if (data.action === "updateMedical") return renderMedical(data.medical || {});
    if (data.action === "updateVehicle") {
      if (state.editorOpen) return;
      state.vehicle = { ...state.vehicle, ...(data.vehicle || {}) };
      state.realVehicleVisible = state.vehicle.visible;
      app.renderSpeedometer(); app.renderLogo(); app.applyVisibility();
      return;
    }
    if (data.action === "updateWeapon") {
      if (state.editorOpen) return;
      state.weapon = { ...state.weapon, ...(data.weapon || {}) };
      app.renderWeaponHud(); app.applyVisibility();
      return;
    }
    if (data.action === "setHudVisible") { state.hudVisible = Boolean(data.visible); app.applyVisibility(); return; }
    if (data.action === "setSpeedometerVisible") { state.speedometerVisible = Boolean(data.visible); app.applyVisibility(); return; }
    if (data.action === "openEditor") {
      state.config = h.normalizeConfig(data.config || state.config);
      state.editorDefaults = h.normalizeConfig(data.defaults || state.editorDefaults || state.config);
      state.canManage = Boolean(data.canManage ?? state.canManage);
      app.openEditor(state.config, state.editorDefaults);
      return;
    }
    if (data.action === "closeEditor") app.closeEditor();
  };
})();
