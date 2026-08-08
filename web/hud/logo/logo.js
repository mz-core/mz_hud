(function () {
  function render(ctx) {
    const state = ctx.state;
    const dom = ctx.dom;
    const getLogoPositionClass = ctx.getLogoPositionClass;

    const logo = state.config?.logo || {};
    const inVehicle = state.vehicle.visible;
    const visibility = window.MZHudVisibility?.resolveVisibility("logo", logo, state, { preview: state.editorPreview }) || { visible: true, forced: false };
    const shouldShow =
      logo.enabled && logo.image_url && visibility.visible && (!logo.show_only_in_vehicle || inVehicle || visibility.forced);

    if (!shouldShow) {
      dom.hudLogo.className = "hud-logo hidden";
      dom.hudLogo.innerHTML = "";
      return;
    }

    const positionClass = logo.free ? "logo-free" : getLogoPositionClass(logo.position);
    dom.hudLogo.className = `hud-logo ${positionClass} ${state.editorOpen && state.selectedElement === "logo" ? "is-selected" : ""} ${visibility.forced ? "is-editor-forced" : ""}`;
    dom.hudLogo.dataset.hudSelect = "logo";
    dom.hudLogo.style.opacity = `${(logo.opacity || 100) / 100}`;
    const scale = Math.max(.5, Math.min(1.8, Number(logo.scale || 100) / 100));
    if (logo.free) {
      dom.hudLogo.style.left = `${Math.max(0, Math.min(100, Number(logo.x) || 50))}%`;
      dom.hudLogo.style.top = `${Math.max(0, Math.min(100, Number(logo.y) || 6))}%`;
      dom.hudLogo.style.right = "auto";
      dom.hudLogo.style.bottom = "auto";
      dom.hudLogo.style.transform = `translate(-50%, -50%) scale(${scale})`;
    } else {
      dom.hudLogo.style.left = "";
      dom.hudLogo.style.top = "";
      dom.hudLogo.style.right = "";
      dom.hudLogo.style.bottom = "";
      const anchorTranslate = {
        "bottom-center": "translateX(-50%) ", "top-center": "translateX(-50%) ",
        "center-left": "translateY(-50%) ", "center-right": "translateY(-50%) ",
        center: "translate(-50%, -50%) ",
      }[logo.position] || "";
      dom.hudLogo.style.transform = `${anchorTranslate}scale(${scale})`;
    }
    dom.hudLogo.innerHTML = "";

    const image = document.createElement("img");
    image.alt = "HUD Logo";
    image.src = String(logo.image_url || "");
    image.style.width = `${logo.width}px`;
    image.style.height = `${logo.height}px`;

    dom.hudLogo.appendChild(image);
    if (state.editorOpen && visibility.mode !== "always") {
      const badge = document.createElement("span");
      badge.className = "hud-editor-module-badge";
      badge.textContent = visibility.mode.toUpperCase();
      dom.hudLogo.appendChild(badge);
    }
  }

  window.MZHudLogo = {
    render,
  };
})();
