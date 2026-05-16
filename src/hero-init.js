import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";
export async function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!stage) return;

  const status = stage.querySelector("[data-helmet-status]");
  const hideStatus = () => {
    if (status) status.hidden = true;
  };

  let api = null;

  if (canvas) {
    try {
      const { initHeroHelmet } = await import("./hero-helmet.js");
      api = initHeroHelmet(canvas, HERO_ROTATION);
      if (api) {
        const ready =
          typeof api.whenReady === "function" ? api.whenReady() : api.whenReady;
        await ready;
        if (api.isAvailable?.(HERO_FIRST_SLUG)) {
          hideStatus();
          initHeroRotator(api, HERO_ROTATION);
          return;
        }
      }
    } catch (err) {
      console.warn("[Clear Nano] Three.js hero failed, using model-viewer:", err);
    }
  }

  try {
    const { initModelViewerHero } = await import("./hero-fallback.js");
    api = initModelViewerHero(stage);
    await api.whenReady;
    hideStatus();
    initHeroRotator(api, HERO_ROTATION);
  } catch (err) {
    console.error("[Clear Nano] Hero model failed:", err);
    if (status) {
      status.hidden = false;
      status.className = "hero-helmet-status hero-helmet-status--error";
      status.textContent = "3D preview unavailable.";
    }
  }
}
