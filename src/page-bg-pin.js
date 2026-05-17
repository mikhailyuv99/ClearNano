import { isInAppBrowser } from "./device.js";

function applyShellLock(root, w, h) {
  root.style.setProperty("--app-width", `${w}px`);
  root.style.setProperty("--app-height", `${h}px`);
}

function pinBgToVisualViewport() {
  const stack = document.querySelector(".page-bg-stack");
  const root = document.documentElement;
  const vv = window.visualViewport;
  if (!stack || !vv) return;

  const x = Math.round(vv.offsetLeft);
  const y = Math.round(vv.offsetTop);
  const w = Math.round(vv.width);
  const h = Math.round(vv.height);

  root.style.setProperty("--vv-x", `${x}px`);
  root.style.setProperty("--vv-y", `${y}px`);
  root.style.setProperty("--vv-w", `${w}px`);
  root.style.setProperty("--vv-h", `${h}px`);
}

/**
 * In-app WebViews (Instagram, TikTok, etc.): scroll inside #main and pin the
 * fixed background to the visual viewport so it does not drift on scroll.
 */
export function initPageBgPin() {
  if (!isInAppBrowser()) return;

  const root = document.documentElement;
  root.classList.add("is-inapp-browser", "is-inapp-scroll");

  let shellW = Math.round(window.innerWidth);
  let shellH = Math.round(window.innerHeight);

  if (!root.style.getPropertyValue("--app-height")) {
    applyShellLock(root, shellW, shellH);
  } else {
    shellW = Math.round(parseFloat(root.style.getPropertyValue("--app-width")) || shellW);
    shellH = Math.round(parseFloat(root.style.getPropertyValue("--app-height")) || shellH);
  }

  let frame = 0;
  const schedulePin = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      pinBgToVisualViewport();
    });
  };

  pinBgToVisualViewport();

  window.visualViewport?.addEventListener("scroll", schedulePin);
  window.visualViewport?.addEventListener("resize", schedulePin);
  window.addEventListener("scroll", schedulePin, { passive: true });
  window.addEventListener("resize", schedulePin, { passive: true });

  const main = document.getElementById("main");
  main?.addEventListener("scroll", schedulePin, { passive: true });

  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => {
      shellW = Math.round(window.innerWidth);
      shellH = Math.round(window.innerHeight);
      applyShellLock(root, shellW, shellH);
      schedulePin();
    }, 650);
  });
}

/** For the inline head script — earliest possible pin */
export function pinBgEarly() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!root.classList.contains("is-inapp-scroll")) return;
  pinBgToVisualViewport();
}
