import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const root = new URL("../", import.meta.url),
  out = new URL("dist/", root),
  server = new URL(".website-server/", root);
await build({ configFile: fileURLToPath(new URL("vite.config.mjs", root)) });
await build({
  configFile: fileURLToPath(new URL("vite.config.mjs", root)),
  build: {
    ssr: fileURLToPath(new URL("src/react/entry-server.tsx", root)),
    outDir: fileURLToPath(server),
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
const { render, publicPaths, pageMeta, legacyRoutes } = await import(
  pathToFileURL(fileURLToPath(new URL("entry-server.js", server)))
);
const template = await readFile(new URL("index.html", out), "utf8");
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const path of [...publicPaths, "/404/"]) {
  const meta = pageMeta(path),
    { body, hydration } = await render(path);
  if (!body.includes("<h1") && !path.startsWith("/app/"))
    throw new Error("Empty pre-render: " + path);
  let html = template
    .replace(
      '<link rel="icon" href="/brand/plate-89.svg" type="image/svg+xml" />',
      `<link rel="icon" href="${meta.icon.href}" type="${meta.icon.type}" />` +
        (meta.appIcon ? `<link rel="apple-touch-icon" href="${meta.appIcon}" />` : "") +
        (meta.manifest ? `<link rel="manifest" href="${meta.manifest}" />` : ""),
    )
    .replace("<!--app-html-->", body)
    .replace("</body>", hydration.replaceAll("\u0000", "\\u0000") + "</body>")
    .replace("<title>Origin89</title>", `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      'name="description" content="Open control for your site."',
      `name="description" content="${escapeHtml(meta.description)}"`,
    )
    .replace(
      'property="og:title" content="Origin89"',
      `property="og:title" content="${escapeHtml(meta.title)}"`,
    )
    .replace(
      'property="og:description" content="Open control for your site."',
      `property="og:description" content="${escapeHtml(meta.description)}"`,
    )
    .replaceAll(
      'href="https://origin89.com/"',
      `href="${meta.canonical || "https://origin89.com/404/"}"`,
    )
    .replace(
      'property="og:url" content="https://origin89.com/"',
      `property="og:url" content="${meta.canonical || "https://origin89.com/404/"}"`,
    );
  if (meta.noindex)
    html = html.replace(
      'name="robots" content="index, follow"',
      'name="robots" content="noindex, follow"',
    );
  const file = new URL(path === "/404/" ? "404.html" : path.slice(1) + "index.html", out);
  await mkdir(new URL(".", file), { recursive: true });
  await writeFile(file, html);
}
const sitemap = publicPaths
  .filter((path) => !pageMeta(path).noindex)
  .map((path) => `<url><loc>https://origin89.com${path}</loc></url>`)
  .join("");
await writeFile(
  new URL("sitemap.xml", out),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`,
);
await writeFile(
  new URL("robots.txt", out),
  "User-agent: *\nAllow: /\nDisallow: /storybook/\nSitemap: https://origin89.com/sitemap.xml\n",
);
await writeFile(
  new URL("_redirects", out),
  Object.entries(legacyRoutes)
    .map(([from, to]) => `${from} ${to} 301`)
    .join("\n") + "\n",
);
await writeFile(
  new URL("_headers", out),
  "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/brand/*\n  X-Content-Type-Options: nosniff\n/storybook/*\n  X-Robots-Tag: noindex, nofollow\n",
);
// Concrete redirects also work in the existing ngrok file preview.
for (const [from, to] of Object.entries(legacyRoutes)) {
  if (!from.endsWith("/")) continue;
  const file = new URL(from.slice(1) + "index.html", out);
  await mkdir(new URL(".", file), { recursive: true });
  await writeFile(
    file,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page moved · Origin89</title><link rel="canonical" href="https://origin89.com${to}"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script><noscript><meta http-equiv="refresh" content="0;url=${to}"></noscript></head><body><a href="${to}">Continue to Origin89</a></body></html>`,
  );
}
console.log(
  `Pre-rendered ${publicPaths.length} pages and a 404 page. Wrote sitemap and migration redirects.`,
);
