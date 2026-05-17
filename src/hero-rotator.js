import { HERO_SINGLE_MODEL } from "./hero-config.js";
import { isMobilePerfMode } from "./device.js";
import { getLang, t } from "./i18n.js";
import { applyHeroHeadline, getHeroHeadline } from "./hero-grammar.js";

/** Milliseconds each hero product stays on screen before the next transition */
export const HERO_ROTATE_MS = 2500;

function wordFadeMs() {
  return isMobilePerfMode() ? 400 : 520;
}

let stopRotation = null;

export function initHeroRotator(api, products) {
  stopRotation?.();

  const wrap = document.querySelector(".hero-word-wrap");
  const layerA = document.querySelector("[data-hero-word-a]");
  const layerB = document.querySelector("[data-hero-word-b]");
  const canvas = document.getElementById("paths-kiosk-canvas");

  if (!wrap || !layerA || !layerB || !products?.length) return;

  let frontIsA = true;
  let cancelled = false;
  let wordTimer = null;

  function getFront() {
    return frontIsA ? layerA : layerB;
  }

  function getBack() {
    return frontIsA ? layerB : layerA;
  }

  function setCanvasLabel(product) {
    if (!canvas) return;
    const { full, word } = getHeroHeadline(product);
    canvas.setAttribute(
      "aria-label",
      getLang() === "ru" ? `${t("paths.kioskLabel")} — ${full}` : `Clear Nano cleaning machine — ${word}`
    );
  }

  function clearWordTimer() {
    if (wordTimer) {
      clearTimeout(wordTimer);
      wordTimer = null;
    }
  }

  function setWord(word) {
    const front = getFront();
    front.textContent = word;
    front.classList.add("is-visible");
    front.removeAttribute("aria-hidden");

    const back = getBack();
    back.textContent = "";
    back.classList.remove("is-visible");
    back.setAttribute("aria-hidden", "true");
  }

  function showHeadline(product, { animate = false } = {}) {
    const word = applyHeroHeadline(product);
    setCanvasLabel(product);
    if (animate) {
      crossfadeWord(word);
    } else {
      setWord(word);
    }
  }

  function crossfadeWord(word) {
    clearWordTimer();
    const fadeMs = wordFadeMs();

    const out = getFront();
    const inn = getBack();

    inn.textContent = word;
    inn.removeAttribute("aria-hidden");
    out.setAttribute("aria-hidden", "true");

    inn.classList.add("is-visible", "is-entering");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inn.classList.remove("is-entering");
        out.classList.add("is-exiting");
      });
    });

    const finish = () => {
      out.classList.remove("is-visible", "is-exiting");
      out.textContent = "";
      inn.classList.remove("is-entering");
      frontIsA = !frontIsA;
      wordTimer = null;
    };

    const onEnd = (e) => {
      if (e.target !== inn || e.propertyName !== "opacity") return;
      inn.removeEventListener("transitionend", onEnd);
      finish();
    };
    inn.addEventListener("transitionend", onEnd);
    wordTimer = window.setTimeout(() => {
      inn.removeEventListener("transitionend", onEnd);
      finish();
    }, fadeMs + 60);
  }

  const list = products;
  let index = 0;

  const refreshHeadline = () => {
    showHeadline(list[index] ?? list[0]);
  };

  showHeadline(list[0]);
  window.addEventListener("cn-lang-change", refreshHeadline);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stopRotation = null;
    return;
  }

  async function ensureGpuReady() {
    if (!api?.isHealthy || api.isHealthy()) return true;
    try {
      await api.waitForHealthy?.();
      return api.isHealthy?.() ?? true;
    } catch {
      return false;
    }
  }

  async function advance() {
    if (!(await ensureGpuReady())) return;

    index = (index + 1) % list.length;
    const product = list[index];

    if (HERO_SINGLE_MODEL) {
      showHeadline(product, { animate: true });
      return;
    }

    let tries = 0;
    while (tries < list.length && !cancelled) {
      const item = list[index];
      try {
        await api.showProduct(item.slug, {
          onWordReveal() {
            showHeadline(item, { animate: true });
          },
        });
        return;
      } catch {
        tries++;
        index = (index + 1) % list.length;
      }
    }
  }

  async function run() {
    await new Promise((r) => setTimeout(r, HERO_ROTATE_MS));
    while (!cancelled) {
      await advance();
      if (cancelled) break;
      await new Promise((r) => setTimeout(r, HERO_ROTATE_MS));
    }
  }

  void run();

  stopRotation = () => {
    cancelled = true;
    clearWordTimer();
    wrap.querySelectorAll(".hero-word-layer").forEach((el) => {
      el.classList.remove("is-entering", "is-exiting");
    });
  };
  return stopRotation;
}
