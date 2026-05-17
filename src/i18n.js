import en from "./locales/en.js";
import ru from "./locales/ru.js";

const STORAGE_KEY = "cn-lang";
const locales = { en, ru };

let current = "en";

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), obj);
}

export function getLang() {
  return current;
}

export function t(key, lang = current) {
  const pack = locales[lang] ?? locales.en;
  const val = get(pack, key);
  if (typeof val === "function") return val;
  return val ?? get(locales.en, key) ?? "";
}

export function setLang(lang) {
  const next = lang === "ru" ? "ru" : "en";
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode */
  }
  applyLocale(next);
  window.dispatchEvent(new CustomEvent("cn-lang-change", { detail: { lang: next } }));
}

function applyText(el, value) {
  if (el.hasAttribute("data-hero-prefix")) {
    const empty = value == null || value === "";
    el.hidden = empty;
    el.style.display = empty ? "none" : "";
    if (empty) return;
  }
  if (value == null || value === "") return;
  el.textContent = value;
}

function applyHtml(el, value) {
  if (!value) return;
  el.innerHTML = String(value).replace(/\n/g, "<br />");
}

function fillMarquee(track, items) {
  if (!items?.length) return;
  const html = [...items, ...items].map((s) => `<span>${s}</span>`).join("");
  track.innerHTML = html;
}

export function applyLocale(lang = current) {
  current = lang === "ru" ? "ru" : "en";
  const pack = locales[current] ?? locales.en;
  const root = document.documentElement;
  root.lang = current === "ru" ? "ru" : "en";

  document.title = pack.meta.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", pack.meta.description);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    applyText(el, t(el.getAttribute("data-i18n"), current));
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    applyHtml(el, t(el.getAttribute("data-i18n-html"), current));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = t(el.getAttribute("data-i18n-aria"), current);
    if (v) el.setAttribute("aria-label", v);
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const v = t(el.getAttribute("data-i18n-alt"), current);
    if (v) el.setAttribute("alt", v);
  });

  document.querySelectorAll("[data-i18n-marquee]").forEach((el) => {
    const key = el.getAttribute("data-i18n-marquee");
    const items = get(pack, key);
    const track = el.querySelector(".marquee-track");
    if (track && Array.isArray(items)) fillMarquee(track, items);
  });

  document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
    const active = btn.getAttribute("data-lang") === current;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

export function initI18n() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "en") current = saved;
  } catch {
    /* ignore */
  }

  applyLocale(current);

  document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang) setLang(lang);
    });
  });
}
