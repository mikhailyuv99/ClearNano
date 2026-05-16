import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createCleaningMachine } from "./procedural-machine.js";
import { isMobilePerfMode } from "./device.js";

const TARGET_SIZE = 2.5;

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
  const pad = window.innerWidth <= 959 ? 2.05 : 1.65;
  const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * pad;
  camera.position.set(center.x + distance * 0.35, center.y + size.y * 0.02, center.z + distance * 0.85);
  camera.near = 0.05;
  camera.far = 200;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.minDistance = distance;
  controls.maxDistance = distance;
  controls.update();
}

/** Hero 3D — procedural cleaning kiosk, no GLB. */
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

  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.85));
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(5, 10, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x5eead4, 0.55);
  fill.position.set(-6, 3, 4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x88ccff, 0.4);
  rim.position.set(0, 2, -8);
  scene.add(rim);

  const machine = createCleaningMachine({ lite });
  fitModel(machine);
  scene.add(machine);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.82;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
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
    frameCamera(camera, controls, machine);
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  const clock = new THREE.Clock();
  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    controls.update();
    machine.rotation.y = 0.22 + Math.sin(clock.getElapsedTime() * 0.55) * 0.08;
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
      machine.traverse((c) => {
        c.geometry?.dispose?.();
        if (c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m) => m?.dispose?.());
        }
      });
    },
  };
}
