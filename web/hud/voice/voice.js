(function () {
  "use strict";

  function render(rawEntry, ctx) {
    const {
      state,
      withElementDefaults,
      withCommsOptions,
      itemInlineStyle,
      getItemPositionClass,
      voiceLevelFromStatus,
      iconMap,
      escapeHTML,
    } = ctx;

    const entry = withElementDefaults("voice", rawEntry || {});
    const options = withCommsOptions(
      state.config?.general?.comms_options || {},
    );
    const status = state.status || {};

    if (!entry.enabled) return "";

    const speaking = status.talking === true;
    const level = voiceLevelFromStatus(
      status.voiceMode || status.voice || status.voiceLabel,
    );
    const label = status.voiceLabel || "Normal";
    const subtitle = speaking ? "Falando" : "Em silêncio";

    const positionClass = entry.free
      ? "hud-item-free"
      : getItemPositionClass(entry.position);

    const activeBars = level === "low" ? 1 : level === "normal" ? 2 : 3;

    return `
      <div
        class="hud-item hud-comms hud-comms-voice voice-level-${escapeHTML(level)} ${speaking ? "is-speaking" : ""} ${positionClass}"
        style="${itemInlineStyle(entry)}"
        data-hud-item="voice"
      >
        <div class="comms-icon-wrap">
          ${iconMap.mic || ""}
        </div>

        <div class="voice-meter" aria-hidden="true">
          <span class="${activeBars >= 1 ? "active" : ""}"></span>
          <span class="${activeBars >= 2 ? "active" : ""}"></span>
          <span class="${activeBars >= 3 ? "active" : ""}"></span>
        </div>

        <div class="comms-copy">
          <strong>Voz</strong>
          <span>${escapeHTML(label)} • ${escapeHTML(subtitle)}</span>
        </div>
      </div>
    `;
  }

  window.MZHudVoice = {
    render,
  };
})();
