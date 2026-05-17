/**
 * Hero word carousel — slug maps to i18n keys under words.*
 */
export const HERO_ROTATION = [
  { slug: "helmet", wordKey: "words.helmet" },
  { slug: "boxing-gloves", wordKey: "words.boxing-gloves" },
  { slug: "riding-gloves", wordKey: "words.riding-gloves" },
  { slug: "sports-shoes", wordKey: "words.sports-shoes" },
  { slug: "knee-guards", wordKey: "words.knee-guards" },
  { slug: "vr-headset", wordKey: "words.vr-headset" },
  { slug: "masks", wordKey: "words.masks" },
  { slug: "ice-skates", wordKey: "words.ice-skates" },
  { slug: "hard-hat", wordKey: "words.hard-hat" },
  { slug: "bicycle-helmet", wordKey: "words.bicycle-helmet" },
  { slug: "gym-equipment", wordKey: "words.gym-equipment" },
];

export const CLEANABLE_ITEMS = [
  { slug: "helmet", wordKey: "words.helmet", labelKey: "marquee.gear.0" },
  { slug: "boxing-gloves", wordKey: "words.boxing-gloves", labelKey: "marquee.gear.1" },
  { slug: "sports-shoes", wordKey: "words.sports-shoes", labelKey: "marquee.gear.2" },
  { slug: "knee-guards", wordKey: "words.knee-guards", labelKey: "marquee.gear.3" },
  { slug: "riding-gloves", wordKey: "words.riding-gloves", labelKey: "marquee.gear.4" },
  { slug: "bicycle-helmet", wordKey: "words.bicycle-helmet", labelKey: "marquee.gear.5" },
  { slug: "vr-headset", wordKey: "words.vr-headset", labelKey: "marquee.gear.6" },
  { slug: "masks", wordKey: "words.masks", labelKey: "marquee.gear.7" },
  { slug: "ice-skates", wordKey: "words.ice-skates", labelKey: "marquee.gear.8" },
  { slug: "gym-equipment", wordKey: "words.gym-equipment", labelKey: "marquee.gear.9" },
  { slug: "hard-hat", wordKey: "words.hard-hat", labelKey: "marquee.gear.10" },
];

export function modelUrl(slug) {
  return `/models/${slug}.glb`;
}
