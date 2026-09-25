import { readFileSync, writeFileSync } from "node:fs";

const file = "dist/server/wrangler.json";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!accountId || !databaseId) {
  throw new Error("Define CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_D1_DATABASE_ID como variables secretas antes de publicar.");
}
const config = JSON.parse(readFileSync(file, "utf8"));
const database = config.d1_databases?.find((item) => item.binding === "DB");
if (!database) throw new Error("No se encontró la conexión D1 `DB` en el Worker compilado.");
config.account_id = accountId;
database.database_id = databaseId;
writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
console.log("La configuración del Worker quedó lista para la cuenta y base de datos indicadas.");
