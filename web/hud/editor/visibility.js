(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MZHudVisibility = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  const descriptions = {
    armor: "Mostra somente quando o jogador possuir colete.",
    oxygen: "Mostra enquanto a native de oxigênio indicar uso submerso.",
    stamina: "Mostra enquanto houver consumo de stamina.",
    speedometer: "Mostra somente dentro de um veículo.",
    weapon: "Mostra somente quando existir uma arma relevante equipada.",
  };

  function smartRule(id, state = {}) {
    const status = state.status || {};
    const vehicle = state.vehicle || {};
    const weapon = state.weapon || {};
    if (id === "armor") return Number(status.armor) > 0;
    if (id === "oxygen") return status.oxygenActive === true || status.oxygenInUse === true || Number(status.oxygen) < 100;
    if (id === "stamina") return status.staminaActive === true || Number(status.stamina) > 0;
    if (id === "speedometer" || id === "fuel" || id === "seatbelt") return vehicle.visible === true;
    if (id === "weapon") return weapon.visible === true;
    if (id === "logo") return state.config?.logo?.show_only_in_vehicle ? vehicle.visible === true : true;
    return true;
  }

  function resolveVisibility(id, entry = {}, state = {}, options = {}) {
    const enabled = entry.enabled !== false;
    const mode = ["always", "smart", "hidden"].includes(entry.visibilityMode) ? entry.visibilityMode : "always";
    let visible = enabled && (mode === "always" || (mode === "smart" && smartRule(id, state)));
    const normallyVisible = visible;
    if (options.preview === "all" && enabled) visible = true;
    if (options.preview === "submerged" && id === "oxygen" && enabled) visible = true;
    if (options.preview === "vehicle" && ["speedometer", "fuel", "seatbelt"].includes(id) && enabled) visible = true;
    return { visible, normallyVisible, forced: visible && !normallyVisible, mode, description: descriptions[id] || "A visibilidade inteligente acompanha o estado canônico disponível." };
  }

  return { descriptions, smartRule, resolveVisibility };
});
