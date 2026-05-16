import { isMobilePerfMode } from "./device.js";

/** Sync background height when iOS Safari chrome resizes — never move it on scroll. */
export function initPageBgPin() {
  if (!isMobilePerfMode()) return;

  const stack = document.querySelector(".page-bg-stack");
  const vv = window.visualViewport;
  if (!stack || !vv) return;

  const syncHeight = () => {
    stack.style.setProperty("--page-bg-h", `${Math.round(vv.height)}px`);
  };

  vv.addEventListener("resize", syncHeight, { passive: true });
  window.addEventListener("orientationchange", syncHeight, { passive: true });
  syncHeight();
}
