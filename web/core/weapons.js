(function () {
  "use strict";

  const core = (window.MZHudCore = window.MZHudCore || {});

  function weaponImagePath(name, model = "default") {
    const safe = String(name || "weapon_unarmed")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    const safeModel = String(model || "default")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    return `./assets/weapons/${safeModel}/${safe}.png`;
  }

  function prettyWeaponName(name) {
    return String(name || "weapon")
      .replace(/^weapon_/, "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  Object.assign(core, {
    weaponImagePath,
    prettyWeaponName,
  });
})();
