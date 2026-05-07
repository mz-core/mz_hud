(function () {
  "use strict";

  function render(payload = {}) {
    const dom = payload.dom || {};
    const state = payload.state || {};
    const helpers = payload.helpers || {};
    const weaponHud = dom.weaponHud;

    if (!weaponHud || !state.config) return;

    const withWeaponDefaults = helpers.withWeaponDefaults;
    const getWeaponPositionClass = helpers.getWeaponPositionClass;
    const weaponImagePath = helpers.weaponImagePath;
    const prettyWeaponName = helpers.prettyWeaponName;
    const speedometerIcon = helpers.speedometerIcon;
    const escapeHTML = helpers.escapeHTML || ((value) => String(value ?? ""));

    if (
      typeof withWeaponDefaults !== "function" ||
      typeof getWeaponPositionClass !== "function" ||
      typeof weaponImagePath !== "function" ||
      typeof prettyWeaponName !== "function" ||
      typeof speedometerIcon !== "function"
    ) {
      return;
    }

    const config = withWeaponDefaults(state.config.weapon || {});
    const visible = Boolean(
      config.enabled && state.weapon?.visible && state.hudVisible,
    );

    if (!visible) {
      weaponHud.className = "weapon-hud hidden";
      return;
    }

    const positionClass = config.free
      ? "weapon-free"
      : getWeaponPositionClass(config.position);
    const selected = state.editorOpen && state.selectedElement === "weapon" ? "is-selected" : "";
    weaponHud.className = `weapon-hud ${positionClass} ${selected}`;
    weaponHud.style.opacity = `${Math.max(0, Math.min(100, config.opacity || 100)) / 100}`;

    const scale = Math.max(60, Math.min(150, config.scale || 100)) / 100;
    if (config.free) {
      const x = Math.max(0, Math.min(100, Number(config.x) || 88));
      const y = Math.max(0, Math.min(100, Number(config.y) || 78));
      weaponHud.style.left = `${x}%`;
      weaponHud.style.top = `${y}%`;
      weaponHud.style.right = "auto";
      weaponHud.style.bottom = "auto";
      weaponHud.style.transform = `translate(-50%, -50%) scale(${scale})`;
    } else {
      weaponHud.style.left = "";
      weaponHud.style.top = "";
      weaponHud.style.right = "";
      weaponHud.style.bottom = "";
      const weaponTranslate =
        {
          "bottom-center": "translateX(-50%) ",
          "top-center": "translateX(-50%) ",
          "center-left": "translateY(-50%) ",
          "center-right": "translateY(-50%) ",
          center: "translate(-50%, -50%) ",
        }[config.position] || "";
      weaponHud.style.transform = `${weaponTranslate}scale(${scale})`;
    }

    const name = state.weapon?.name || "weapon_unarmed";
    const image = weaponImagePath(name, config.image_model);
    const clip = Number(state.weapon?.clipAmmo ?? state.weapon?.clip ?? 0);
    const reserve = Number(state.weapon?.reserveAmmo ?? state.weapon?.reserve ?? 0);
    const ammoText = state.weapon?.ammoText || `${clip} / ${reserve}`;
    const label = state.weapon?.label || prettyWeaponName(name);
    const ammoParts = String(ammoText).split("/");
    const clipText = (ammoParts[0] || String(clip)).trim();
    const reserveText = (ammoParts.slice(1).join("/") || String(reserve)).trim();

    weaponHud.innerHTML = `
      <div class="weapon-card weapon-comms-card" data-hud-select="weapon">
        ${config.show_image ? `<img class="weapon-image" src="${image}" alt="" onerror="this.style.display='none'">` : `<div class="weapon-placeholder">${speedometerIcon("weapon")}</div>`}
        <div class="weapon-info">
          ${config.show_name ? `<strong>${escapeHTML(label)}</strong>` : ""}
          ${config.show_ammo ? `<div class="weapon-ammo">${speedometerIcon("ammo")}<span>${escapeHTML(clipText)}</span><em>/ ${escapeHTML(reserveText)}</em></div>` : ""}
        </div>
      </div>`;
  }

  window.MZHudWeapon = {
    render,
  };
})();
