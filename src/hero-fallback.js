import "@google/model-viewer";

const SOURCES = ["/models/helmet.glb", "/models/bicycle-helmet.glb"];

function loadSrc(mv, src) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("timeout")), 120000);
    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    const fail = () => {
      window.clearTimeout(timer);
      reject(new Error(`Failed: ${src}`));
    };
    mv.addEventListener("load", done, { once: true });
    mv.addEventListener("error", fail, { once: true });
    mv.setAttribute("src", src);
  });
}

/** Reliable hero 3D when Three.js / WebGL fails. */
export function initModelViewerHero(stage) {
  const canvas = stage.querySelector("#hero-helmet-canvas");
  if (canvas) canvas.hidden = true;

  const status = stage.querySelector("[data-helmet-status]");
  if (status) status.hidden = true;

  let mv = stage.querySelector("#hero-helmet-viewer");
  if (!mv) {
    mv = document.createElement("model-viewer");
    mv.id = "hero-helmet-viewer";
    stage.insertBefore(mv, stage.firstChild);
  }

  mv.setAttribute("alt", "3D helmet preview");
  mv.setAttribute("camera-controls", "");
  mv.setAttribute("auto-rotate", "");
  mv.setAttribute("rotation-per-second", "28deg");
  mv.setAttribute("interaction-prompt", "none");
  mv.setAttribute("shadow-intensity", "1");
  mv.setAttribute("environment-image", "neutral");
  mv.setAttribute("exposure", "1.2");
  mv.setAttribute("camera-orbit", "0deg 72deg 110%");
  mv.setAttribute("loading", "eager");
  mv.setAttribute("reveal", "auto");

  const whenReady = (async () => {
    for (const src of SOURCES) {
      try {
        await loadSrc(mv, src);
        return;
      } catch {
        /* next */
      }
    }
    throw new Error("No hero GLB loaded");
  })();

  return {
    viewer: mv,
    showProduct(_slug, options = {}) {
      options.onTransitionStart?.();
      options.onWordReveal?.();
      return Promise.resolve();
    },
    isAvailable: () => true,
    isHealthy: () => true,
    waitForHealthy: () => Promise.resolve(),
    whenReady,
  };
}
