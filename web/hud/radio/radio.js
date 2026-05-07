(function () {
  "use strict";

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
      formatRadioFrequency,
    } = ctx;

    if (
      !state ||
      typeof escapeHTML !== "function" ||
      typeof withElementDefaults !== "function" ||
      typeof withCommsOptions !== "function" ||
      typeof itemInlineStyle !== "function" ||
      typeof getItemPositionClass !== "function" ||
      typeof formatRadioFrequency !== "function"
    ) {
      return "";
    }

    const key = "radio";
    const entry = withElementDefaults(key, rawEntry);
    const opts = withCommsOptions(key, entry.comms_options || {});
    const icon = typeof renderElementIcon === "function"
      ? renderElementIcon(key, entry)
      : (iconMap?.[entry.icon] || iconMap?.radio || "");
    const positionClass = entry.free
      ? "hud-anchor-free"
      : getItemPositionClass(entry.position);
    const selected =
      state.editorOpen && state.selectedElement === key ? "is-selected" : "";

    const channel = Number(state.status.radioChannel) || 0;
    const active = Boolean(state.status.radioActive || channel > 0);
    const talking = Boolean(state.status.radioTalking);

    if (!active && opts.show_inactive === false && !state.editorOpen) return "";

    const frequency = formatRadioFrequency(channel, opts.frequency_suffix);
    const mainText = active
      ? opts.show_frequency
        ? frequency
        : "Conectado"
      : opts.inactive_text || "OFF";
    const subText = active
      ? talking
        ? "Rádio falando"
        : "Rádio online"
      : "Sem rádio";

    return `
      <button class="hud-comms hud-comms-radio ${active ? "is-radio-active" : "is-radio-off"} ${talking ? "is-speaking" : ""} ${selected} ${positionClass}" data-hud-select="radio" title="${escapeHTML(active ? frequency : "Fora do rádio")}" style="${itemInlineStyle(key, entry)}">
        <div class="radio-signal"><span></span><span></span><span></span></div>
        <div class="comms-icon-wrap"><div class="hud-icon">${icon}</div></div>
        <div class="comms-copy"><strong>${escapeHTML(mainText)}</strong>${opts.show_talking_text ? `<small>${escapeHTML(subText)}</small>` : ""}</div>
      </button>
    `;
  }

  window.MZHudRadio = {
    render,
  };
})();
