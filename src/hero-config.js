/**
 * Hero 3D strategy
 * - singleModel: one helmet in WebGL, carousel updates words only (most reliable)
 * - multiModel: swap GLBs with strict GPU cache (heavier; needs small GLBs)
 */
export const HERO_SINGLE_MODEL = true;

export const HERO_GPU_CACHE_MAX = 2;
export const HERO_TARGET_FPS = 30;
export const HERO_FIRST_SLUG = "helmet";
