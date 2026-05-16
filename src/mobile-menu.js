/** Mobile nav toggle — isolated so hero/scroll modules cannot block setup */
export function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !mobileNav) return () => {};

  const main = document.getElementById("main");
  const root = document.documentElement;
  let open = false;
  let scrollY = 0;

  function setOpen(next) {
    open = next;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileNav.classList.toggle("is-open", open);
    root.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);

    if (open) {
      scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      main?.setAttribute("inert", "");
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      main?.removeAttribute("inert");
    }
  }

  function onToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  }

  toggle.addEventListener("click", onToggle);

  mobileNav.addEventListener("click", (e) => {
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
