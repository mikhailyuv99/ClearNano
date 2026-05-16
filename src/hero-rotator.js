/** Milliseconds each hero product stays on screen before the next transition */
export const HERO_ROTATE_MS = 3500;

const WORD_IN_MS = 620;

let stopRotation = null;

export function initHeroRotator(api, products) {
  stopRotation?.();

  const wrap = document.querySelector(".hero-word-wrap");
  const layerA = document.querySelector("[data-hero-word-a]");
  const layerB = document.querySelector("[data-hero-word-b]");
  const canvas = document.getElementById("hero-helmet-canvas");

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

  function setCanvasLabel(word) {
    if (!canvas) return;
    canvas.setAttribute("aria-label", `Interactive 3D ${word}, drag to rotate`);
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

  function crossfadeWord(word) {
    clearWordTimer();

    const out = getFront();
    const inn = getBack();

    inn.textContent = word;
    inn.removeAttribute("aria-hidden");
    out.setAttribute("aria-hidden", "true");

    out.classList.remove("is-visible");
    inn.classList.add("is-visible");

    wrap.classList.remove("is-word-out");
    wrap.classList.add("is-word-in");
    frontIsA = !frontIsA;
    setCanvasLabel(word);

    wordTimer = window.setTimeout(() => {
      wrap.classList.remove("is-word-in");
      wordTimer = null;
    }, WORD_IN_MS);
  }

  setWord(products[0].word);
  setCanvasLabel(products[0].word);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stopRotation = null;
    return;
  }

  const list = products;
  let index = 0;

  async function ensureGpuReady() {
    if (!api.isHealthy || api.isHealthy()) return true;
    try {
      await api.waitForHealthy?.();
      return api.isHealthy?.() ?? true;
    } catch {
      return false;
    }
  }

  async function advance() {
    if (!(await ensureGpuReady())) return;

    let tries = 0;
    while (tries < list.length && !cancelled) {
      index = (index + 1) % list.length;
      const product = list[index];
      try {
        await api.showProduct(product.slug, {
          onTransitionStart() {
            wrap.classList.add("is-word-out");
          },
          onWordReveal() {
            crossfadeWord(product.word);
          },
        });
        return;
      } catch {
        tries++;
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
    wrap.classList.remove("is-word-out", "is-word-in");
  };
  return stopRotation;
}
