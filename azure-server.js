import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "./backend/src/index.js";
import { createAzureDatabase } from "./backend/azure-db.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(root, "dist", "client");
const database = createAzureDatabase();
await database.initialize();

const env = {
  DB: database.database,
  ASSETS: { fetch: serveAsset },
};

const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    for await (const chunk of incoming) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
      else if (value !== undefined) headers.set(name, value);
    }
    const init = { method: incoming.method, headers };
    if (body.length && incoming.method !== "GET" && incoming.method !== "HEAD") init.body = body;
    const request = new Request(`http://${incoming.headers.host ?? "localhost"}${incoming.url ?? "/"}`, init);
    const response = await worker.fetch(request, env);
    const responseBody = Buffer.from(await response.arrayBuffer());
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(responseBody);
  } catch (error) {
    console.error("Error atendiendo una solicitud", error);
    outgoing.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    outgoing.end("No fue posible atender la solicitud.");
  }
});

async function serveAsset(request) {
  const url = new URL(request.url);
  let requestedPath;
  try { requestedPath = decodeURIComponent(url.pathname); }
  catch { return new Response("Ruta no válida.", { status: 400 }); }
  const relativePath = requestedPath.replace(/^\/+/, "");
  let filePath = path.resolve(staticRoot, relativePath || "index.html");
  if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${path.sep}`)) {
    return new Response("No encontrado.", { status: 404 });
  }
  try {
    if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, "index.html");
    const contents = await readFile(filePath);
    return new Response(contents, { headers: { "Content-Type": contentType(filePath) } });
  } catch {
    return new Response("No encontrado.", { status: 404 });
  }
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return ({
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
  })[extension] ?? "application/octet-stream";
}

const port = Number(process.env.PORT ?? 8080);
server.listen(port, "0.0.0.0", () => console.log(`Hotel Eco Antigua listo en el puerto ${port}.`));

async function close() {
  server.close();
  await database.close();
}
process.once("SIGTERM", close);
process.once("SIGINT", close);
