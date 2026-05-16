import { initHeroHelmet } from "./hero-helmet.js";
import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";

/** Same Three.js hero on all devices — all models warmed in background. */
export async function initHeroExperience() {
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!canvas) return;

  canvas.hidden = false;

  const api = initHeroHelmet(canvas, HERO_ROTATION);
  if (!api) return;

  api.whenReady?.().then(() => {
    initHeroRotator(api, HERO_ROTATION);
  });
}
