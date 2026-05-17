import { getLang, t } from "./i18n.js";

/** Russian agreement keys: m | f | n | pl */
export const WORD_GRAMMAR = {
  helmet: "m",
  "boxing-gloves": "pl",
  "riding-gloves": "pl",
  "sports-shoes": "f",
  "knee-guards": "pl",
  "vr-headset": "f",
  masks: "f",
  "ice-skates": "pl",
  "hard-hat": "f",
  "bicycle-helmet": "m",
  "gym-equipment": "m",
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
  const word = t(wordKey);

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
 */
export function applyHeroHeadline(product) {
  const { prefix, word, tagline } = getHeroHeadline(product);

  const prefixEl = document.querySelector("[data-hero-prefix]");
  const taglineEl = document.querySelector("[data-hero-tagline]");

  if (prefixEl) {
    prefixEl.textContent = prefix;
    prefixEl.hidden = false;
    prefixEl.style.display = "";
  }
  if (taglineEl) taglineEl.textContent = tagline;

  return word;
}
