/** Whole-page fade-in on first paint (skipped when reduced motion is preferred). */
export function initPageFadeIn() {
  const { body } = document;
  if (!body || body.classList.contains("is-page-ready")) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    body.classList.add("is-page-ready");
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      body.classList.add("is-page-ready");
    });
  });
}

initPageFadeIn();
