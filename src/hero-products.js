/**
 * Items Clear Nano can disinfect (from site copy + marquee).
 * GLB files live in /public/models/{slug}.glb
 */
export const CLEANABLE_ITEMS = [
  { slug: "helmet", word: "helmet", label: "Motorbike helmets" },
  { slug: "boxing-gloves", word: "boxing gloves", label: "Boxing gloves" },
  { slug: "sports-shoes", word: "shoes", label: "Sports shoes" },
  { slug: "knee-guards", word: "guards", label: "Knee & elbow guards" },
  { slug: "riding-gloves", word: "riding gloves", label: "Riding gloves" },
  { slug: "bicycle-helmet", word: "bike helmet", label: "Bicycle helmets" },
  { slug: "vr-headset", word: "headset", label: "VR headsets" },
  { slug: "masks", word: "mask", label: "Masks & face covers" },
  { slug: "ice-skates", word: "skates", label: "Ice skates" },
  { slug: "gym-equipment", word: "gym gear", label: "Gym equipment" },
  { slug: "hard-hat", word: "hard hat", label: "Hard hats" },
];

/** Hero title + 3D rotation (order = carousel order) */
export const HERO_ROTATION = [
  { slug: "helmet", word: "helmet" },
  { slug: "boxing-gloves", word: "boxing gloves" },
  { slug: "riding-gloves", word: "riding gloves" },
  { slug: "sports-shoes", word: "shoes" },
  { slug: "knee-guards", word: "guards" },
  { slug: "vr-headset", word: "headset" },
  { slug: "masks", word: "mask" },
  { slug: "ice-skates", word: "skates" },
  { slug: "hard-hat", word: "hard hat" },
  { slug: "bicycle-helmet", word: "bike helmet" },
  { slug: "gym-equipment", word: "gym gear" },
];

export function modelUrl(slug) {
  return `/models/${slug}.glb`;
}
