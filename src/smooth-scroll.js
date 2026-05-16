import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { isMobilePerfMode } from "./device.js";

/** Premium smooth scroll — one rAF loop for Lenis + scroll-driven UI */
export function initSmoothScroll(onScroll) {
  const scheduleScroll = () => onScroll?.();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || isMobilePerfMode()) {
    const onNativeScroll = () => {
      scheduleScroll();
      window.dispatchEvent(new CustomEvent("app-scroll"));
    };
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    onNativeScroll();
    return { lenis: null, addTick: () => () => {} };
  }

  const ticks = new Set();
  const addTick = (fn) => {
    ticks.add(fn);
    return () => ticks.delete(fn);
  };

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.1,
    lerp: 0.12,
    syncTouch: true,
    smoothTouch: true,
  });

  let scrollScheduled = false;
  const scheduleLenisScroll = () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      onScroll?.();
      window.dispatchEvent(new CustomEvent("app-scroll"));
    });
  };

  lenis.on("scroll", scheduleLenisScroll);

  function raf(time) {
    lenis.raf(time);
    ticks.forEach((fn) => fn());
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72, duration: 1.1 });
    });
  });

  scheduleLenisScroll();

  return { lenis, addTick };
}
