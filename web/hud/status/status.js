(function () {
  "use strict";

  function renderHudItem(key, rawEntry, ctx = {}, renderMode = "single") {
    const {
      state,
      iconMap,
      renderElementIcon,
      escapeHTML,
      withElementDefaults,
      itemInlineStyle,
      getItemPositionClass,
    } = ctx;

    if (!state || typeof withElementDefaults !== "function") return "";

    const entry = withElementDefaults(key, rawEntry);
    const value = Math.max(0, Math.min(100, Number(state.status[key]) || 0));
    const style = entry.style || "circle";
    const extraClass =
      (key === "voice" && state.status.talking) ||
      (key === "radio" && state.status.radioTalking)
        ? "hud-speaking"
        : "";
    const isComms = key === "voice" || key === "radio";
    const selected =
      state.editorOpen && state.selectedElement === key ? "is-selected" : "";
    const icon = typeof renderElementIcon === "function"
      ? renderElementIcon(key, entry)
      : (iconMap?.[entry.icon] || iconMap?.heart || "");
    const positionClass =
      renderMode === "group"
        ? "hud-anchor-grouped"
        : entry.free
          ? "hud-anchor-free"
          : getItemPositionClass(entry.position);
    const voiceClass = isComms ? "hud-voice-item" : "";

    return `
    <button class="hud-item hud-style-${style} ${extraClass} ${selected} ${positionClass} ${voiceClass}" data-hud-select="${key}" title="${escapeHTML(key === "voice" ? state.status.voiceLabel || entry.label : key === "radio" ? state.status.radioLabel || entry.label : entry.label)}" style="${itemInlineStyle(key, entry)}">
      ${style === "circle" ? `<div class="hud-ring"><div class="hud-center"><div class="hud-icon">${icon}</div></div></div>` : ""}
      ${style === "bar" ? `<div class="hud-bar-box"><div class="hud-icon">${icon}</div><div class="hud-bar-track"><div class="hud-bar-fill" style="width:${value}%"></div></div></div>` : ""}
      ${style === "square" ? `<div class="hud-square-box"><div class="hud-square-fill" style="height:${value}%"></div><div class="hud-icon">${icon}</div></div>` : ""}
      ${style === "pill" ? `<div class="hud-pill-box"><div class="hud-icon">${icon}</div><span>${value}%</span></div>` : ""}
      ${style === "apex" ? `<div class="apex-status-circle ${key === "health" ? "apex-health" : ""}"><svg class="apex-status-svg" viewBox="0 0 50 50"><circle class="apex-circle-back" r="18" cx="25" cy="25"></circle><circle class="apex-circle-fill" r="18" cx="25" cy="25" style="stroke-dashoffset:${((113 * (100 - value)) / 100).toFixed(1)}"></circle></svg><div class="hud-icon">${icon}</div></div>` : ""}
    </button>
  `;
  }

  function renderStatusGroup(keys, elements, ctx = {}) {
    const {
      state,
      withStatusGroupDefaults,
      statusGroupInlineStyle,
      getStatusGroupPositionClass,
    } = ctx;

    if (!state || !state.config || typeof withStatusGroupDefaults !== "function") return "";

    const group = withStatusGroupDefaults(
      state.config?.general?.status_group || {},
    );
    if (!group.enabled || !keys.length) return "";
    const positionClass = group.free
      ? "hud-group-anchor-free"
      : getStatusGroupPositionClass(group.position);
    return `<div class="hud-status-group ${positionClass}" style="${statusGroupInlineStyle(group)}">${keys
      .map((key) => renderHudItem(key, elements[key], ctx, "group"))
      .join("")}</div>`;
  }

  window.MZHudStatus = {
    renderHudItem,
    renderStatusGroup,
    render: renderStatusGroup,
  };
})();
