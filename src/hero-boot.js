/** Start helmet GLB + Three.js module download in parallel with the rest of the page. */
import { ensureModelBytes } from "./hero-model-preload.js";
import { HERO_FIRST_SLUG } from "./hero-config.js";

export const heroHelmetModule = import("./hero-helmet.js");
export const helmetBytesReady = ensureModelBytes(HERO_FIRST_SLUG);
ensureModelBytes("bicycle-helmet").catch(() => {});
