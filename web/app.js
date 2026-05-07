(function () {
  "use strict";

  const app = window.MZHudApp;
  if (!app) return;

  let started = false;

  function start() {
    if (started) return;
    started = true;

    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";

    app.helpers.cacheStaticOptions?.();
    app.bindActions?.();

    const iconsReady = app.helpers.bootstrapIconCatalog?.();
    if (iconsReady && typeof iconsReady.then === "function") {
      iconsReady.then(() => {
        app.helpers.iconMap = app.core?.iconMap || app.helpers.iconMap;
        if (app.state?.config) app.renderHud?.();
        if (app.state?.editorOpen && app.state?.config) app.populateEditor?.(app.state.config);
      }).catch(() => {});
    }

    app.nui?.("ready");
  }

  window.addEventListener("message", app.handleMessage);

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
