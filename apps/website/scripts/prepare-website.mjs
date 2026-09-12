import { cp, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { prepareGeneratedAssets } from "./generated-assets.mjs";
import { prepareBuddyAssets } from "./prepare-buddy-assets.mjs";

const root = new URL("../", import.meta.url);
const pkg = new URL("node_modules/@origin89/brand/", root);
const output = new URL("src/react/generated/", root);
const brand = new URL("public/brand/", root);
const catalogue = new URL("catalogue.json", output);

const regenerated = await prepareGeneratedAssets({
  inputs: [
    ...["art/", "fonts/", "logos/", "brand.json", "package.json", "LICENSE.md"].map(
      (path) => new URL(path, pkg),
    ),
    new URL("src/assets/brand/", root),
    ...["prepare-website.mjs", "prepare-buddy-assets.mjs", "generated-assets.mjs"].map(
      (path) => new URL(path, import.meta.url),
    ),
  ],
  outputs: [output, brand],
  exclude: [catalogue],
  stamp: new URL(".website-assets.json", root),
  toolVersion: JSON.stringify(sharp.versions),
  async generate() {
    await mkdir(output, { recursive: true });
    await mkdir(new URL("fonts/", brand), { recursive: true });
    await prepareBuddyAssets();
    for (const [from, to] of [
      ["fonts/InterTight-Variable.ttf", "fonts/InterTight-Variable.ttf"],
      ["fonts/IBMPlexMono-Regular.ttf", "fonts/IBMPlexMono-Regular.ttf"],
      ["fonts/InterTight-OFL.txt", "fonts/InterTight-OFL.txt"],
      ["fonts/IBMPlexMono-OFL.txt", "fonts/IBMPlexMono-OFL.txt"],
      ["logos/origin89-horizontal-blue.svg", "origin89-blue.svg"],
      ["logos/origin89-horizontal-white.svg", "origin89-white.svg"],
      ["logos/plate-89-blue.svg", "plate-89.svg"],
      ["LICENSE.md", "LICENSE.md"],
    ])
      await cp(new URL(from, pkg), new URL(to, brand));
    for (const file of [
      "brand-tokens.css",
      "brand-tokens.json",
      "design-guide.md",
      "social-cover.png",
    ])
      await cp(new URL(`src/assets/brand/${file}`, root), new URL(file, brand));
    await sharp(new URL("art/portrait-welcoming-transparent.webp", pkg).pathname)
      .resize({ width: 320, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(new URL("buddy.webp", output).pathname);
  },
});
console.log(
  regenerated ? "Prepared website assets." : "Website assets verified; no regeneration needed.",
);
