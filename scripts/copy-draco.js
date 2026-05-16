import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/three/examples/jsm/libs/draco");
const dest = join(root, "public/draco");

if (!existsSync(src)) process.exit(0);

mkdirSync(join(dest, "gltf"), { recursive: true });
cpSync(join(src, "gltf"), join(dest, "gltf"), { recursive: true });
cpSync(join(src, "draco_wasm_wrapper.js"), join(dest, "draco_wasm_wrapper.js"));
