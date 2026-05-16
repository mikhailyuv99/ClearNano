import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";
import { heroSceneModule } from "./hero-boot.js";

export async function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!stage || !canvas) return;

  const status = stage.querySelector("[data-helmet-status]");
  if (status) status.hidden = true;

  try {
    const { initHeroScene } = await heroSceneModule;
    const api = initHeroScene(canvas);
    if (!api) throw new Error("Hero scene failed to start");

    await api.whenReady;
    initHeroRotator(api, HERO_ROTATION);
  } catch (err) {
    console.error("[Clear Nano] Hero 3D failed:", err);
    if (status) {
      status.hidden = false;
      status.className = "hero-helmet-status hero-helmet-status--error";
      status.textContent = "3D preview unavailable.";
    }
  }
}
