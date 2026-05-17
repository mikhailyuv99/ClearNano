import { getLang, t } from "./i18n.js";

/** Russian agreement keys: m | f | n | pl */
export const WORD_GRAMMAR = {
  helmet: "m",
  "boxing-gloves": "pl",
  "riding-gloves": "pl",
  "sports-shoes": "f",
  "knee-guards": "pl",
  "vr-headset": "m",
  masks: "f",
  "ice-skates": "pl",
  "hard-hat": "f",
  "bicycle-helmet": "m",
  "gym-equipment": "f",
};

const RU_POSSESSIVE = {
  m: "Ваш ",
  f: "Ваша ",
  n: "Ваше ",
  pl: "Ваши ",
};

const RU_CLEAN = {
  m: "Чистый",
  f: "Чистая",
  n: "Чистое",
  pl: "Чистые",
};

const RU_CLEAN_SUFFIX = " за 5 минут.";

/**
 * @param {{ slug: string, wordKey?: string }} product
 */
export function getHeroHeadline(product) {
  const slug = product?.slug ?? "helmet";
  const wordKey = product?.wordKey ?? `words.${slug}`;
  const word = t(wordKey) || t(wordKey, "en") || slug;

  if (getLang() !== "ru") {
    return {
      prefix: t("hero.titlePrefix"),
      word,
      tagline: t("hero.titleGradient"),
      full: `${t("hero.titlePrefix")}${word}`,
    };
  }

  const form = WORD_GRAMMAR[slug] ?? "m";
  const prefix = RU_POSSESSIVE[form] ?? RU_POSSESSIVE.m;
  const clean = RU_CLEAN[form] ?? RU_CLEAN.m;

  return {
    prefix,
    word,
    tagline: `${clean}${RU_CLEAN_SUFFIX}`,
    full: `${prefix}${word}`,
  };
}

/**
 * @param {{ slug: string, wordKey?: string }} product
 * @param {{ skipWord?: boolean }} [opts]
 */
export function applyHeroHeadline(product, { skipWord = false } = {}) {
  const { prefix, word, tagline } = getHeroHeadline(product);
  const wordText = word?.trim() ? word : t("words.helmet") || t("words.helmet", "en") || "helmet";

  const prefixEl = document.querySelector("[data-hero-prefix]");
  const taglineEl = document.querySelector("[data-hero-tagline]");

  if (prefixEl) {
    prefixEl.textContent = prefix;
    prefixEl.hidden = false;
    prefixEl.style.display = "";
  }
  if (taglineEl) taglineEl.textContent = tagline;

  if (!skipWord) {
    const visible = document.querySelector(".hero-word-layer.is-visible");
    if (visible) visible.textContent = wordText;
    else {
      const layerA = document.querySelector("[data-hero-word-a]");
      if (layerA) layerA.textContent = wordText;
    }
  }

  return wordText;
}

/**
 * Reserve space for the widest rotating word / prefix / tagline so the layout never jumps.
 * @param {Array<{ slug: string, wordKey?: string }>} products
 */
export function syncHeroHeadlineLayout(products) {
  const slot = document.querySelector(".hero-word-slot");
  const h1 = document.getElementById("hero-title");
  const prefixEl = document.querySelector("[data-hero-prefix]");
  if (!slot || !h1 || !products?.length) return;

  const hidden =
    "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;white-space:nowrap;";

  const wordProbe = document.createElement("span");
  wordProbe.className = "hero-word-layer";
  wordProbe.setAttribute("aria-hidden", "true");
  wordProbe.style.cssText = hidden;
  h1.appendChild(wordProbe);

  let maxWord = 0;

  for (const p of products) {
    const { word } = getHeroHeadline(p);
    wordProbe.textContent = word;
    maxWord = Math.max(maxWord, wordProbe.getBoundingClientRect().width);
  }

  wordProbe.remove();

  slot.style.width = `${Math.ceil(maxWord) + 6}px`;
  slot.style.minWidth = slot.style.width;

  if (prefixEl) {
    prefixEl.style.display = "";
    prefixEl.style.minWidth = "";
  }
}
