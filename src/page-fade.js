/** Page ready flag — set from main.js so nav shows instantly. */
export function initPageFadeIn() {
  document.body?.classList.add("is-page-ready");
}

initPageFadeIn();
