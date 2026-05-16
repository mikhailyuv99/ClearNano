/** Scroll-driven effects — smooth reveals & process timeline */

import { isMobilePerfMode } from "./device.js";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/** When element top crosses this viewport ratio, fade begins */
const REVEAL_START = 0.9;
/** When element top crosses this ratio, fade is complete */
const REVEAL_END = 0.58;

function revealProgress(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * REVEAL_START;
  const end = vh * REVEAL_END;
  const range = start - end;
  if (range <= 0) return 1;
  return smoothstep(Math.min(1, Math.max(0, (start - rect.top) / range)));
}

function isNearViewport(el, margin = 0.2) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return rect.top < vh * (1 + margin) && rect.bottom > -vh * margin;
}

function staggerDelay(index, step = 0.07) {
  return `${(index * step).toFixed(2)}s`;
}

/** Add reveal classes to section content that does not have them yet */
function discoverReveals() {
  document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
    section.querySelectorAll(".section-head").forEach((head) => {
      if (!head.classList.contains("reveal")) {
        head.classList.add("reveal", "reveal--fade");
      }
    });
  });

  const staggerGroups = [
    { selector: ".problem-row", variant: "reveal--scale", step: 0.08 },
    { selector: ".process-step__panel", variant: "reveal--fade", step: 0.1 },
    { selector: ".tech-split-list > li", variant: "reveal--fade", step: 0.06 },
    { selector: ".venue-row", variant: "reveal--fade", step: 0.08 },
    { selector: ".paths-duo__col", variant: "reveal--fade", step: 0.08 },
    { selector: ".partnership-tier", variant: "reveal--scale", step: 0.09 },
    { selector: ".trust-list__item", variant: "reveal--fade", step: 0.06 },
    { selector: ".faq-accordion details", variant: "reveal--fade", step: 0.07 },
  ];

  staggerGroups.forEach(({ selector, variant, step }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (!el.classList.contains("reveal")) {
        el.classList.add("reveal", variant);
      }
      if (!el.style.getPropertyValue("--delay")) {
        el.style.setProperty("--delay", staggerDelay(i, step));
      }
    });
  });

  document.querySelectorAll(".tech-split.reveal").forEach((block) => {
    block.classList.remove("reveal", "reveal--fade", "is-visible", "is-revealing");
    block.style.removeProperty("--delay");
    const visual = block.querySelector(".tech-split-visual");
    if (visual && !visual.classList.contains("reveal")) {
      visual.classList.add("reveal", "reveal--fade");
    }
  });

  document.querySelectorAll(".partnership-showcase.reveal").forEach((block) => {
    block.classList.remove("reveal", "is-visible", "is-revealing");
  });

  document.querySelectorAll("ul.trust-list.reveal").forEach((list) => {
    if (list.querySelector(".trust-list__item.reveal")) {
      list.classList.remove("reveal", "is-visible", "is-revealing");
    }
  });

  document.querySelectorAll(".calc-box, .commitment-plans, .gear-marquee-section .container").forEach((el) => {
    if (!el.classList.contains("reveal")) {
      el.classList.add("reveal", "reveal--fade");
    }
  });

  document.querySelectorAll(".faq-column.reveal").forEach((col) => {
    if (col.querySelector(".faq-accordion details.reveal")) {
      col.classList.remove("reveal", "reveal--fade", "is-visible", "is-revealing");
    }
  });

  document.querySelectorAll(".site-footer .footer-brand, .site-footer .footer-nav-grid, .site-footer .footer-bottom").forEach((el, i) => {
    if (!el.classList.contains("reveal")) {
      el.classList.add("reveal", "reveal--fade");
      el.style.setProperty("--delay", staggerDelay(i, 0.1));
    }
  });
}

function getRevealMotion(el) {
  if (el.classList.contains("reveal--fade")) {
    return { y: 18, scale: 1 };
  }
  if (el.classList.contains("reveal--scale")) {
    return { y: 14, scale: 0.965 };
  }
  return { y: 26, scale: 1 };
}

/** How far outside the viewport (ratio of vh) before a reveal resets */
const REVEAL_RESET_MARGIN = 0.12;

function isOutOfRevealZone(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const margin = vh * REVEAL_RESET_MARGIN;
  return rect.bottom < -margin || rect.top > vh + margin;
}

/** Scroll-linked fade — replays every time the element enters the viewport */
export function initReplayReveals(addTick) {
  discoverReveals();

  const reduced = prefersReducedMotion();
  const els = [...document.querySelectorAll(".reveal")];

  if (!els.length) {
    return { refresh: () => {}, observe: () => {} };
  }

  function finishReveal(el) {
    el.classList.add("is-visible");
    el.classList.remove("is-revealing");
    el.style.removeProperty("--reveal-p");
    el.style.removeProperty("opacity");
    el.style.removeProperty("transform");
  }

  function resetReveal(el) {
    el.classList.remove("is-visible", "is-revealing");
    el.style.removeProperty("--reveal-p");
    el.style.removeProperty("opacity");
    el.style.removeProperty("transform");
  }

  if (reduced) {
    els.forEach((el) => finishReveal(el));
    return { refresh: () => {}, observe: () => {} };
  }

  if (isMobilePerfMode()) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (el.classList.contains("reveal--instant")) return;
          if (entry.isIntersecting) finishReveal(el);
          else resetReveal(el);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -4% 0px" }
    );

    els.forEach((el) => {
      if (el.classList.contains("reveal--instant")) finishReveal(el);
      else io.observe(el);
    });

    return {
      refresh: () => {},
      observe: (el) => {
        if (el instanceof Element) io.observe(el);
      },
    };
  }

  const active = new Set();

  function applyProgress(el, p) {
    if (p >= 0.995) {
      finishReveal(el);
      return;
    }

    el.classList.remove("is-visible");

    if (p <= 0.002) {
      resetReveal(el);
      return;
    }

    const { y, scale } = getRevealMotion(el);
    const lift = (1 - p) * y;
    const s = scale === 1 ? 1 : scale + (1 - scale) * p;

    el.classList.add("is-revealing");
    el.style.setProperty("--reveal-p", p.toFixed(3));
    el.style.opacity = String(p);
    el.style.transform =
      scale === 1 ? `translate3d(0, ${lift}px, 0)` : `translate3d(0, ${lift}px, 0) scale(${s})`;
  }

  function syncElement(el) {
    if (el.classList.contains("reveal--instant")) {
      finishReveal(el);
      return;
    }

    if (isOutOfRevealZone(el)) {
      resetReveal(el);
      active.delete(el);
      return;
    }

    const p = revealProgress(el);
    applyProgress(el, p);
  }

  function tickReveals() {
    active.forEach((el) => syncElement(el));

    /* IO can miss re-entry after a reset — pick up elements back in range */
    for (const el of els) {
      if (el.classList.contains("reveal--instant")) continue;
      if (active.has(el)) continue;
      if (isOutOfRevealZone(el) || !isNearViewport(el, 0.28)) continue;
      active.add(el);
      syncElement(el);
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (el.classList.contains("reveal--instant")) return;

        if (entry.isIntersecting) {
          active.add(el);
          syncElement(el);
        } else {
          active.delete(el);
          resetReveal(el);
        }
      });
    },
    { rootMargin: "15% 0px 15% 0px", threshold: [0, 0.05, 0.12, 0.25] }
  );

  function observe(el) {
    if (!(el instanceof Element)) return;
    if (el.classList.contains("reveal--instant")) {
      finishReveal(el);
      return;
    }
    io.observe(el);
    if (!isOutOfRevealZone(el)) {
      active.add(el);
      syncElement(el);
    }
  }

  els.forEach(observe);

  function refresh() {
    els.forEach((el) => {
      if (el.classList.contains("reveal--instant")) return;
      if (isOutOfRevealZone(el)) {
        resetReveal(el);
        active.delete(el);
        return;
      }
      active.add(el);
      syncElement(el);
    });
  }

  if (addTick) {
    addTick(tickReveals);
  }

  refresh();

  return { refresh, observe };
}

function initProcessTimeline(addTick) {
  const rail = document.querySelector('[data-timeline="how"]');
  if (!rail) return null;

  const axis = rail.querySelector(".process-rail__axis");
  const glow = rail.querySelector(".process-rail__line-glow");
  const steps = [...rail.querySelectorAll("[data-step]")];
  const nodes = steps.map((s) => s.querySelector(".process-step__node")).filter(Boolean);
  if (!axis || !glow || !nodes.length) return null;

  let currentGlow = 0;
  let targetGlow = 0;
  let active = false;
  const reduced = prefersReducedMotion();
  const TRIGGER_RATIO = 0.55;

  let geom = { lineLen: 1, nodeOffsets: [] };

  function measureGeometry() {
    const railRect = rail.getBoundingClientRect();

    const centers = nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return r.top + r.height / 2 - railRect.top;
    });

    const start = centers[0];
    const end = centers[centers.length - 1];
    const lineLen = Math.max(end - start, 48);

    axis.style.top = `${start}px`;
    axis.style.height = `${lineLen}px`;

    geom = {
      lineLen,
      nodeOffsets: centers.map((c) => c - start),
    };

    glow.style.height = `${lineLen}px`;
  }

  function measureScroll() {
    const rect = axis.getBoundingClientRect();
    const trigger = window.innerHeight * TRIGGER_RATIO;
    const axisH = Math.max(rect.height, 1);
    const progress = Math.min(1, Math.max(0, (trigger - rect.top) / axisH));
    targetGlow = progress * geom.lineLen;
  }

  function paintGlow() {
    const scale = geom.lineLen > 0 ? currentGlow / geom.lineLen : 0;
    glow.style.transform = `scaleY(${scale})`;
    rail.style.setProperty("--process-glow", String(scale));

    steps.forEach((step, i) => {
      const offset = geom.nodeOffsets[i] ?? 0;
      const node = step.querySelector(".process-step__node");
      const fill = geom.lineLen > 0 ? Math.min(1, Math.max(0, (currentGlow - offset + 12) / 28)) : 0;

      step.classList.toggle("is-active", currentGlow >= offset - 6);
      step.classList.toggle("is-passed", currentGlow >= offset + 14);
      node?.style.setProperty("--node-fill", String(fill));
    });
  }

  function tick() {
    if (!active || reduced) return;
    measureScroll();
    currentGlow = lerp(currentGlow, targetGlow, 0.18);
    paintGlow();
  }

  function sync() {
    if (!active) return;
    measureScroll();
    currentGlow = targetGlow;
    paintGlow();
  }

  measureGeometry();
  measureScroll();
  paintGlow();

  const io = new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting;
      if (active) {
        measureGeometry();
        sync();
      }
    },
    { rootMargin: "120px 0px", threshold: 0 }
  );
  io.observe(rail);

  const ro = new ResizeObserver(() => {
    measureGeometry();
    if (active) sync();
  });
  ro.observe(rail);

  window.addEventListener("resize", measureGeometry, { passive: true });

  if (reduced) {
    currentGlow = geom.lineLen;
    paintGlow();
    steps.forEach((s) => s.classList.add("is-active", "is-passed"));
  } else if (isMobilePerfMode()) {
    window.addEventListener(
      "scroll",
      () => {
        if (!active) return;
        sync();
      },
      { passive: true }
    );
  } else if (addTick) {
    addTick(tick);
  }

  return sync;
}

export function initScrollEffects(addTick) {
  const reveals = initReplayReveals(addTick);
  const syncTimeline = initProcessTimeline(addTick);

  return () => {
    reveals.refresh();
    syncTimeline?.();
  };
}
