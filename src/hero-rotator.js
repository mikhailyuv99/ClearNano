import { HERO_SINGLE_MODEL } from "./hero-config.js";
import { isMobilePerfMode } from "./device.js";
import { getLang, t } from "./i18n.js";
import { applyHeroHeadline, getHeroHeadline, syncHeroHeadlineLayout } from "./hero-grammar.js";

/** Milliseconds each hero product stays on screen before the next transition */
export const HERO_ROTATE_MS = 2500;

function wordFadeMs() {
  return isMobilePerfMode() ? 320 : 380;
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
  let hasShownFirst = false;
  let isCrossfading = false;

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

  function resetLayers() {
    wrap.querySelectorAll(".hero-word-layer").forEach((el) => {
      el.classList.remove("is-entering", "is-exiting");
    });
  }

  function setWord(word) {
    const text = String(word ?? "").trim();
    if (!text) return;

    const front = getFront();
    front.textContent = text;
    front.classList.add("is-visible");
    front.removeAttribute("aria-hidden");

    const back = getBack();
    back.textContent = "";
    back.classList.remove("is-visible", "is-entering", "is-exiting");
    back.setAttribute("aria-hidden", "true");
  }

  function crossfadeWord(word) {
    return new Promise((resolve) => {
      const text = String(word ?? "").trim();
      if (!text) {
        resolve();
        return;
      }

      const fadeMs = wordFadeMs();
      const out = getFront();
      const inn = getBack();

      resetLayers();

      inn.textContent = text;
      inn.removeAttribute("aria-hidden");
      out.setAttribute("aria-hidden", "true");
      inn.classList.add("is-visible", "is-entering");

      void inn.offsetWidth;

      inn.classList.remove("is-entering");
      out.classList.add("is-exiting");

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearWordTimer();

        out.classList.remove("is-visible", "is-exiting");
        out.textContent = "";
        out.setAttribute("aria-hidden", "true");
        inn.classList.remove("is-entering");
        inn.classList.add("is-visible");
        inn.textContent = text;
        inn.removeAttribute("aria-hidden");
        frontIsA = !frontIsA;
        resolve();
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
      }, fadeMs + 50);
    });
  }

  async function showHeadline(product, { animate = false } = {}) {
    const shouldAnimate = animate && hasShownFirst;

    if (shouldAnimate && isCrossfading) {
      return;
    }

    clearWordTimer();

    const word = applyHeroHeadline(product, { skipWord: shouldAnimate });
    setCanvasLabel(product);

    if (!word) return;

    if (shouldAnimate) {
      isCrossfading = true;
      try {
        await crossfadeWord(word);
      } finally {
        isCrossfading = false;
      }
    } else {
      resetLayers();
      setWord(word);
      hasShownFirst = true;
    }
  }

  const list = products;
  let index = 0;

  const refreshHeadline = async () => {
    syncHeroHeadlineLayout(list);
    await showHeadline(list[index] ?? list[0], { animate: hasShownFirst });
  };

  syncHeroHeadlineLayout(list);
  void showHeadline(list[0], { animate: false });
  window.addEventListener("cn-lang-change", () => {
    void refreshHeadline();
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stopRotation = () => {
      cancelled = true;
      clearWordTimer();
    };
    return stopRotation;
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
      await showHeadline(product, { animate: true });
      return;
    }

    let tries = 0;
    while (tries < list.length && !cancelled) {
      const item = list[index];
      try {
        await api.showProduct(item.slug, {
          onWordReveal() {
            void showHeadline(item, { animate: true });
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
    isCrossfading = false;
    clearWordTimer();
    resetLayers();
  };
  return stopRotation;
}
