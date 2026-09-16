// Render board A's top-side layer masks from the fabrication Gerbers.
//
// Input: the extracted gerber.zip from boards/controller-a/build/<date>/ in
// origin89hq/hardware. Output: top-copper.png, top-pads.png, top-silk.png and
// top-board.png (white = present, black = absent) at 64 px/mm over the 100 x 125 mm
// board outline, plus top-layers.json. build-detailed-board.py textures the board
// with these masks and gerber-art.mjs derives the homepage artwork from them.
//
// pcb-stackup is not a website dependency. Run from apps/website with a pinned copy:
//
//   unzip -o /path/to/hardware/boards/controller-a/build/2026-09-09/gerber.zip \
//     -d /tmp/home-media/gerber
//   npx --yes --package pcb-stackup@4.2.8 -- \
//     node scripts/render/gerber-layers.mjs --gerbers /tmp/home-media/gerber \
//     --out /tmp/home-media/gerber-layers
//
// sharp comes from the website's own dependencies. The SVG width and height are
// rewritten to pixels before rasterising because sharp mis-sizes SVGs in mm units.
import assert from "node:assert/strict";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { delimiter, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const { values } = parseArgs({
  options: {
    gerbers: { type: "string" },
    out: { type: "string" },
    "px-per-mm": { type: "string", default: "64" },
  },
});
assert.ok(values.gerbers && values.out, "Usage: gerber-layers.mjs --gerbers DIR --out DIR");
const pxPerMm = Number(values["px-per-mm"]);
assert.ok(Number.isInteger(pxPerMm) && pxPerMm > 0, "--px-per-mm must be a positive integer");

// npx and pnpm put their node_modules/.bin on PATH; NODE_PATH also works.
function loadPcbStackup() {
  const bins = (process.env.PATH ?? "")
    .split(delimiter)
    .filter((dir) => dir.endsWith(join("node_modules", ".bin")));
  for (const base of [import.meta.filename, ...bins.map((dir) => join(dir, "..", "x.js"))]) {
    try {
      return createRequire(base)("pcb-stackup");
    } catch {}
  }
  throw new Error("pcb-stackup not found; run through npx --package pcb-stackup@4.2.8");
}
const stackup = loadPcbStackup();

// Top side only: drills, outline, top copper, paste, mask and silkscreen.
const files = (await readdir(values.gerbers))
  .filter((file) => /\.(G..|DRL)$/i.test(file) && !/Document|DrillDrawing|Bottom|Inner/.test(file))
  .sort();
assert.ok(files.length > 0, `No Gerber files in ${values.gerbers}`);
const layers = await Promise.all(
  files.map(async (filename) => ({
    filename,
    gerber: await readFile(join(values.gerbers, filename), "utf8"),
  })),
);

const clear = "rgba(0,0,0,0)";
// Stackup colours per mask: fr4, copper, finish (exposed pads), mask, silk, paste, outline.
const passes = {
  copper: { fr4: "#000", cu: "#fff", cf: "#fff", sm: clear, ss: clear, sp: clear, out: "#000" },
  pads: { fr4: "#000", cu: "#000", cf: "#fff", sm: clear, ss: clear, sp: clear, out: "#000" },
  silk: { fr4: "#000", cu: "#000", cf: "#000", sm: clear, ss: "#fff", sp: clear, out: "#000" },
  board: { fr4: "#fff", cu: "#fff", cf: "#fff", sm: clear, ss: "#fff", sp: clear, out: "#fff" },
};

await mkdir(values.out, { recursive: true });
let record;
for (const [name, color] of Object.entries(passes)) {
  const { top, layers: detected } = await stackup(layers, { color, useOutline: true });
  // board_detail.py maps UVs onto this outline: 100 x 125 mm centred on the origin.
  assert.equal(top.units, "mm");
  assert.deepEqual(top.viewBox, [-50000, -62500, 100000, 125000], "Board outline changed");
  const width = Math.round((top.viewBox[2] / 1000) * pxPerMm);
  const height = Math.round((top.viewBox[3] / 1000) * pxPerMm);
  const svg = top.svg.replace(
    /^(<svg[^>]*?) width="[^"]*" height="[^"]*"/,
    `$1 width="${width}" height="${height}"`,
  );
  assert.notEqual(svg, top.svg, "SVG size attributes not found");
  const png = resolve(values.out, `top-${name}.png`);
  await sharp(Buffer.from(svg), { density: 72, limitInputPixels: false })
    .flatten({ background: "#000" })
    .greyscale()
    .png()
    .toFile(png);
  const size = await sharp(png).metadata();
  assert.equal(size.width, width);
  assert.equal(size.height, height);
  record ??= {
    px_per_mm: pxPerMm,
    view_box: top.viewBox,
    units: top.units,
    layers: detected.map((layer) => [layer.filename, layer.type, layer.side]),
  };
  console.log(`top-${name}.png ${width}x${height}`);
}
await writeFile(resolve(values.out, "top-layers.json"), `${JSON.stringify(record, null, 2)}\n`);
