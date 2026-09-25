import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  root: path.resolve(projectRoot, "frontend"),
  plugins: [react()],
  publicDir: path.resolve(projectRoot, "frontend/public"),
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: { "/api": { target: "http://127.0.0.1:8787", changeOrigin: false } },
  },
  build: {
    outDir: path.resolve(projectRoot, "dist/client"),
    emptyOutDir: true,
    sourcemap: true,
  },
});
