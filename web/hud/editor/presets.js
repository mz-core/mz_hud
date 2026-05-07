(function () {
  "use strict";

  function create(ctx) {
    const {
      state,
      dom,
      nui,
      escapeHTML,
      normalizeConfig,
      renderHud,
      populateEditor,
      applyChatLayoutPreview,
    } = ctx;

    let loadedOnce = false;
    let isBusy = false;

    function managerDom() {
      return {
        list: document.getElementById("preset-manager-list"),
        active: document.getElementById("preset-active-label"),
        backups: document.getElementById("preset-backup-summary"),
        status: document.getElementById("preset-manager-status"),
      };
    }

    function setStatus(message, type = "info") {
      const nodes = managerDom();
      if (!nodes.status) return;
      nodes.status.textContent = message || "";
      nodes.status.dataset.type = type;
    }

    function render(meta) {
      const nodes = managerDom();
      if (!nodes.list) return;

      const payload = meta || state.editorPresetManager || {};
      const presets = Array.isArray(payload.presets) ? payload.presets : [];
      const active = payload.active_preset || "custom";
      const backupCount = payload.backups && Number(payload.backups.count || 0);
      const latest = payload.backups && payload.backups.latest;

      if (nodes.active) {
        nodes.active.textContent =
          active === "custom" ? "Atual: customizado" : `Atual: ${active}`;
      }

      if (nodes.backups) {
        nodes.backups.textContent = latest
          ? `Backups: ${backupCount} • último ${latest.id}`
          : `Backups: ${backupCount || 0}`;
      }

      if (!payload.presets_enabled) {
        nodes.list.innerHTML =
          '<div class="preset-empty-state">Presets estão desativados no config.lua.</div>';
        return;
      }

      if (!presets.length) {
        nodes.list.innerHTML =
          '<div class="preset-empty-state">Nenhum preset encontrado no manifesto.</div>';
        return;
      }

      nodes.list.innerHTML = presets
        .map((preset) => {
          const name = String(preset.name || "");
          const activeClass = name === active ? " active" : "";
          const production = preset.safe_for_production
            ? '<span class="preset-tag safe">produção</span>'
            : '<span class="preset-tag warning">teste</span>';
          return `
            <article class="preset-option${activeClass}">
              <div class="preset-option-head">
                <strong>${escapeHTML(preset.label || name)}</strong>
                ${production}
              </div>
              <p>${escapeHTML(preset.recommended_for || "Preset global da HUD")}</p>
              <div class="preset-option-meta">
                <span>Status: ${escapeHTML(preset.status_style || "-")}</span>
                <span>Velocímetro: ${escapeHTML(preset.speedometer_style || "-")}</span>
              </div>
              <button type="button" class="ghost-button compact-button" data-editor-preset-apply="${escapeHTML(name)}">
                Aplicar
              </button>
            </article>`;
        })
        .join("");
    }

    async function refresh() {
      if (!state.canManage) return;
      setStatus("Carregando presets...", "info");
      const result = await nui("getEditorPresetManager");
      if (!result || result.ok !== true) {
        setStatus(`Falha ao carregar presets: ${(result && result.error) || "unknown"}`, "error");
        render({ presets_enabled: false, presets: [] });
        return;
      }

      loadedOnce = true;
      state.editorPresetManager = result;
      render(result);
      setStatus("Presets carregados.", "success");
    }

    async function applyPreset(name) {
      if (!name || isBusy) return;
      isBusy = true;
      setStatus(`Aplicando preset ${name}...`, "info");

      const result = await nui("applyPresetFromEditor", { preset: name });
      if (!result || result.ok !== true) {
        isBusy = false;
        setStatus(`Falha ao aplicar preset: ${(result && result.error) || "unknown"}`, "error");
        return;
      }

      if (result.config) {
        state.config = normalizeConfig(result.config);
        populateEditor(state.config);
        applyChatLayoutPreview(state.config.chat);
        renderHud();
      }

      state.editorPresetManager = result.manager || state.editorPresetManager;
      render(state.editorPresetManager);
      setStatus(`Preset aplicado: ${result.label || name}`, "success");
      isBusy = false;
    }

    async function createBackup() {
      if (isBusy) return;
      isBusy = true;
      setStatus("Criando backup da configuração atual...", "info");

      const result = await nui("createEditorBackup");
      if (!result || result.ok !== true) {
        isBusy = false;
        setStatus(`Falha ao criar backup: ${(result && result.error) || "unknown"}`, "error");
        return;
      }

      state.editorPresetManager = result.manager || state.editorPresetManager;
      render(state.editorPresetManager);
      setStatus(`Backup criado: ${result.backup}`, "success");
      isBusy = false;
    }

    function bind() {
      if (!dom.editorOverlay) return;
      dom.editorOverlay.addEventListener("click", (event) => {
        const applyButton = event.target.closest("[data-editor-preset-apply]");
        if (applyButton) {
          applyPreset(applyButton.dataset.editorPresetApply);
          return;
        }

        if (event.target.closest("#preset-manager-refresh")) {
          refresh();
          return;
        }

        if (event.target.closest("#preset-manager-backup")) {
          createBackup();
        }
      });
    }

    function ensureLoaded() {
      refresh();
    }

    return {
      bind,
      refresh,
      render,
      ensureLoaded,
    };
  }

  window.MZHudEditorPresets = { create };
})();
