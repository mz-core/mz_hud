(function () {
  "use strict";

  function normalizeSlot(name) {
    return {
      lightHigh: "light_high",
      lightOff: "light_off",
      arrowActive: "arrow_active",
      engineIndicator: "engine_indicator",
    }[name] || name;
  }

  function fallbackIconPath(name) {
    const paths = {
      fuel: "./assets/icons/vehicle/default/fuel.svg",
      belt: "./assets/icons/vehicle/default/belt.svg",
      unbelt: "./assets/icons/vehicle/default/unbelt.svg",
      light: "./assets/icons/vehicle/default/light-spot.svg",
      light_high: "./assets/icons/vehicle/default/light-spot-2.svg",
      light_off: "./assets/icons/vehicle/default/light-spot-off.svg",
      lock: "./assets/icons/vehicle/default/lock.svg",
      unlock: "./assets/icons/vehicle/default/unlock.svg",
      engine: "./assets/icons/vehicle/default/engine.svg",
      engine_indicator: "./assets/icons/vehicle/default/turn.svg",
      turn: "./assets/icons/vehicle/default/turn.svg",
      speed: "./assets/icons/vehicle/default/speed.svg",
      rpm: "./assets/icons/vehicle/default/rpm.svg",
      gear: "./assets/icons/vehicle/default/gear.svg",
      weapon: "./assets/icons/vehicle/default/weapon.svg",
      ammo: "./assets/icons/vehicle/default/ammo.svg",
      arrow: "./assets/icons/vehicle/default/arrow.svg",
      arrow_active: "./assets/icons/vehicle/default/arrowActive.svg",
    };
    return paths[normalizeSlot(name)] || "";
  }

  function iconSrc(name, speedometer = {}) {
    const slot = normalizeSlot(name);
    if (window.MZHudCore?.resolveVehicleIconPath) {
      return window.MZHudCore.resolveVehicleIconPath(slot, speedometer) || fallbackIconPath(slot);
    }
    return fallbackIconPath(slot);
  }

  function icon(name, speedometer = {}) {
    if (window.MZHudCore?.renderVehicleIcon) {
      return window.MZHudCore.renderVehicleIcon(normalizeSlot(name), speedometer);
    }
    const src = iconSrc(name, speedometer);
    if (!src) return "";
    return `<span class="speedometer-icon-mask" style="--icon-url: url('${src}')"></span>`;
  }

  function indicatorIcons(speedometer, state) {
    const engineOn = Boolean(state.vehicle.engine);
    const lightState = state.vehicle.lightsState || (state.vehicle.lightsHigh ? "high" : state.vehicle.lights ? "on" : "off");
    const lightIcon = lightState === "high" ? "lightHigh" : lightState === "on" ? "light" : "lightOff";
    const lightClass = lightState === "high" ? "is-high" : lightState === "on" ? "is-active" : "is-off";
    const seatbeltAvailable = state.vehicle.seatbeltAvailable !== false;
    const locked = Boolean(state.vehicle.locked);

    return `<div class="speedometer-indicators">
      ${speedometer.show_seatbelt && seatbeltAvailable ? `<span class="speedometer-indicator ${state.vehicle.seatbelt ? "is-active" : "danger"}" title="Cinto">${icon(state.vehicle.seatbelt ? "belt" : "unbelt", speedometer)}</span>` : ""}
      ${speedometer.show_lights ? `<span class="speedometer-indicator ${lightClass}" title="Faróis">${icon(lightIcon, speedometer)}</span>` : ""}
      ${speedometer.show_lock ? `<span class="speedometer-indicator ${locked ? "is-active" : "is-off"}" title="${locked ? "Trancado" : "Destrancado"}">${icon(locked ? "lock" : "unlock", speedometer)}</span>` : ""}
      ${speedometer.show_engine ? `<span class="speedometer-indicator ${engineOn ? "is-active" : "is-off"}" title="Motor">${icon("engine_indicator", speedometer)}</span>` : ""}
    </div>`;
  }

  function speedArcOffset(value, maxValue = 260, segment = 88) {
    const safe = Math.max(0, Math.min(maxValue, Number(value) || 0));
    const percent = safe / maxValue;
    return (segment * (1 - percent)).toFixed(2);
  }

  function circleDashOffset(value) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0));
    return ((113 * (100 - safe)) / 100).toFixed(1);
  }

  function renderSpeedDigits(speed) {
    const safe = Math.max(0, Math.min(999, Number(speed) || 0));
    const padded = String(Math.floor(safe)).padStart(3, "0");
    return `${padded.slice(0, -2)}<b>${padded.slice(-2)}</b>`;
  }

  function renderApex(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
    const { state, escapeHTML } = ctx;
    const maxSpeed = speedometer.unit === "mph" ? 160 : 260;
    const speedArc = speedArcOffset(speed, maxSpeed, 88);
    const fuelArc = circleDashOffset(fuel);
    const engineValue = Math.max(0, Math.min(100, Number(state.vehicle.engineHealth ?? (state.vehicle.engine ? 100 : 0)) || 0));
    const engineArc = circleDashOffset(engineValue);
    const previousGear = gear === "R" ? "" : gear === "N" ? "R" : String(Math.max(1, (Number(gear) || 1) - 1));
    const nextGear = gear === "R" ? "N" : gear === "N" ? "1" : String((Number(gear) || 1) + 1);
    const leftActive = Boolean(state.vehicle.indicatorLeft);
    const rightActive = Boolean(state.vehicle.indicatorRight);
    const engineOn = Boolean(state.vehicle.engine);
    const lightState = state.vehicle.lightsState || (state.vehicle.lightsHigh ? "high" : state.vehicle.lights ? "on" : "off");
    const lightIcon = lightState === "high" ? "lightHigh" : lightState === "on" ? "light" : "lightOff";
    const lightClass = lightState === "high" ? "is-high" : lightState === "on" ? "is-active" : "is-off";
    const beltIcon = state.vehicle.seatbelt ? "belt" : "unbelt";
    const beltClass = state.vehicle.seatbelt ? "is-active" : "is-danger";
    const seatbeltAvailable = state.vehicle.seatbeltAvailable !== false;
    const locked = Boolean(state.vehicle.locked);
    const engineClass = state.vehicle.engine ? (engineValue < 35 ? "is-warning" : "is-ok") : "is-off";

    return `<div class="speedometer-panel speedometer-apex">
      ${speedometer.show_speed ? `<svg class="apex-speed-arc" viewBox="0 0 64 64" aria-hidden="true"><circle class="apex-speed-track" r="20" cx="32" cy="32"></circle><circle class="apex-speed-fill" r="20" cx="32" cy="32" style="stroke-dashoffset:${speedArc}"></circle></svg>` : ""}
      ${speedometer.show_fuel ? `<div class="apex-side-circle apex-fuel ${fuelLowClass}" title="CombustÃ­vel"><svg class="apex-status-svg" viewBox="0 0 50 50"><circle class="apex-circle-back" r="18" cx="25" cy="25"></circle><circle class="apex-circle-fill" r="18" cx="25" cy="25" style="stroke-dashoffset:${fuelArc}"></circle></svg><span class="apex-side-value">${fuel}<b>L</b></span><span class="apex-side-icon">${icon("fuel", speedometer)}</span></div>` : ""}
      ${speedometer.show_engine ? `<div class="apex-side-circle apex-engine-circle ${engineClass}" title="Motor"><svg class="apex-status-svg" viewBox="0 0 50 50"><circle class="apex-circle-back" r="18" cx="25" cy="25"></circle><circle class="apex-circle-fill" r="18" cx="25" cy="25" style="stroke-dashoffset:${engineArc}"></circle></svg><span class="apex-side-icon">${icon("engine", speedometer)}</span></div>` : ""}
      ${speedometer.show_gear ? `<div class="apex-gear"><small>${escapeHTML(previousGear)}</small><div>${escapeHTML(gear)}</div><small>${escapeHTML(nextGear)}</small></div>` : ""}
      ${speedometer.show_rpm ? `<div class="apex-rpm"><strong>RPM</strong><div class="apex-rpm-leds">${Array.from({ length: 10 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 10) ? "active" : ""} ${i > 7 ? "hot" : ""}"></span>`).join("")}</div></div>` : ""}
      ${speedometer.show_speed ? `<h1>${renderSpeedDigits(speed)}</h1><em>${escapeHTML(speedometer.unit === "mph" ? "MPH" : "KM")}</em>` : ""}
      <div class="apex-car-info">
        ${speedometer.show_lights ? `<span class="apex-arrows"><img class="apex-arrow ${leftActive ? "is-active" : ""}" src="${leftActive ? iconSrc("arrow_active", speedometer) : iconSrc("arrow", speedometer)}" alt="Seta esquerda" style="transform:scaleX(-1)"><img class="apex-arrow ${rightActive ? "is-active" : ""}" src="${rightActive ? iconSrc("arrow_active", speedometer) : iconSrc("arrow", speedometer)}" alt="Seta direita"></span>` : ""}
        ${speedometer.show_seatbelt && seatbeltAvailable ? `<span class="apex-info-icon ${beltClass}" title="Cinto">${icon(beltIcon, speedometer)}</span>` : ""}
        ${speedometer.show_lights ? `<span class="apex-info-icon ${lightClass}" title="Faróis">${icon(lightIcon, speedometer)}</span>` : ""}
        ${speedometer.show_lock ? `<span class="apex-info-icon ${locked ? "is-active" : "is-off"}" title="${locked ? "Trancado" : "Destrancado"}">${icon(locked ? "lock" : "unlock", speedometer)}</span>` : ""}
        ${speedometer.show_engine ? `<span class="apex-info-icon ${engineOn ? "is-active" : "is-off"}" title="Motor">${icon("engine_indicator", speedometer)}</span>` : ""}
      </div>
    </div>`;
  }

  function renderDigital(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
    const { state, escapeHTML } = ctx;
    return `<div class="speedometer-panel speedometer-digital">
      ${speedometer.show_speed ? `<div class="speedometer-speed-wrap"><div class="speedometer-speed">${speed}</div><div class="speedometer-unit">${escapeHTML(speedometer.unit || "kmh")}</div></div>` : ""}
      ${speedometer.show_rpm ? `<div class="speedometer-rpm"><div class="speedometer-bar-track"><div class="speedometer-bar-fill" style="width:${rpm}%"></div></div><div class="speedometer-rpm-labels"><span>0</span><span>RPM</span><span>9</span></div></div>` : ""}
      <div class="speedometer-bottom-row">
        ${speedometer.show_gear ? `<div class="speedometer-gear">${escapeHTML(gear)}</div>` : ""}
        ${speedometer.show_fuel ? `<div class="speedometer-fuel ${fuelLowClass}">${icon("fuel", speedometer)}<div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div></div>` : ""}
      </div>
      ${indicatorIcons(speedometer, state)}
    </div>`;
  }

  function renderMinimal(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
    const { state, escapeHTML } = ctx;
    return `<div class="speedometer-panel speedometer-minimal">
      ${speedometer.show_speed ? `<div class="minimal-speed"><strong>${renderSpeedDigits(speed)}</strong><span>${escapeHTML(speedometer.unit || "kmh")}</span></div>` : ""}
      ${speedometer.show_gear ? `<div class="minimal-gear">${escapeHTML(gear)}</div>` : ""}
      ${speedometer.show_fuel ? `<div class="minimal-fuel ${fuelLowClass}">${icon("fuel", speedometer)}<div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div></div>` : ""}
      ${speedometer.show_rpm ? `<div class="rpm-leds">${Array.from({ length: 8 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 8) ? "active" : ""} ${i > 5 ? "hot" : ""}"></span>`).join("")}</div>` : ""}
      ${indicatorIcons(speedometer, state)}
    </div>`;
  }

  function renderRacing(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
    const { state, escapeHTML } = ctx;
    return `<div class="speedometer-panel speedometer-racing">
      ${speedometer.show_gear ? `<div class="racing-gear">${escapeHTML(gear)}</div>` : ""}
      <div class="racing-main">
        ${speedometer.show_speed ? `<div class="racing-speed"><strong>${renderSpeedDigits(speed)}</strong><span>${escapeHTML(speedometer.unit || "kmh")}</span></div>` : ""}
        ${speedometer.show_rpm ? `<div class="rpm-blocks">${Array.from({ length: 12 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 12) ? "active" : ""} ${i > 8 ? "hot" : ""}"></span>`).join("")}</div>` : ""}
      </div>
      <div class="racing-side">
        ${speedometer.show_fuel ? `<div class="racing-fuel ${fuelLowClass}"><div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div>${icon("fuel", speedometer)}</div>` : ""}
        ${indicatorIcons(speedometer, state)}
      </div>
    </div>`;
  }

  function renderVector(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
    const { state, escapeHTML } = ctx;
    const maxSpeed = speedometer.unit === "mph" ? 160 : 260;
    const safeSpeed = Math.max(0, Math.min(maxSpeed, Number(speed) || 0));
    const speedPercent = Math.max(0, Math.min(100, (safeSpeed / maxSpeed) * 100));
    const dash = 350;
    const speedOffset = (dash - (dash * speedPercent) / 100).toFixed(1);
    const engineValue = Math.max(0, Math.min(100, Number(state.vehicle.engineHealth ?? (state.vehicle.engine ? 100 : 0)) || 0));
    const engineClass = state.vehicle.engine ? (engineValue < 35 ? "is-warning" : "is-ok") : "is-off";
    const seatbeltAvailable = state.vehicle.seatbeltAvailable !== false;
    const lightState = state.vehicle.lightsState || (state.vehicle.lightsHigh ? "high" : state.vehicle.lights ? "on" : "off");
    const lightIcon = lightState === "high" ? "lightHigh" : lightState === "on" ? "light" : "lightOff";
    const lightClass = lightState === "high" ? "is-high" : lightState === "on" ? "is-active" : "is-off";
    const locked = Boolean(state.vehicle.locked);

    return `<div class="speedometer-panel speedometer-vector">
      ${speedometer.show_speed ? `<svg class="vector-speed-line" viewBox="0 0 298 68" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="vector-speed-gradient" x1="0" y1="0" x2="298" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="var(--speed-primary)" />
            <stop offset="100%" stop-color="var(--speed-accent)" />
          </linearGradient>
        </defs>
        <path d="M3 65L38.4 28.0283C50.2 17.0368 66.72 2.04825 89.14 3.04747H298" class="vector-speed-track" />
        <path d="M3 65L38.4 28.0283C50.2 17.0368 66.72 2.04825 89.14 3.04747H298" class="vector-speed-fill" stroke-dasharray="${dash}" stroke-dashoffset="${speedOffset}" />
      </svg>` : ""}
      <div class="vector-main">
        ${speedometer.show_speed ? `<div class="vector-speed"><strong>${renderSpeedDigits(speed)}</strong><span>${escapeHTML(speedometer.unit === "mph" ? "MPH" : "KM/H")}</span></div>` : ""}
        ${speedometer.show_gear ? `<div class="vector-gear"><span>GEAR</span><strong>${escapeHTML(gear)}</strong></div>` : ""}
      </div>
      ${speedometer.show_rpm ? `<div class="vector-rpm">${Array.from({ length: 12 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 12) ? "is-active" : ""} ${i > 9 ? "is-hot" : ""}"></span>`).join("")}</div>` : ""}
      <div class="vector-status">
        ${speedometer.show_fuel ? `<div class="vector-stat ${fuelLowClass}">${icon("fuel", speedometer)}<span>${fuel}%</span></div>` : ""}
        ${speedometer.show_engine ? `<div class="vector-stat ${engineClass}">${icon("engine", speedometer)}<span>${Math.round(engineValue)}%</span></div>` : ""}
        ${speedometer.show_seatbelt && seatbeltAvailable ? `<div class="vector-stat ${state.vehicle.seatbelt ? "is-active" : "is-danger"}">${icon(state.vehicle.seatbelt ? "belt" : "unbelt", speedometer)}</div>` : ""}
        ${speedometer.show_lights ? `<div class="vector-stat ${lightClass}">${icon(lightIcon, speedometer)}</div>` : ""}
        ${speedometer.show_lock ? `<div class="vector-stat ${locked ? "is-active" : "is-off"}" title="${locked ? "Trancado" : "Destrancado"}">${icon(locked ? "lock" : "unlock", speedometer)}</div>` : ""}
      </div>
    </div>`;
  }

  function renderAnalog(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass, classic = false) {
    const { state, escapeHTML } = ctx;
    const maxSpeed = speedometer.unit === "mph" ? (classic ? 120 : 160) : classic ? 200 : 260;
    const safeSpeed = Math.max(0, Math.min(maxSpeed, Number(speed) || 0));
    const dash = classic ? 250 : 176;
    const progress = Math.max(0, Math.min(dash, (safeSpeed / maxSpeed) * dash));
    const needle = (safeSpeed / maxSpeed) * 240 - 120;
    const engineValue = Math.max(0, Math.min(100, Number(state.vehicle.engineHealth ?? (state.vehicle.engine ? 100 : 0)) || 0));
    const engineOn = Boolean(state.vehicle.engine);
    const engineClass = engineOn ? (engineValue < 35 ? "is-warning" : "is-ok") : "is-off";
    const engineArc = 120;
    const engineOffset = (engineArc * (1 - engineValue / 100)).toFixed(1);
    const leftActive = Boolean(state.vehicle.indicatorLeft);
    const rightActive = Boolean(state.vehicle.indicatorRight);
    const lightState = state.vehicle.lightsState || (state.vehicle.lightsHigh ? "high" : state.vehicle.lights ? "on" : "off");
    const lightIcon = lightState === "high" ? "lightHigh" : lightState === "on" ? "light" : "lightOff";
    const lightClass = lightState === "high" ? "is-high" : lightState === "on" ? "is-active" : "is-off";
    const seatbeltAvailable = state.vehicle.seatbeltAvailable !== false;
    const locked = Boolean(state.vehicle.locked);
    const tickCount = classic ? 21 : 9;
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const percent = tickCount === 1 ? 0 : i / (tickCount - 1);
      const angle = ((percent * 240 - 120) * Math.PI) / 180;
      const inner = classic ? (i % 4 === 0 ? 37 : 41) : 36;
      const outer = classic ? 45 : 42;
      const x1 = 50 + inner * Math.cos(angle);
      const y1 = 50 + inner * Math.sin(angle);
      const x2 = 50 + outer * Math.cos(angle);
      const y2 = 50 + outer * Math.sin(angle);
      return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="var(--speed-primary-soft)" stroke-width="${classic && i % 4 === 0 ? 2 : 1}" />`;
    }).join("");
    const numbers = classic
      ? [0, 40, 80, 120, 160, 200].map((num, i) => {
          const display = speedometer.unit === "mph" ? Math.round(num * 0.621371) : num;
          const angle = (((i / 5) * 240 - 120) * Math.PI) / 180;
          const x = 50 + 34 * Math.cos(angle);
          const y = 50 + 34 * Math.sin(angle) + 3;
          return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle">${display}</text>`;
        }).join("")
      : "";
    return `<div class="speedometer-panel ${classic ? "speedometer-classic" : "speedometer-analog"}">
      <div class="speedometer-gauge">
        <svg viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gauge-needle-gradient" x1="50" y1="50" x2="50" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="var(--speed-accent)" stop-opacity="0" />
              <stop offset="48%" stop-color="var(--speed-accent)" stop-opacity="0" />
              <stop offset="78%" stop-color="var(--speed-accent)" stop-opacity=".82" />
              <stop offset="100%" stop-color="var(--speed-accent)" stop-opacity="1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="46" class="gauge-outer" />
          ${numbers}
          <circle cx="50" cy="50" r="42" class="gauge-bg" stroke-dasharray="${dash} 264" transform="rotate(150 50 50)" />
          <circle cx="50" cy="50" r="42" class="gauge-progress" stroke-dasharray="${progress.toFixed(1)} 264" transform="rotate(150 50 50)" />
          ${ticks}
          <line x1="50" y1="50" x2="50" y2="15" class="gauge-needle" transform="rotate(${needle.toFixed(2)} 50 50)" />
        </svg>
        <div class="gauge-center-text">
          ${speedometer.show_speed ? `<strong>${speed}</strong><span>${escapeHTML(speedometer.unit || "kmh")}</span>` : ""}
          ${speedometer.show_gear ? `<em>${escapeHTML(gear)}</em>` : ""}
        </div>
      </div>
      <div class="gauge-side">
        ${speedometer.show_engine ? `<div class="gauge-engine-edge ${engineClass}" title="Motor"><span class="gauge-engine-icon">${icon("engine", speedometer)}</span><svg viewBox="0 0 32 120" aria-hidden="true"><path d="M 8 10 C 30 34 30 86 8 110" class="gauge-engine-arc-bg" /><path d="M 8 10 C 30 34 30 86 8 110" class="gauge-engine-arc ${engineClass}" stroke-dasharray="${engineArc}" stroke-dashoffset="${engineOffset}" /></svg></div>` : ""}
        ${speedometer.show_lights ? `<div class="gauge-drive-icons"><img class="gauge-arrow ${leftActive ? "is-active" : ""}" src="${leftActive ? iconSrc("arrow_active", speedometer) : iconSrc("arrow", speedometer)}" alt="Seta esquerda"><img class="gauge-arrow gauge-arrow-right ${rightActive ? "is-active" : ""}" src="${rightActive ? iconSrc("arrow_active", speedometer) : iconSrc("arrow", speedometer)}" alt="Seta direita"></div>` : ""}
        ${speedometer.show_fuel ? `<div class="gauge-fuel ${fuelLowClass}">${icon("fuel", speedometer)}<span>${fuel}%</span></div>` : ""}
        ${speedometer.show_rpm ? `<div class="gauge-rpm"><div class="speedometer-bar-track"><div class="speedometer-bar-fill" style="width:${rpm}%"></div></div><small>RPM</small></div>` : ""}
        <div class="gauge-status-icons">
          ${speedometer.show_seatbelt && seatbeltAvailable ? `<span class="speedometer-indicator ${state.vehicle.seatbelt ? "is-active" : "danger"}" title="Cinto">${icon(state.vehicle.seatbelt ? "belt" : "unbelt", speedometer)}</span>` : ""}
          ${speedometer.show_lights ? `<span class="speedometer-indicator ${lightClass}" title="Faróis">${icon(lightIcon, speedometer)}</span>` : ""}
          ${speedometer.show_lock ? `<span class="speedometer-indicator ${locked ? "is-active" : "is-off"}" title="${locked ? "Trancado" : "Destrancado"}">${icon(locked ? "lock" : "unlock", speedometer)}</span>` : ""}
          ${speedometer.show_engine ? `<span class="speedometer-indicator ${engineOn ? "is-active" : "is-off"}" title="Motor">${icon("engine_indicator", speedometer)}</span>` : ""}
        </div>
      </div>
    </div>`;
  }

  function render(ctx) {
    const { state, dom, withSpeedometerDefaults, getSpeedometerPositionClass } = ctx;
    if (!state.config) return;
    const speedometer = withSpeedometerDefaults(state.config.speedometer || {});
    const visibility = window.MZHudVisibility?.resolveVisibility("speedometer", speedometer, state, { preview: state.editorPreview }) || { visible: true, forced: false };
    const visible = Boolean(speedometer.enabled && visibility.visible && state.speedometerVisible);
    if (!visible) {
      dom.speedometer.className = "speedometer hidden";
      return;
    }
    const rpm = Math.max(0, Math.min(100, Number(state.vehicle.rpm) || 0));
    const fuel = Math.max(0, Math.min(100, Number(state.vehicle.fuel) || 0));
    const speed = Math.max(0, Number(state.vehicle.speed) || 0);
    const gear = state.vehicle.gear || "N";
    const fuelLowClass = fuel < 20 ? "is-low" : "";
    const style = ["digital", "analog", "minimal", "racing", "classic", "apex", "vector"].includes(speedometer.style) ? speedometer.style : "digital";
    const positionClass = speedometer.free ? "speedometer-free" : getSpeedometerPositionClass(speedometer.position);
    dom.speedometer.className = `speedometer speedometer-style-${style} ${positionClass} ${state.editorOpen && state.selectedElement === "speedometer" ? "is-selected" : ""} ${visibility.forced ? "is-editor-forced" : ""}`;
    dom.speedometer.dataset.hudSelect = "speedometer";
    dom.speedometer.style.opacity = `${Math.max(0, Math.min(100, speedometer.opacity || 100)) / 100}`;
    dom.speedometer.style.setProperty("--speed-primary", speedometer.primary_color);
    dom.speedometer.style.setProperty("--speed-secondary", speedometer.secondary_color);
    dom.speedometer.style.setProperty("--speed-accent", speedometer.accent_color);
    dom.speedometer.style.setProperty("--speed-bg", speedometer.background_color);
    dom.speedometer.style.setProperty("--speed-primary-soft", `${speedometer.primary_color}80`);
    const speedScale = Math.max(60, Math.min(150, speedometer.scale || 100)) / 100;
    if (speedometer.free) {
      const x = Math.max(0, Math.min(100, Number(speedometer.x) || 88));
      const y = Math.max(0, Math.min(100, Number(speedometer.y) || 82));
      dom.speedometer.style.left = `${x}%`;
      dom.speedometer.style.top = `${y}%`;
      dom.speedometer.style.right = "auto";
      dom.speedometer.style.bottom = "auto";
      dom.speedometer.style.transform = `translate(-50%, -50%) scale(${speedScale})`;
    } else {
      dom.speedometer.style.left = "";
      dom.speedometer.style.top = "";
      dom.speedometer.style.right = "";
      dom.speedometer.style.bottom = "";
      const speedTranslate = {
        "bottom-center": "translateX(-50%) ",
        "top-center": "translateX(-50%) ",
        "center-left": "translateY(-50%) ",
        "center-right": "translateY(-50%) ",
        center: "translate(-50%, -50%) ",
      }[speedometer.position] || "";
      dom.speedometer.style.transform = `${speedTranslate}scale(${speedScale})`;
    }

    const renderers = {
      digital: renderDigital,
      minimal: renderMinimal,
      racing: renderRacing,
      analog: (ctx, s, sp, r, f, g, l) => renderAnalog(ctx, s, sp, r, f, g, l, false),
      classic: (ctx, s, sp, r, f, g, l) => renderAnalog(ctx, s, sp, r, f, g, l, true),
      apex: renderApex,
      vector: renderVector,
    };

    const badge = state.editorOpen && visibility.mode !== "always" ? `<span class="hud-editor-module-badge">${visibility.mode.toUpperCase()}</span>` : "";
    dom.speedometer.innerHTML = badge + renderers[style](ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass);
  }

  window.MZHudSpeedometer = {
    icon,
    render,
  };
})();
