/** Touch / narrow viewports — lighter scroll, 3D, and glass effects */
export function isMobilePerfMode() {
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
}

/** Instagram, Telegram, Facebook, etc. — fixed backgrounds break on document scroll */
export function isInAppBrowser() {
  const ua = navigator.userAgent || "";
  return (
    /Instagram|FBAN|FBAV|FB_IAB|Messenger|Twitter|Telegram|WhatsApp|Snapchat|TikTok|Line\/|LinkedInApp|GSA\//i.test(
      ua
    ) || (/Android/i.test(ua) && /;\s*wv\)|WebView/i.test(ua))
  );
}

/** Element that actually scrolls (window vs #main in in-app WebViews) */
export function getScrollElement() {
  if (document.documentElement.classList.contains("is-inapp-scroll")) {
    return document.getElementById("main") || document.documentElement;
  }
  return null;
}

export function getScrollTop() {
  const el = getScrollElement();
  return el ? el.scrollTop : window.scrollY;
}
