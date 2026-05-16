/** Touch / narrow viewports — lighter scroll, 3D, and glass effects */
export function isMobilePerfMode() {
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
}
