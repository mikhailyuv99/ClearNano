/** Ensure page is visible even if other scripts fail. */
if (typeof document !== "undefined") {
  document.body?.classList.add("is-page-ready");
}
