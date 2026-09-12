import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const input = process.argv[2];
assert.ok(input, "Pass the directory produced by render-controller-study.py");
const output = new URL("../src/assets/product/", import.meta.url);
const plates = [
  ["closed", "closed"],
  ["base", "base"],
  ["cover", "cover-on"],
];
const metadata = await Promise.all(
  plates.map(async ([, plate]) =>
    JSON.parse(await readFile(resolve(input, `${plate}.json`), "utf8")),
  ),
);
for (const key of ["width", "height", "camera", "ortho_scale", "scene_sha256", "pcb_sha256"]) {
  assert.ok(metadata[0][key] !== undefined, `Missing ${key}`);
  for (const plate of metadata) assert.deepEqual(plate[key], metadata[0][key], key);
}
assert.equal(metadata[0].height / metadata[0].width, 9 / 8);
for (const [part, plate] of plates) {
  const source = resolve(input, `${plate}.png`);
  const image = await sharp(source).metadata();
  assert.equal(image.width, metadata[0].width);
  assert.equal(image.height, metadata[0].height);
  assert.ok(image.hasAlpha, "Plates require a transparent background");
  for (const width of [640, 1200]) {
    await sharp(source)
      .resize({ width })
      .webp({ quality: 90, effort: 6 })
      .toFile(new URL(`controller-study-${part}-${width}.webp`, output).pathname);
  }
}
await writeFile(
  new URL("controller-study.json", output),
  `${JSON.stringify(metadata[0], null, 2)}\n`,
);
