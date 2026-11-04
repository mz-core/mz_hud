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
    minimap: "GERAL / MAPA", general: "GERAL / HUD", appearance: "APARÊNCIA / TEMA",
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
      resize: document.getElementById("editor-resize-handle"),
      minimapProxy: document.getElementById("editor-minimap-proxy"),
      inspector: document.getElementById("editor-inspector"),
      inspectorTitle: document.getElementById("inspector-title"),
      inspectorBody: document.getElementById("inspector-body"),
      dock: document.getElementById("editor-dock"),
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
    let dockPosIndex = 0;
    const DOCK_POSITIONS = ["", "dock-bottom-right", "dock-top"];

    function cycleDockPosition() {
      DOCK_POSITIONS.forEach((cls) => { if (cls) ui.dock.classList.remove(cls); });
      dockPosIndex = (dockPosIndex + 1) % DOCK_POSITIONS.length;
      if (DOCK_POSITIONS[dockPosIndex]) ui.dock.classList.add(DOCK_POSITIONS[dockPosIndex]);
    }

    function renderDraft(reason) {
      state.config = store.draft;
      renderHud();
      updateMinimapProxy();
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

    function updateMinimapProxy() {
      if (!ui.minimapProxy) return;
      if (!state.editorOpen || !store.draft?.general) {
        ui.minimapProxy.classList.add("hidden");
        return;
      }
      const general = store.draft.general;
      const style = ["square", "circle", "default"].includes(general.minimap_style) ? general.minimap_style : "square";
      const geometry = MINIMAP_GEOMETRY[style];
      const x = schema.clamp(general.minimap_x, -300, 500, 24);
      const y = schema.clamp(general.minimap_y, -300, 500, 24);
      const aspect = window.innerWidth / window.innerHeight;
      const defaultAspect = 1920 / 1080;
      const minimapOffset = aspect > defaultAspect ? ((defaultAspect - aspect) / 3.6) - 0.008 : 0;
      const dx = (x - 24) / 1920;
      const dy = (y - 24) / 1080;
      ui.minimapProxy.classList.remove("hidden", "is-square", "is-circle", "is-default");
      ui.minimapProxy.classList.add(`is-${style}`);
      ui.minimapProxy.classList.toggle("is-disabled", general.show_minimap === false || general.minimap_visibility === "never");
      // Ancora L/B igual ao client. A base negativa dos estilos e a area das
      // barras de vida/colete (ocultas), entao a caixa visivel fica no recuo do
      // safezone; x/y (dx,dy) deslocam a partir dai.
      const inset = Math.max(0, Number(state.minimapInset) || 0);
      ui.minimapProxy.style.left = `${(inset + Math.max(0, geometry.x) + minimapOffset + dx) * 100}%`;
      ui.minimapProxy.style.bottom = `${(inset + Math.max(0, geometry.y) + dy) * 100}%`;
      ui.minimapProxy.style.top = "auto";
      ui.minimapProxy.style.right = "auto";
      ui.minimapProxy.style.width = geometry.circle
        ? `min(${geometry.w * 100}vw, ${geometry.h * 100}vh)`
        : `${geometry.w * 100}vw`;
      ui.minimapProxy.style.height = geometry.circle
        ? `min(${geometry.w * 100}vw, ${geometry.h * 100}vh)`
        : `${geometry.h * 100}vh`;
    }

    function isLocked(id, entry) {
      return id === "minimap" ? entry?.minimap_locked === true : entry?.locked === true;
    }

    function setByPath(object, path, value) {
      const parts = String(path).split(".");
      let target = object;
      for (let index = 0; index < parts.length - 1; index += 1) {
        const key = parts[index];
        if (target[key] == null || typeof target[key] !== "object") target[key] = {};
        target = target[key];
      }
      target[parts[parts.length - 1]] = value;
    }

    const themes = window.MZHudThemes;
    const ROLES = themes && themes.ROLES
      ? themes.ROLES
      : ["primary", "secondary", "accent", "text", "background", "border", "success", "warning", "danger"];
    const ROLE_LABELS = {
      primary: "Primária",
      secondary: "Secundária",
      accent: "Destaque",
      text: "Texto",
      background: "Fundo",
      border: "Borda",
      success: "Sucesso",
      warning: "Aviso",
      danger: "Perigo",
    };
    const ELEMENT_ROLES = ["primary", "secondary", "background", "text", "border"];
    const SPEEDOMETER_SLOT_ROLES = themes && themes.SPEEDOMETER_SLOT_ROLES
      ? themes.SPEEDOMETER_SLOT_ROLES
      : { primary_color: "text", secondary_color: "primary", accent_color: "danger", background_color: "background" };
    const SPEEDOMETER_SLOT_LABELS = {
      primary_color: "Principal",
      secondary_color: "Secundária",
      accent_color: "Destaque",
      background_color: "Fundo",
    };
    let paletteFocusRole = "primary";

    function appearance() {
      return (store.draft && store.draft.general && store.draft.general.appearance)
        || { mode: "legacy", theme: "", palette: {}, overrides: {} };
    }

    function isThemed() {
      return appearance().mode !== "legacy";
    }

    function roleHasOverride(componentId, role) {
      const app = appearance();
      return !!(app.overrides && app.overrides[componentId] && app.overrides[componentId][role]);
    }

    function setAppearanceMode(mode) {
      store.mutate((draft) => {
        const app = draft.general.appearance;
        app.mode = mode;
        if (mode === "preset") {
          if (!themes || !themes.THEME_PRESETS[app.theme]) {
            app.theme = themes ? themes.DEFAULT_THEME_ID : "mz_cyan";
          }
          const preset = themes && themes.THEME_PRESETS[app.theme];
          if (preset) ROLES.forEach((role) => { app.palette[role] = preset.palette[role]; });
        } else {
          app.theme = "";
        }
      }, "appearance:mode");
    }

    function applyThemePreset(themeId) {
      const preset = themes && themes.THEME_PRESETS[themeId];
      if (!preset) return;
      store.mutate((draft) => {
        const app = draft.general.appearance;
        app.mode = "preset";
        app.theme = themeId;
        ROLES.forEach((role) => { app.palette[role] = preset.palette[role]; });
      }, "appearance:preset");
    }

    function setPaletteRole(role, value) {
      store.mutate((draft) => {
        const app = draft.general.appearance;
        if (app.mode === "preset") { app.mode = "custom"; app.theme = ""; }
        app.palette[role] = value;
      }, "appearance:palette");
    }

    function setRoleOverride(componentId, role, value) {
      store.mutate((draft) => {
        const app = draft.general.appearance;
        app.overrides = app.overrides || {};
        app.overrides[componentId] = app.overrides[componentId] || {};
        app.overrides[componentId][role] = value;
      }, "appearance:override");
    }

    function clearRoleOverride(componentId, role) {
      store.mutate((draft) => {
        const app = draft.general.appearance;
        if (!app.overrides || !app.overrides[componentId]) return;
        delete app.overrides[componentId][role];
        if (Object.keys(app.overrides[componentId]).length === 0) delete app.overrides[componentId];
      }, "appearance:inherit");
    }

    function clearAllOverrides() {
      store.mutate((draft) => {
        draft.general.appearance.overrides = {};
      }, "appearance:clear-overrides");
    }

    function renderColorRoleField(componentId, role, label, effectiveValue, slotKey, legacyValue) {
      const themed = isThemed();
      const overridden = roleHasOverride(componentId, role);
      const badge = themed
        ? `<span class="role-inherit-badge ${overridden ? "is-override" : "is-theme"}">${overridden ? "Override" : "Tema"}</span>`
        : "";
      const safeValue = themes && themes.isValidHex(effectiveValue) ? effectiveValue : "#ffffff";
      let actionBtn = "";
      if (themed && overridden) {
        actionBtn = `<button type="button" class="role-inherit-btn" data-appearance-inherit="${componentId}:${role}" title="Voltar a herdar do tema">herdar</button>`;
      } else if (themed && legacyValue && themes && themes.isValidHex(legacyValue) && legacyValue.toLowerCase() !== safeValue.toLowerCase()) {
        actionBtn = `<button type="button" class="role-inherit-btn" data-appearance-preserve="${componentId}:${role}:${slotKey}" title="Usar a cor legada como override">legado</button>`;
      }
      return `<label class="inspector-field color-role-field"><span>${label}${badge}</span><div class="color-role-control"><INPUT type="color" value="${safeValue}" data-appearance-component="${componentId}" data-appearance-role="${role}" data-appearance-slot="${slotKey}">${actionBtn}</div></label>`;
    }

    function renderElementColorFields(componentId, entry) {
      const elColors = themes
        ? themes.resolveElementColors(store.draft, componentId, entry.color)
        : { accent: entry.color, track: null, background: null, text: null, border: null };
      const roleToValue = {
        primary: elColors.accent,
        secondary: elColors.track,
        background: elColors.background,
        text: elColors.text,
        border: elColors.border,
      };
      return ELEMENT_ROLES.map((role) =>
        renderColorRoleField(
          componentId,
          role,
          ROLE_LABELS[role],
          roleToValue[role] || "#ffffff",
          "color",
          role === "primary" ? entry.color : null,
        ),
      ).join("");
    }

    function speedometerThemeButtons() {
      const speedThemes = window.MZHudCore && window.MZHudCore.speedometerThemes;
      if (!speedThemes) return "";
      const labels = { blue: "Azul", red: "Vermelho", green: "Verde", purple: "Roxo", orange: "Laranja", mono: "Mono" };
      return Object.keys(speedThemes).map((key) =>
        `<button type="button" class="theme-quick-btn" data-speedometer-theme="${key}">${labels[key] || key}</button>`,
      ).join("");
    }

    function applySpeedometerTheme(key) {
      const t = window.MZHudCore && window.MZHudCore.speedometerThemes && window.MZHudCore.speedometerThemes[key];
      if (!t) return;
      const themed = isThemed();
      store.mutate((draft) => {
        const sp = draft.speedometer;
        if (themed) {
          const app = draft.general.appearance;
          app.overrides = app.overrides || {};
          app.overrides.speedometer = {
            text: t.primary_color,
            primary: t.secondary_color,
            danger: t.accent_color,
            background: t.background_color,
          };
        } else {
          sp.primary_color = t.primary_color;
          sp.secondary_color = t.secondary_color;
          sp.accent_color = t.accent_color;
          sp.background_color = t.background_color;
        }
      }, "speedometer:theme");
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
      if (ui.resize) ui.resize.classList.toggle("hidden", state.selectedElement === "minimap");
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

    const speedometerIconSlots = [
      ["fuel", "Combustível"], ["engine", "Motor"], ["engine_indicator", "Indicador do motor"],
      ["belt", "Cinto"], ["unbelt", "Cinto removido"], ["light", "Farol"],
      ["light_high", "Farol alto"], ["light_off", "Farol apagado"],
      ["lock", "Cadeado"], ["unlock", "Cadeado aberto"],
      ["arrow", "Seta"], ["arrow_active", "Seta ativa"],
      ["speed", "Velocidade"], ["rpm", "RPM"], ["gear", "Marcha"],
      ["weapon", "Arma"], ["ammo", "Munição"],
    ];
    const chatPresetOptions = [
      ["left-top", "Esquerda superior"], ["left-center", "Esquerda centro"], ["left-bottom", "Esquerda inferior"],
      ["center-top", "Centro superior"], ["center", "Centro"], ["center-bottom", "Centro inferior"],
      ["right-top", "Direita superior"], ["right-center", "Direita centro"], ["right-bottom", "Direita inferior"],
    ];
    const statusStyleKeys = ["health", "armor", "hunger", "thirst", "stamina", "oxygen", "stress"];
    const statusStyleChoices = [
      ["circle", "Circular"], ["bar", "Barra"], ["square", "Quadrado"], ["pill", "Pílula"], ["apex", "Apex"],
    ];
    // Espelha client/main.lua (SetMinimapComponentPosition) para o preview do mapa.
    const MINIMAP_GEOMETRY = {
      square: { x: 0.0, y: -0.047, w: 0.1638, h: 0.183, circle: false },
      circle: { x: -0.0100, y: -0.030, w: 0.180, h: 0.258, circle: true },
      default: { x: -0.0045, y: 0.002, w: 0.150, h: 0.188888, circle: false },
    };

    function vehicleIconField(entry, slot, label) {
      const options = typeof getVehicleIconOptions === "function"
        ? (getVehicleIconOptions(slot) || []).map((option) => [option.id, option.label || option.id])
        : [];
      const current = entry.icons?.[slot] || options[0]?.[0] || slot;
      const values = options.some(([key]) => key === current) ? options : [...options, [current, `${current} (custom)`]];
      return field(label, `icons.${slot}`, select(current, values));
    }

    function renderInspector() {
      const id = state.selectedElement;
      const entry = schema.target(store.draft, id);
      if (!entry) return;
      ui.inspectorTitle.textContent = names[id] || id;
      let specific = "";
      if (id === "minimap") {
        ui.inspectorBody.innerHTML = `<section><h3>Mapa do jogo</h3>
          ${field("Mostrar mapa", "show_minimap", toggle(entry.show_minimap), "toggle-field")}
          ${field("Formato", "minimap_style", select(entry.minimap_style, [["square", "Quadrado"], ["circle", "Circular"], ["default", "Padrão GTA"]]))}
          ${field("Exibição", "minimap_visibility", select(entry.minimap_visibility, [["always", "Sempre"], ["vehicle", "Em veículo"], ["foot", "A pé"], ["never", "Nunca"]]))}
          <div class="inspector-pair">${field("Deslocamento X", "minimap_x", number(entry.minimap_x, -300, 500, 1))}${field("Deslocamento Y", "minimap_y", number(entry.minimap_y, -300, 500, 1))}</div>
          ${field("Bloqueado", "minimap_locked", toggle(entry.minimap_locked), "toggle-field")}
          <p class="inspector-note">O contorno usa a mesma posição e tamanho que o cliente aplica no jogo (base do estilo + deslocamento X/Y). Arraste para posicionar; o mapa real é desenhado pelo jogo sobre esta área.</p>
        </section>`;
        return;
      } else if (id === "general") {
        specific = `<section><h3>Global</h3>
          ${field("Opacidade da HUD", "global_opacity", range(entry.global_opacity ?? 100, 0, 100, 1))}
          <p class="inspector-note">Opacidade aplicada ao conjunto da HUD. Cada módulo mantém a própria opacidade.</p>
        </section>`;
      } else if (store.draft.elements?.[id]) {
        const iconOptions = typeof getElementIconOptions === "function" ? getElementIconOptions(id).map((option) => [option.id, option.label || option.id]) : [[entry.icon, entry.icon]];
        specific = `<section><h3>Aparência</h3>
          ${field("Nome", "label", `<INPUT type="text" maxlength="24" value="${escapeHTML(entry.label || id)}">`)}
          ${field("Ícone", "icon", select(entry.icon, iconOptions))}
          ${field("Estilo", "style", select(entry.style || "circle", [["circle", "Circular"], ["bar", "Barra"], ["square", "Quadrado"], ["pill", "Pílula"], ["apex", "Apex"], ["comms", "Comunicação"]]))}
          ${isThemed() ? `<div class="inspector-color-grid">${renderElementColorFields(id, entry)}</div><p class="inspector-note">Cores vêm do tema; edite para criar override ou use ↺ para voltar a herdar.</p>` : field("Cor", "color", `<INPUT type="color" value="${entry.color || "#ffffff"}">`)}
          ${!["voice", "radio"].includes(id) ? field("Mover separado", "individual", toggle(entry.individual), "toggle-field") : ""}
          ${field("Colapsar quando oculto", "collapseWhenHidden", toggle(entry.collapseWhenHidden), "toggle-field")}
        </section>`;
        if (id === "voice") {
          const options = ctx.withCommsOptions ? ctx.withCommsOptions("voice", entry.comms_options) : (entry.comms_options || {});
          specific += `<section><h3>Comunicação</h3>
            ${field("Mostrar rótulo", "comms_options.show_label", toggle(options.show_label !== false), "toggle-field")}
            ${field("Texto de nível", "comms_options.show_level_text", toggle(options.show_level_text !== false), "toggle-field")}
            ${field("Texto 'falando'", "comms_options.show_talking_text", toggle(options.show_talking_text !== false), "toggle-field")}
            ${field("Opacidade inativo", "comms_options.inactive_opacity", range(options.inactive_opacity ?? 72, 0, 100, 1))}
          </section>`;
        }
        if (id === "radio") {
          const options = ctx.withCommsOptions ? ctx.withCommsOptions("radio", entry.comms_options) : (entry.comms_options || {});
          specific += `<section><h3>Comunicação</h3>
            ${field("Mostrar frequência", "comms_options.show_frequency", toggle(options.show_frequency !== false), "toggle-field")}
            ${field("Mostrar inativo", "comms_options.show_inactive", toggle(options.show_inactive !== false), "toggle-field")}
            ${field("Texto 'falando'", "comms_options.show_talking_text", toggle(options.show_talking_text !== false), "toggle-field")}
            ${field("Texto inativo", "comms_options.inactive_text", `<INPUT type="text" maxlength="12" value="${escapeHTML(options.inactive_text || "OFF")}">`)}
            ${field("Sufixo da frequência", "comms_options.frequency_suffix", `<INPUT type="text" maxlength="12" value="${escapeHTML(options.frequency_suffix || "MHz")}">`)}
          </section>`;
        }
      } else if (id === "statusGroup") {
        specific = `<section><h3>Agrupamento</h3>
          ${field("Orientação", "orientation", select(entry.orientation, [["horizontal", "Horizontal"], ["vertical", "Vertical"]]))}
          ${field("Alinhamento", "alignment", select(entry.alignment, [["start", "Início (→ / ↓)"], ["center", "Centro"], ["end", "Fim (← / ↑)"]]))}
          ${field("Espaçamento", "gap", range(entry.gap, 0, 40, 1))}
          <p class="inspector-note">Horizontal: Início cresce da esquerda para a direita e Fim da direita para a esquerda. Vertical: Início de cima para baixo e Fim de baixo para cima. Status ocultos com "colapsar" fecham o vão nessa direção.</p>
        </section>
        <section><h3>Modelo dos status</h3>
          <label class="inspector-field"><span>Aplicar a todos</span><select data-bulk="statusStyle"><option value="">Escolher modelo...</option>${statusStyleChoices.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label>
          <p class="inspector-note">Aplica o modelo a todos os status (vida, colete, fome, sede, stamina, oxigênio, stress). Voz e rádio usam o modelo de comunicação. Cada status também pode ter seu próprio modelo no inspetor individual.</p>
        </section>`;
      } else if (id === "speedometer") {
        const slots = themes ? themes.resolveSpeedometerSlots(store.draft, entry) : entry;
        const colorFields = Object.keys(SPEEDOMETER_SLOT_ROLES).map((slot) => {
          const role = SPEEDOMETER_SLOT_ROLES[slot];
          return renderColorRoleField("speedometer", role, SPEEDOMETER_SLOT_LABELS[slot], slots[slot] || entry[slot] || "#ffffff", slot, entry[slot]);
        }).join("");
        const quickPicks = speedometerThemeButtons();
        const iconFields = speedometerIconSlots.map(([slot, label]) => vehicleIconField(entry, slot, label)).join("");
        specific = `<section><h3>Modelo e unidade</h3>
            ${field("Modelo", "style", select(entry.style, [["apex", "Apex"], ["minimal", "Minimal"], ["digital", "Digital"], ["analog", "Analógico"], ["classic", "Classic"], ["racing", "Racing"], ["vector", "Vector"], ["auren_felon", "Auren Felon"], ["auren_truck", "Auren Truck"], ["auren_aton", "Auren Aton"]]))}
            ${field("Unidade", "unit", select(entry.unit, [["kmh", "KM/H"], ["mph", "MPH"]]))}
          </section>
          <section><h3>Indicadores</h3>
            ${field("Velocidade", "show_speed", toggle(entry.show_speed), "toggle-field")}
            ${field("RPM", "show_rpm", toggle(entry.show_rpm), "toggle-field")}
            ${field("Combustível", "show_fuel", toggle(entry.show_fuel), "toggle-field")}
            ${field("Marcha", "show_gear", toggle(entry.show_gear), "toggle-field")}
            ${field("Cinto", "show_seatbelt", toggle(entry.show_seatbelt), "toggle-field")}
            ${field("Faróis", "show_lights", toggle(entry.show_lights), "toggle-field")}
            ${field("Cadeado", "show_lock", toggle(entry.show_lock), "toggle-field")}
            ${field("Motor", "show_engine", toggle(entry.show_engine), "toggle-field")}
          </section>
          <section><h3>Cores</h3>
            <div class="inspector-color-grid">${colorFields}</div>
            ${quickPicks ? `<div class="theme-quick-picks"><span>Rápidos</span>${quickPicks}</div>` : ""}
            <p class="inspector-note">${isThemed() ? "Cores vêm do tema; edite para criar um override ou use ↺ para voltar a herdar." : "Cores do velocímetro no modo legado."}</p>
          </section>
          <section><h3>Ícones</h3>${iconFields}</section>`;
      } else if (id === "weapon") {
        specific = `<section><h3>Exibição</h3>
          ${field("Imagem", "show_image", toggle(entry.show_image), "toggle-field")}
          ${field("Munição", "show_ammo", toggle(entry.show_ammo), "toggle-field")}
          ${field("Nome", "show_name", toggle(entry.show_name), "toggle-field")}
          ${field("Modelo da imagem", "image_model", `<INPUT type="text" maxlength="24" value="${escapeHTML(entry.image_model || "default")}">`)}
          <p class="inspector-note">O modelo define a pasta em web/assets/weapons/&lt;modelo&gt;/ — o padrão do resource é "default".</p>
        </section>`;
      } else if (id === "logo") {
        specific = `<section><h3>Logo</h3>
          ${field("Imagem", "image_url", `<INPUT type="text" maxlength="512" value="${escapeHTML(entry.image_url || "")}">`)}
          <div class="inspector-pair">${field("Largura", "width", number(entry.width, 40, 400))}${field("Altura", "height", number(entry.height, 20, 200))}</div>
          ${field("Só em veículo", "show_only_in_vehicle", toggle(entry.show_only_in_vehicle), "toggle-field")}
        </section>`;
      } else if (id === "chat") {
        specific = `<section><h3>Chat</h3>
          ${field("Preset de posição", "preset", select(entry.preset || "left-top", chatPresetOptions))}
          <p class="inspector-note">O preset é aplicado ao mz_chat quando disponível. Ative "Posição livre" para usar X/Y manuais.</p>
        </section>`;
      } else if (id === "appearance") {
        const app = appearance();
        const presetCards = themes && themes.THEME_PRESETS
          ? Object.keys(themes.THEME_PRESETS).map((key) => {
              const preset = themes.THEME_PRESETS[key];
              const swatches = ROLES.slice(0, 5).map((role) => `<i style="background:${preset.palette[role]}"></i>`).join("");
              const active = app.mode === "preset" && app.theme === key;
              return `<button type="button" class="theme-preset-card ${active ? "is-active" : ""}" data-appearance-preset="${key}"><span class="theme-preset-swatches">${swatches}</span><strong>${escapeHTML(preset.label)}</strong></button>`;
            }).join("")
          : "";
        const paletteFields = ROLES.map((role) =>
          `<label class="inspector-field color-role-field"><span>${ROLE_LABELS[role]}</span><div class="color-role-control"><INPUT type="color" value="${app.palette[role] || "#ffffff"}" data-appearance-palette-role="${role}"></div></label>`,
        ).join("");
        const swatchRow = (ctx.colorPresets || []).map((hex) =>
          `<button type="button" class="palette-swatch" data-palette-swatch="${hex}" style="background:${hex}" title="${hex}"></button>`,
        ).join("");
        const overrideKeys = Object.keys(app.overrides || {});
        const overrideSummary = overrideKeys.length
          ? `<div class="override-chips">${overrideKeys.map((cid) => `<span class="override-chip">${escapeHTML(names[cid] || cid)}</span>`).join("")}</div>`
          : `<p class="inspector-note">Nenhum override. Componentes herdam as cores do tema.</p>`;
        specific = `<section><h3>Modo</h3>
          <label class="inspector-field"><span>Modo</span><SELECT data-appearance-mode>
            <option value="legacy" ${app.mode === "legacy" ? "selected" : ""}>Legado (sem tema)</option>
            <option value="preset" ${app.mode === "preset" ? "selected" : ""}>Preset</option>
            <option value="custom" ${app.mode === "custom" ? "selected" : ""}>Personalizado</option>
          </SELECT></label>
          <p class="inspector-note">Legado preserva o visual atual (sem salvar automaticamente). Preset aplica um tema fixo. Personalizado edita a paleta livremente.</p>
        </section>
        <section><h3>Presets de tema</h3>
          <div class="theme-preset-grid">${presetCards}</div>
        </section>
        <section><h3>Paleta</h3>
          ${swatchRow ? `<div class="palette-swatches">${swatchRow}</div>` : ""}
          <div class="inspector-color-grid">${paletteFields}</div>
          <p class="inspector-note">Clique em uma amostra acima para aplicar ao papel com foco (ou edite cada papel pelo seletor).</p>
        </section>
        <section><h3>Overrides por componente</h3>
          ${overrideSummary}
          ${overrideKeys.length ? `<button type="button" class="inspector-danger" data-appearance-action="clear-overrides">Limpar todos os overrides</button>` : ""}
        </section>`;
      }
      const common = (id === "general" || id === "appearance") ? "" : `<section><h3>Posicionamento e aparência</h3>${commonInspector(entry)}</section>`;
      ui.inspectorBody.innerHTML = `${common}${specific}`;
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
      if (["all", "vehicle"].includes(mode)) state.vehicle = { ...state.vehicle, visible: true, speed: 87, rpm: 65, fuel: 72, gear: "4", seatbelt: true, seatbeltAvailable: true, engine: true, engineHealth: 80, lights: true, lightsHigh: false, indicatorLeft: true, indicatorRight: false };
      if (mode === "all") state.weapon = { ...state.weapon, visible: true, name: "weapon_pistol", clip: 12, reserve: 48 };
      if (mode === "low") state.status = { ...state.status, health: 18, armor: 12, hunger: 14, thirst: 10, stamina: 72 };
      if (mode === "submerged") state.status = { ...state.status, oxygen: 42, oxygenActive: true };
      renderHud();
      updateMinimapProxy();
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

    function anchorFraction(id) {
      if (id !== "statusGroup") return { x: 0.5, y: 0.5 };
      const group = schema.target(store.draft, "statusGroup") || {};
      const align = group.alignment === "start" ? 0 : group.alignment === "end" ? 1 : 0.5;
      return group.orientation === "vertical" ? { x: 0.5, y: align } : { x: align, y: 0.5 };
    }

    function startPointer(event, mode) {
      if (event.button !== 0 || !state.editorOpen) return;
      let id = state.selectedElement;
      let entry = schema.target(store.draft, id);
      if (!entry || isLocked(id, entry)) return;
      let node = targetNode();
      if (mode === "drag" && store.draft.elements?.[id] && entry.individual !== true) {
        id = "statusGroup";
        entry = schema.target(store.draft, id);
        node = dom.hudRoot.querySelector('[data-hud-select="statusGroup"]');
      }
      if (!entry || isLocked(id, entry)) return;
      if (!node) return;
      event.preventDefault();
      store.begin();
      pointerAction = {
        mode, id, entry, node, startX: event.clientX, startY: event.clientY,
        startScale: Number(entry.scale || 100), startRect: node.getBoundingClientRect(),
        startMinimapX: Number(entry.minimap_x ?? 24), startMinimapY: Number(entry.minimap_y ?? 24),
        anchor: anchorFraction(id),
      };
      document.body.classList.add("editor-is-dragging");
    }

    function movePointer(event) {
      if (!pointerAction) return;
      const { mode, entry, node, startX, startY, startScale, startRect, startMinimapX, startMinimapY, id, anchor } = pointerAction;
      if (mode === "drag" && id === "minimap") {
        entry.minimap_x = schema.clamp(startMinimapX + ((event.clientX - startX) * 1920 / window.innerWidth), -300, 500, startMinimapX);
        entry.minimap_y = schema.clamp(startMinimapY - ((event.clientY - startY) * 1080 / window.innerHeight), -300, 500, startMinimapY);
        updateMinimapProxy();
        const rect = node.getBoundingClientRect();
        ui.selection.style.left = `${rect.left - 5}px`;
        ui.selection.style.top = `${rect.top - 5}px`;
      } else if (mode === "drag") {
        const ax = anchor?.x ?? 0.5;
        const ay = anchor?.y ?? 0.5;
        entry.free = true;
        entry.x = snapValue(((startRect.left + startRect.width * ax + event.clientX - startX) / window.innerWidth) * 100, "x", id);
        entry.y = snapValue(((startRect.top + startRect.height * ay + event.clientY - startY) / window.innerHeight) * 100, "y", id);
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
      if (!entry || isLocked(state.selectedElement, entry)) return;
      if (state.selectedElement === "minimap") {
        store.mutate(() => {
          entry.minimap_x = schema.clamp(Number(entry.minimap_x) + dx, -300, 500, 24);
          entry.minimap_y = schema.clamp(Number(entry.minimap_y) - dy, -300, 500, 24);
        }, "nudge:minimap");
        return;
      }
      if (entry.x === undefined) return;
      store.mutate(() => { entry.free = true; entry.x = Math.max(4, Math.min(96, Number(entry.x) + dx)); entry.y = Math.max(4, Math.min(96, Number(entry.y) + dy)); }, "nudge");
    }

    function resetSelected() {
      if (state.selectedElement !== "minimap") return store.reset(state.selectedElement);
      const keys = ["show_minimap", "minimap_style", "minimap_visibility", "minimap_x", "minimap_y", "minimap_locked"];
      store.mutate((draft) => {
        keys.forEach((key) => { draft.general[key] = deepClone(store.defaults.general[key]); });
      }, "reset:minimap");
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
        const presetCard = event.target.closest("[data-appearance-preset]");
        if (presetCard) { applyThemePreset(presetCard.dataset.appearancePreset); return; }
        const paletteSwatch = event.target.closest("[data-palette-swatch]");
        if (paletteSwatch) { setPaletteRole(paletteFocusRole, paletteSwatch.dataset.paletteSwatch); return; }
        const inheritBtn = event.target.closest("[data-appearance-inherit]");
        if (inheritBtn) { const pair = inheritBtn.dataset.appearanceInherit.split(":"); clearRoleOverride(pair[0], pair[1]); return; }
        const preserveBtn = event.target.closest("[data-appearance-preserve]");
        if (preserveBtn) {
          const parts = preserveBtn.dataset.appearancePreserve.split(":");
          const target = schema.target(store.draft, parts[0]);
          const legacy = target ? target[parts[2] || "color"] : null;
          if (themes && themes.isValidHex(legacy)) setRoleOverride(parts[0], parts[1], legacy);
          return;
        }
        const speedTheme = event.target.closest("[data-speedometer-theme]");
        if (speedTheme) { applySpeedometerTheme(speedTheme.dataset.speedometerTheme); return; }
        const clearOverrides = event.target.closest('[data-appearance-action="clear-overrides"]');
        if (clearOverrides) { clearAllOverrides(); return; }
        const action = event.target.closest("[data-editor-action]")?.dataset.editorAction;
        if (action === "toggle-dock") ui.dock.classList.toggle("is-collapsed");
        if (action === "cycle-dock-pos") cycleDockPosition();
        if (action === "cycle-inspector-pos") ui.inspector.classList.toggle("inspector-left");
        if (action === "inspect") showInspector();
        if (action === "toggle-lock") store.mutate(() => {
          const item = schema.target(store.draft, state.selectedElement);
          if (!item) return;
          if (state.selectedElement === "minimap") item.minimap_locked = !item.minimap_locked;
          else item.locked = !item.locked;
        }, "lock");
        if (action === "reset-element") resetSelected();
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
      ui.inspectorBody.addEventListener("focusin", (event) => {
        if (event.target.dataset.prop || event.target.dataset.appearanceComponent || event.target.dataset.appearancePaletteRole) store.begin();
      });
      ui.inspectorBody.addEventListener("input", (event) => {
        const input = event.target;
        if (input.dataset.bulk === "statusStyle") {
          const style = input.value;
          input.value = "";
          if (!style) return;
          store.mutate((draft) => {
            statusStyleKeys.forEach((key) => {
              if (draft.elements?.[key]) draft.elements[key].style = style;
            });
          }, "status:style-all");
          return;
        }
        if (input.dataset.appearanceMode) {
          setAppearanceMode(input.value);
          return;
        }
        if (input.dataset.appearanceComponent && input.dataset.appearanceRole) {
          const componentId = input.dataset.appearanceComponent;
          const role = input.dataset.appearanceRole;
          const slot = input.dataset.appearanceSlot || "color";
          const value = input.value;
          const themed = isThemed();
          const app = store.draft.general.appearance;
          if (themed) {
            app.overrides = app.overrides || {};
            app.overrides[componentId] = app.overrides[componentId] || {};
            app.overrides[componentId][role] = value;
          } else {
            const target = schema.target(store.draft, componentId);
            if (target) target[slot] = value;
          }
          store.draft = schema.normalizeConfig(store.draft); state.config = store.draft;
          renderDraft("inspector-live");
          return;
        }
        if (input.dataset.appearancePaletteRole) {
          const role = input.dataset.appearancePaletteRole;
          paletteFocusRole = role;
          const app = store.draft.general.appearance;
          if (app.mode === "preset") { app.mode = "custom"; app.theme = ""; }
          app.palette[role] = input.value;
          store.draft = schema.normalizeConfig(store.draft); state.config = store.draft;
          renderDraft("inspector-live");
          return;
        }
        const property = input.dataset.prop; if (!property) return;
        const entry = schema.target(store.draft, state.selectedElement); if (!entry) return;
        setByPath(entry, property, input.type === "checkbox" ? input.checked : input.type === "number" || input.type === "range" ? Number(input.value) : input.value);
        store.draft = schema.normalizeConfig(store.draft); state.config = store.draft;
        const output = input.parentElement?.querySelector("output"); if (output) output.value = input.value;
        renderDraft("inspector-live");
      });
      ui.inspectorBody.addEventListener("change", () => store.commit("inspector"));
      ui.resize.addEventListener("pointerdown", (event) => startPointer(event, "resize"));
      document.addEventListener("pointermove", movePointer);
      document.addEventListener("pointerup", endPointer);
      ui.preview.addEventListener("change", () => setPreview(ui.preview.value));
      document.getElementById("editor-element-select").addEventListener("change", (event) => { if (event.target.value) selectElement(event.target.value, true); event.target.value = ""; });
      window.addEventListener("resize", () => { updateMinimapProxy(); positionSelection(); });
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
      if (ui.minimapProxy) ui.minimapProxy.classList.add("hidden");
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
