import { initHeroHelmet } from "./hero-helmet.js";
import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";

export function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!stage || !canvas) return;

  stage.classList.add("is-loading");

  const api = initHeroHelmet(canvas, HERO_ROTATION);
  if (!api) return;

  const ready =
    typeof api.whenReady === "function" ? api.whenReady() : api.whenReady;

  ready
    .then(() => {
      stage.classList.remove("is-loading");
      const status = stage.querySelector("[data-helmet-status]");
      if (status) status.hidden = true;
      initHeroRotator(api, HERO_ROTATION);
    })
    .catch((err) => {
      console.error("[Clear Nano] Hero model failed:", err);
      stage.classList.remove("is-loading");
      const status = stage.querySelector("[data-helmet-status]");
      if (status) {
        status.hidden = false;
        status.className = "hero-helmet-status hero-helmet-status--error";
        status.textContent = "Could not load 3D model. Check /public/models/helmet.glb";
      }
    });
}
