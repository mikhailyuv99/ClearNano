import { isInAppBrowser } from "./device.js";

function applyLockedViewport(root, w, h) {
  root.style.setProperty("--app-width", `${w}px`);
  root.style.setProperty("--app-height", `${h}px`);
}

function measureViewport() {
  return {
    w: Math.round(window.visualViewport?.width ?? window.innerWidth),
    h: Math.round(window.visualViewport?.height ?? window.innerHeight),
  };
}

/** In-app WebViews: scroll #main + viewport dimensions frozen (no resize-on-scroll zoom). */
export function initPageBgPin() {
  if (!isInAppBrowser()) return;

  const root = document.documentElement;
  root.classList.add("is-inapp-browser", "is-inapp-scroll");

  const finalizeLock = () => {
    const lock = measureViewport();
    applyLockedViewport(root, lock.w, lock.h);
    sessionStorage.setItem("cn-viewport-lock", JSON.stringify(lock));
  };

  try {
    const stored = sessionStorage.getItem("cn-viewport-lock");
    if (stored) {
      const { w, h } = JSON.parse(stored);
      if (w > 0 && h > 0) {
        applyLockedViewport(root, w, h);
      } else {
        finalizeLock();
      }
    } else {
      finalizeLock();
    }
  } catch {
    finalizeLock();
  }

  requestAnimationFrame(finalizeLock);

  window.addEventListener("orientationchange", () => {
    sessionStorage.removeItem("cn-viewport-lock");
    setTimeout(finalizeLock, 600);
  });
}
