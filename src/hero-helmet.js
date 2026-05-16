import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { modelUrl } from "./hero-products.js";

const TARGET_SIZE = 2.35;
/** Keep in sync with --hero-word-fade-out / --hero-word-fade-in in styles.css */
const FADE_OUT_MS = 680;
const FADE_IN_MS = 780;
const LOAD_RETRIES = 4;

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
}

const HELMET_COLORS = {
  shell: 0xe8ecf0,
  rubber: 0x14181f,
  visor: 0x0c1a2e,
  accent: 0x2dd4bf,
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function diffuseFromMaterial(mat) {
  const ext = mat?.userData?.gltfExtensions?.KHR_materials_pbrSpecularGlossiness;
  if (ext?.diffuseFactor) {
    const [r, g, b] = ext.diffuseFactor;
    return new THREE.Color(r, g, b);
  }
  if (mat?.color) return mat.color.clone();
  return null;
}

function isDarkColor(color) {
  if (!color) return false;
  return color.r + color.g + color.b < 0.2;
}

function isVisorMesh(name) {
  const n = name.toLowerCase();
  return n.includes("visor") || n.includes("glass") || n.includes("lens") || n.includes("shield");
}

function buildPhysicalMaterial({ color, metalness, roughness, envMap, envIntensity, clearcoat = 0 }) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness: 0.15,
    envMap,
    envMapIntensity: envIntensity,
  });
}

/** Keep authored helmet look (custom PBR), not texture-driven. */
function upgradeHelmetMaterials(object, envMap) {
  object.traverse((child) => {
    if (!child.isMesh) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const meshName = child.name || "";
    const sourceMats = Array.isArray(child.material) ? child.material : [child.material];

    const nextMats = sourceMats.map((mat) => {
      if (!mat) return mat;

      const matName = (mat.name || "").toLowerCase();
      const diffuse = diffuseFromMaterial(mat);
      const dark = isDarkColor(diffuse) || matName.includes("blinn7");

      if (isVisorMesh(meshName) || matName.includes("visor")) {
        return new THREE.MeshPhysicalMaterial({
          color: HELMET_COLORS.visor,
          metalness: 0.05,
          roughness: 0.08,
          transmission: 0.72,
          thickness: 0.35,
          ior: 1.45,
          transparent: true,
          opacity: 0.92,
          envMap,
          envMapIntensity: 1.6,
        });
      }

      if (dark) {
        return buildPhysicalMaterial({
          color: HELMET_COLORS.rubber,
          metalness: 0.55,
          roughness: 0.42,
          envMap,
          envIntensity: 1.1,
        });
      }

      const shellColor = new THREE.Color(HELMET_COLORS.shell);
      if (matName.includes("blinn5") || diffuse) {
        shellColor.lerp(new THREE.Color(HELMET_COLORS.accent), meshName.includes("vent") ? 0.35 : 0.04);
      }

      return buildPhysicalMaterial({
        color: shellColor,
        metalness: 0.42,
        roughness: 0.28,
        envMap,
        envIntensity: 1.35,
        clearcoat: 0.85,
      });
    });

    const wasArray = Array.isArray(child.material);
    sourceMats.forEach((m) => m?.dispose?.());
    child.material = wasArray ? nextMats : nextMats[0];
  });
}

function syncTextureColorSpaces(mat) {
  if (!mat) return;
  const srgb = THREE.SRGBColorSpace;
  const linear = THREE.LinearSRGBColorSpace;
  const noColor = THREE.NoColorSpace;

  const assign = (tex, space) => {
    if (tex?.isTexture && space) tex.colorSpace = space;
  };

  assign(mat.map, srgb);
  assign(mat.emissiveMap, srgb);
  assign(mat.specularMap, srgb);
  assign(mat.normalMap, noColor);
  assign(mat.roughnessMap, linear);
  assign(mat.metalnessMap, linear);
  assign(mat.aoMap, linear);
  assign(mat.alphaMap, linear);
  assign(mat.bumpMap, linear);
  assign(mat.displacementMap, linear);
  assign(mat.clearcoatNormalMap, noColor);
}

/** Preserve GLB maps & colors; add IBL only (no destructive material swap). */
function enhanceImportedMaterials(root, envMap) {
  root.traverse((child) => {
    if (!child.isMesh && !child.isSkinnedMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    const next = mats.map((mat) => upgradeMaterialForEnv(mat, envMap));
    const wasArray = Array.isArray(child.material);
    if (wasArray) child.material = next;
    else child.material = next[0];
  });
}

function specGlossExtension(mat) {
  return mat?.userData?.gltfExtensions?.KHR_materials_pbrSpecularGlossiness;
}

/** Three.js no longer loads KHR_materials_pbrSpecularGlossiness — rebuild PBR from extension data. */
function materialFromSpecularGlossiness(mat, envMap) {
  const ext = specGlossExtension(mat);
  if (!ext) return null;

  const diffuseFactor = ext.diffuseFactor ?? [1, 1, 1];
  const next = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(diffuseFactor[0], diffuseFactor[1], diffuseFactor[2]),
    map: mat.map ?? null,
    normalMap: mat.normalMap ?? null,
    aoMap: mat.aoMap ?? null,
    emissiveMap: mat.emissiveMap ?? null,
    emissive: mat.emissive?.clone?.() ?? new THREE.Color(0, 0, 0),
    emissiveIntensity: mat.emissiveIntensity ?? 1,
    transparent: mat.transparent,
    opacity: mat.opacity,
    alphaMap: mat.alphaMap ?? null,
    side: mat.side,
    metalness: mat.metalness ?? 0.08,
    roughness: mat.roughness ?? 0.62,
    envMap,
    envMapIntensity: 1.15,
  });

  mat.dispose?.();
  syncTextureColorSpaces(next);
  return next;
}

function upgradeMaterialForEnv(mat, envMap) {
  if (!mat) return mat;

  const fromSpecGloss = materialFromSpecularGlossiness(mat, envMap);
  if (fromSpecGloss) return fromSpecGloss;

  syncTextureColorSpaces(mat);

  if (mat.isMeshPhysicalMaterial || mat.isMeshStandardMaterial) {
    mat.envMap = envMap;
    if (!mat.envMapIntensity || mat.envMapIntensity < 0.05) mat.envMapIntensity = 1.15;
    mat.needsUpdate = true;
    return mat;
  }

  if (mat.isMeshToonMaterial) {
    mat.envMap = envMap;
    if (!mat.envMapIntensity || mat.envMapIntensity < 0.05) mat.envMapIntensity = 0.9;
    mat.needsUpdate = true;
    return mat;
  }

  if (mat.isMeshPhongMaterial || mat.isMeshLambertMaterial) {
    mat.envMap = envMap;
    mat.needsUpdate = true;
    return mat;
  }

  if (mat.isMeshBasicMaterial && mat.map) {
    const next = new THREE.MeshPhysicalMaterial({
      map: mat.map,
      alphaMap: mat.alphaMap,
      transparent: mat.transparent,
      opacity: mat.opacity,
      side: mat.side,
      color: mat.color?.clone?.() ?? new THREE.Color(0xffffff),
      roughness: 0.55,
      metalness: 0.12,
      envMap,
      envMapIntensity: 1.2,
    });
    mat.dispose();
    syncTextureColorSpaces(next);
    return next;
  }

  return mat;
}

function applyMaterialsForSlug(root, slug, envMap) {
  if (slug === "helmet") upgradeHelmetMaterials(root, envMap);
  else {
    enhanceImportedMaterials(root, envMap);
    if (slug === "sports-shoes") tuneSportsShoesMaterials(root, envMap);
    if (slug === "masks") stylizeMaskBlack(root, envMap);
  }
}

/** Keep authored albedo/emissive; light IBL only (post metal/rough conversion). */
function tuneSportsShoesMaterials(root, envMap) {
  root.traverse((child) => {
    if ((!child.isMesh && !child.isSkinnedMesh) || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!mat) return;
      syncTextureColorSpaces(mat);
      if (mat.isMeshPhysicalMaterial || mat.isMeshStandardMaterial) {
        mat.envMap = envMap;
        mat.envMapIntensity = 1.05;
        if (mat.map) mat.color.setHex(0xffffff);
        mat.needsUpdate = true;
      }
    });
  });
}

/** Matte black finish for mask GLB (keeps normals/roughness when present). */
function stylizeMaskBlack(root, envMap) {
  root.traverse((child) => {
    if ((!child.isMesh && !child.isSkinnedMesh) || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!mat) return;
      if (mat.map) {
        mat.map.dispose?.();
        mat.map = null;
      }
      if (mat.emissiveMap) {
        mat.emissiveMap.dispose?.();
        mat.emissiveMap = null;
      }
      if (mat.isMeshPhysicalMaterial || mat.isMeshStandardMaterial) {
        mat.color.setHex(0x050508);
        mat.emissive?.set?.(0);
        if ("emissiveIntensity" in mat) mat.emissiveIntensity = 0;
        mat.roughness = Math.max(mat.roughness ?? 0.9, 0.9);
        mat.metalness = 0.04;
        mat.envMap = envMap;
        mat.envMapIntensity = 0.2;
        if ("clearcoat" in mat) mat.clearcoat = 0.04;
        if ("clearcoatRoughness" in mat) mat.clearcoatRoughness = 1;
        if ("sheen" in mat) mat.sheen = 0;
        mat.needsUpdate = true;
        return;
      }
      if (mat.isMeshBasicMaterial) {
        mat.map?.dispose?.();
        mat.map = null;
        mat.color.setHex(0x050508);
        mat.needsUpdate = true;
      }
    });
  });
}

/** Disabled: name-based stripping was removing valid meshes from some GLBs. */
function stripLikelyBackground(_root) {}

function getDominantDrawnMesh(root) {
  let best = null;
  let bestTri = 0;
  root.traverse((child) => {
    if ((!child.isMesh && !child.isSkinnedMesh) || !child.geometry) return;
    const g = child.geometry;
    const tri = g.index ? g.index.count / 3 : Math.floor((g.attributes.position?.count || 0) / 3);
    if (tri > bestTri) {
      bestTri = tri;
      best = child;
    }
  });
  return { mesh: best, tri: bestTri };
}

/** Sparse vertex sample — ignores a few outlier verts that blow up Sketchfab AABBs. */
function sampledWorldBox(mesh, maxSamples = 65536) {
  const pos = mesh.geometry?.attributes?.position;
  if (!pos) return null;
  mesh.updateWorldMatrix(true, false);
  const box = new THREE.Box3();
  const n = pos.count;
  const step = Math.max(1, Math.floor(n / maxSamples));
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i += step) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    box.expandByPoint(v);
  }
  return box.isEmpty() ? null : box;
}

function pruneDistantMeshes(root, anchorWorld, maxRadius) {
  const victims = [];
  root.traverse((child) => {
    if ((!child.isMesh && !child.isSkinnedMesh) || !child.geometry) return;
    const b = new THREE.Box3().setFromObject(child);
    const c = b.getCenter(new THREE.Vector3());
    const s = b.getSize(new THREE.Vector3());
    const localMax = Math.max(s.x, s.y, s.z);
    if (anchorWorld.distanceTo(c) > maxRadius || localMax > maxRadius * 18) {
      victims.push(child);
    }
  });
  victims.forEach((v) => {
    v.parent?.remove(v);
    v.geometry?.dispose?.();
    const mats = Array.isArray(v.material) ? v.material : [v.material];
    mats.forEach((m) => m?.dispose?.());
  });
}

function centerAndScale(object, targetSize = TARGET_SIZE) {
  object.updateMatrixWorld(true);

  const fullBox = new THREE.Box3().setFromObject(object);
  const fullSize = fullBox.getSize(new THREE.Vector3());
  const fullMax = Math.max(fullSize.x, fullSize.y, fullSize.z, 0.001);

  const { mesh: main, tri: mainTri } = getDominantDrawnMesh(object);
  let sizingBox = fullBox.clone();

  if (main && mainTri >= 32) {
    const exactMain = new THREE.Box3().setFromObject(main);
    sizingBox = exactMain.clone();
    const ex = exactMain.getSize(new THREE.Vector3());
    let mainMax = Math.max(ex.x, ex.y, ex.z, 0.001);

    const looseMain = sampledWorldBox(main);
    if (looseMain) {
      const ls = looseMain.getSize(new THREE.Vector3());
      const lm = Math.max(ls.x, ls.y, ls.z, 0.001);
      if (mainMax > lm * 2.5) {
        sizingBox = looseMain;
        mainMax = lm;
      }
    }

    if (fullMax > mainMax * 6) {
      const anchor = sizingBox.getCenter(new THREE.Vector3());
      pruneDistantMeshes(object, anchor, mainMax * 12);
      sizingBox.setFromObject(object);
    }
  }

  const center = sizingBox.getCenter(new THREE.Vector3());
  const size = sizingBox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);

  object.position.sub(center);
  object.scale.setScalar(targetSize / maxDim);

  return object;
}

function getFramePadding() {
  if (window.innerWidth <= 480) return 2.05;
  if (window.innerWidth <= 959) return 1.9;
  return 1.55;
}

function frameCamera(camera, controls, object, padding = getFramePadding()) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const fovRad = (camera.fov * Math.PI) / 180;
  const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * padding;

  camera.position.set(center.x + distance * 0.12, center.y + size.y * 0.06, center.z + distance);
  camera.near = 0.05;
  camera.far = Math.min(8000, Math.max(180, maxDim * 28));
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.minDistance = distance;
  controls.maxDistance = distance;
  controls.update();
}

function createLoader() {
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  draco.preload();
  loader.setDRACOLoader(draco);
  return loader;
}

function setStageMessage(container, type, text) {
  const el = container.querySelector("[data-helmet-status]");
  if (!el) return;
  el.hidden = false;
  el.className = `hero-helmet-status hero-helmet-status--${type}`;
  el.textContent = text;
}

function hideStageMessage(container) {
  const el = container.querySelector("[data-helmet-status]");
  if (el) el.hidden = true;
}

function setModelOpacity(object, opacity) {
  object.traverse((child) => {
    if ((!child.isMesh && !child.isSkinnedMesh) || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!mat) return;
      mat.transparent = opacity < 1;
      mat.opacity = opacity;
      mat.needsUpdate = true;
    });
  });
}

function animateModelOpacity(object, from, to, durationMs) {
  return new Promise((resolve) => {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = easeInOutQuart(t);
      setModelOpacity(object, from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
      else {
        setModelOpacity(object, to);
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

export function initHeroHelmet(canvas, products = []) {
  if (!canvas) return null;

  const container = canvas.parentElement;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100);
  camera.position.set(0, 0.2, 5);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.35 : 1.85));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envMap = pmrem.fromScene(envScene, 0.04).texture;
  scene.environment = envMap;

  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.9));
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(6, 10, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x5eead4, 1.1);
  fill.position.set(-7, 3, 5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x7dd3fc, 1.35);
  rim.position.set(2, 5, -9);
  scene.add(rim);

  const accent = new THREE.PointLight(0x2dd4bf, 2.5, 12);
  accent.position.set(-2, 1, 3);
  scene.add(accent);

  const modelPivot = new THREE.Group();
  scene.add(modelPivot);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.78;

  const reduced = prefersReducedMotion();
  if (!reduced) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
  }

  canvas.addEventListener("pointerdown", () => {
    controls.autoRotate = false;
  });
  canvas.addEventListener("pointerup", () => {
    if (!reduced) controls.autoRotate = true;
  });

  const loader = createLoader();
  let meshoptAttached = false;

  async function attachMeshoptIfNeeded() {
    if (meshoptAttached) return;
    await MeshoptDecoder.ready;
    loader.setMeshoptDecoder(MeshoptDecoder);
    meshoptAttached = true;
  }

  const cache = new Map();
  const inflight = new Map();
  const availableSlugs = new Set();
  let currentModel = null;
  let framed = false;
  let raf = 0;

  /** One transition at a time — avoids torn fades and races. */
  let displayChain = Promise.resolve();

  function loadModelOnce(slug) {
    return new Promise((resolve, reject) => {
      loader.load(
        modelUrl(slug),
        (gltf) => resolve(gltf),
        undefined,
        (err) => reject(err)
      );
    });
  }

  async function loadModel(slug) {
    if (cache.has(slug)) return cache.get(slug);
    if (inflight.has(slug)) return inflight.get(slug);

    const task = (async () => {
      let lastErr;
      for (let attempt = 0; attempt <= LOAD_RETRIES; attempt++) {
        try {
          await attachMeshoptIfNeeded();
          if (attempt > 0) await new Promise((r) => setTimeout(r, 280 * attempt));
          const gltf = await loadModelOnce(slug);
          stripLikelyBackground(gltf.scene);
          const model = centerAndScale(gltf.scene);
          applyMaterialsForSlug(model, slug, envMap);
          setModelOpacity(model, 1);
          cache.set(slug, model);
          availableSlugs.add(slug);
          return model;
        } catch (e) {
          lastErr = e;
        }
      }
      console.warn(`[Clear Nano] Failed to load ${modelUrl(slug)}`, lastErr);
      throw lastErr;
    })();

    inflight.set(slug, task);
    try {
      return await task;
    } finally {
      inflight.delete(slug);
    }
  }

  function prefetchSlugs(slugs) {
    slugs.forEach((slug, i) => {
      window.setTimeout(() => {
        if (cache.has(slug)) return;
        loadModel(slug).catch(() => {});
      }, 800 + i * 350);
    });
  }

  async function showProductCore(slug, options = {}) {
    const { onTransitionStart, onWordReveal, onModelReady } = options;
    const next = await loadModel(slug);

    if (currentModel === next) return;

    if (!framed) {
      modelPivot.add(next);
      frameCamera(camera, controls, next);
      framed = true;
      currentModel = next;
      hideStageMessage(container);
      onModelReady?.();
      onWordReveal?.();
      return;
    }

    const prev = currentModel;

    await new Promise((resolve) => {
      requestAnimationFrame(async () => {
        onTransitionStart?.();

        if (reduced) {
          if (prev?.parent) modelPivot.remove(prev);
          setModelOpacity(next, 1);
          modelPivot.add(next);
          frameCamera(camera, controls, next);
          onWordReveal?.();
          onModelReady?.();
          currentModel = next;
          resolve();
          return;
        }

        if (prev) await animateModelOpacity(prev, 1, 0, FADE_OUT_MS);

        onWordReveal?.();
        onModelReady?.();

        if (prev?.parent) modelPivot.remove(prev);

        setModelOpacity(next, 0);
        modelPivot.add(next);
        frameCamera(camera, controls, next);

        await animateModelOpacity(next, 0, 1, FADE_IN_MS);

        setModelOpacity(next, 1);
        currentModel = next;
        resolve();
      });
    });
  }

  function showProduct(slug, options = {}) {
    let resolveP;
    let rejectP;
    const p = new Promise((res, rej) => {
      resolveP = res;
      rejectP = rej;
    });

    displayChain = displayChain.catch(() => {}).then(async () => {
      try {
        await showProductCore(slug, options);
        resolveP();
      } catch (e) {
        rejectP(e);
      }
    });

    return p;
  }

  const slugs = [...new Set(products.map((p) => p.slug))];
  const firstSlug = slugs[0] || "helmet";

  setStageMessage(container, "loading", "Loading 3D preview…");

  const ready = loadModel(firstSlug)
    .then(() => showProduct(firstSlug))
    .then(() => {
      hideStageMessage(container);
      const rest = slugs.filter((s) => s !== firstSlug);
      prefetchSlugs(rest);
      return api;
    })
    .catch(() => {
      setStageMessage(container, "error", "Could not load 3D model. Check /public/models/.");
      return api;
    });

  function resize() {
    const rect = container.getBoundingClientRect();
    const mobile = window.innerWidth <= 959;
    const width = Math.max(rect.width, mobile ? 260 : 320);
    const height = Math.max(rect.height, mobile ? 220 : 400);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (currentModel) frameCamera(camera, controls, currentModel);
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const clock = new THREE.Clock();
  let heroVisible = true;

  const visibilityIo = new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.isIntersecting;
    },
    { threshold: 0.05, rootMargin: "40px" }
  );
  visibilityIo.observe(container);

  function animate() {
    raf = requestAnimationFrame(animate);
    if (!heroVisible) return;
    controls.update();
    modelPivot.position.y = Math.sin(clock.getElapsedTime() * 1.05) * 0.03;
    renderer.render(scene, camera);
  }

  animate();

  const api = {
    showProduct,
    isAvailable: (slug) => availableSlugs.has(slug),
    whenReady: () => ready,
  };

  return api;
}
