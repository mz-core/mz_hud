(function () {
  "use strict";

  function create(ctx) {
    const { state, nui, escapeHTML, applyPreset } = ctx;
    let busy = false;
    const list = () => document.getElementById("preset-manager-list");
    const status = () => document.getElementById("preset-manager-status");

    function setStatus(message, type = "info") {
      if (!status()) return;
      status().textContent = message;
      status().dataset.type = type;
    }

    function render(meta = {}) {
      const presets = Array.isArray(meta.presets) ? meta.presets : [];
      const active = document.getElementById("preset-active-label");
      const backups = document.getElementById("preset-backup-summary");
      if (active) active.textContent = `Persistido: ${meta.active_preset || "custom"}`;
      if (backups) backups.textContent = `Backups: ${Number(meta.backups?.count || 0)}`;
      if (!list()) return;
      list().innerHTML = presets.length ? presets.map((preset) => `
        <article class="preset-option">
          <div class="preset-preview" data-preset-theme="${escapeHTML(preset.name)}"><span></span><span></span><span></span></div>
          <div class="preset-option-head"><strong>${escapeHTML(preset.label || preset.name)}</strong><span class="preset-tag ${preset.safe_for_production ? "safe" : "warning"}">${preset.safe_for_production ? "produção" : "teste"}</span></div>
          <p>${escapeHTML(preset.recommended_for || "Preset global da HUD")}</p>
          <div class="preset-option-meta"><span>Status: ${escapeHTML(preset.status_style || "-")}</span><span>Velocímetro: ${escapeHTML(preset.speedometer_style || "-")}</span></div>
          <button type="button" data-editor-preset-apply="${escapeHTML(preset.name)}">Aplicar ao Draft</button>
        </article>`).join("") : '<div class="preset-empty-state">Nenhum preset disponível.</div>';
    }

    async function refresh() {
      setStatus("Carregando presets...", "info");
      const result = await nui("getEditorPresetManager");
      if (!result?.ok) return setStatus(`Falha ao carregar: ${result?.error || "unknown"}`, "error");
      state.editorPresetManager = result;
      render(result);
      setStatus("Escolha um preset. A aplicação continua local até salvar.", "info");
    }

    async function apply(name) {
      if (busy) return;
      busy = true;
      setStatus(`Carregando ${name} no draft...`, "info");
      const result = await nui("applyPresetFromEditor", { preset: name });
      busy = false;
      if (!result?.ok || !result.config) return setStatus(`Falha ao aplicar: ${result?.error || "unknown"}`, "error");
      applyPreset(result.config);
      setStatus(`${result.label || name} aplicado somente ao draft.`, "success");
    }

    function bind() {
      const overlay = document.getElementById("editor-preset-modal");
      if (!overlay || overlay.dataset.bound === "true") return;
      overlay.dataset.bound = "true";
      overlay.addEventListener("click", (event) => {
        const button = event.target.closest("[data-editor-preset-apply]");
        if (button) apply(button.dataset.editorPresetApply);
      });
    }

    bind();
    return { bind, refresh, ensureLoaded: refresh, render, applyPreset: apply };
  }

  window.MZHudEditorPresets = { create };
})();
