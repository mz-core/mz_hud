(function () {
  "use strict";

  function clampPercent(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(0, Math.min(100, number));
  }

  function render(rawEntry, ctx = {}) {
    const {
      state,
      iconMap,
      renderElementIcon,
      escapeHTML,
      withElementDefaults,
      withCommsOptions,
      itemInlineStyle,
      getItemPositionClass,
      voiceLevelFromStatus,
      resolveVisibility,
    } = ctx;

    if (
      !state ||
      typeof escapeHTML !== "function" ||
      typeof withElementDefaults !== "function" ||
      typeof withCommsOptions !== "function" ||
      typeof itemInlineStyle !== "function" ||
      typeof getItemPositionClass !== "function" ||
      typeof voiceLevelFromStatus !== "function"
    ) {
      return "";
    }

    const key = "voice";
    const entry = withElementDefaults(key, rawEntry);
    const opts = withCommsOptions(key, entry.comms_options || {});
    const icon = typeof renderElementIcon === "function"
      ? renderElementIcon(key, entry)
      : (iconMap?.[entry.icon] || iconMap?.mic || "");
    const positionClass = entry.free
      ? "hud-anchor-free"
      : getItemPositionClass(entry.position);
    const selected =
      state.editorOpen && state.selectedElement === key ? "is-selected" : "";
    const voice = voiceLevelFromStatus();
    const speaking = Boolean(state.status.talking);
    const talkingText = speaking ? "Falando" : "Em silêncio";
    const idleOpacity = clampPercent(opts.inactive_opacity, 72) / 100;
    const visibility = typeof resolveVisibility === "function" ? resolveVisibility(key, entry, state, { preview: state.editorPreview }) : { visible: true, forced: false, mode: "always" };
    if (!visibility.visible) return "";

    return `
      <button class="hud-comms hud-comms-voice voice-level-${voice.key} ${speaking ? "is-speaking" : ""} ${selected} ${positionClass} ${visibility.forced ? "is-editor-forced" : ""}" data-hud-select="voice" title="Voz ${escapeHTML(voice.label)}" style="${itemInlineStyle(key, entry)};--comms-idle-opacity:${idleOpacity}">
        ${state.editorOpen && visibility.mode !== "always" ? `<span class="hud-editor-badge">${visibility.mode.toUpperCase()}</span>` : ""}
        <div class="comms-icon-wrap"><div class="hud-icon">${icon}</div></div>
        <div class="voice-meter" aria-hidden="true">${[1, 2, 3].map((level) => `<span class="${level <= voice.level ? "active" : ""}"></span>`).join("")}</div>
        <div class="comms-copy">
          ${opts.show_label ? "<strong>Voz</strong>" : ""}
          ${opts.show_level_text ? `<small>${escapeHTML(voice.label)}</small>` : ""}
          ${opts.show_talking_text ? `<em>${escapeHTML(talkingText)}</em>` : ""}
        </div>
      </button>
    `;
  }

  window.MZHudVoice = {
    render,
  };
})();
