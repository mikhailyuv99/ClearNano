import { HERO_ROTATION } from "./hero-products.js";
import { HERO_FIRST_SLUG, HERO_SINGLE_MODEL } from "./hero-config.js";

function whenHeroVisible(stage, callback) {
  if (!stage || typeof callback !== "function") return;

  if (!("IntersectionObserver" in window)) {
    callback();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      callback();
    },
    { rootMargin: "120px 0px", threshold: 0.01 }
  );

  io.observe(stage);
}

/** Lazy-load Three.js when hero is near viewport. */
export function initHeroExperience() {
  const stage = document.getElementById("hero-helmet-stage");
  const canvas = document.getElementById("hero-helmet-canvas");
  if (!canvas) return;

  whenHeroVisible(stage, async () => {
    const [{ initHeroHelmet }, { initHeroRotator }] = await Promise.all([
      import("./hero-helmet.js"),
      import("./hero-rotator.js"),
    ]);

    canvas.hidden = false;

    if (HERO_SINGLE_MODEL) {
      const api = initHeroHelmet(canvas, [{ slug: HERO_FIRST_SLUG, word: "helmet" }]);
      if (!api) return;

      await api.whenReady?.();

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
  });
}
