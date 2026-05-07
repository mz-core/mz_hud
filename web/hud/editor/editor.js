(function () {
  "use strict";

  function create(ctx) {
    const form = window.MZHudEditorForm.create(ctx);
    const elements = window.MZHudEditorElements.create(ctx);

    function populateEditor(config) {
      return form.populateEditor(
        config,
        elements.renderElementsEditor,
        elements.renderVoiceEditor,
      );
    }

    const lifecycle = window.MZHudEditorLifecycle.create({
      ...ctx,
      collectElementConfig: elements.collectElementConfig,
      populateEditor,
    });

    return {
      setFormValue: form.setFormValue,
      elementSummary: elements.elementSummary,
      renderElementsEditor: elements.renderElementsEditor,
      renderVoiceEditor: elements.renderVoiceEditor,
      populateEditor,
      collectElementConfig: elements.collectElementConfig,
      collectConfig: lifecycle.collectConfig,
      applyEditorPreview: lifecycle.applyEditorPreview,
      openEditor: lifecycle.openEditor,
      closeEditor: lifecycle.closeEditor,
    };
  }

  window.MZHudEditor = { create };
})();
