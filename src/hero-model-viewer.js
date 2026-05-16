/**
 * Mobile / touch hero — uses model-viewer (GPU-friendly on iOS).
 * Same API surface as initHeroHelmet for the rotator.
 */
import "@google/model-viewer";
import { modelUrl } from "./hero-products.js";

const ORBIT_BY_SLUG = {
  helmet: "0deg 72deg 108%",
  "boxing-gloves": "0deg 68deg 102%",
  "riding-gloves": "0deg 65deg 98%",
  "sports-shoes": "0deg 75deg 112%",
  "knee-guards": "0deg 70deg 100%",
  "vr-headset": "0deg 74deg 95%",
  masks: "0deg 62deg 96%",
  "ice-skates": "0deg 78deg 110%",
  "hard-hat": "0deg 70deg 94%",
  "bicycle-helmet": "0deg 80deg 90%",
  "gym-equipment": "0deg 58deg 104%",
};

const DEFAULT_ORBIT = "0deg 72deg 105%";

function hideCanvas(stage) {
  const canvas = stage.querySelector("#hero-helmet-canvas");
  if (canvas) canvas.hidden = true;
}

export function initHeroModelViewer(stage, products = []) {
  if (!stage || !products.length) return null;

  hideCanvas(stage);

  const viewer = document.createElement("model-viewer");
  viewer.className = "hero-model-viewer";
  viewer.setAttribute("camera-controls", "");
  viewer.setAttribute("touch-action", "none");
  viewer.setAttribute("auto-rotate", "");
  viewer.setAttribute("rotation-per-second", "28deg");
  viewer.setAttribute("interaction-prompt", "none");
  viewer.setAttribute("disable-zoom", "");
  viewer.setAttribute("shadow-intensity", "0.85");
  viewer.setAttribute("environment-image", "neutral");
  viewer.setAttribute("exposure", "1.12");
  viewer.setAttribute("loading", "eager");
  viewer.setAttribute("reveal", "auto");
  viewer.setAttribute("tone-mapping", "commerce");
  stage.insertBefore(viewer, stage.firstChild);

  const loaded = new Set();
  let currentSlug = products[0].slug;
  let swapToken = 0;

  function applyOrbit(slug) {
    viewer.setAttribute("camera-orbit", ORBIT_BY_SLUG[slug] || DEFAULT_ORBIT);
  }

  function setLabel(word) {
    viewer.setAttribute("aria-label", `Interactive 3D ${word}, drag to rotate`);
  }

  function showProduct(slug, options = {}) {
    const token = ++swapToken;
    const src = modelUrl(slug);
    const { onTransitionStart, onWordReveal, onModelReady } = options;

    return new Promise((resolve) => {
      onTransitionStart?.();

      const finish = () => {
        if (token !== swapToken) return;
        loaded.add(slug);
        currentSlug = slug;
        onWordReveal?.();
        onModelReady?.();
        viewer.classList.remove("is-swapping");
        resolve();
      };

      const currentSrc = viewer.getAttribute("src") || "";
      if (loaded.has(slug) && currentSrc === src) {
        finish();
        return;
      }

      const onLoad = () => {
        viewer.removeEventListener("load", onLoad);
        viewer.removeEventListener("error", onError);
        finish();
      };

      const onError = () => {
        viewer.removeEventListener("load", onLoad);
        viewer.removeEventListener("error", onError);
        console.warn(`[Clear Nano] model-viewer failed: ${src}`);
        finish();
      };

      viewer.classList.add("is-swapping");
      viewer.addEventListener("load", onLoad);
      viewer.addEventListener("error", onError);
      applyOrbit(slug);
      viewer.src = src;
    });
  }

  const ready = new Promise((resolve) => {
    const onReady = () => {
      viewer.removeEventListener("load", onReady);
      loaded.add(currentSlug);
      viewer.classList.remove("is-swapping");
      resolve(api);
    };
    viewer.addEventListener("load", onReady);
    applyOrbit(currentSlug);
    viewer.src = modelUrl(currentSlug);
    setLabel(products[0].word);
  });

  function prefetchSlugs(slugs) {
    slugs.slice(0, 3).forEach((slug, i) => {
      window.setTimeout(() => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "fetch";
        link.href = modelUrl(slug);
        link.crossOrigin = "anonymous";
        document.head.append(link);
      }, 400 + i * 300);
    });
  }

  const api = {
    showProduct,
    isAvailable: (slug) => loaded.has(slug),
    isHealthy: () => true,
    whenReady: () => ready,
  };

  ready.then(() => {
    const rest = products.map((p) => p.slug).filter((s) => s !== currentSlug);
    prefetchSlugs(rest);
  });

  return api;
}
