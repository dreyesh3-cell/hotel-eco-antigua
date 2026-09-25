import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function createAzureDatabase(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error("Configura DATABASE_URL para conectar Azure Database for PostgreSQL.");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: true },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  function prepare(query) {
    let values = [];
    return {
      bind(...parameters) { values = parameters; return this; },
      async all() {
        const result = await pool.query(toPostgres(query), values);
        return { results: result.rows };
      },
      async first() {
        const result = await pool.query(toPostgres(query), values);
        return result.rows[0] ?? null;
      },
      async run() {
        const result = await pool.query(toPostgres(query), values);
        return { meta: { changes: result.rowCount ?? 0 } };
      },
    };
  }

  return {
    pool,
    database: { prepare },
    async initialize() {
      const schema = await readFile(path.join(root, "azure", "schema.sql"), "utf8");
      await pool.query(schema);
      await pool.query("SELECT 1");
    },
    close: () => pool.end(),
  };
}

function toPostgres(query) {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}
