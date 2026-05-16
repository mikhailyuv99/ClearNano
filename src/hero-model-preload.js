import { HERO_ROTATION, modelUrl } from "./hero-products.js";

/** Shared byte cache — filled as soon as the app boots. */
const bytes = new Map();
const inflight = new Map();

export function getCachedModelBytes(slug) {
  return bytes.get(slug);
}

export function ensureModelBytes(slug) {
  if (bytes.has(slug)) return Promise.resolve(bytes.get(slug));
  if (inflight.has(slug)) return inflight.get(slug);

  const task = fetch(modelUrl(slug), { cache: "force-cache" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buf) => {
      bytes.set(slug, buf);
      return buf;
    })
    .finally(() => inflight.delete(slug));

  inflight.set(slug, task);
  return task;
}

/** Download every hero GLB in parallel (staggered slightly for Safari). */
export function preloadAllHeroModelBytes() {
  HERO_ROTATION.forEach(({ slug }, i) => {
    window.setTimeout(() => {
      ensureModelBytes(slug).catch(() => {});
    }, i * 40);
  });
}

preloadAllHeroModelBytes();
