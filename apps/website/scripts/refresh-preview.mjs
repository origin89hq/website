import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url),
  source = new URL("dist/", root),
  target = new URL("design-dist/", root);
// Require a complete build before replacing the generated preview. Copying over
// old output leaves retired images and their hashed bundles publicly reachable.
await access(new URL("index.html", source));
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
// This folder is a review surface. Keep it out of search indexes.
const { readdir } = await import("node:fs/promises");
async function mark(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(item.name + (item.isDirectory() ? "/" : ""), directory);
    if (item.isDirectory()) {
      if (item.name !== "storybook" && item.name !== "assets") await mark(path);
    } else if (item.name.endsWith(".html")) {
      const html = await readFile(path, "utf8");
      await writeFile(
        path,
        html.replace(
          'name="robots" content="index, follow"',
          'name="robots" content="noindex, nofollow"',
        ),
      );
    }
  }
}
await mark(target);
console.log("Refreshed the existing ngrok file preview.");
