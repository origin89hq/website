import { cp, mkdir } from "node:fs/promises";
import sharp from "sharp";
import "./prepare-buddy-assets.mjs";
// The design guide's hero. Imported here because nothing else ran it, and its
// output only existed because it had been committed.
import "../design/react/prepare-assets.mjs";

const root = new URL("../", import.meta.url);
const pkg = new URL("node_modules/@origin89/brand/", root);
const output = new URL("src/react/generated/", root),
  brand = new URL("public/brand/", root);
await mkdir(output, { recursive: true });
await mkdir(new URL("fonts/", brand), { recursive: true });

// Logos and fonts come from @origin89/brand, served from this origin because
// the stylesheets and the download list reference them by URL. Copied on every
// run so the package stays the only place either file lives; a second copy in
// git would be the same artwork under two owners, free to drift apart.
for (const [from, to] of [
  ["fonts/InterTight-Variable.ttf", "fonts/InterTight-Variable.ttf"],
  ["fonts/IBMPlexMono-Regular.ttf", "fonts/IBMPlexMono-Regular.ttf"],
  ["logos/origin89-horizontal-blue.svg", "origin89-blue.svg"],
  ["logos/origin89-horizontal-white.svg", "origin89-white.svg"],
  ["logos/plate-89-blue.svg", "plate-89.svg"],
])
  await cp(new URL(from, pkg), new URL(to, brand));

// Site-owned brand files, served from the same place as the package's so the
// download list is one directory rather than two.
for (const file of ["brand-tokens.css", "brand-tokens.json", "design-guide.md", "social-cover.png"])
  await cp(new URL(`src/assets/brand/${file}`, root), new URL(file, brand));

// The journal's Buddy portrait, the one size the React bundle inlines.
await sharp(new URL("art/portrait-welcoming-transparent.webp", pkg).pathname)
  .resize({ width: 320, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile(new URL("buddy.webp", output).pathname);
