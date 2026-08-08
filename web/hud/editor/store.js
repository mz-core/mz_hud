(function (root, factory) {
  const api = factory(root.MZHudEditorSchema);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MZHudEditorStore = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function (schema) {
  "use strict";

  schema = schema || (typeof require === "function" ? require("./schema.js") : null);

  class DraftStore {
    constructor(limit = 50) {
      this.limit = limit;
      this.persisted = null;
      this.defaults = null;
      this.draft = null;
      this.undoStack = [];
      this.redoStack = [];
      this.pending = null;
      this.onChange = null;
    }

    start(persisted, defaults) {
      this.persisted = schema.normalizeConfig(persisted || {});
      this.defaults = schema.normalizeConfig(defaults || persisted || {});
      this.draft = schema.clone(this.persisted);
      this.undoStack = [];
      this.redoStack = [];
      this.pending = null;
      this.emit("start");
      return this.draft;
    }

    emit(reason) {
      if (typeof this.onChange === "function") this.onChange(this.draft, reason);
    }

    signature(value) {
      return JSON.stringify(value);
    }

    isDirty() {
      return this.signature(this.draft) !== this.signature(this.persisted);
    }

    push(snapshot) {
      if (!snapshot || this.signature(snapshot) === this.signature(this.draft)) return;
      this.undoStack.push(schema.clone(snapshot));
      if (this.undoStack.length > this.limit) this.undoStack.shift();
      this.redoStack = [];
    }

    begin() {
      if (!this.pending) this.pending = schema.clone(this.draft);
    }

    commit(reason = "change") {
      if (!this.pending) return false;
      const before = this.pending;
      this.pending = null;
      if (this.signature(before) === this.signature(this.draft)) return false;
      this.push(before);
      this.emit(reason);
      return true;
    }

    cancelPending() {
      this.pending = null;
    }

    mutate(mutator, reason = "change", consolidate = false) {
      const before = schema.clone(this.draft);
      mutator(this.draft);
      this.draft = schema.normalizeConfig(this.draft);
      if (!consolidate) this.push(before);
      this.emit(reason);
      return this.draft;
    }

    replace(config, reason = "replace") {
      const before = schema.clone(this.draft);
      const next = schema.normalizeConfig(config || {});
      next.revision = this.persisted.revision;
      this.draft = next;
      this.push(before);
      this.emit(reason);
    }

    reset(id) {
      this.mutate((draft) => {
        if (!id || id === "hud") {
          const revision = this.persisted.revision;
          this.draft = schema.clone(this.defaults);
          this.draft.revision = revision;
          draft = this.draft;
          return;
        }
        const destination = schema.target(draft, id);
        const source = schema.target(this.defaults, id);
        if (!destination || !source) return;
        Object.keys(destination).forEach((key) => delete destination[key]);
        Object.assign(destination, schema.clone(source));
      }, id ? `reset:${id}` : "reset:hud");
    }

    undo() {
      const previous = this.undoStack.pop();
      if (!previous) return false;
      this.redoStack.push(schema.clone(this.draft));
      this.draft = schema.clone(previous);
      this.emit("undo");
      return true;
    }

    redo() {
      const next = this.redoStack.pop();
      if (!next) return false;
      this.undoStack.push(schema.clone(this.draft));
      this.draft = schema.clone(next);
      this.emit("redo");
      return true;
    }

    markSaved(config) {
      this.persisted = schema.normalizeConfig(config || this.draft);
      this.draft = schema.clone(this.persisted);
      this.undoStack = [];
      this.redoStack = [];
      this.emit("saved");
    }
  }

  return { DraftStore };
});
