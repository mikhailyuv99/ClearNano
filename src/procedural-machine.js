import * as THREE from "three";

const COLORS = {
  body: 0xf0f2f5,
  bodyEdge: 0xd8dde4,
  dark: 0x1a2230,
  glass: 0x9eb8d4,
  led: 0x22d3ee,
  uv: 0x7c3aed,
  screen: 0x080c12,
};

function bodyMat(lite) {
  return new THREE.MeshPhysicalMaterial({
    color: COLORS.body,
    metalness: 0.14,
    roughness: 0.22,
    clearcoat: lite ? 0.3 : 0.78,
    clearcoatRoughness: 0.08,
  });
}

function edgeMat() {
  return new THREE.MeshStandardMaterial({
    color: COLORS.bodyEdge,
    metalness: 0.2,
    roughness: 0.35,
  });
}

function darkMat() {
  return new THREE.MeshStandardMaterial({
    color: COLORS.dark,
    metalness: 0.5,
    roughness: 0.42,
  });
}

function glassMat(lite) {
  return new THREE.MeshPhysicalMaterial({
    color: COLORS.glass,
    metalness: 0,
    roughness: 0.03,
    transmission: lite ? 0 : 0.5,
    transparent: true,
    opacity: lite ? 0.5 : 0.38,
    side: THREE.DoubleSide,
  });
}

const LOGO_URL = "/images/optimized/logo-p0-img0.webp";

export function loadClearNanoLogo(url = LOGO_URL) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        resolve(tex);
      },
      undefined,
      reject
    );
  });
}

const SCREEN_MAT = new THREE.MeshStandardMaterial({
  color: COLORS.screen,
  metalness: 0.4,
  roughness: 0.32,
});

function addCenteredLogoPlane(root, logoTexture, { y, z, maxHeight }) {
  const img = logoTexture.image;
  const aspect = img?.width && img?.height ? img.width / img.height : 2.4;
  const h = maxHeight;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(h * aspect, h),
    new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      depthWrite: true,
      toneMapped: false,
    })
  );
  plane.position.set(0, y, z);
  root.add(plane);
  return plane;
}

function drawPhoneIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const w = size * 0.55;
  const h = size;
  const rx = x - w / 2;
  const ry = y - h / 2;
  ctx.beginPath();
  ctx.moveTo(rx + w * 0.22, ry);
  ctx.lineTo(rx + w * 0.78, ry);
  ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + h * 0.12);
  ctx.lineTo(rx + w, ry + h * 0.88);
  ctx.quadraticCurveTo(rx + w, ry + h, rx + w * 0.78, ry + h);
  ctx.lineTo(rx + w * 0.22, ry + h);
  ctx.quadraticCurveTo(rx, ry + h, rx, ry + h * 0.88);
  ctx.lineTo(rx, ry + h * 0.12);
  ctx.quadraticCurveTo(rx, ry, rx + w * 0.22, ry);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + h * 0.1, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const COMPANY_PHONE = "0902 164 414";

export function createPhoneScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 280;
  const ctx = canvas.getContext("2d");
  const accent = "#22d3ee";
  const cx = canvas.width / 2;

  ctx.fillStyle = "#0a0f14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPhoneIcon(ctx, cx, 92, 46, accent);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e8eef4";
  ctx.font = "700 54px system-ui, Segoe UI, sans-serif";
  ctx.fillText(COMPANY_PHONE, cx, 168);

  ctx.fillStyle = "#8b9cb0";
  ctx.font = "500 22px system-ui, Segoe UI, sans-serif";
  ctx.fillText("Hotline", cx, 218);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

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
  g.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(profile, 32),
      new THREE.MeshStandardMaterial({ color: 0xe8ecf0, metalness: 0.35, roughness: 0.35 })
    )
  );
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

/** Bulkier kiosk proportions — wide footprint, real cabinet depth. */
export function createCleaningMachine({ lite = false, logoTexture = null } = {}) {
  const root = new THREE.Group();
  root.name = "CleaningMachine";

  const W = 0.92;
  const D = 0.78;
  const body = bodyMat(lite);
  const edge = edgeMat();
  const dark = darkMat();
  const glass = glassMat(lite);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(W * 0.96, 0.07, D * 0.94), dark);
  kick.position.y = -1.08;
  root.add(kick);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(W * 1.02, 0.08, D * 1.02), edge);
  plinth.position.y = -1.02;
  root.add(plinth);

  const lowerBase = new THREE.Mesh(new THREE.BoxGeometry(W, 0.95, D), body);
  lowerBase.position.y = -0.5;
  root.add(lowerBase);

  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([sx, sz], i) => {
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(sx ? 0.04 : W * 0.98, 0.9, sz ? 0.04 : D * 0.98),
      i < 2 ? edge : edge
    );
    side.position.set(sx * (W / 2 + 0.02), -0.48, sz * (D / 2 + 0.02));
    root.add(side);
  });

  const panelBand = new THREE.Mesh(new THREE.BoxGeometry(W * 0.98, 0.14, D * 0.98), body);
  panelBand.position.y = 0.02;
  root.add(panelBand);

  const panelRecess = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 0.1, D * 0.88), edge);
  panelRecess.position.set(0, 0.02, 0);
  root.add(panelRecess);

  const buttonColors = [0xef4444, 0xeab308, 0x3b82f6, 0x22c55e];
  buttonColors.forEach((hex, i) => {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.018, 16),
      new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.45 })
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(-0.22 + i * 0.14, 0.04, D / 2 + 0.02);
    root.add(btn);
  });

  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.022), dark);
  slot.position.set(0.28, 0.04, D / 2 + 0.02);
  root.add(slot);

  const slotBezel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.055, 0.012), edge);
  slotBezel.position.set(0.28, 0.04, D / 2 + 0.012);
  root.add(slotBezel);

  const chamberH = 0.64;
  const chamber = new THREE.Mesh(new THREE.BoxGeometry(W * 0.97, chamberH, D * 0.96), body);
  chamber.position.y = 0.44;
  root.add(chamber);

  const chamberBack = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.75, chamberH * 0.75, 0.06),
    new THREE.MeshStandardMaterial({
      color: COLORS.uv,
      emissive: COLORS.uv,
      emissiveIntensity: lite ? 0.2 : 0.45,
    })
  );
  chamberBack.position.set(0, 0.46, -D * 0.22);
  root.add(chamberBack);

  const chamberInner = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.78, chamberH * 0.74, D * 0.62),
    new THREE.MeshStandardMaterial({
      color: COLORS.uv,
      emissive: COLORS.uv,
      emissiveIntensity: lite ? 0.12 : 0.28,
      transparent: true,
      opacity: 0.3,
    })
  );
  chamberInner.position.set(0, 0.46, 0.02);
  root.add(chamberInner);

  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(W * 0.76, chamberH * 0.72, 0.025), glass);
  windowGlass.position.set(0, 0.46, D / 2 + 0.015);
  root.add(windowGlass);

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(W * 0.8, chamberH * 0.76, 0.02), dark);
  doorFrame.position.set(0, 0.46, D / 2 + 0.005);
  root.add(doorFrame);

  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.028), dark);
  handle.position.set(-W * 0.38, 0.44, D / 2 + 0.022);
  root.add(handle);

  const helmet = miniHelmet();
  helmet.position.set(0, 0.42, 0.06);
  helmet.scale.setScalar(0.24);
  root.add(helmet);

  const uvLight = new THREE.PointLight(COLORS.uv, lite ? 0.8 : 2, 2);
  uvLight.position.set(0, 0.48, 0.1);
  root.add(uvLight);

  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(W * 1.04, 0.035, D * 1.04),
    new THREE.MeshStandardMaterial({
      color: COLORS.led,
      emissive: COLORS.led,
      emissiveIntensity: lite ? 0.9 : 1.6,
    })
  );
  ledStrip.position.y = 0.82;
  root.add(ledStrip);

  const topCap = new THREE.Mesh(new THREE.BoxGeometry(W * 1.08, 0.5, D * 1.06), body);
  topCap.position.y = 1.12;
  root.add(topCap);

  const topBevel = new THREE.Mesh(new THREE.BoxGeometry(W * 1.1, 0.06, D * 1.08), edge);
  topBevel.position.y = 0.86;
  root.add(topBevel);

  const screenFront = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, 0.36, 0.028), SCREEN_MAT);
  screenFront.position.set(0, 1.18, D / 2 + 0.025);
  root.add(screenFront);

  const phoneTex = createPhoneScreenTexture();
  const phoneAspect = canvasAspect(phoneTex);
  const phoneH = 0.32;
  const phoneW = Math.min(phoneH * phoneAspect, W * 0.84);
  const phonePanel = new THREE.Mesh(
    new THREE.PlaneGeometry(phoneW, phoneH),
    new THREE.MeshBasicMaterial({ map: phoneTex, toneMapped: false })
  );
  phonePanel.position.set(0, 1.18, D / 2 + 0.042);
  root.add(phonePanel);
  root.userData.phoneScreenTexture = phoneTex;

  const screenSideL = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.32, D * 0.82), SCREEN_MAT);
  screenSideL.position.set(-W / 2 - 0.02, 1.14, 0);
  root.add(screenSideL);

  const screenSideR = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.32, D * 0.82), SCREEN_MAT);
  screenSideR.position.set(W / 2 + 0.02, 1.14, 0);
  root.add(screenSideR);

  if (logoTexture) {
    addCenteredLogoPlane(root, logoTexture, {
      y: -0.1,
      z: D / 2 + 0.042,
      maxHeight: 0.14,
    });
    root.userData.logoTexture = logoTexture;
  }

  return root;
}

function canvasAspect(texture) {
  const img = texture.image;
  return img?.width && img?.height ? img.width / img.height : 3.2;
}
