import { HERO_ROTATION } from "./hero-products.js";
import { HERO_FIRST_SLUG, HERO_SINGLE_MODEL } from "./hero-config.js";
import { heroHelmetModuleReady, heroRotatorModuleReady } from "./hero-model-preload.js";

/** Hero is above the fold — init immediately (no lazy IO). */
export function initHeroExperience() {
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!canvas) return;

  canvas.hidden = false;

  void (async () => {
    const [{ initHeroHelmet }, { initHeroRotator }] = await Promise.all([
      heroHelmetModuleReady,
      heroRotatorModuleReady,
    ]);

    if (HERO_SINGLE_MODEL) {
      const api = initHeroHelmet(canvas, [{ slug: HERO_FIRST_SLUG, word: "helmet" }]);
      if (!api) return;

      const wordOnlyApi = {
        showProduct(_slug, options = {}) {
          options.onTransitionStart?.();
          options.onWordReveal?.();
          return Promise.resolve();
        },
        isHealthy: () => api.isHealthy(),
        waitForHealthy: (...args) => api.waitForHealthy?.(...args),
        whenReady: () => api.whenReady(),
      };

      initHeroRotator(wordOnlyApi, HERO_ROTATION);
      return;
    }

    const api = initHeroHelmet(canvas, HERO_ROTATION);
    if (!api) return;

    api.whenReady?.().then(() => initHeroRotator(api, HERO_ROTATION));
  })();
}
