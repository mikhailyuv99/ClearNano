import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        terms: "terms.html",
        privacy: "privacy.html",
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "vendor-three";
        },
      },
    },
  },
});
