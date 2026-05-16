import { isMobilePerfMode } from "./device.js";
import { HERO_ROTATION } from "./hero-products.js";

/** Desktop = Three.js · Mobile / touch = model-viewer (stable on iOS). */
export async function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  if (!stage) return;

  const { initHeroRotator } = await import("./hero-rotator.js");

  let api;
  if (isMobilePerfMode()) {
    const { initHeroModelViewer } = await import("./hero-model-viewer.js");
    api = initHeroModelViewer(stage, HERO_ROTATION);
  } else {
    const canvas = document.getElementById("hero-helmet-canvas");
    if (!canvas) return;
    const { initHeroHelmet } = await import("./hero-helmet.js");
    api = initHeroHelmet(canvas, HERO_ROTATION);
  }

  if (!api) return;

  api.whenReady?.().then(() => {
    initHeroRotator(api, HERO_ROTATION);
  });
}
