(function () {
  "use strict";

  const schema = window.MZHudEditorSchema;
  const Store = window.MZHudEditorStore?.DraftStore;
  if (!schema || !Store) return;

  const names = {
    statusGroup: "STATUS GROUP", health: "STATUS / VIDA", armor: "STATUS / COLETE",
    hunger: "STATUS / FOME", thirst: "STATUS / SEDE", stamina: "STATUS / STAMINA",
    oxygen: "STATUS / OXIGÊNIO", stress: "STATUS / STRESS", voice: "COMUNICAÇÃO / VOZ",
    radio: "COMUNICAÇÃO / RÁDIO", speedometer: "VEÍCULO / VELOCÍMETRO",
    weapon: "COMBATE / ARMA", logo: "IDENTIDADE / LOGO", chat: "INTERFACE / CHAT",
  };

  const field = (label, property, control, extra = "") =>
    `<label class="inspector-field ${extra}"><span>${label}</span>${control.replace("<INPUT", `<input data-prop="${property}"`).replace("<SELECT", `<select data-prop="${property}"`)}</label>`;
  const number = (value, min, max, step = 1) => `<INPUT type="number" value="${value}" min="${min}" max="${max}" step="${step}">`;
  const range = (value, min, max, step = 1) => `<INPUT type="range" value="${value}" min="${min}" max="${max}" step="${step}"><output>${value}</output>`;
  const toggle = (checked) => `<INPUT type="checkbox" ${checked ? "checked" : ""}>`;
  const select = (value, values) => `<SELECT>${values.map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}</select>`;

  function create(ctx) {
    const { state, dom, renderHud, normalizeConfig, deepClone, escapeHTML, getElementIconOptions } = ctx;
    const store = new Store(50);
    const ui = {
      selection: document.getElementById("editor-selection-box"),
      selectionName: document.getElementById("editor-selection-name"),
      inspector: document.getElementById("editor-inspector"),
      inspectorTitle: document.getElementById("inspector-title"),
      inspectorBody: document.getElementById("inspector-body"),
      dirty: document.getElementById("editor-dirty-state"),
      undo: document.getElementById("editor-undo"), redo: document.getElementById("editor-redo"),
      grid: document.getElementById("editor-grid-guide"), safezone: document.getElementById("editor-safezone"),
      guideX: document.getElementById("editor-guide-x"), guideY: document.getElementById("editor-guide-y"),
      presetModal: document.getElementById("editor-preset-modal"), confirm: document.getElementById("editor-confirm-modal"),
      confirmTitle: document.getElementById("confirm-title"), confirmMessage: document.getElementById("confirm-message"),
      preview: document.getElementById("editor-preview-state"), save: document.getElementById("save-config"),
    };
    let bound = false;
    let runtimeSnapshot = null;
    let pointerAction = null;
    let confirmAction = null;
    let frame = 0;
    const flags = { grid: false, snap: true, safezone: false };

    function renderDraft(reason) {
      state.config = store.draft;
      renderHud();
      updateDirty();
      if (ui.inspector && !ui.inspector.classList.contains("hidden") && reason !== "inspector-live") renderInspector();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(positionSelection);
    }

    store.onChange = (draft, reason) => {
      state.config = draft;
      renderDraft(reason);
    };

    function updateDirty(message) {
      const dirty = store.isDirty();
      ui.dirty.textContent = message || (dirty ? "● Alterações não salvas" : "Sem alterações");
      ui.dirty.classList.toggle("is-dirty", dirty);
      ui.undo.disabled = store.undoStack.length === 0;
      ui.redo.disabled = store.redoStack.length === 0;
      ui.save.disabled = !dirty;
    }

    function targetNode() {
      const id = String(state.selectedElement || "").replace(/[^a-zA-Z0-9_-]/g, "");
      return dom.hudRoot.querySelector(`[data-hud-select="${id}"]`);
    }

    function selectElement(id, openInspector = false) {
      if (!schema.target(store.draft, id)) return;
      state.selectedElement = id;
      renderHud();
      if (openInspector) showInspector();
      requestAnimationFrame(positionSelection);
    }

    function positionSelection() {
      if (!state.editorOpen || !ui.selection) return;
      const node = targetNode();
      if (!node || node.classList.contains("hidden")) {
        ui.selection.classList.add("hidden");
        return;
      }
      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) {
        ui.selection.classList.add("hidden");
        return;
      }
      ui.selection.classList.remove("hidden", "toolbar-below");
      ui.selection.style.left = `${rect.left - 5}px`;
      ui.selection.style.top = `${rect.top - 5}px`;
      ui.selection.style.width = `${rect.width + 10}px`;
      ui.selection.style.height = `${rect.height + 10}px`;
      ui.selectionName.textContent = names[state.selectedElement] || state.selectedElement;
      if (rect.top < 62) ui.selection.classList.add("toolbar-below");
    }

    function commonInspector(entry) {
      const anchorOptions = schema.anchors.map((key) => [key, key]);
      const visibility = entry.visibilityMode
        ? `<fieldset class="visibility-options"><legend>Visibilidade</legend>${schema.visibilityModes.map((mode) => `<label><input data-prop="visibilityMode" type="radio" name="visibility-mode" value="${mode}" ${entry.visibilityMode === mode ? "checked" : ""}><span>${mode === "always" ? "Sempre" : mode === "smart" ? "Inteligente" : "Oculto"}</span></label>`).join("")}<p>${window.MZHudVisibility?.descriptions?.[state.selectedElement] || "A visibilidade usa somente estados canônicos da HUD."}</p></fieldset>` : "";
      return `${field("Ativado", "enabled", toggle(entry.enabled), "toggle-field")}
        ${entry.position ? field("Âncora", "position", select(entry.position, anchorOptions)) : ""}
        ${entry.free !== undefined ? field("Posição livre", "free", toggle(entry.free), "toggle-field") : ""}
        ${entry.x !== undefined ? `<div class="inspector-pair">${field("X (%)", "x", number(entry.x, 0, 100, .1))}${field("Y (%)", "y", number(entry.y, 0, 100, .1))}</div>` : ""}
        ${entry.scale !== undefined ? field("Escala", "scale", range(entry.scale, state.selectedElement === "chat" ? .5 : 50, state.selectedElement === "chat" ? 1.8 : 180, state.selectedElement === "chat" ? .05 : 1)) : ""}
        ${entry.opacity !== undefined ? field("Opacidade", "opacity", range(entry.opacity, 0, state.selectedElement === "chat" ? 1 : 100, state.selectedElement === "chat" ? .05 : 1)) : ""}
        ${visibility}${field("Bloqueado", "locked", toggle(entry.locked), "toggle-field")}`;
    }

    function renderInspector() {
      const id = state.selectedElement;
      const entry = schema.target(store.draft, id);
      if (!entry) return;
      ui.inspectorTitle.textContent = names[id] || id;
      let specific = "";
      if (store.draft.elements?.[id]) {
        const iconOptions = typeof getElementIconOptions === "function" ? getElementIconOptions(id).map((option) => [option.id, option.label || option.id]) : [[entry.icon, entry.icon]];
        specific = `${field("Nome", "label", `<INPUT type="text" maxlength="24" value="${escapeHTML(entry.label || id)}">`)}
          ${field("Ícone", "icon", select(entry.icon, iconOptions))}
          ${field("Estilo", "style", select(entry.style || "circle", [["circle", "Circular"], ["bar", "Barra"], ["square", "Quadrado"], ["pill", "Pílula"], ["apex", "Apex"], ["comms", "Comunicação"]]))}
          ${field("Cor", "color", `<INPUT type="color" value="${entry.color || "#ffffff"}">`)}
          ${!["voice", "radio"].includes(id) ? field("Mover separado", "individual", toggle(entry.individual), "toggle-field") : ""}
          ${field("Colapsar quando oculto", "collapseWhenHidden", toggle(entry.collapseWhenHidden), "toggle-field")}`;
      } else if (id === "statusGroup") {
        specific = `${field("Orientação", "orientation", select(entry.orientation, [["horizontal", "Horizontal"], ["vertical", "Vertical"]]))}
          ${field("Alinhamento", "alignment", select(entry.alignment, [["start", "Início"], ["center", "Centro"], ["end", "Fim"]]))}
          ${field("Espaçamento", "gap", range(entry.gap, 0, 40, 1))}`;
      } else if (id === "speedometer") {
        specific = `${field("Modelo", "style", select(entry.style, [["apex", "Apex"], ["minimal", "Minimal"], ["digital", "Digital"], ["analog", "Analógico"], ["classic", "Classic"], ["racing", "Racing"], ["vector", "Vector"]]))}
          ${field("Unidade", "unit", select(entry.unit, [["kmh", "KM/H"], ["mph", "MPH"]]))}
          ${field("Velocidade", "show_speed", toggle(entry.show_speed), "toggle-field")}${field("RPM", "show_rpm", toggle(entry.show_rpm), "toggle-field")}${field("Combustível", "show_fuel", toggle(entry.show_fuel), "toggle-field")}${field("Marcha", "show_gear", toggle(entry.show_gear), "toggle-field")}${field("Cinto", "show_seatbelt", toggle(entry.show_seatbelt), "toggle-field")}
          <div class="inspector-pair">${field("Cor principal", "primary_color", `<INPUT type="color" value="${entry.primary_color || "#ffffff"}">`)}${field("Destaque", "accent_color", `<INPUT type="color" value="${entry.accent_color || "#ef4444"}">`)}</div>`;
      } else if (id === "weapon") {
        specific = `${field("Imagem", "show_image", toggle(entry.show_image), "toggle-field")}${field("Munição", "show_ammo", toggle(entry.show_ammo), "toggle-field")}${field("Nome", "show_name", toggle(entry.show_name), "toggle-field")}`;
      } else if (id === "logo") {
        specific = `${field("Imagem", "image_url", `<INPUT type="text" maxlength="512" value="${escapeHTML(entry.image_url || "")}">`)}<div class="inspector-pair">${field("Largura", "width", number(entry.width, 40, 400))}${field("Altura", "height", number(entry.height, 20, 200))}</div>${field("Só em veículo", "show_only_in_vehicle", toggle(entry.show_only_in_vehicle), "toggle-field")}`;
      }
      ui.inspectorBody.innerHTML = `<section><h3>Posicionamento e aparência</h3>${commonInspector(entry)}</section>${specific ? `<section><h3>Propriedades</h3>${specific}</section>` : ""}`;
    }

    function showInspector() {
      renderInspector();
      ui.inspector.classList.remove("hidden");
    }

    function hideInspector() { ui.inspector.classList.add("hidden"); }

    function setPreview(mode) {
      state.editorPreview = mode;
      if (!runtimeSnapshot) return;
      state.status = deepClone(runtimeSnapshot.status);
      state.vehicle = deepClone(runtimeSnapshot.vehicle);
      state.weapon = deepClone(runtimeSnapshot.weapon);
      if (["all", "vehicle"].includes(mode)) state.vehicle = { ...state.vehicle, visible: true, speed: 87, rpm: 65, fuel: 72, gear: "4", seatbeltAvailable: true };
      if (mode === "all") state.weapon = { ...state.weapon, visible: true, name: "weapon_pistol", clip: 12, reserve: 48 };
      if (mode === "low") state.status = { ...state.status, health: 18, armor: 12, hunger: 14, thirst: 10, stamina: 72 };
      if (mode === "submerged") state.status = { ...state.status, oxygen: 42, oxygenActive: true };
      renderHud();
      requestAnimationFrame(positionSelection);
    }

    function snapValue(value, axis, currentId) {
      let output = value;
      let guided = false;
      if (flags.snap) {
        const grid = 2;
        const gridValue = Math.round(value / grid) * grid;
        if (Math.abs(gridValue - value) <= .35) output = gridValue;
        if (Math.abs(value - 50) <= .75) { output = 50; guided = true; }
        const candidates = [];
        schema.statusKeys.concat(["statusGroup", "speedometer", "weapon", "logo"]).forEach((id) => {
          if (id === currentId) return;
          const item = schema.target(store.draft, id);
          if (item && Number.isFinite(Number(item[axis]))) candidates.push(Number(item[axis]));
        });
        const match = candidates.find((candidate) => Math.abs(candidate - value) <= .55);
        if (match !== undefined) { output = match; guided = true; }
      }
      (axis === "x" ? ui.guideX : ui.guideY).classList.toggle("hidden", !guided);
      return Math.max(4, Math.min(96, output));
    }

    function startPointer(event, mode) {
      if (event.button !== 0 || !state.editorOpen) return;
      let id = state.selectedElement;
      let entry = schema.target(store.draft, id);
      if (!entry || entry.locked) return;
      let node = targetNode();
      if (mode === "drag" && store.draft.elements?.[id] && entry.individual !== true) {
        id = "statusGroup";
        entry = schema.target(store.draft, id);
        node = dom.hudRoot.querySelector('[data-hud-select="statusGroup"]');
      }
      if (!entry || entry.locked) return;
      if (!node) return;
      event.preventDefault();
      store.begin();
      pointerAction = { mode, id, entry, node, startX: event.clientX, startY: event.clientY, startScale: Number(entry.scale || 100), startRect: node.getBoundingClientRect() };
      document.body.classList.add("editor-is-dragging");
    }

    function movePointer(event) {
      if (!pointerAction) return;
      const { mode, entry, node, startX, startY, startScale, startRect, id } = pointerAction;
      if (mode === "drag") {
        entry.free = true;
        entry.x = snapValue(((startRect.left + startRect.width / 2 + event.clientX - startX) / window.innerWidth) * 100, "x", id);
        entry.y = snapValue(((startRect.top + startRect.height / 2 + event.clientY - startY) / window.innerHeight) * 100, "y", id);
        node.style.left = `${entry.x}%`;
        node.style.top = `${entry.y}%`;
        node.style.right = "auto";
        node.style.bottom = "auto";
        ui.selection.style.left = `${Math.max(0, startRect.left + event.clientX - startX) - 5}px`;
        ui.selection.style.top = `${Math.max(0, startRect.top + event.clientY - startY) - 5}px`;
      } else {
        const delta = ((event.clientX - startX) + (event.clientY - startY)) * .45;
        const min = id === "chat" ? .5 : 50;
        const max = id === "chat" ? 1.8 : 180;
        entry.scale = schema.clamp(startScale + delta, min, max, startScale);
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => renderDraft("resize-live"));
      }
      updateDirty();
    }

    function endPointer() {
      if (!pointerAction) return;
      pointerAction = null;
      document.body.classList.remove("editor-is-dragging");
      ui.guideX.classList.add("hidden"); ui.guideY.classList.add("hidden");
      store.commit("pointer");
      renderDraft("pointer");
    }

    function nudge(dx, dy) {
      const entry = schema.target(store.draft, state.selectedElement);
      if (!entry || entry.locked || entry.x === undefined) return;
      store.mutate(() => { entry.free = true; entry.x = Math.max(4, Math.min(96, Number(entry.x) + dx)); entry.y = Math.max(4, Math.min(96, Number(entry.y) + dy)); }, "nudge");
    }

    function promptConfirm(action) {
      confirmAction = action;
      ui.confirmTitle.textContent = action === "reset" ? "Resetar toda a HUD?" : "Descartar alterações?";
      ui.confirmMessage.textContent = action === "reset" ? "Os padrões serão aplicados apenas ao draft. Nada será persistido até salvar." : "Existem alterações não salvas no draft.";
      ui.confirm.classList.remove("hidden");
    }

    async function save() {
      if (!store.isDirty()) return;
      ui.save.disabled = true;
      updateDirty("Salvando e validando...");
      const result = await window.MZHudApp.nui("saveConfig", { config: store.draft });
      if (!result?.ok) {
        updateDirty(result?.error === "revision_conflict" ? "Conflito: a configuração mudou no servidor" : `Falha ao salvar: ${result?.error || "unknown"}`);
        ui.save.disabled = false;
        return;
      }
      store.markSaved(result.config || store.draft);
      await window.MZHudApp.nui("closeEditor");
    }

    function discardAndClose() {
      state.config = deepClone(store.persisted);
      window.MZHudApp.nui("closeEditor");
    }

    function bind() {
      if (bound) return;
      bound = true;
      dom.hudRoot.addEventListener("pointerdown", (event) => {
        if (!state.editorOpen) return;
        const node = event.target.closest("[data-hud-select]");
        if (!node) return;
        selectElement(node.dataset.hudSelect);
        startPointer(event, "drag");
      });
      dom.editorOverlay.addEventListener("pointerdown", (event) => {
        if (event.target.closest('[data-editor-action="move"]')) startPointer(event, "drag");
      });
      dom.editorOverlay.addEventListener("click", (event) => {
        const selectButton = event.target.closest("[data-select-element]");
        if (selectButton) return selectElement(selectButton.dataset.selectElement, true);
        const action = event.target.closest("[data-editor-action]")?.dataset.editorAction;
        if (action === "inspect") showInspector();
        if (action === "toggle-lock") store.mutate(() => { const item = schema.target(store.draft, state.selectedElement); if (item) item.locked = !item.locked; }, "lock");
        if (action === "reset-element") store.reset(state.selectedElement);
        if (event.target.closest("#inspector-close")) hideInspector();
        if (event.target.closest("#editor-undo")) store.undo();
        if (event.target.closest("#editor-redo")) store.redo();
        if (event.target.closest("#editor-grid-toggle")) { flags.grid = !flags.grid; ui.grid.classList.toggle("hidden", !flags.grid); event.target.closest("button").setAttribute("aria-pressed", String(flags.grid)); }
        if (event.target.closest("#editor-snap-toggle")) { flags.snap = !flags.snap; event.target.closest("button").setAttribute("aria-pressed", String(flags.snap)); }
        if (event.target.closest("#editor-safezone-toggle")) { flags.safezone = !flags.safezone; ui.safezone.classList.toggle("hidden", !flags.safezone); event.target.closest("button").setAttribute("aria-pressed", String(flags.safezone)); }
        if (event.target.closest("#editor-presets-open")) { ui.presetModal.classList.remove("hidden"); window.MZHudApp.getEditorPresetModule()?.refresh(); }
        if (event.target.closest('[data-modal-close="presets"]')) ui.presetModal.classList.add("hidden");
        if (event.target.closest("#reset-config")) promptConfirm("reset");
        if (event.target.closest("#save-config")) save();
        if (event.target.closest("#close-editor")) store.isDirty() ? promptConfirm("close") : discardAndClose();
        if (event.target.closest("#confirm-cancel")) { confirmAction = null; ui.confirm.classList.add("hidden"); }
        if (event.target.closest("#confirm-discard")) {
          const actionToRun = confirmAction; confirmAction = null; ui.confirm.classList.add("hidden");
          if (actionToRun === "reset") store.reset("hud"); else discardAndClose();
        }
      });
      ui.inspectorBody.addEventListener("focusin", (event) => { if (event.target.dataset.prop) store.begin(); });
      ui.inspectorBody.addEventListener("input", (event) => {
        const input = event.target; const property = input.dataset.prop; if (!property) return;
        const entry = schema.target(store.draft, state.selectedElement); if (!entry) return;
        entry[property] = input.type === "checkbox" ? input.checked : input.type === "number" || input.type === "range" ? Number(input.value) : input.value;
        store.draft = schema.normalizeConfig(store.draft); state.config = store.draft;
        const output = input.parentElement?.querySelector("output"); if (output) output.value = input.value;
        renderDraft("inspector-live");
      });
      ui.inspectorBody.addEventListener("change", () => store.commit("inspector"));
      document.getElementById("editor-resize-handle").addEventListener("pointerdown", (event) => startPointer(event, "resize"));
      document.addEventListener("pointermove", movePointer);
      document.addEventListener("pointerup", endPointer);
      ui.preview.addEventListener("change", () => setPreview(ui.preview.value));
      document.getElementById("editor-element-select").addEventListener("change", (event) => { if (event.target.value) selectElement(event.target.value, true); event.target.value = ""; });
      window.addEventListener("resize", positionSelection);
      document.addEventListener("keydown", (event) => {
        if (!state.editorOpen) return;
        if (event.key === "Escape") { event.preventDefault(); if (!ui.inspector.classList.contains("hidden")) return hideInspector(); if (!ui.presetModal.classList.contains("hidden")) return ui.presetModal.classList.add("hidden"); store.isDirty() ? promptConfirm("close") : discardAndClose(); return; }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? store.redo() : store.undo(); return; }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); store.redo(); return; }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && !event.target.closest("input,select,textarea")) {
          event.preventDefault(); const step = event.shiftKey ? 10 : 1;
          nudge(event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0, event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0);
        }
      });
    }

    function openEditor(config, defaults) {
      runtimeSnapshot = { status: deepClone(state.status), vehicle: deepClone(state.vehicle), weapon: deepClone(state.weapon) };
      store.start(normalizeConfig(config), normalizeConfig(defaults || state.editorDefaults || config));
      state.editorOpen = true;
      state.selectedElement = "health";
      dom.editorOverlay.classList.remove("hidden");
      dom.hudRoot.classList.add("editor-preview-mode");
      document.body.classList.add("visual-editor-open");
      ui.preview.value = "all";
      setPreview("all");
      renderDraft("open");
      requestAnimationFrame(positionSelection);
    }

    function closeEditor() {
      state.editorOpen = false;
      state.editorPreview = "normal";
      dom.editorOverlay.classList.add("hidden");
      dom.hudRoot.classList.remove("editor-preview-mode");
      document.body.classList.remove("visual-editor-open", "editor-is-dragging");
      hideInspector(); ui.selection.classList.add("hidden"); ui.confirm.classList.add("hidden"); ui.presetModal.classList.add("hidden");
      if (runtimeSnapshot) { state.status = runtimeSnapshot.status; state.vehicle = runtimeSnapshot.vehicle; state.weapon = runtimeSnapshot.weapon; runtimeSnapshot = null; }
      state.config = deepClone(store.persisted || state.config);
      renderHud();
    }

    bind();
    return {
      openEditor, closeEditor, selectElement, showInspector, renderInspector,
      collectConfig: () => store.draft,
      applyEditorPreview: () => renderDraft("preview"),
      applyPreset: (config) => { store.replace(config, "preset"); ui.presetModal.classList.add("hidden"); },
      populateEditor: () => renderInspector(),
      renderElementsEditor: () => {}, renderVoiceEditor: () => {}, collectElementConfig: () => store.draft?.elements,
      setFormValue: () => {}, store,
    };
  }

  window.MZHudVisualEditor = { create };
})();
