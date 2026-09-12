import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer, request as upstreamRequest } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("../design-dist", import.meta.url)));
const port = Number(process.env.BUDDY_PREVIEW_PORT ?? 8792);
const apiOrigin = new URL(process.env.BUDDY_API_ORIGIN ?? "http://127.0.0.1:8791");
if (!["localhost", "127.0.0.1"].includes(apiOrigin.hostname) || apiOrigin.protocol !== "http:")
  throw new Error("Buddy preview API must be local HTTP.");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

// Serve only the review build and the narrow Buddy API. Never expose Wrangler's explorer/evaluator.
createServer(async (request, response) => {
  response.setHeader("X-Robots-Tag", "noindex, nofollow");
  response.setHeader("X-Content-Type-Options", "nosniff");
  try {
    const url = new URL(request.url, "http://preview.local");
    if (url.pathname.startsWith("/api/buddy/")) {
      const origin = request.headers.origin;
      if (
        request.headers["sec-fetch-site"] === "cross-site" ||
        (origin &&
          (new URL(origin).host !== request.headers.host ||
            !["http:", "https:"].includes(new URL(origin).protocol)))
      ) {
        response.writeHead(403);
        response.end("Open Buddy from this preview.");
        return;
      }
      const headers = { ...request.headers, host: apiOrigin.host };
      if (origin) headers.origin = apiOrigin.origin;
      delete headers["x-forwarded-host"];
      delete headers["x-forwarded-proto"];
      const upstream = upstreamRequest(
        new URL(url.pathname + url.search, apiOrigin),
        { method: request.method, headers },
        (result) => {
          const outgoing = {
            ...result.headers,
            "x-robots-tag": "noindex, nofollow",
          };
          if (
            !/^(localhost|127\.0\.0\.1)(:|$)/.test(request.headers.host ?? "") &&
            outgoing["set-cookie"]
          )
            outgoing["set-cookie"] = outgoing["set-cookie"].map((cookie) =>
              /;\s*Secure/i.test(cookie) ? cookie : `${cookie}; Secure`,
            );
          response.writeHead(result.statusCode ?? 502, outgoing);
          result.pipe(response);
        },
      );
      upstream.setTimeout(30_000, () => upstream.destroy(new Error("Buddy preview timed out.")));
      upstream.on("error", () => {
        if (!response.headersSent) response.writeHead(502, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            error: "Buddy is temporarily unavailable. Your saved setup is still there.",
          }),
        );
      });
      request.on("aborted", () => upstream.destroy());
      request.pipe(upstream);
      return;
    }
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405);
      response.end();
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.split("/").some((part) => part.startsWith(".")) || pathname.includes("\0")) {
      response.writeHead(404);
      response.end();
      return;
    }
    let path = resolve(root, `.${pathname}`),
      status = 200;
    if (!path.startsWith(root + sep) && path !== root) {
      response.writeHead(404);
      response.end();
      return;
    }
    try {
      if ((await stat(path)).isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          response.writeHead(308, {
            Location: url.pathname + "/" + url.search,
          });
          response.end();
          return;
        }
        path = resolve(path, "index.html");
      }
      path = await realpath(path);
      if (!path.startsWith(root + sep)) throw new Error("Outside preview");
      if (!(await stat(path)).isFile()) throw new Error("Not a file");
    } catch {
      path = resolve(root, "404/index.html");
      status = 404;
    }
    response.writeHead(status, {
      "Content-Type": mime[extname(path)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    if (request.method === "HEAD") response.end();
    else
      createReadStream(path)
        .on("error", () => response.end())
        .pipe(response);
  } catch {
    if (!response.headersSent) response.writeHead(400);
    response.end();
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Buddy website preview: http://127.0.0.1:${port}/buddy/`),
);
