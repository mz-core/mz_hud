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

  const medicalPresentations = {
    downed: {
      eyebrow: "ESTADO DE INCAPACITAÇÃO",
      title: "NOCAUTEADO",
      description: "Você está incapacitado. Aguarde atendimento médico ou peça ajuda.",
      timerLabel: "TEMPO RESTANTE",
      monitor: "PULSO INSTÁVEL",
      wave: "M0 50 L110 50 L126 28 L143 76 L164 50 L286 50 L305 12 L326 88 L350 50 L470 50 L490 34 L505 66 L524 50 L720 50",
    },
    dead: {
      eyebrow: "ESTADO CRÍTICO",
      title: "MORTO",
      description: "Aguarde a liberação do atendimento hospitalar.",
      timerLabel: "RESPAWN DISPONÍVEL EM",
      monitor: "SEM PULSO",
      wave: "M0 50 L720 50",
    },
    respawning: {
      eyebrow: "ATENDIMENTO HOSPITALAR",
      title: "RESPAWN EM ANDAMENTO",
      description: "Aguarde enquanto seu personagem é transferido.",
      timerLabel: "PROCESSANDO",
      monitor: "TRANSFERINDO",
      wave: "M0 50 L170 50 L184 40 L198 60 L214 50 L430 50 L444 40 L458 60 L474 50 L720 50",
    },
  };

  function formatMedicalTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
  }

  function medicalMarkup(presentation) {
    return `
      <div class="medical-vignette" aria-hidden="true"></div>
      <main class="medical-stage">
        <div class="medical-eyebrow"><i></i><span>${h.escapeHTML(presentation.eyebrow)}</span><b></b></div>
        <h1>${h.escapeHTML(presentation.title)}</h1>
        <p class="medical-description">${h.escapeHTML(presentation.description)}</p>

        <section class="medical-monitor" aria-label="Monitor de sinais vitais">
          <header>
            <div class="medical-monitor-title">
              <span class="medical-heart" aria-hidden="true">♥</span>
              <strong>SINAIS VITAIS</strong>
            </div>
            <div class="medical-monitor-state"><i></i><span>${h.escapeHTML(presentation.monitor)}</span></div>
          </header>
          <div class="medical-wave" aria-hidden="true">
            <svg viewBox="0 0 720 100" preserveAspectRatio="none">
              <path class="medical-wave-base" d="${presentation.wave}"></path>
              <path class="medical-wave-trace" d="${presentation.wave}"></path>
            </svg>
          </div>
          <footer>
            <span>ESTADO</span><strong>${h.escapeHTML(presentation.monitor)}</strong>
          </footer>
        </section>

        <div class="medical-timer">
          <small data-medical-timer-label>${h.escapeHTML(presentation.timerLabel)}</small>
          <strong data-medical-timer-value>0:00</strong>
          <i></i>
        </div>

        <div class="medical-actions" aria-label="Ações disponíveis">
          <div data-medical-action="help" class="hidden"><kbd>H</kbd><span>Pedir ajuda</span></div>
          <div data-medical-action="respawn" class="hidden"><kbd>E</kbd><span>Respawn hospitalar</span></div>
          <div data-medical-action="treatment" class="medical-treatment hidden"><span class="medical-treatment-dot"></span><span>Atendimento em andamento</span></div>
        </div>
      </main>`;
  }

  function setMedicalAction(target, action, visible) {
    const element = target.querySelector(`[data-medical-action="${action}"]`);
    if (element) element.classList.toggle("hidden", !visible);
  }

  function renderMedical(medical) {
    const target = dom.medicalHud;
    if (!target) return;
    const requestedState = String(medical.state || "alive");
    const stateName = Object.prototype.hasOwnProperty.call(medicalPresentations, requestedState)
      ? requestedState
      : "alive";
    if (stateName === "alive") {
      target.className = "medical-hud hidden";
      delete target.dataset.medicalState;
      target.innerHTML = "";
      return;
    }

    const presentation = medicalPresentations[stateName];
    const remaining = Math.max(0, Number(medical.remaining) || 0);
    const respawnAvailable = medical.respawnAvailable === true && stateName === "dead";

    if (target.dataset.medicalState !== stateName) {
      target.innerHTML = medicalMarkup(presentation);
      target.dataset.medicalState = stateName;
    }

    target.className = `medical-hud medical-${stateName}${respawnAvailable ? " medical-ready" : ""}`;
    const timerLabel = target.querySelector("[data-medical-timer-label]");
    const timerValue = target.querySelector("[data-medical-timer-value]");
    if (timerLabel) timerLabel.textContent = respawnAvailable ? "RESPAWN HOSPITALAR LIBERADO" : presentation.timerLabel;
    if (timerValue) timerValue.textContent = formatMedicalTime(remaining);
    setMedicalAction(target, "help", medical.helpEnabled === true && stateName !== "respawning");
    setMedicalAction(target, "respawn", respawnAvailable);
    setMedicalAction(target, "treatment", medical.treatment === true);
  }

  app.handleMessage = function handleMessage(event) {
    const data = event.data || {};
    if (data.action === "bootstrap") {
      state.config = h.normalizeConfig(data.config);
      state.editorDefaults = h.normalizeConfig(data.defaults || data.config);
      app.applyChatLayoutPreview(state.config.chat);
      state.canManage = Boolean(data.canManage);
      state.hudVisible = data.hudVisible !== false;
      state.logoVisible = data.logoVisible !== false;
      state.speedometerVisible = data.speedometerVisible !== false;
      state.minimapInset = Number(data.minimapInset) || 0;
      app.markUIReady();
      app.renderHud();
      return;
    }
    if (data.action === "applyConfig") {
      if (state.editorOpen) return;
      state.config = h.normalizeConfig(data.config);
      state.minimapInset = Number(data.minimapInset) || state.minimapInset || 0;
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
    if (data.action === "setHudVisible") {
      state.hudVisible = Boolean(data.visible);
      state.logoVisible = data.logoVisible == null ? state.hudVisible : Boolean(data.logoVisible);
      app.renderHud();
      return;
    }
    if (data.action === "setSpeedometerVisible") { state.speedometerVisible = Boolean(data.visible); app.applyVisibility(); return; }
    if (data.action === "openEditor") {
      state.config = h.normalizeConfig(data.config || state.config);
      state.editorDefaults = h.normalizeConfig(data.defaults || state.editorDefaults || state.config);
      state.canManage = Boolean(data.canManage ?? state.canManage);
      state.minimapInset = Number(data.minimapInset) || state.minimapInset || 0;
      app.openEditor(state.config, state.editorDefaults);
      return;
    }
    if (data.action === "closeEditor") app.closeEditor();
  };
})();
