import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await build({ configFile: path.join(root, "backend/vite.config.mjs") });

const workerDirectory = path.join(root, "dist/server");
mkdirSync(workerDirectory, { recursive: true });
const config = {
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "hotel-eco-antigua",
  "main": "index.js",
  "compatibility_date": "2026-05-22",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": true,
  "assets": { "directory": "../client", "binding": "ASSETS", "run_worker_first": ["/api/*"] },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "hotel-eco-antigua",
    "database_id": "00000000-0000-4000-8000-000000000000",
    "migrations_dir": "../../drizzle",
  }],
};
writeFileSync(path.join(workerDirectory, "wrangler.json"), `${JSON.stringify(config, null, 2)}\n`);
