import { modelUrl } from "./hero-products.js";
import { HERO_FIRST_SLUG } from "./hero-config.js";

/** Shared byte cache — helmet primed on first import. */
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

/** Start downloading helmet + Three.js as soon as main.js runs. */
export function primeHelmetBoot() {
  ensureModelBytes(HERO_FIRST_SLUG).catch(() => {});
}

export const heroHelmetModuleReady = import("./hero-helmet.js");
export const heroRotatorModuleReady = import("./hero-rotator.js");

primeHelmetBoot();
