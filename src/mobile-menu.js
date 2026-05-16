/** Mobile nav toggle — isolated so hero/scroll modules cannot block setup */
export function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !mobileNav) return () => {};

  const main = document.getElementById("main");
  const backdrop = mobileNav.querySelector("[data-menu-backdrop]");
  let open = false;

  function setOpen(next) {
    open = next;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileNav.classList.toggle("is-open", open);
    mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    if (open) {
      main?.setAttribute("inert", "");
    } else {
      main?.removeAttribute("inert");
    }
  }

  function onToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  }

  toggle.addEventListener("click", onToggle);

  backdrop?.addEventListener("click", () => setOpen(false));

  mobileNav.querySelector(".mobile-nav__panel")?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  });

  return () => {
    toggle.removeEventListener("click", onToggle);
    setOpen(false);
  };
}
