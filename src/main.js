import "@google/model-viewer";
import "./page-fade.js";
import { initPageBgPin } from "./page-bg-pin.js";
import { initHeroExperience } from "./hero-init.js";

initPageBgPin();
void initHeroExperience();

const PRICE = 20000;
const DAYS = 30;
const SHARE = 0.25;

function formatVnd(n) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(n))}\u00a0\u20AB`;
}

const header = document.querySelector("[data-header]");
function onHeaderScroll() {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
}

const toggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

function closeMenu() {
  toggle?.setAttribute("aria-expanded", "false");
  mobileNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

function openMenu() {
  toggle?.setAttribute("aria-expanded", "true");
  mobileNav?.classList.add("is-open");
  document.body.classList.add("menu-open");
}

toggle?.addEventListener("click", () => {
  if (mobileNav?.classList.contains("is-open")) closeMenu();
  else openMenu();
});

mobileNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

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
