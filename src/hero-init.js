import { HERO_ROTATION } from "./hero-products.js";

/** Same Three.js hero on all devices — mobile uses tighter memory limits only. */
export async function initHeroExperience() {
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!canvas) return;

  canvas.hidden = false;

  const { initHeroHelmet } = await import("./hero-helmet.js");
  const { initHeroRotator } = await import("./hero-rotator.js");

  const api = initHeroHelmet(canvas, HERO_ROTATION);
  if (!api) return;

  api.whenReady?.().then(() => {
    initHeroRotator(api, HERO_ROTATION);
  });
}
