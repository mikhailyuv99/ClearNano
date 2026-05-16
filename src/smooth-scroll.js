import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Premium smooth scroll — one rAF loop for Lenis + scroll-driven UI */
export function initSmoothScroll(onScroll) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onScroll?.();
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
  const scheduleScroll = () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      onScroll?.();
    });
  };

  lenis.on("scroll", scheduleScroll);

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

  scheduleScroll();

  return { lenis, addTick };
}
