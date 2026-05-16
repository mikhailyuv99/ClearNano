import "@google/model-viewer";

const HERO_SOURCES = ["/models/helmet.glb", "/models/bicycle-helmet.glb"];

function waitForModel(mv, src, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    if (mv.getAttribute("src") === src && mv.loaded) {
      resolve();
      return;
    }
    const timer = window.setTimeout(() => reject(new Error("timeout")), timeoutMs);
    const done = () => {
      window.clearTimeout(timer);
      mv.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => {
      window.clearTimeout(timer);
      mv.removeEventListener("load", done);
      reject(new Error(`Failed: ${src}`));
    };
    mv.addEventListener("load", done, { once: true });
    mv.addEventListener("error", fail, { once: true });
    if (mv.getAttribute("src") !== src) mv.setAttribute("src", src);
  });
}

/** Hero 3D — model-viewer with fallback if the main GLB is slow or fails. */
export function initHeroViewer(stage) {
  const mv =
    stage.querySelector("#hero-helmet-viewer") ||
    stage.querySelector("model-viewer");
  if (!mv) return null;

  const whenReady = (async () => {
    for (const src of HERO_SOURCES) {
      try {
        await waitForModel(mv, src);
        return;
      } catch {
        /* try next */
      }
    }
    throw new Error("No hero model could be loaded");
  })();

  return {
    viewer: mv,
    showProduct(_slug, options = {}) {
      options.onTransitionStart?.();
      options.onWordReveal?.();
      return Promise.resolve();
    },
    isHealthy: () => true,
    waitForHealthy: () => Promise.resolve(),
    whenReady,
  };
}
