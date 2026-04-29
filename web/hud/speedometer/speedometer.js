(function () {
  "use strict";

  const iconAssets = {
    fuel: "./assets/icons/vehicle/default/fuel.svg",
    belt: "./assets/icons/vehicle/default/belt.svg",
    unbelt: "./assets/icons/vehicle/default/unbelt.svg",
    light: "./assets/icons/vehicle/default/light-spot.svg",
    lightHigh: "./assets/icons/vehicle/default/light-spot-2.svg",
    lightOff: "./assets/icons/vehicle/default/light-spot-off.svg",
    engine: "./assets/icons/vehicle/default/engine.svg",
    turn: "./assets/icons/vehicle/default/turn.svg",
    speed: "./assets/icons/vehicle/default/speed.svg",
    rpm: "./assets/icons/vehicle/default/rpm.svg",
    gear: "./assets/icons/vehicle/default/gear.svg",
    weapon: "./assets/icons/vehicle/default/weapon.svg",
    ammo: "./assets/icons/vehicle/default/ammo.svg",
    arrow: "./assets/icons/vehicle/default/arrow.svg",
    arrowActive: "./assets/icons/vehicle/default/arrowActive.svg",
  };

  function icon(name) {
    const src = iconAssets[name];
    if (!src) return "";
    return `<span class="speedometer-icon-mask" style="--icon-url: url('${src}')"></span>`;
  }

  function indicatorIcons(speedometer, state) {
    const engineOn = Boolean(state.vehicle.engine);
    const lightState = state.vehicle.lightsState || (state.vehicle.lightsHigh ? "high" : state.vehicle.lights ? "on" : "off");
    const lightIcon = lightState === "high" ? "lightHigh" : lightState === "on" ? "light" : "lightOff";
    const lightClass = lightState === "high" ? "is-high" : lightState === "on" ? "is-active" : "is-off";

    return `<div class="speedometer-indicators">
      ${speedometer.show_seatbelt ? `<span class="speedometer-indicator ${state.vehicle.seatbelt ? "is-active" : "danger"}" title="Cinto">${icon(state.vehicle.seatbelt ? "belt" : "unbelt")}</span>` : ""}
      ${speedometer.show_lights ? `<span class="speedometer-indicator ${lightClass}" title="Faróis">${icon(lightIcon)}</span>` : ""}
      ${speedometer.show_engine ? `<span class="speedometer-indicator ${engineOn ? "is-active" : "is-off"}" title="Motor">${icon("turn")}</span>` : ""}
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

  function renderHudzip(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
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
    const engineClass = state.vehicle.engine ? (engineValue < 35 ? "is-warning" : "is-ok") : "is-off";

    return `<div class="speedometer-panel speedometer-hudzip">
      ${speedometer.show_speed ? `<svg class="hudzip-speed-arc" viewBox="0 0 64 64" aria-hidden="true"><circle class="hudzip-speed-track" r="20" cx="32" cy="32"></circle><circle class="hudzip-speed-fill" r="20" cx="32" cy="32" style="stroke-dashoffset:${speedArc}"></circle></svg>` : ""}
      ${speedometer.show_fuel ? `<div class="hudzip-side-circle hudzip-fuel ${fuelLowClass}" title="CombustÃ­vel"><svg class="hudzip-status-svg" viewBox="0 0 50 50"><circle class="hudzip-circle-back" r="18" cx="25" cy="25"></circle><circle class="hudzip-circle-fill" r="18" cx="25" cy="25" style="stroke-dashoffset:${fuelArc}"></circle></svg><span class="hudzip-side-value">${fuel}<b>L</b></span><span class="hudzip-side-icon">${icon("fuel")}</span></div>` : ""}
      ${speedometer.show_engine ? `<div class="hudzip-side-circle hudzip-engine-circle ${engineClass}" title="Motor"><svg class="hudzip-status-svg" viewBox="0 0 50 50"><circle class="hudzip-circle-back" r="18" cx="25" cy="25"></circle><circle class="hudzip-circle-fill" r="18" cx="25" cy="25" style="stroke-dashoffset:${engineArc}"></circle></svg><span class="hudzip-side-icon">${icon("engine")}</span></div>` : ""}
      ${speedometer.show_gear ? `<div class="hudzip-gear"><small>${escapeHTML(previousGear)}</small><div>${escapeHTML(gear)}</div><small>${escapeHTML(nextGear)}</small></div>` : ""}
      ${speedometer.show_rpm ? `<div class="hudzip-rpm"><strong>RPM</strong><div class="hudzip-rpm-leds">${Array.from({ length: 10 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 10) ? "active" : ""} ${i > 7 ? "hot" : ""}"></span>`).join("")}</div></div>` : ""}
      ${speedometer.show_speed ? `<h1>${renderSpeedDigits(speed)}</h1><em>${escapeHTML(speedometer.unit === "mph" ? "MPH" : "KM")}</em>` : ""}
      <div class="hudzip-car-info">
        ${speedometer.show_lights ? `<span class="hudzip-arrows"><img class="hudzip-arrow ${leftActive ? "is-active" : ""}" src="${leftActive ? iconAssets.arrowActive : iconAssets.arrow}" alt="Seta esquerda" style="transform:scaleX(-1)"><img class="hudzip-arrow ${rightActive ? "is-active" : ""}" src="${rightActive ? iconAssets.arrowActive : iconAssets.arrow}" alt="Seta direita"></span>` : ""}
        ${speedometer.show_seatbelt ? `<span class="hudzip-info-icon ${beltClass}" title="Cinto">${icon(beltIcon)}</span>` : ""}
        ${speedometer.show_lights ? `<span class="hudzip-info-icon ${lightClass}" title="Faróis">${icon(lightIcon)}</span>` : ""}
        ${speedometer.show_engine ? `<span class="hudzip-info-icon ${engineOn ? "is-active" : "is-off"}" title="Motor">${icon("turn")}</span>` : ""}
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
        ${speedometer.show_fuel ? `<div class="speedometer-fuel ${fuelLowClass}">${icon("fuel")}<div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div></div>` : ""}
      </div>
      ${indicatorIcons(speedometer, state)}
    </div>`;
  }

  function renderMinimal(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
    const { state, escapeHTML } = ctx;
    return `<div class="speedometer-panel speedometer-minimal">
      ${speedometer.show_speed ? `<div class="minimal-speed"><strong>${speed}</strong><span>${escapeHTML(speedometer.unit || "kmh")}</span></div>` : ""}
      ${speedometer.show_gear ? `<div class="minimal-gear">${escapeHTML(gear)}</div>` : ""}
      ${speedometer.show_fuel ? `<div class="minimal-fuel ${fuelLowClass}">${icon("fuel")}<div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div></div>` : ""}
      ${speedometer.show_rpm ? `<div class="rpm-leds">${Array.from({ length: 8 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 8) ? "active" : ""} ${i > 5 ? "hot" : ""}"></span>`).join("")}</div>` : ""}
      ${indicatorIcons(speedometer, state)}
    </div>`;
  }

  function renderRacing(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass) {
    const { state, escapeHTML } = ctx;
    return `<div class="speedometer-panel speedometer-racing">
      ${speedometer.show_gear ? `<div class="racing-gear">${escapeHTML(gear)}</div>` : ""}
      <div class="racing-main">
        ${speedometer.show_speed ? `<div class="racing-speed"><strong>${speed}</strong><span>${escapeHTML(speedometer.unit || "kmh")}</span></div>` : ""}
        ${speedometer.show_rpm ? `<div class="rpm-blocks">${Array.from({ length: 12 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 12) ? "active" : ""} ${i > 8 ? "hot" : ""}"></span>`).join("")}</div>` : ""}
      </div>
      <div class="racing-side">
        ${speedometer.show_fuel ? `<div class="racing-fuel ${fuelLowClass}"><div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div>${icon("fuel")}</div>` : ""}
        ${indicatorIcons(speedometer, state)}
      </div>
    </div>`;
  }

  function renderAnalog(ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass, classic = false) {
    const { state, escapeHTML } = ctx;
    const maxSpeed = speedometer.unit === "mph" ? (classic ? 120 : 160) : classic ? 200 : 260;
    const safeSpeed = Math.max(0, Math.min(maxSpeed, Number(speed) || 0));
    const dash = classic ? 250 : 198;
    const progress = Math.max(0, Math.min(dash, (safeSpeed / maxSpeed) * dash));
    const needle = (safeSpeed / maxSpeed) * 240 - 120;
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
          <circle cx="50" cy="50" r="46" class="gauge-outer" />
          ${numbers}
          <circle cx="50" cy="50" r="42" class="gauge-bg" stroke-dasharray="${dash} 264" transform="rotate(150 50 50)" />
          <circle cx="50" cy="50" r="42" class="gauge-progress" stroke-dasharray="${progress.toFixed(1)} 264" transform="rotate(150 50 50)" />
          ${ticks}
          <line x1="50" y1="50" x2="50" y2="15" class="gauge-needle" transform="rotate(${needle.toFixed(2)} 50 50)" />
          <circle cx="50" cy="50" r="5" class="gauge-center" />
        </svg>
        <div class="gauge-center-text">
          ${speedometer.show_speed ? `<strong>${speed}</strong><span>${escapeHTML(speedometer.unit || "kmh")}</span>` : ""}
          ${speedometer.show_gear ? `<em>${escapeHTML(gear)}</em>` : ""}
        </div>
      </div>
      <div class="gauge-side">
        ${speedometer.show_fuel ? `<div class="gauge-fuel ${fuelLowClass}">${icon("fuel")}<span>${fuel}%</span></div>` : ""}
        ${speedometer.show_rpm ? `<div class="gauge-rpm"><div class="speedometer-bar-track"><div class="speedometer-bar-fill" style="width:${rpm}%"></div></div><small>RPM</small></div>` : ""}
        ${indicatorIcons(speedometer, state)}
      </div>
    </div>`;
  }

  function render(ctx) {
    const { state, dom, withSpeedometerDefaults, getSpeedometerPositionClass } = ctx;
    if (!state.config) return;
    const speedometer = withSpeedometerDefaults(state.config.speedometer || {});
    const visible = Boolean(speedometer.enabled && state.vehicle.visible && state.speedometerVisible);
    if (!visible) {
      dom.speedometer.className = "speedometer hidden";
      return;
    }
    const rpm = Math.max(0, Math.min(100, Number(state.vehicle.rpm) || 0));
    const fuel = Math.max(0, Math.min(100, Number(state.vehicle.fuel) || 0));
    const speed = Math.max(0, Number(state.vehicle.speed) || 0);
    const gear = state.vehicle.gear || "N";
    const fuelLowClass = fuel < 20 ? "is-low" : "";
    const style = ["digital", "analog", "minimal", "racing", "classic", "hudzip"].includes(speedometer.style) ? speedometer.style : "digital";
    const positionClass = speedometer.free ? "speedometer-free" : getSpeedometerPositionClass(speedometer.position);
    dom.speedometer.className = `speedometer speedometer-style-${style} ${positionClass} ${state.editorOpen && state.selectedElement === "speedometer" ? "is-selected" : ""}`;
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
      hudzip: renderHudzip,
    };

    dom.speedometer.innerHTML = renderers[style](ctx, speedometer, speed, rpm, fuel, gear, fuelLowClass);
  }

  window.MZHudSpeedometer = {
    icon,
    render,
  };
})();
