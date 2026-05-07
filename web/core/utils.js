(function () {
  "use strict";

  const core = (window.MZHudCore = window.MZHudCore || {});

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function setSelectOptions(select, values) {
    if (!select) return;
    const labels = core.labels || {};
    select.innerHTML = values
      .map(
        (value) =>
          `<option value="${value}">${labels[value] || value}</option>`,
      )
      .join("");
  }

  function cacheStaticOptions() {
    const options = core.selectOptions || {};
    setSelectOptions(
      document.getElementById("general-hud-position"),
      options.hudPosition || [],
    );
    setSelectOptions(
      document.getElementById("general-minimap-style"),
      options.minimapStyle || [],
    );
    setSelectOptions(
      document.getElementById("general-minimap-visibility"),
      options.minimapVisibility || [],
    );
    setSelectOptions(
      document.getElementById("status-group-position"),
      options.itemPosition || [],
    );
    setSelectOptions(
      document.getElementById("speedometer-position"),
      options.speedometerPosition || [],
    );
    setSelectOptions(
      document.getElementById("speedometer-style"),
      options.speedometerStyle || [],
    );
    setSelectOptions(
      document.getElementById("speedometer-unit"),
      options.unit || [],
    );
    setSelectOptions(
      document.getElementById("logo-position"),
      options.logoPosition || [],
    );
    setSelectOptions(
      document.getElementById("weapon-position"),
      options.speedometerPosition || [],
    );
    setSelectOptions(
      document.getElementById("chat-preset"),
      options.chatPreset || [],
    );
  }

  Object.assign(core, {
    escapeHTML,
    deepClone,
    setSelectOptions,
    cacheStaticOptions,
  });
})();
