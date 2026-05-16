import * as THREE from "three";

const COLORS = {
  body: 0xf2f4f7,
  dark: 0x1c2430,
  glass: 0xa8c4e0,
  led: 0x22d3ee,
  uv: 0x8b5cf6,
  screen: 0x0a0e14,
};

function bodyMat(lite) {
  return new THREE.MeshPhysicalMaterial({
    color: COLORS.body,
    metalness: 0.12,
    roughness: 0.2,
    clearcoat: lite ? 0.25 : 0.72,
    clearcoatRoughness: 0.1,
  });
}

function darkMat() {
  return new THREE.MeshStandardMaterial({
    color: COLORS.dark,
    metalness: 0.45,
    roughness: 0.45,
  });
}

function glassMat(lite) {
  return new THREE.MeshPhysicalMaterial({
    color: COLORS.glass,
    metalness: 0,
    roughness: 0.04,
    transmission: lite ? 0 : 0.55,
    transparent: true,
    opacity: lite ? 0.45 : 0.32,
    side: THREE.DoubleSide,
  });
}

/** Simple helmet silhouette inside the chamber */
function miniHelmet() {
  const g = new THREE.Group();
  const profile = [
    new THREE.Vector2(0.05, -0.5),
    new THREE.Vector2(0.38, -0.45),
    new THREE.Vector2(0.5, -0.15),
    new THREE.Vector2(0.48, 0.15),
    new THREE.Vector2(0.3, 0.45),
    new THREE.Vector2(0.08, 0.55),
  ];
  const shell = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 32),
    new THREE.MeshStandardMaterial({ color: 0xe8ecf0, metalness: 0.35, roughness: 0.35 })
  );
  g.add(shell);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4),
    new THREE.MeshStandardMaterial({
      color: 0x1a2840,
      metalness: 0.2,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85,
    })
  );
  visor.position.set(0, 0.05, 0.15);
  visor.rotation.x = -0.35;
  visor.scale.set(1, 0.75, 0.6);
  g.add(visor);
  return g;
}

/**
 * Clear Nano disinfection kiosk — procedural, no branding.
 * Based on standard helmet-cleaning cabinet layout.
 */
export function createCleaningMachine({ lite = false } = {}) {
  const root = new THREE.Group();
  root.name = "CleaningMachine";

  const W = 0.54;
  const D = 0.5;
  const body = bodyMat(lite);
  const dark = darkMat();
  const glass = glassMat(lite);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 0.055, D * 0.88), dark);
  kick.position.y = -1.02;
  root.add(kick);

  const lowerBase = new THREE.Mesh(new THREE.BoxGeometry(W, 0.88, D), body);
  lowerBase.position.y = -0.54;
  root.add(lowerBase);

  const panelBand = new THREE.Mesh(new THREE.BoxGeometry(W * 0.97, 0.1, D * 0.96), body);
  panelBand.position.y = -0.02;
  root.add(panelBand);

  const buttonColors = [0xef4444, 0xeab308, 0x3b82f6, 0x22c55e];
  buttonColors.forEach((hex, i) => {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.012, 12),
      new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.35 })
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(-0.135 + i * 0.09, -0.01, D / 2 + 0.012);
    root.add(btn);
  });

  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.015), dark);
  slot.position.set(0.17, -0.01, D / 2 + 0.012);
  root.add(slot);

  const chamberH = 0.58;
  const chamber = new THREE.Mesh(new THREE.BoxGeometry(W * 0.95, chamberH, D * 0.93), body);
  chamber.position.y = 0.4;
  root.add(chamber);

  const chamberInner = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.7, chamberH * 0.72, D * 0.55),
    new THREE.MeshStandardMaterial({
      color: COLORS.uv,
      emissive: COLORS.uv,
      emissiveIntensity: lite ? 0.15 : 0.35,
      transparent: true,
      opacity: 0.25,
    })
  );
  chamberInner.position.set(0, 0.42, 0);
  root.add(chamberInner);

  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.68, chamberH * 0.7, 0.018), glass);
  windowGlass.position.set(0, 0.42, D / 2 + 0.01);
  root.add(windowGlass);

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(W * 0.72, chamberH * 0.74, 0.012), dark);
  doorFrame.position.set(0, 0.42, D / 2 + 0.004);
  root.add(doorFrame);

  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.09, 0.018), dark);
  handle.position.set(-W * 0.36, 0.4, D / 2 + 0.015);
  root.add(handle);

  const helmet = miniHelmet();
  helmet.position.set(0, 0.38, 0.04);
  helmet.scale.setScalar(0.2);
  root.add(helmet);

  const uvLight = new THREE.PointLight(COLORS.uv, lite ? 0.6 : 1.4, 1.5);
  uvLight.position.set(0, 0.44, 0.08);
  root.add(uvLight);

  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(W * 1.04, 0.022, D * 1.02),
    new THREE.MeshStandardMaterial({
      color: COLORS.led,
      emissive: COLORS.led,
      emissiveIntensity: lite ? 0.8 : 1.4,
    })
  );
  ledStrip.position.y = 0.74;
  root.add(ledStrip);

  const topCap = new THREE.Mesh(new THREE.BoxGeometry(W * 1.06, 0.44, D * 1.04), body);
  topCap.position.y = 1.02;
  root.add(topCap);

  const screenFront = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.82, 0.3, 0.018),
    new THREE.MeshStandardMaterial({ color: COLORS.screen, metalness: 0.35, roughness: 0.35 })
  );
  screenFront.position.set(0, 1.08, D / 2 + 0.02);
  root.add(screenFront);

  const screenSide = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.26, D * 0.75),
    new THREE.MeshStandardMaterial({ color: COLORS.screen, metalness: 0.35, roughness: 0.35 })
  );
  screenSide.position.set(W / 2 + 0.01, 1.06, 0);
  root.add(screenSide);

  root.rotation.y = 0.22;
  return root;
}
