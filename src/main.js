import "./hero-boot.js";
import "./page-fade.js";
import { getScrollTop } from "./device.js";
import { initI18n } from "./i18n.js";
import { initPageBgPin } from "./page-bg-pin.js";
import { initMobileMenu } from "./mobile-menu.js";

document.body.classList.add("is-page-ready");

initI18n();
initPageBgPin();

import("./hero-init.js")
  .then(({ initHeroExperience }) => initHeroExperience())
  .catch((err) => console.error("[Clear Nano] Hero module failed:", err));

const PRICE = 20000;
const DAYS = 30;
const SHARE = 0.25;

function formatVnd(n) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(n))}\u00a0\u20AB`;
}

const header = document.querySelector("[data-header]");
function onHeaderScroll() {
  header?.classList.toggle("is-scrolled", getScrollTop() > 20);
}

initMobileMenu();

const range = document.querySelector("[data-uses-range]");
const label = document.querySelector("[data-uses-label]");
const partnerEl = document.querySelector("[data-calc-partner]");
const totalEl = document.querySelector("[data-calc-total]");

function updateCalc() {
  const uses = Number(range?.value || 20);
  const total = uses * PRICE * DAYS;
  const partner = total * SHARE;
  if (label) label.textContent = String(uses);
  if (partnerEl) partnerEl.textContent = formatVnd(partner);
  if (totalEl) totalEl.textContent = formatVnd(total);
}

range?.addEventListener("input", updateCalc);
updateCalc();

Promise.all([import("./smooth-scroll.js"), import("./scroll-effects.js")]).then(
  ([{ initSmoothScroll }, { initScrollEffects }]) => {
    let syncScroll = null;
    const { addTick } = initSmoothScroll(() => {
      onHeaderScroll();
      syncScroll?.();
    });
    syncScroll = initScrollEffects(addTick);
    onHeaderScroll();

    window.addEventListener("load", () => syncScroll?.(), { once: true });
  }
);

if (location.hash === "#partner" || location.hash === "#business") {
  document.getElementById("partner")?.scrollIntoView({ behavior: "smooth" });
}
