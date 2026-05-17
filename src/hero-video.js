/** Hero loop — first 4s clip, muted, inline playback */
export function initHeroVideo() {
  const video = document.querySelector("[data-hero-video]");
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.removeAttribute("controls");

  const play = () => {
    video.play().catch(() => {});
  };

  video.addEventListener("loadeddata", play, { once: true });
  play();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) play();
  });
}
