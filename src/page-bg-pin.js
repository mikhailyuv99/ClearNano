import { isInAppBrowser } from "./device.js";

function applyLockedViewport(root, w, h) {
  root.style.setProperty("--app-width", `${w}px`);
  root.style.setProperty("--app-height", `${h}px`);
}

function measureViewport() {
  const vv = window.visualViewport;
  return {
    w: Math.round(vv?.width ?? window.innerWidth),
    h: Math.round(vv?.height ?? window.innerHeight),
  };
}

function hasInlineLock(root) {
  const h = root.style.getPropertyValue("--app-height");
  return h && h !== "100%" && parseFloat(h) > 0;
}

/**
 * In-app WebViews: scroll #main, freeze viewport size once (no resize-on-scroll jump).
 */
export function initPageBgPin() {
  if (!isInAppBrowser()) return;

  const root = document.documentElement;
  root.classList.add("is-inapp-browser", "is-inapp-scroll");

  let locked = hasInlineLock(root);

  const lockOnce = () => {
    if (locked) return;
    const { w, h } = measureViewport();
    if (w < 1 || h < 1) return;
    applyLockedViewport(root, w, h);
    locked = true;
  };

  if (!locked) {
    lockOnce();
  }

  window.addEventListener("orientationchange", () => {
    locked = false;
    window.setTimeout(() => {
      const { w, h } = measureViewport();
      if (w > 0 && h > 0) {
        applyLockedViewport(root, w, h);
        locked = true;
      }
    }, 650);
  });
}
