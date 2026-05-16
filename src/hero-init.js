import { initHeroViewer } from "./hero-viewer.js";
import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";

export function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  if (!stage) return;

  stage.classList.add("is-loading");

  const api = initHeroViewer(stage);
  if (!api) return;

  api.whenReady
    .then(() => {
      stage.classList.remove("is-loading");
      const status = stage.querySelector("[data-helmet-status]");
      if (status) status.hidden = true;
      document.body.classList.add("is-page-ready");
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
