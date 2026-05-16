import { isInAppBrowser } from "./device.js";

/** In-app WebViews: scroll #main instead of body so the fixed background never shifts. */
export function initPageBgPin() {
  if (!isInAppBrowser()) return;

  const root = document.documentElement;
  root.classList.add("is-inapp-browser", "is-inapp-scroll");

  const lockHeight = () => {
    root.style.setProperty("--app-height", `${window.innerHeight}px`);
  };

  lockHeight();
  window.addEventListener("orientationchange", () => setTimeout(lockHeight, 400), { passive: true });

  let lastH = window.innerHeight;
  window.addEventListener(
    "resize",
    () => {
      const h = window.innerHeight;
      if (Math.abs(h - lastH) > 48) {
        lastH = h;
        lockHeight();
      }
    },
    { passive: true }
  );

  setTimeout(lockHeight, 250);
  setTimeout(lockHeight, 800);
}
