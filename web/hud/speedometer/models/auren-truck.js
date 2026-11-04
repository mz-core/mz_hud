/*
  MZ HUD — modelo de velocímetro "auren_truck".

  Portado do Auren_Speedometer (Truck) para o contrato canônico do mz_hud.
  Autor original: Apex (colega do operador). Uso local autorizado; NÃO redistribuir
  publicamente em release comercial sem autorização expressa.

  Adaptações:
  - Consome o payload canônico `updateVehicle` (telemetria única do MZ).
  - Textura carbon original (CC0) substituída por gradiente próprio; fonte Rajdhani
    NÃO copiada (usa fontes de sistema).
  - Temperatura e trip/odômetro/GPS/ETA não têm fonte canônica no MZ: ocultos.
  - Mostrador MOTOR = engineHealth (estado/saúde do motor), não temperatura.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MZHudSpeedometerTruck = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  let serial = 0;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const finite = (n, f = 0) => (typeof n === "number" && Number.isFinite(n) ? n : f);
  const number = finite;
  const point = (cx, cy, r, a) => { const t = (a * Math.PI) / 180; return [cx + Math.sin(t) * r, cy - Math.cos(t) * r]; };
  const arc = (cx, cy, r, a, b) => { const p = point(cx, cy, r, a), q = point(cx, cy, r, b); return `M${p[0].toFixed(2)} ${p[1].toFixed(2)} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${q[0].toFixed(2)} ${q[1].toFixed(2)}`; };
  const label = (n) => String(Number.isInteger(n) ? n : Number(n.toFixed(1)));

  function ticks(cx, cy, r, max, step, unit, redFrom, labelEvery) {
    let out = "";
    for (let value = 0; value <= max + 0.0001; value += step) {
      const fraction = value / max;
      const a = -128 + fraction * 256;
      const major = Math.abs(value / labelEvery - Math.round(value / labelEvery)) < 0.001 || Math.abs(value - max) < 0.001;
      const mid = Math.abs(value / (labelEvery / 2) - Math.round(value / (labelEvery / 2))) < 0.001;
      const p = point(cx, cy, r, a);
      const q = point(cx, cy, r - (major ? 9 : mid ? 6 : 3), a);
      out += `<path class="truck-tick${major ? " major" : mid ? " medium" : " micro"}${value >= redFrom ? " danger" : ""}" d="M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${q[0].toFixed(1)} ${q[1].toFixed(1)}"/>`;
      if (major) {
        const edge = (cx === 260 && (value === 0 || value === max)) ? r - 12 : r - 21;
        const t = point(cx, cy, edge, a);
        out += `<text class="truck-tick-label${value >= redFrom ? " danger" : ""}" x="${t[0].toFixed(1)}" y="${(t[1] + 3).toFixed(1)}">${label(value)}${unit}</text>`;
      }
    }
    return out;
  }

  function dial(id, cx, cy, r, title, scale) {
    const small = id.endsWith("fuel") || id.endsWith("temp") || id.endsWith("health");
    const titleY = small ? cy + r * 0.45 : id.endsWith("rpm") ? cy + r * 0.39 : cy - r * 0.33;
    const redStart = id.endsWith("rpm") ? 0.76 : id.endsWith("temp") ? 0.78 : id.endsWith("fuel") ? 0.88 : id.endsWith("health") ? 0.85 : 1.1;
    return `<g class="truck-dial" data-dial="${id}"><circle cx="${cx}" cy="${cy}" r="${r + 8}" class="truck-rim-highlight" stroke="url(#${id}-metal)"/><circle cx="${cx}" cy="${cy}" r="${r + 6}" class="truck-rim-outer" stroke="url(#${id}-metal)"/><circle cx="${cx}" cy="${cy}" r="${r + 2}" class="truck-rim-inner"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-face)" class="truck-face"/><circle cx="${cx}" cy="${cy}" r="${r - 3}" class="truck-inner-line"/><path class="truck-arc" d="${arc(cx, cy, r - 3, -128, 128)}"/>${redStart < 1 ? `<path class="truck-warning-arc" d="${arc(cx, cy, r - 4, -128 + redStart * 256, 128)}"/>` : ""}<g data-scale="${id}">${scale}</g><g data-needle="${id}" class="truck-needle" transform="rotate(-128 ${cx} ${cy})"><path d="M${cx - 2} ${cy + 8} L${cx - 1} ${cy - r + 16} L${cx + 1} ${cy - r + 16} L${cx + 2} ${cy + 8} Z"/><circle cx="${cx}" cy="${cy}" r="4"/></g><text class="truck-title" x="${cx}" y="${titleY}">${title}</text><circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="url(#${id}-glass)" class="truck-dial-glass" pointer-events="none"/></g>`;
  }

  function markup(prefix) {
    const slots = ["P", "R", "N", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((gear, index) => `<text data-gear-slot="${gear}" x="${216 + index * 8}" y="209">${gear}</text>`).join("");
    const face = (id) => `<radialGradient id="${id}-face" cx="42%" cy="35%" r="72%"><stop stop-color="#0b0d0e"/><stop offset=".52" stop-color="#060809"/><stop offset="1" stop-color="#010304"/></radialGradient><linearGradient id="${id}-metal" x1="0%" y1="0%" x2="100%" y2="100%"><stop stop-color="#18282e"/><stop offset=".13" stop-color="#d7e2e5"/><stop offset=".27" stop-color="#576a71"/><stop offset=".48" stop-color="#a5b8bc"/><stop offset=".75" stop-color="#35474e"/><stop offset=".9" stop-color="#e4eef0"/><stop offset="1" stop-color="#111d22"/></linearGradient><linearGradient id="${id}-glass" x1="5%" y1="0%" x2="84%" y2="100%"><stop stop-color="#e4f6ff" stop-opacity=".075"/><stop offset=".36" stop-color="#bfdce9" stop-opacity=".009"/><stop offset=".68" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".025"/></linearGradient>`;
    return `<svg class="truck-instrument" viewBox="0 0 600 285" role="img" aria-label="Painel de caminhão com instrumentos">
      <defs>${["speed", "rpm", "fuel", "health"].map((v) => face(prefix + v)).join("")}</defs>
      <g data-edit-part="rpm" data-pivot-x="78" data-pivot-y="161">${dial(prefix + "rpm", 78, 161, 72, "RPM ×1000", ticks(78, 161, 67, 9, 0.1, "", 7, 1))}</g>
      <g data-edit-part="speed" data-pivot-x="260" data-pivot-y="143">${dial(prefix + "speed", 260, 143, 110, "KM/H", ticks(260, 143, 104, 140, 2, "", Infinity, 20))}<text data-read="speed" class="truck-speed" x="260" y="178">0</text>
        <g data-edit-part="gear" data-pivot-x="260" data-pivot-y="204" class="truck-gear-strip"><rect x="210" y="196" width="100" height="17" rx="3"/><path data-gear-caret d="M-2.5 194 L0 198 L2.5 194 Z" transform="translate(232 0)"/>${slots}</g>
      </g>
      <g data-edit-part="fuel" data-pivot-x="438" data-pivot-y="96">${dial(prefix + "fuel", 438, 96, 53, "COMB.", ticks(438, 96, 49, 100, 2, "", 90, 20))}<g class="truck-fixed-symbol" transform="translate(437 78)"><path d="M-4-5 h7 v11 h-7 Z M-2-2 h3 M3-3 q4-2 4 2 v5 q3 2 3-2 v-7"/></g><text data-read="fuelPct" class="truck-gauge-value" x="438" y="136">--%</text></g>
      <g data-edit-part="health" data-pivot-x="550" data-pivot-y="164">${dial(prefix + "health", 550, 164, 38, "MOTOR", ticks(550, 164, 34, 100, 5, "", 85, 50))}</g>
      <g data-edit-part="signals" data-pivot-x="260" data-pivot-y="126" class="truck-signals"><path data-lamp="left" d="M218 126 l8-6 v4 h10 v4 h-10 v4Z"/><g data-lamp="hazard" class="truck-hazard" transform="translate(260 126)"><path d="M0-10 L10 8 H-10 Z"/><path d="M0-4 V2 M0 5 V5.4"/></g><path data-lamp="right" d="M302 126 l-8-6 v4 h-10 v4 h10 v4Z"/></g>
      <g data-edit-part="lamps" data-pivot-x="300" data-pivot-y="164" class="truck-lamps">
        <g data-lamp="engine" transform="translate(78 64)"><title>Motor</title><path d="M-9-4 h4 v-4 h8 v4 h4 l3 3 v6 h-3 l-2 3 h-11 l-2-3 h-3 v-7Z"/></g>
        <g data-lamp="seatbelt" transform="translate(338 263)"><title>Cinto de segurança</title><circle cx="-1" cy="-9" r="2.4"/><path d="M-5-4 Q-1-6 3-3 L5 3 M-5-4 L-6 5 L5 5 L8 9 M-9 9 H7 M-8-1 L4 8 M4 6 H8 V10 H4 Z"/></g>
        <g data-lamp="headlights" transform="translate(530 80)"><title>Faróis</title><path d="M-3-6 q11 6 0 12 Z M-10-5 h5 M-10-1 h5 M-10 3 h5 M-10 7 h5"/></g>
      </g>
    </svg>`;
  }

  class TruckView {
    constructor(host) {
      this.root = document.createElement("div");
      this.root.className = "truck-view";
      this.prefix = `truck-${++serial}-`;
      this.root.innerHTML = markup(this.prefix);
      host.appendChild(this.root);
      this.nodes = {};
      this.root.querySelectorAll("[data-read],[data-lamp],[data-needle],[data-scale],[data-dial]").forEach((el) => {
        const key = el.dataset.read || el.dataset.lamp || el.dataset.needle || el.dataset.scale || el.dataset.dial;
        (this.nodes[key] ||= []).push(el);
      });
      this.motionQuery = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
      this.lastUnit = "";
      // Oculta elementos sem fonte canônica MZ (temperatura não existe; trip não existe).
      const hide = (sel) => { const el = this.root.querySelector(sel); if (el) el.style.display = "none"; };
    }

    theme(accent, textColor) {
      this.root.style.setProperty("--model-accent", accent || "#e32132");
      this.root.style.setProperty("--model-text", textColor || "#f0f1ed");
    }

    text(name, value) {
      for (const node of this.nodes[name] || []) {
        const str = String(value);
        if (node.textContent !== str) node.textContent = str;
      }
    }

    angle(name, fraction, cx, cy) {
      for (const el of this.nodes[name] || []) {
        if (el.matches("[data-needle]")) el.setAttribute("transform", `rotate(${-128 + clamp(finite(fraction), 0, 1) * 256} ${cx} ${cy})`);
      }
    }

    update(vehicle, config = {}, now = 0) {
      const v = vehicle || {};
      const engine = v.engine === true || v.engine === 1;
      const reduced = this.motionQuery.matches || config.animation === false;
      const unit = String(config.unit).toUpperCase() === "MPH" ? "MPH" : "KM/H";
      const maxSpeed = unit === "MPH" ? 90 : 140;

      // Reconstrói o título da unidade apenas quando muda (evita trabalho por frame).
      if (this.lastUnit !== unit) {
        this.lastUnit = unit;
        const title = this.root.querySelector(`[data-dial="${this.prefix}speed"] .truck-title`);
        if (title) title.textContent = unit;
      }

      const speed = clamp(number(v.speed), 0, 999);
      const rpm = engine ? clamp(number(v.rpm, 0), 0, 1) : 0;
      const fuel = clamp(number(v.fuel), 0, 100);
      const health = clamp(number(v.engineHealth, 0), 0, 1);

      this.root.classList.toggle("truck-reduced-motion", reduced);
      this.root.classList.toggle("truck-engine-off", !engine);
      this.root.classList.toggle("truck-low-fuel", fuel <= number(config.lowFuel, 15));
      this.root.classList.toggle("truck-redline", engine && rpm >= 0.76);

      this.angle(this.prefix + "speed", speed / maxSpeed, 260, 143);
      this.angle(this.prefix + "rpm", rpm, 78, 161);
      this.angle(this.prefix + "fuel", fuel / 100, 438, 96);
      this.angle(this.prefix + "health", health, 550, 164);

      this.text("speed", Math.round(speed));
      this.text("fuelPct", `${Math.round(fuel)}%`);

      // Marcha (P/R/N/1..9)
      const gear = /^(?:N|R|[0-9]|1[0-2])$/.test(String(v.gear ?? "N")) ? String(v.gear) : "-";
      const slots = this.root.querySelectorAll("[data-gear-slot]");
      let activeIndex = 2;
      slots.forEach((slot, index) => {
        const active = slot.dataset.gearSlot === gear;
        slot.classList.toggle("is-current", active);
        if (active) activeIndex = index;
      });
      const caret = this.root.querySelector("[data-gear-caret]");
      if (caret) caret.setAttribute("transform", `translate(${216 + activeIndex * 8} 0)`);

      // Indicadores suportados pelo MZ.
      const blink = reduced || Math.floor(number(now) / 400) % 2 === 0;
      const lamps = {
        left: v.indicatorLeft && blink,
        right: v.indicatorRight && blink,
        hazard: v.indicatorLeft && v.indicatorRight && blink,
        engine: v.engineWarning === true,
        seatbelt: v.seatbeltAvailable !== false && v.seatbelt !== true && engine,
        headlights: v.lights || v.lightsHigh,
      };
      for (const [key, on] of Object.entries(lamps)) {
        for (const el of this.nodes[key] || []) {
          if (el.matches("[data-lamp]")) el.classList.toggle("is-on", !!on);
        }
      }
    }

    destroy() {
      this.root.remove();
    }
  }

  function create(host) {
    return new TruckView(host);
  }

  return { create, markup };
});
