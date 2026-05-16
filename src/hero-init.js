import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";

export async function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!stage || !canvas) return;

  try {
    const { initHeroHelmet } = await import("./hero-helmet.js");
    const api = initHeroHelmet(canvas, HERO_ROTATION);
    if (!api) return;

    initHeroRotator(api, HERO_ROTATION);

    const ready =
      typeof api.whenReady === "function" ? api.whenReady() : api.whenReady;

    await ready;
  } catch (err) {
    console.error("[Clear Nano] Hero model failed:", err);
    const status = stage.querySelector("[data-helmet-status]");
    if (status) {
      status.hidden = false;
      status.className = "hero-helmet-status hero-helmet-status--error";
      status.textContent = "3D preview unavailable.";
    }
  }
}
