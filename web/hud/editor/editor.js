(function () {
  "use strict";

  function create(ctx) {
    if (!window.MZHudVisualEditor?.create) {
      throw new Error("MZHudVisualEditor não foi carregado");
    }
    return window.MZHudVisualEditor.create(ctx);
  }

  window.MZHudEditor = { create };
})();
