import { isMobilePerfMode } from "./device.js";

/** Keep full-page art pinned on iOS Safari (fixed + URL bar scroll drift). */
export function initPageBgPin() {
  if (!isMobilePerfMode()) return;

  const stack = document.querySelector(".page-bg-stack");
  const vv = window.visualViewport;
  if (!stack || !vv) return;

  const sync = () => {
    const h = Math.round(vv.height);
    stack.style.setProperty("--page-bg-h", `${h}px`);
    stack.style.transform = vv.offsetTop ? `translate3d(0, ${vv.offsetTop}px, 0)` : "";
  };

  vv.addEventListener("resize", sync, { passive: true });
  vv.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("orientationchange", sync, { passive: true });
  sync();
}
