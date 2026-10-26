import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

test("el pie de página identifica la rama y el commit de la compilación", async (t) => {
  process.env.VITE_BUILD_REF = "qa";
  process.env.VITE_BUILD_SHA = "abcdef1234567890";

  const viteConfig = fileURLToPath(new URL("./vite.config.mjs", import.meta.url));
  const vite = await createServer({
    configFile: viteConfig,
    server: { middlewareMode: true },
    appType: "custom",
  });
  t.after(() => vite.close());

  const { default: Home } = await vite.ssrLoadModule("/src/App.tsx");
  const markup = renderToStaticMarkup(createElement(Home));

  assert.match(markup, /Versión qa · abcdef1/);
});
