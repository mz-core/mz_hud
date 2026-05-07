(function () {
  "use strict";

  const core = (window.MZHudCore = window.MZHudCore || {});

  const minimapQuickPosition = {
    "bottom-left": { x: 24, y: 24 },
    "bottom-center": { x: 860, y: 24 },
    "bottom-right": { x: 1660, y: 24 },
    "center-left": { x: 24, y: 420 },
    center: { x: 860, y: 420 },
    "center-right": { x: 1660, y: 420 },
    "top-left": { x: 24, y: 760 },
    "top-center": { x: 860, y: 760 },
    "top-right": { x: 1660, y: 760 },
  };

  const statusGroupQuickPosition = {
    "bottom-left": { x: 8, y: 94 },
    "bottom-center": { x: 50, y: 94 },
    "bottom-right": { x: 92, y: 94 },
    "center-left": { x: 8, y: 50 },
    center: { x: 50, y: 50 },
    "center-right": { x: 92, y: 50 },
    "top-left": { x: 8, y: 6 },
    "top-center": { x: 50, y: 6 },
    "top-right": { x: 92, y: 6 },
  };

  const chatQuickPosition = {
    "left-top": { x: 2, y: 3 },
    "left-center": { x: 2, y: 50 },
    "left-bottom": { x: 2, y: 82 },
    "center-top": { x: 50, y: 3 },
    center: { x: 50, y: 50 },
    "center-bottom": { x: 50, y: 82 },
    "right-top": { x: 98, y: 3 },
    "right-center": { x: 98, y: 50 },
    "right-bottom": { x: 98, y: 82 },
  };

  function applyMinimapQuickPosition(position) {
    const preset = minimapQuickPosition[position];
    if (!preset) return;
    const x = document.getElementById("general-minimap-x");
    const y = document.getElementById("general-minimap-y");
    if (x) x.value = preset.x;
    if (y) y.value = preset.y;
  }

  function applyStatusGroupQuickPosition(position) {
    const preset = statusGroupQuickPosition[position];
    if (!preset) return;
    const free = document.getElementById("status-group-free");
    const x = document.getElementById("status-group-x");
    const y = document.getElementById("status-group-y");
    if (free) free.checked = false;
    if (x) x.value = preset.x;
    if (y) y.value = preset.y;
  }

  function applyChatQuickPosition(preset) {
    const position = chatQuickPosition[preset];
    if (!position) return;
    const free = document.getElementById("chat-free");
    const x = document.getElementById("chat-x");
    const y = document.getElementById("chat-y");
    if (free) free.checked = false;
    if (x) x.value = position.x;
    if (y) y.value = position.y;
  }

  function getHudPositionClass(position) {
    return `hud-position-${position || "bottom-left"}`;
  }

  function getLogoPositionClass(position) {
    return `logo-${position || "top-center"}`;
  }

  function getSpeedometerPositionClass(position) {
    return `speedometer-${position || "bottom-right"}`;
  }

  function getItemPositionClass(position) {
    return `hud-anchor-${position || "bottom-center"}`;
  }

  function getStatusGroupPositionClass(position) {
    return `hud-group-anchor-${position || "bottom-center"}`;
  }

  function getWeaponPositionClass(position) {
    return `weapon-${position || "bottom-right"}`;
  }

  Object.assign(core, {
    minimapQuickPosition,
    statusGroupQuickPosition,
    chatQuickPosition,
    applyMinimapQuickPosition,
    applyStatusGroupQuickPosition,
    applyChatQuickPosition,
    getHudPositionClass,
    getLogoPositionClass,
    getSpeedometerPositionClass,
    getItemPositionClass,
    getStatusGroupPositionClass,
    getWeaponPositionClass,
  });
})();
