"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const schema = require("../web/hud/editor/schema.js");
const visibility = require("../web/hud/editor/visibility.js");
const { DraftStore } = require("../web/hud/editor/store.js");

let passed = 0;
function test(name, callback) {
  callback();
  passed += 1;
  process.stdout.write(`ok ${passed} - ${name}\n`);
}

test("always permanece visível", () => {
  assert.equal(visibility.resolveVisibility("health", { enabled: true, visibilityMode: "always" }, {}).visible, true);
});

test("hidden permanece oculto fora do preview", () => {
  assert.equal(visibility.resolveVisibility("health", { enabled: true, visibilityMode: "hidden" }, {}).visible, false);
});

test("armor SMART usa armor canônico", () => {
  assert.equal(visibility.resolveVisibility("armor", { enabled: true, visibilityMode: "smart" }, { status: { armor: 0 } }).visible, false);
  assert.equal(visibility.resolveVisibility("armor", { enabled: true, visibilityMode: "smart" }, { status: { armor: 50 } }).visible, true);
});

test("oxygen SMART usa somente estado de oxigênio em uso", () => {
  assert.equal(visibility.resolveVisibility("oxygen", { enabled: true, visibilityMode: "smart" }, { status: { oxygen: 100, oxygenActive: false } }).visible, false);
  assert.equal(visibility.resolveVisibility("oxygen", { enabled: true, visibilityMode: "smart" }, { status: { oxygen: 82, oxygenActive: true } }).visible, true);
});

test("preview Todos revela SMART e HIDDEN sem mutar gameplay", () => {
  const state = { status: { oxygen: 100, oxygenActive: false }, vehicle: { visible: false } };
  const before = JSON.stringify(state);
  const result = visibility.resolveVisibility("oxygen", { enabled: true, visibilityMode: "hidden" }, state, { preview: "all" });
  assert.equal(result.visible, true);
  assert.equal(result.forced, true);
  assert.equal(JSON.stringify(state), before);
});

test("normalização migra v1, fecha enums e aplica ranges", () => {
  const config = schema.normalizeConfig({
    revision: -4,
    general: { status_group: { orientation: "diagonal", gap: 999 } },
    elements: { armor: { x: -10, y: 500, scale: 900, visibilityMode: "script", locked: "yes" } },
  });
  assert.equal(config.schema_version, 2);
  assert.equal(config.revision, 0);
  assert.equal(config.general.status_group.orientation, "horizontal");
  assert.equal(config.general.status_group.gap, 40);
  assert.equal(config.elements.armor.x, 0);
  assert.equal(config.elements.armor.y, 100);
  assert.equal(config.elements.armor.scale, 180);
  assert.equal(config.elements.armor.visibilityMode, "smart");
  assert.equal(config.elements.armor.locked, false);
});

test("minimapa preserva contrato, fecha formato e limita deslocamentos", () => {
  const config = schema.normalizeConfig({
    general: { minimap_style: "hexagonal", minimap_visibility: "combat", minimap_x: 999, minimap_y: -999, minimap_locked: "yes" },
  });
  assert.equal(config.general.minimap_style, "square");
  assert.equal(config.general.minimap_visibility, "vehicle");
  assert.equal(config.general.minimap_x, 500);
  assert.equal(config.general.minimap_y, -300);
  assert.equal(config.general.minimap_locked, false);
  assert.equal(schema.target(config, "minimap"), config.general);
});

test("presets existentes normalizam para schema v2", () => {
  const presetDirectory = path.join(__dirname, "..", "data", "presets");
  for (const filename of ["apex.json", "classic_rp.json", "clean_minimal.json", "setup_debug.json"]) {
    const preset = JSON.parse(fs.readFileSync(path.join(presetDirectory, filename), "utf8"));
    const normalized = schema.normalizeConfig(preset);
    assert.equal(normalized.schema_version, 2, filename);
    assert.ok(normalized.elements.health, filename);
    assert.ok(schema.visibilityModes.includes(normalized.elements.armor.visibilityMode), filename);
    assert.ok(["horizontal", "vertical"].includes(normalized.general.status_group.orientation), filename);
  }
});

test("preset entra no draft e preserva revisão persistida", () => {
  const store = new DraftStore(50);
  const persisted = schema.normalizeConfig({ revision: 7, elements: { health: { x: 48 } } });
  store.start(persisted, persisted);
  store.replace({ revision: 0, elements: { health: { x: 22 } } }, "preset");
  assert.equal(store.persisted.elements.health.x, 48);
  assert.equal(store.draft.elements.health.x, 22);
  assert.equal(store.draft.revision, 7);
  assert.equal(store.isDirty(), true);
});

test("history consolida, desfaz e refaz localmente", () => {
  const store = new DraftStore(50);
  store.start({ revision: 1, elements: { health: { x: 48 } } }, { revision: 0, elements: { health: { x: 50 } } });
  store.begin();
  store.draft.elements.health.x = 70;
  store.draft.elements.health.x = 71;
  store.commit("drag");
  assert.equal(store.undoStack.length, 1);
  store.undo();
  assert.equal(store.draft.elements.health.x, 48);
  store.redo();
  assert.equal(store.draft.elements.health.x, 71);
});

test("reset global aplica defaults ao draft sem perder revisão", () => {
  const store = new DraftStore(50);
  store.start({ revision: 9, elements: { health: { x: 20 } } }, { revision: 0, elements: { health: { x: 50 } } });
  store.reset("hud");
  assert.equal(store.draft.elements.health.x, 50);
  assert.equal(store.draft.revision, 9);
  assert.equal(store.persisted.elements.health.x, 20);
  assert.equal(store.isDirty(), true);
});

process.stdout.write(`# ${passed} testes aprovados\n`);
