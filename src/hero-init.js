import { initHeroHelmet } from "./hero-helmet.js";
import { initHeroRotator } from "./hero-rotator.js";
import { HERO_ROTATION } from "./hero-products.js";
import { HERO_FIRST_SLUG, HERO_SINGLE_MODEL } from "./hero-config.js";

/** Eager init — hero is always above the fold. */
export function initHeroExperience() {
  const canvas = document.getElementById("hero-helmet-canvas");
  const stage = document.getElementById("hero-helmet-stage");
  if (!canvas || !stage) return;

  canvas.hidden = false;
  stage.classList.add("is-loading");

  if (HERO_SINGLE_MODEL) {
    const api = initHeroHelmet(canvas, [{ slug: HERO_FIRST_SLUG, word: "helmet" }]);
    if (!api) return;

    api.whenReady?.().then(
      () => {
        stage.classList.remove("is-loading");
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
      },
      () => stage.classList.remove("is-loading")
    );
    return;
  }

  const api = initHeroHelmet(canvas, HERO_ROTATION);
  if (!api) return;

  api.whenReady?.().then(() => {
    stage.classList.remove("is-loading");
    initHeroRotator(api, HERO_ROTATION);
  });
}
