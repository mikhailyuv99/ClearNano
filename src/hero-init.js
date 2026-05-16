import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";
import { heroHelmetModule } from "./hero-boot.js";

export async function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!stage || !canvas) return;

  const status = stage.querySelector("[data-helmet-status]");
  const hideStatus = () => {
    if (status) status.hidden = true;
  };

  try {
    const { initHeroHelmet } = await heroHelmetModule;
    const api = initHeroHelmet(canvas, HERO_ROTATION);
    if (!api) throw new Error("Hero init returned null");

    const ready =
      typeof api.whenReady === "function" ? api.whenReady() : api.whenReady;
    await ready;

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
