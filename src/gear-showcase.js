/** 3D gear previews via model-viewer + real glTF assets */

const GEAR = [
  { label: "Motorbike helmets", src: "/models/helmet.glb", orbit: "0deg 72deg 110%" },
  { label: "Boxing gloves", src: "/models/gear/damaged-helmet.glb", orbit: "0deg 68deg 95%" },
  { label: "Sports shoes", src: "/models/gear/shoe.glb", orbit: "0deg 75deg 120%" },
  { label: "Knee & elbow guards", src: "/models/gear/lantern.glb", orbit: "0deg 70deg 100%" },
  { label: "Riding gloves", src: "/models/gear/damaged-helmet.glb", orbit: "0deg 65deg 90%" },
  { label: "Bicycle helmets", src: "/models/helmet.glb", orbit: "0deg 80deg 85%" },
  { label: "VR headsets", src: "/models/gear/lantern.glb", orbit: "0deg 72deg 88%" },
  { label: "Masks & face covers", src: "/models/gear/water-bottle.glb", orbit: "0deg 60deg 95%" },
  { label: "Ice skates", src: "/models/gear/shoe.glb", orbit: "0deg 78deg 115%" },
  { label: "Gym equipment", src: "/models/gear/water-bottle.glb", orbit: "0deg 55deg 105%" },
  { label: "Hard hats", src: "/models/gear/damaged-helmet.glb", orbit: "0deg 70deg 92%" },
];

function mountModelViewer(container, item) {
  const mv = document.createElement("model-viewer");
  mv.setAttribute("src", item.src);
  mv.setAttribute("alt", item.label);
  mv.setAttribute("loading", "lazy");
  mv.setAttribute("auto-rotate", "");
  mv.setAttribute("rotation-per-second", "22deg");
  mv.setAttribute("disable-zoom", "");
  mv.setAttribute("interaction-prompt", "none");
  mv.setAttribute("shadow-intensity", "1");
  mv.setAttribute("camera-orbit", item.orbit);
  mv.setAttribute("environment-image", "neutral");
  mv.setAttribute("exposure", "1.1");
  container.appendChild(mv);
}

export function initGearShowcase() {
  const grid = document.querySelector("[data-gear-grid]");
  if (!grid) return;

  if (!customElements.get("model-viewer")) {
    console.warn("[Clear Nano] model-viewer not loaded");
    return;
  }

  grid.innerHTML = "";

  GEAR.forEach((item, i) => {
    const article = document.createElement("article");
    article.className = "gear-item reveal";
    if (i) article.style.setProperty("--delay", `${i * 0.04}s`);

    const stage = document.createElement("div");
    stage.className = "gear-stage";
    mountModelViewer(stage, item);

    const title = document.createElement("h3");
    title.textContent = item.label;

    article.append(stage, title);
    grid.appendChild(article);
  });
}
