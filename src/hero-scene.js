import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createProceduralHelmet } from "./procedural-helmet.js";
import { isMobilePerfMode } from "./device.js";

const TARGET_SIZE = 2.35;

function fitModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  model.position.sub(center);
  model.scale.setScalar(TARGET_SIZE / maxDim);
}

function frameCamera(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const fovRad = (camera.fov * Math.PI) / 180;
  const pad = window.innerWidth <= 959 ? 1.95 : 1.55;
  const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * pad;
  camera.position.set(center.x + distance * 0.1, center.y + size.y * 0.05, center.z + distance);
  camera.near = 0.05;
  camera.far = 200;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.minDistance = distance;
  controls.maxDistance = distance;
  controls.update();
}

/** Minimal hero viewer — procedural helmet only, no GLB. */
export function initHeroScene(canvas) {
  if (!canvas) return null;

  const lite = isMobilePerfMode();
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !lite,
    powerPreference: "high-performance",
  });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.9));
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 9, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x5eead4, 0.65);
  fill.position.set(-5, 2, 5);
  scene.add(fill);

  const helmet = createProceduralHelmet(null, { lite });
  fitModel(helmet);
  scene.add(helmet);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.78;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.15;
  }
  controls.addEventListener("start", () => {
    controls.autoRotate = false;
  });
  controls.addEventListener("end", () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      controls.autoRotate = true;
    }
  });

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const { width, height } = parent.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    frameCamera(camera, controls, helmet);
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  const clock = new THREE.Clock();
  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    controls.update();
    helmet.position.y = Math.sin(clock.getElapsedTime() * 1.05) * 0.03;
    renderer.render(scene, camera);
  }
  tick();

  return {
    whenReady: Promise.resolve(),
    showProduct(_slug, options = {}) {
      options.onTransitionStart?.();
      options.onWordReveal?.();
      return Promise.resolve();
    },
    isAvailable: () => true,
    isHealthy: () => true,
    waitForHealthy: () => Promise.resolve(),
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      helmet.traverse((c) => {
        c.geometry?.dispose?.();
        if (c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m) => m?.dispose?.());
        }
      });
    },
  };
}
