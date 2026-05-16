import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createCleaningMachine, loadClearNanoLogo } from "./procedural-machine.js";
import { isMobilePerfMode } from "./device.js";

const TARGET_SIZE = 3.55;

function fitModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  model.position.sub(center);
  model.scale.setScalar(TARGET_SIZE / maxDim);
}

function frameCamera(camera, controls, object, viewportAspect = 1) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const fovRad = (camera.fov * Math.PI) / 180;
  const mobile = window.innerWidth <= 959;
  const pad = mobile ? 1.85 : 1.52;
  const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * pad;
  const ox = mobile ? 0.38 : 0.55;
  const oy = mobile ? 0.02 : 0.04;
  const oz = mobile ? 0.78 : 0.72;
  camera.position.set(
    center.x + distance * ox * (viewportAspect < 1.1 ? 0.92 : 1),
    center.y + size.y * oy,
    center.z + distance * oz
  );
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
    antialias: true,
    powerPreference: "high-performance",
  });
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0f172a, lite ? 0.95 : 0.85));
  if (!lite) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  }
  const key = new THREE.DirectionalLight(0xffffff, lite ? 1.35 : 1.5);
  key.position.set(5, 10, 8);
  scene.add(key);
  if (!lite) {
    const fill = new THREE.DirectionalLight(0x5eead4, 0.55);
    fill.position.set(-6, 3, 4);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x88ccff, 0.4);
    rim.position.set(0, 2, -8);
    scene.add(rim);
  }

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !lite;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.82;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spinSpeed = reducedMotion ? 0 : lite ? 0.5 : 0.65;

  let machine = null;
  const whenReady = loadClearNanoLogo()
    .catch(() => null)
    .then((logoTexture) => {
      machine = createCleaningMachine({ lite, logoTexture });
      fitModel(machine);
      scene.add(machine);
      machine.userData.userSpinning = true;
      const parent = canvas.parentElement;
      const aspect = parent
        ? parent.getBoundingClientRect().width / Math.max(1, parent.getBoundingClientRect().height)
        : 1;
      frameCamera(camera, controls, machine, aspect);
      return machine;
    });

  controls.addEventListener("start", () => {
    if (machine) machine.userData.userSpinning = false;
  });
  controls.addEventListener("end", () => {
    if (machine) machine.userData.userSpinning = true;
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
    if (machine) frameCamera(camera, controls, machine, w / h);
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  let inView = false;
  const viewObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.12;
    },
    { root: null, threshold: [0, 0.12, 0.25, 0.5] }
  );
  viewObserver.observe(canvas.parentElement || canvas);

  let scrolling = false;
  let scrollEndId = 0;
  const targetFps = lite ? 30 : 45;
  const minFrameMs = 1000 / targetFps;
  const clock = new THREE.Clock();
  let raf = 0;
  let lastFrame = 0;

  function shouldRender() {
    return inView && !scrolling && !document.hidden;
  }

  function renderFrame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    controls.update();
    if (machine && spinSpeed > 0 && machine.userData.userSpinning !== false) {
      machine.rotation.y += dt * spinSpeed;
    }
    renderer.render(scene, camera);
  }

  function onScroll() {
    scrolling = true;
    window.clearTimeout(scrollEndId);
    scrollEndId = window.setTimeout(() => {
      scrolling = false;
      if (shouldRender()) {
        lastFrame = 0;
        renderFrame();
      }
    }, 150);
  }

  function onVisibility() {
    if (!document.hidden && shouldRender()) {
      lastFrame = 0;
      renderFrame();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("app-scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (!shouldRender()) return;
    if (lastFrame && now - lastFrame < minFrameMs) return;
    lastFrame = now;
    renderFrame();
  }
  tick(performance.now());

  return {
    whenReady,
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
      window.clearTimeout(scrollEndId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("app-scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      viewObserver.disconnect();
      renderer.dispose();
      machine?.userData?.logoTexture?.dispose?.();
      machine?.userData?.topContactTexture?.dispose?.();
      machine?.traverse((c) => {
        c.geometry?.dispose?.();
        if (c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m) => m?.dispose?.());
        }
      });
    },
  };
}
