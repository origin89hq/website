import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const input = process.argv[2];
assert.ok(input, "Pass the directory produced by render-controller-reveal.py");
const output = new URL("../src/assets/product/", import.meta.url);
const plates = ["closed", "base"];
const width = 1200;
const metadata = await Promise.all(
  plates.map(async (plate) => JSON.parse(await readFile(resolve(input, `${plate}.json`), "utf8"))),
);
for (const key of ["width", "height", "camera", "ortho_scale", "scene_sha256", "pcb_sha256"]) {
  assert.ok(metadata[0][key] !== undefined, `Missing ${key}`);
  for (const plate of metadata) assert.deepEqual(plate[key], metadata[0][key], key);
}

// Crop both plates to the union of their alpha bounds so they stay aligned. The
// harness leaves the bottom of the frame, so the crop keeps the full height.
let [left, top, right] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, -1];
for (const plate of plates) {
  const { data, info } = await sharp(resolve(input, `${plate}.png`))
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(info.width, metadata[0].width);
  assert.equal(info.height, metadata[0].height);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] <= 8) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + 1);
    }
  }
}
assert.ok(right > 0, "The plates are empty");
assert.ok(left > 0 && top > 0 && right < metadata[0].width, "Widen the source camera");
const crop = [
  Math.max(0, left - 16),
  Math.max(0, top - 16),
  Math.min(metadata[0].width, right + 16),
  metadata[0].height,
];
const region = { left: crop[0], top: crop[1], width: crop[2] - crop[0], height: crop[3] - crop[1] };
for (const plate of plates) {
  await sharp(resolve(input, `${plate}.png`))
    .extract(region)
    .resize({ width })
    .webp({ quality: 87, effort: 6 })
    .toFile(fileURLToPath(new URL(`controller-reveal-${plate}-${width}.webp`, output)));
}
const record = {
  width,
  height: Math.round((region.height * width) / region.width),
  crop,
  scene_sha256: metadata[0].scene_sha256,
  pcb_sha256: metadata[0].pcb_sha256,
};
await writeFile(new URL("controller-reveal.json", output), `${JSON.stringify(record, null, 2)}\n`);
