import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";
import { heroSceneModule } from "./hero-boot.js";
import { initHeroVideo } from "./hero-video.js";
import { t } from "./i18n.js";

export async function initHeroExperience() {
  initHeroVideo();

  const kioskStage = document.getElementById("paths-kiosk-stage");
  const kioskCanvas = document.getElementById("paths-kiosk-canvas");

  if (kioskStage && kioskCanvas) {
    const status = kioskStage.querySelector("[data-helmet-status]");
    if (status) status.hidden = true;

    let api = null;
    try {
      const { initHeroScene } = await heroSceneModule;
      api = initHeroScene(kioskCanvas);
      if (api) await api.whenReady;
      kioskCanvas.setAttribute("aria-label", t("paths.kioskLabel"));
    } catch (err) {
      console.error("[Clear Nano] Paths kiosk 3D failed:", err);
    }
    initHeroRotator(api, HERO_ROTATION);
    return;
  }

  initHeroRotator(null, HERO_ROTATION);
}
