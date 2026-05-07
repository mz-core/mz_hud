(function () {
  "use strict";

  const app = window.MZHudApp;
  if (!app) return;

  const state = app.state;
  const dom = app.dom;
  const h = app.helpers;
  let editorModule = null;
  let editorPresetModule = null;

  app.getEditorModule = function getEditorModule() {
    if (!editorModule) {
      editorModule = window.MZHudEditor.create({
        state,
        dom,
        labels: h.labels,
        selectOptions: h.selectOptions,
        colorPresets: h.colorPresets,
        iconMap: h.iconMap,
        getElementIconOptions: h.getElementIconOptions,
        renderElementIcon: h.renderElementIcon,
        getVehicleIconOptions: h.getVehicleIconOptions,
        iconOptionList: h.iconOptionList,
        escapeHTML: h.escapeHTML,
        deepClone: h.deepClone,
        normalizeConfig: h.normalizeConfig,
        withElementDefaults: h.withElementDefaults,
        withCommsOptions: h.withCommsOptions,
        withStatusGroupDefaults: h.withStatusGroupDefaults,
        withSpeedometerDefaults: h.withSpeedometerDefaults,
        withWeaponDefaults: h.withWeaponDefaults,
        withChatDefaults: h.withChatDefaults,
        renderHud: app.renderHud,
        applyChatLayoutPreview: app.applyChatLayoutPreview,
      });
    }
    return editorModule;
  };

  app.setFormValue = function setFormValue(id, value) {
    return app.getEditorModule().setFormValue(id, value);
  };

  app.renderElementsEditor = function renderElementsEditor(config) {
    return app.getEditorModule().renderElementsEditor(config);
  };

  app.renderVoiceEditor = function renderVoiceEditor(config) {
    return app.getEditorModule().renderVoiceEditor(config);
  };

  app.populateEditor = function populateEditor(config) {
    return app.getEditorModule().populateEditor(config);
  };

  app.collectElementConfig = function collectElementConfig() {
    return app.getEditorModule().collectElementConfig();
  };

  app.collectConfig = function collectConfig() {
    return app.getEditorModule().collectConfig();
  };

  app.applyEditorPreview = function applyEditorPreview() {
    return app.getEditorModule().applyEditorPreview();
  };

  app.openEditor = function openEditor(config) {
    const result = app.getEditorModule().openEditor(config);
    app.getEditorPresetModule()?.ensureLoaded();
    return result;
  };

  app.closeEditor = function closeEditor() {
    return app.getEditorModule().closeEditor();
  };

  app.getEditorPresetModule = function getEditorPresetModule() {
    if (!editorPresetModule && window.MZHudEditorPresets?.create) {
      editorPresetModule = window.MZHudEditorPresets.create({
        state,
        dom,
        nui: app.nui,
        escapeHTML: h.escapeHTML,
        normalizeConfig: h.normalizeConfig,
        renderHud: app.renderHud,
        populateEditor: app.populateEditor,
        applyChatLayoutPreview: app.applyChatLayoutPreview,
      });
    }
    return editorPresetModule;
  };
})();
