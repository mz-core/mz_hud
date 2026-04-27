(function () {
  function render(ctx) {
    const state = ctx.state;
    const dom = ctx.dom;
    const getLogoPositionClass = ctx.getLogoPositionClass;

    const logo = state.config?.logo || {};
    const inVehicle = state.vehicle.visible;
    const shouldShow =
      logo.enabled && logo.image_url && (!logo.show_only_in_vehicle || inVehicle);

    if (!shouldShow) {
      dom.hudLogo.className = "hud-logo hidden";
      dom.hudLogo.innerHTML = "";
      return;
    }

    dom.hudLogo.className = `hud-logo ${getLogoPositionClass(logo.position)}`;
    dom.hudLogo.style.opacity = `${(logo.opacity || 100) / 100}`;
    dom.hudLogo.innerHTML = "";

    const image = document.createElement("img");
    image.alt = "HUD Logo";
    image.src = String(logo.image_url || "");
    image.style.width = `${logo.width}px`;
    image.style.height = `${logo.height}px`;

    dom.hudLogo.appendChild(image);
  }

  window.MZHudLogo = {
    render,
  };
})();
