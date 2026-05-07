(function () {
  "use strict";

  const app = window.MZHudApp;
  if (!app) return;

  app.nui = function nui(action, data = {}) {
    return fetch(`https://${app.resourceName}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .catch(() => ({ ok: false }));
  };

  app.applyChatLayoutPreview = function applyChatLayoutPreview(config) {
    if (!config) return;
    app.nui("applyChatLayout", { config });
  };

  app.markUIReady = function markUIReady() {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.classList.remove("hud-initializing");
  };
})();
