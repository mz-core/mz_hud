/*
  MZ HUD — modelo de velocímetro "auren_aton".

  Portado do Auren_Speedometer (ATON) para o contrato canônico do mz_hud.
  Autor original: Apex (colega do operador). Uso local autorizado; NÃO redistribuir
  publicamente em release comercial sem autorização expressa.

  Adaptações:
  - Consome o payload canônico `updateVehicle` (telemetria única do MZ).
  - Dígitos usam os glyphs vetoriais do design.js (não os traçados de reference-digits.js).
  - Ícones das lâmpadas substituídos por paths simples próprios.
  - Fonte Rajdhani NÃO copiada (fontes de sistema).
  - Temperatura, odômetro/trip, freio de mão, ABS, tração: sem fonte MZ → removidos.
  - Sem ignição/boot e sem suavização própria (MZ entrega em ~100 ms).
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MZHudSpeedometerAton = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  let instance = 0;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const number = (v, f = 0) => (typeof v === "number" && Number.isFinite(v) ? v : f);
  const polar = (cx, cy, r, angle) => { const a = (angle * Math.PI) / 180; return [cx + Math.sin(a) * r, cy - Math.cos(a) * r]; };
  const arc = (cx, cy, r, a, b) => { const p = polar(cx, cy, r, a), q = polar(cx, cy, r, b); return `M${p} A${r},${r} 0 ${b - a > 180 ? 1 : 0} 1 ${q}`; };

  // ===== Geometria dos gauges elípticos (portado de design.js) =====
  const profiles = {
    fuel: { cx: 205, cy: 181, rx: 153, ry: 130, side: -1, start: 107, end: 231, width: 6.6, redAt: 207,
      cuts: [[143.8, 1.6, 1], [153.2, 1, 0.98], [173.2, 1.8, 1], [205.7, 1.4, 1], [219.4, 1.1, 1], [226, 1, 1]],
      notches: [[158.7, 0.8, 0.44], [164, 0.9, 0.48], [184.5, 1.2, 0.47], [195.5, 1.3, 0.44]] },
  };
  function pointAtY(p, y, offset = 0) {
    const angle = Math.asin(Math.max(-1, Math.min(1, (y - p.cy) / p.ry)));
    return [p.cx + p.side * (p.rx + offset) * Math.cos(angle), p.cy + (p.ry + offset) * Math.sin(angle)];
  }
  function edges(p, y) {
    const half = p.width / 2;
    return { left: pointAtY(p, y, -p.side * half), right: pointAtY(p, y, p.side * half) };
  }
  const f = (p) => p.map((v) => v.toFixed(3)).join(",");
  function arcTo(p, y, offset, sweep) {
    return `A${(p.rx + offset).toFixed(3)},${(p.ry + offset).toFixed(3)} 0 0 ${sweep} ${f(pointAtY(p, y, offset))}`;
  }
  function ribbon(p, start, end, width = p.width) {
    const left = -p.side * width / 2, right = -left, sweep = p.side === 1 ? 1 : 0;
    return `M${f(pointAtY(p, start, left))} ${arcTo(p, end, left, sweep)} L${f(pointAtY(p, end, right))} ${arcTo(p, start, right, 1 - sweep)} Z`;
  }
  function centerLine(p, offset = 0) {
    return `M${f(pointAtY(p, p.start, offset))} ${arcTo(p, p.end, offset, p.side === 1 ? 1 : 0)}`;
  }
  function gaugeTrack(kind) {
    const p = profiles[kind];
    return `<g class="gauge-housing" stroke-linejoin="round" stroke-linecap="round">
      <path class="fuel-track" d="${centerLine(p)}" fill="none" stroke="#61717e" stroke-width="${p.width + 0.8}" stroke-linecap="butt" opacity=".12"/>
      <path d="${ribbon(p, p.start, p.end, p.width + 1.2)}" fill="none" stroke="#b3c4d1" stroke-width=".55" opacity=".34"/>
      <path d="${centerLine(p, p.width / 2 + 3.1)}" fill="none" stroke="#9aaebc" stroke-width=".65" opacity=".3"/>
    </g>`;
  }
  function gaugeCuts(kind) {
    const p = profiles[kind];
    return `<g class="gauge-cuts" fill="none" stroke="#111921" stroke-linecap="butt">${[...p.cuts, ...p.notches].map(([y, w, fraction]) => {
      const e = edges(p, y), inside = e.right, outside = e.left;
      const end = [inside[0] + (outside[0] - inside[0]) * fraction, inside[1] + (outside[1] - inside[1]) * fraction];
      return `<path d="M${f(inside)} L${f(end)}" stroke-width="${w}"/>`;
    }).join("")}</g>`;
  }
  function buildGauge(host, kind) {
    const p = profiles[kind], start = p.start, end = p.end, n = 64, bars = [];
    let total = 0, previous = pointAtY(p, start); const distances = [0];
    for (let i = 1; i <= n; i++) { const pt = pointAtY(p, start + (end - start) * i / n); total += Math.hypot(pt[0] - previous[0], pt[1] - previous[1]); distances.push(total); previous = pt; }
    for (let i = 0; i < n; i++) {
      const y0 = start + (end - start) * i / n, y1 = start + (end - start) * (i + 1) / n;
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const color = (y0 + y1) / 2 >= p.redAt ? "#f3182c" : "#c6d5e4";
      el.setAttribute("d", ribbon(p, y0, Math.min(end, y1 + 0.3))); el.setAttribute("fill", color); el.setAttribute("stroke", color); el.setAttribute("stroke-width", ".12");
      el.dataset.threshold = String(1 - (distances[i] + distances[i + 1]) / (2 * total)); el.style.opacity = "0"; host.append(el); bars.push(el);
    }
    return bars;
  }

  // ===== Dígitos beveled (portado de design.js glyphs) =====
  const glyphs = {
    "-": { w: 20, d: "M0 17H20V23H0Z" },
    "0": { w: 27, d: "M6 0H21L27 6V34L21 40H6L0 34V6Z M8 5L5.5 7.5V32.5L8 35H19L21.5 32.5V7.5L19 5Z" },
    "1": { w: 20, d: "M12 0H19V40H13V7L3 14L0 9Z" },
    "2": { w: 27, d: "M6 0H21L27 6V15L22 21L6 32V35H27V40H0V30L4 26L20 15L21.5 13V8L19 5H8L5.5 8V11H0V6Z" },
    "3": { w: 27, d: "M1 0H21L27 6V15L23 20L27 25V34L21 40H5L0 35V30H5.5V33L8 35H19L21.5 32.5V25L18 22.5H9V17.5H18L21.5 15V7.5L19 5H1Z" },
    "4": { w: 27, d: "M15 0H22V27H27V32H22V40H16V32H0V26Z M6.5 27H16V10Z" },
    "5": { w: 27, d: "M3 0H27V5H8V16H20L27 23V34L21 40H6L0 34V30H6V32L9 35H18L21.5 32V24.5L18.5 21H2Z" },
    "6": { w: 27, d: "M7 0H23V5H9L5.5 8V17H20L27 24V34L21 40H6L0 34V7Z M5.5 22V32L8.5 35H18.5L21.5 32V25L18.5 22Z" },
    "7": { w: 27, d: "M0 0H27V5L12 40H5.5L20.5 5H0Z" },
    "8": { w: 27, d: "M6 0H21L27 6V15L23 20L27 25V34L21 40H6L0 34V25L4 20L0 15V6Z M8 5L5.5 7.5V14L8.5 17.5H18.5L21.5 14V7.5L19 5Z M8.5 22.5L5.5 25.5V32L8.5 35H18.5L21.5 32V25.5L18.5 22.5Z" },
    "9": { w: 27, d: "M6 0H21L27 6V33L20 40H3V35H18L21.5 32V23H6L0 17V6Z M8 5L5.5 7.5V15.5L8 18H21.5V7.5L19 5Z" },
    "N": { w: 28, d: "M0 40V0H6L22 28V0H28V40H22L6 12V40Z" },
    "R": { w: 28, d: "M0 40V0H21L27 6V17L21 23L28 40H21.5L14.5 23H6V40Z M6 5V18H18.5L21.5 15V8L18.5 5Z" },
  };
  function drawDigits(host, value, height, cx, top, stretch = 1) {
    const textStr = String(value);
    if (host.dataset.value === textStr) return;
    host.dataset.value = textStr;
    const list = [...textStr].map((c) => glyphs[c] || glyphs["0"]);
    const sy = height / 40, sx = sy * stretch;
    let pen = 0, min = Infinity, max = -Infinity;
    for (const g of list) { min = Math.min(min, pen); max = Math.max(max, pen + g.w); pen += g.w + 3; }
    const left = cx - ((min + max) * sx) / 2;
    let x = 0;
    host.innerHTML = `<g transform="translate(${left} ${top}) skewX(-9) scale(${sx} ${sy})">${list.map((g) => { const out = `<path d="${g.d}" transform="translate(${x} 0)" fill-rule="evenodd"/>`; x += g.w + 3; return out; }).join("")}</g>`;
  }

  // ===== Ícones simples (substituem os rastreados de reference-digits.js) =====
  const ICONS = {
    fuel: "M-6 5 V-7 H2 V5 M-8 5 H4 M-5-5 H0 V-2 H-5 Z M2-3 Q7-3 7 0 V3 Q10 6 10 1 V-5 L6-9",
    seatbelt: "M-5 8 L-5-1 Q0-5 5-1 L5 8 M-6 2 L6 5 M-6 7 L7-5 M-1-9 A2.4 2.4 0 1 1 -1-4.2 A2.4 2.4 0 1 1 -1-9",
    engine: "M-9-4 H-5 V-7 H3 V-4 H7 L10-1 H12 V6 H8 L5 9 H-5 V6 H-9 Z M-12-2 V4 M-2-10 V-7 M-5-10 H1",
  };
  const icon = (name) => `<path d="${ICONS[name] || ""}" fill="currentColor" fill-rule="evenodd" stroke="none"/>`;

  function markup(prefix) {
    let ticks = "", spokes = "";
    for (let i = 0; i <= 18; i++) {
      const a = -128 + (i * 256) / 18, major = i % 2 === 0, red = i >= 14;
      const outer = polar(233, 174, red ? 112.2 : 113, a), inner = polar(233, 174, major ? 106.5 : 108.7, a);
      ticks += `<path class="tick ${major ? "major" : ""} ${red ? "red" : ""}" d="M${inner} L${outer}"/>`;
      if (major) { const p = polar(233, 174, 68, a), q = polar(233, 174, 91, a); spokes += `<path d="M${p} L${q}"/>`; }
    }
    return `<div class="cluster" aria-hidden="true"><svg viewBox="0 0 472 296" xmlns="http://www.w3.org/2000/svg" aria-label="Velocímetro e conta-giros">
      <defs>
        <radialGradient id="${prefix}glass" cx="47%" cy="40%" r="66%"><stop offset="0" stop-color="#050b10" stop-opacity=".42"/><stop offset=".65" stop-color="#050b10" stop-opacity=".5"/><stop offset="1" stop-color="#030911" stop-opacity=".67"/></radialGradient>
        <radialGradient id="${prefix}red-aura"><stop stop-color="#ff142e" stop-opacity="0"/><stop offset=".94" stop-color="#ff142e" stop-opacity=".3"/><stop offset="1" stop-color="#ff142e" stop-opacity="0"/></radialGradient>
        <linearGradient id="${prefix}needle-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ff3442"/><stop offset=".55" stop-color="#ff1429"/><stop offset="1" stop-color="#fa1630" stop-opacity=".4"/></linearGradient>
        <linearGradient id="${prefix}digital-face" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#eaf2fd"/><stop offset=".35" stop-color="#e4edf9"/><stop offset="1" stop-color="#c2d1e3"/></linearGradient>
        <linearGradient id="${prefix}white-arc" x1="122" y1="230" x2="250" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#cedce6"/><stop offset=".63" stop-color="#dcebf9"/><stop offset="1" stop-color="#f3f5fa"/></linearGradient>
        <linearGradient id="${prefix}core" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#03080d" stop-opacity=".75"/><stop offset="1" stop-color="#050c12" stop-opacity=".08"/></linearGradient>
        <linearGradient id="${prefix}inner-rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e3edf4" stop-opacity=".52"/><stop offset=".5" stop-color="#9bb3c3" stop-opacity=".2"/><stop offset="1" stop-color="#7e97ac" stop-opacity="0"/></linearGradient>
        <filter id="${prefix}text-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2"/><feComponentTransfer><feFuncA type="linear" slope=".2"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="${prefix}needle-glow" x="-100%" y="-50%" width="300%" height="200%"><feGaussianBlur stdDeviation="2.2"/><feComponentTransfer><feFuncA type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g class="dial-shell" data-edit-part="dial" data-pivot-x="233" data-pivot-y="174">
        <ellipse cx="232" cy="168" rx="124" ry="118" fill="url(#${prefix}glass)"/>
        <circle class="redline-aura" cx="233" cy="174" r="132" fill="url(#${prefix}red-aura)"/>
        <g class="instrument-light">
          <path data-part="normal-arc" d="${arc(233, 174, 113, -128, -128 + (7 * 256) / 9)}" fill="none" stroke="url(#${prefix}white-arc)" stroke-width="1.55"/>
          <path data-part="normal-rim" d="${arc(233, 174, 111.3, -128, -128 + (7 * 256) / 9)}" fill="none" stroke="#718a9d" stroke-width=".65" opacity=".25"/>
          <path data-part="red-arc" d="${arc(233, 174, 108.8, -128 + (7 * 256) / 9, 128)}" fill="none" stroke="#fc1024" stroke-width="6.8" class="red-band"/>
          <g data-part="scale-ticks"><g class="inner-spokes">${spokes}</g>${ticks}</g><g data-part="numbers"></g>
          <path class="sweep-ring" d="${arc(233, 174, 118, -128, 128)}" fill="none" stroke="#e9f6ff" stroke-width="2"/>
        </g>
        <g class="needle" data-part="needle"><path d="M231.1 118 L231.5 71 L234.9 71 L235 118 Z" fill="url(#${prefix}needle-fill)" filter="url(#${prefix}needle-glow)"/></g>
        <circle cx="233" cy="174" r="65" fill="url(#${prefix}core)" stroke="url(#${prefix}inner-rim)" stroke-width="1.1"/>
        <g data-edit-part="gear" data-pivot-x="233" data-pivot-y="149">
          <g transform="translate(233 0) skewX(-9)"><text class="gear-value readout" data-part="gear" x="0" y="164">N</text></g>
          <g class="gear-ink readout" data-part="gear-ink"></g>
        </g>
        <g data-edit-part="speed" data-pivot-x="233" data-pivot-y="216">
          <g transform="translate(231 0) skewX(-9)"><text class="speed-value readout" data-part="speed" x="0" y="231">0</text></g>
          <g class="speed-ink readout" data-part="speed-ink"></g>
          <text class="small-label" data-part="unit" x="233" y="251">KM/H</text>
        </g>
      </g>
      <g class="instrument-light">
        <g class="fuel-gauge" data-edit-part="fuel" data-pivot-x="64" data-pivot-y="174">
          ${gaugeTrack("fuel")}
          <g data-part="fuel-bars"></g>${gaugeCuts("fuel")}<text class="side-label" x="85" y="103">F</text><text class="side-label" x="70" y="240">E</text>
          <g class="fuel-symbol">${icon("fuel")}</g>
        </g>
      </g>
      <g data-edit-part="lamps" data-pivot-x="378" data-pivot-y="161">
        <g class="lamp lamp-red lamp-seatbelt" data-lamp="seatbelt">${icon("seatbelt")}</g>
        <g class="lamp lamp-engine" data-lamp="engineWarning">${icon("engine")}</g>
      </g>
      <g class="signal-lights" data-edit-part="signals" data-pivot-x="233" data-pivot-y="115">
        <g class="lamp lamp-signal" data-lamp="left" transform="translate(191 96)"><path d="M0 6 7 0 V3 H17 V9 H7 V12 Z" fill="currentColor" stroke="none"/></g>
        <g class="lamp lamp-signal" data-lamp="right" transform="translate(256 96)"><path d="M17 6 10 0 V3 H0 V9 H10 V12 Z" fill="currentColor" stroke="none"/></g>
        <g class="lamp lamp-red lamp-hazard" data-lamp="hazard" transform="translate(226 87)"><path d="M7 0 14 13 H0 Z M7 4 10.5 10 H3.5 Z" fill="currentColor" fill-rule="evenodd" stroke="none"/></g>
      </g>
    </svg></div>`;
  }

  class AtonView {
    constructor(host) {
      this.host = host;
      this.prefix = `aton-${++instance}-`;
      host.innerHTML = markup(this.prefix);
      this.root = host.firstElementChild;
      this.parts = Object.fromEntries([...this.root.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
      this.lamps = Object.fromEntries([...this.root.querySelectorAll("[data-lamp]")].map((e) => [e.dataset.lamp, e]));
      this.bars = { fuel: buildGauge(this.parts["fuel-bars"], "fuel") };
      this.root.style.setProperty("--digit-fill", `url(#${this.prefix}digital-face)`);
      this.root.style.setProperty("--text-filter", `url(#${this.prefix}text-glow)`);
      this.key = "";
      this.motionQuery = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
      this.signalKey = "";
      this.signalAt = 0;
      this.buildScale(0.78);
    }

    theme(accent, textColor) {
      this.root.style.setProperty("--model-accent", accent || "#ff1328");
      this.root.style.setProperty("--model-text", textColor || "#e4eef9");
    }

    buildScale(redline) {
      const key = `${redline}`;
      if (this.key === key) return;
      this.key = key;
      const rl = clamp(redline, 0.1, 0.99);
      const end = -128 + rl * 256;
      const entries = Array.from({ length: 19 }, (_, i) => ({ fraction: i / 18, major: i % 2 === 0, label: String(i / 2) }));
      this.parts.numbers.innerHTML = entries.filter((t) => t.major).map((t) => {
        const p = polar(233, 174, 96, -128 + t.fraction * 256);
        return `<text class="dial-label ${t.fraction >= rl ? "red" : ""}" x="${p[0]}" y="${p[1] + 5}">${t.label}</text>`;
      }).join("");
      this.parts["normal-arc"].setAttribute("d", arc(233, 174, 113, -128, end));
      this.parts["normal-rim"].setAttribute("d", arc(233, 174, 111.3, -128, end));
      this.parts["red-arc"].setAttribute("d", arc(233, 174, 108.8, end, 128));
    }

    update(vehicle, config = {}, now = 0) {
      const s = vehicle || {};
      const n = this.parts;
      const engine = s.engine === true || s.engine === 1;
      const reduced = this.motionQuery.matches || config.animation === false;
      const rpm = engine ? clamp(number(s.rpm, 0), 0, 1) : 0;
      const speed = clamp(number(s.speed), 0, 999);
      const fuel = clamp(number(s.fuel), 0, 100);
      const gear = /^(?:N|R|[0-9]|1[0-2])$/.test(String(s.gear ?? "N")) ? String(s.gear) : "-";

      this.buildScale(0.78);
      this.root.classList.toggle("is-visible", true);
      this.root.classList.toggle("is-off", !engine);
      this.root.classList.toggle("reduce-motion", reduced);
      this.root.classList.toggle("is-low-fuel", fuel <= number(config.lowFuel, 15));
      this.root.classList.toggle("is-redline", engine && rpm >= 0.78);

      n.needle.setAttribute("transform", `rotate(${-128 + clamp(rpm, 0, 1) * 256} 233 174)`);
      n.needle.style.visibility = "";
      n.speed.textContent = String(Math.round(speed));
      n.gear.textContent = gear;
      n.unit.textContent = String(config.unit).toUpperCase() === "MPH" ? "MPH" : "KM/H";
      drawDigits(n["speed-ink"], String(Math.round(speed)), 40.5, 233, 190);
      drawDigits(n["gear-ink"], gear, 31.5, 231.8, 132.5);

      for (const el of this.bars.fuel) {
        const opacity = fuel / 100 >= Number(el.dataset.threshold) ? "1" : "0";
        if (el.style.opacity !== opacity) el.style.opacity = opacity;
      }

      const signalKey = `${!!s.indicatorLeft}:${!!s.indicatorRight}`;
      if (signalKey !== this.signalKey) { this.signalKey = signalKey; this.signalAt = now; }
      const flash = reduced || Math.floor(Math.max(0, now - this.signalAt) / 420) % 2 === 0;
      const lampState = {
        seatbelt: s.seatbeltAvailable !== false && s.seatbelt !== true,
        engineWarning: s.engineWarning === true,
        left: s.indicatorLeft && flash,
        right: s.indicatorRight && flash,
        hazard: s.indicatorLeft && s.indicatorRight && flash,
      };
      for (const [key, el] of Object.entries(this.lamps)) {
        el.classList.toggle("is-on", lampState[key] === true);
      }
    }

    destroy() {
      this.root.remove();
    }
  }

  function create(host) {
    return new AtonView(host);
  }

  return { create, markup };
});
