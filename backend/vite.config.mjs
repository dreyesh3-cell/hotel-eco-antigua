import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  configFile: false,
  build: {
    outDir: path.resolve(projectRoot, "dist/server"),
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: true,
    minify: true,
    lib: {
      entry: path.resolve(projectRoot, "backend/src/index.js"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: { output: { entryFileNames: "index.js", format: "es" } },
  },
});
