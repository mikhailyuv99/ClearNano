import * as THREE from "three";

/** Clear Nano hero helmet palette */
export const HELMET_COLORS = {
  shell: 0xe8ecf0,
  rubber: 0x14181f,
  visor: 0x0c1a2e,
  accent: 0x2dd4bf,
};

function shellMaterial(envMap, lite) {
  return new THREE.MeshPhysicalMaterial({
    color: HELMET_COLORS.shell,
    metalness: 0.44,
    roughness: 0.26,
    clearcoat: lite ? 0.15 : 0.88,
    clearcoatRoughness: 0.12,
    envMap,
    envMapIntensity: lite ? 1.05 : 1.38,
  });
}

function rubberMaterial(envMap, lite) {
  return new THREE.MeshPhysicalMaterial({
    color: HELMET_COLORS.rubber,
    metalness: 0.58,
    roughness: 0.4,
    envMap,
    envMapIntensity: lite ? 0.95 : 1.12,
  });
}

function visorMaterial(envMap, lite) {
  if (lite) {
    return new THREE.MeshStandardMaterial({
      color: HELMET_COLORS.visor,
      metalness: 0.12,
      roughness: 0.18,
      transparent: true,
      opacity: 0.9,
      envMap,
      envMapIntensity: 1.15,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: HELMET_COLORS.visor,
    metalness: 0.04,
    roughness: 0.06,
    transmission: 0.78,
    thickness: 0.4,
    ior: 1.48,
    transparent: true,
    opacity: 0.94,
    envMap,
    envMapIntensity: 1.55,
  });
}

function accentMaterial(envMap) {
  return new THREE.MeshPhysicalMaterial({
    color: HELMET_COLORS.accent,
    metalness: 0.35,
    roughness: 0.35,
    emissive: new THREE.Color(HELMET_COLORS.accent),
    emissiveIntensity: 0.12,
    envMap,
    envMapIntensity: 1.2,
  });
}

/** Full-face motorbike helmet built from primitives — no GLB. */
export function createProceduralHelmet(envMap = null, { lite = false } = {}) {
  const root = new THREE.Group();
  root.name = "ProceduralHelmet";

  const shellMat = shellMaterial(envMap, lite);
  const rubberMat = rubberMaterial(envMap, lite);
  const visorMat = visorMaterial(envMap, lite);
  const accentMat = accentMaterial(envMap);

  const profile = [
    new THREE.Vector2(0.0, -0.62),
    new THREE.Vector2(0.34, -0.56),
    new THREE.Vector2(0.52, -0.28),
    new THREE.Vector2(0.54, -0.02),
    new THREE.Vector2(0.5, 0.22),
    new THREE.Vector2(0.4, 0.42),
    new THREE.Vector2(0.26, 0.58),
    new THREE.Vector2(0.1, 0.72),
    new THREE.Vector2(0.02, 0.76),
  ];

  const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 80), shellMat);
  shell.castShadow = !lite;
  shell.receiveShadow = !lite;
  root.add(shell);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.48),
    visorMat
  );
  visor.position.set(0, 0.06, 0.2);
  visor.rotation.x = -0.38;
  visor.scale.set(1.02, 0.78, 0.62);
  root.add(visor);

  const chin = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.045, 10, 48, Math.PI * 0.72),
    rubberMat
  );
  chin.rotation.set(0.55, 0, 0);
  chin.position.set(0, -0.18, 0.22);
  root.add(chin);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.038, 12, 72), rubberMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.54;
  root.add(rim);

  for (let i = -1; i <= 1; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.055), accentMat);
    vent.position.set(i * 0.15, 0.66, -0.04);
    vent.rotation.x = -0.25;
    root.add(vent);
  }

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.55, 0.03),
    accentMat
  );
  stripe.position.set(0, 0.12, 0.48);
  root.add(stripe);

  root.rotation.x = 0.06;
  return root;
}
