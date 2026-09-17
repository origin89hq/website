// Package the homepage renders into src/assets/home/ and record their provenance in home-media.json.
//
//   node scripts/package-home-media.mjs --hardware /path/to/hardware --renders /tmp/home-media
//   node scripts/package-home-media.mjs --hardware ... --renders ... --only chips,studio
//   node scripts/package-home-media.mjs --check
//
// --renders holds the outputs of the render scripts, which live with their inputs
// (origin89hq/hardware enclosure/blender/web/, origin89hq/brand situations/source/):
//   film/        frame-NNNN.png + anchors.json    hardware render_film.py
//   chips/       u7.png, u8.png                   hardware render_chips.py
//   studio/      connect-*.png, integrate-controller.png   hardware render_studio.py
//   dioramas/    audience-*.png                   brand build_site_miniatures.py
//   gerber-art/  *.webp                           hardware gerber_art.mjs
//   controller.glb                               hardware export_glb.py + gltf-transform webp, meshopt
//
// Requires ffmpeg (libx264, libsvtav1) and cwebp on PATH. --hardware is the origin89hq/hardware
// checkout the renders came from; its commit and input hashes go into the record.
// Files outside --only keep their existing record, which must still match. --check
// verifies that home-media.json covers every asset with the current sha256.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const { values } = parseArgs({
  options: {
    hardware: { type: "string" },
    renders: { type: "string" },
    only: { type: "string" },
    out: { type: "string" },
    check: { type: "boolean", default: false },
  },
});
const out = values.out ?? fileURLToPath(new URL("../src/assets/home/", import.meta.url));
const recordPath = join(out, "home-media.json");
const UNRECORDED = new Set(["README.md", "home-media.json"]);
const BACKGROUND = "#07090c";

const FAB = "boards/controller-a/build/2026-09-09";
const HARDWARE_INPUTS = {
  scene: "enclosure/blender/origin89.blend",
  gerber: `${FAB}/gerber.zip`,
  pick_and_place: `${FAB}/pick-and-place.csv`,
  bom: `${FAB}/bom.csv`,
};
const DETAILED = ["scene", "gerber", "pick_and_place", "bom"];
const STUDIO = [
  "connect-bottom",
  "connect-cable",
  "connect-harness",
  "connect-left",
  "connect-right",
];
const DIORAMAS = ["cottage", "mine", "telecom"];
// Recorded as repository:path; the scripts are not in this repository.
const HARDWARE_SCRIPTS = "origin89hq/hardware:enclosure/blender/web";
const BRAND_SCRIPTS = "origin89hq/brand:situations/source";
const GERBER_ART = ["gerber-board-dim", "gerber-u7", "trace-mask-board", "trace-mask-u7"];

const GROUPS = {
  film: {
    script: `${HARDWARE_SCRIPTS}/render_film.py`,
    inputs: DETAILED,
    files: ["hero-av1.mp4", "hero.mp4", "hero-720.mp4", "hero-poster.webp"],
    build: packageFilm,
  },
  chips: {
    script: `${HARDWARE_SCRIPTS}/render_chips.py`,
    inputs: DETAILED,
    files: ["chip-u7.webp", "chip-u8.webp"],
    build: packageChips,
  },
  studio: {
    script: `${HARDWARE_SCRIPTS}/render_studio.py`,
    inputs: DETAILED,
    files: [...STUDIO.map((name) => `${name}.webp`), "integrate-controller.webp"],
    build: packageStudio,
  },
  dioramas: {
    script: `${BRAND_SCRIPTS}/build_site_miniatures.py`,
    inputs: [],
    files: DIORAMAS.map((name) => `audience-3d-${name}.webp`),
    build: packageDioramas,
  },
  gerber: {
    script: `${HARDWARE_SCRIPTS}/gerber_art.mjs`,
    inputs: ["gerber"],
    files: GERBER_ART.map((name) => `${name}.webp`),
    build: (renders) =>
      Promise.all(
        GERBER_ART.map((name) =>
          copyFile(join(renders, "gerber-art", `${name}.webp`), join(out, `${name}.webp`)),
        ),
      ),
  },
  model: {
    script: `${HARDWARE_SCRIPTS}/export_glb.py`,
    inputs: DETAILED,
    files: ["controller.glb"],
    build: (renders) => copyFile(join(renders, "controller.glb"), join(out, "controller.glb")),
  },
};

const sha256 = async (path) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
const cwebp = (...args) => run("cwebp", ["-quiet", ...args]);
const ffmpeg = (...args) => run("ffmpeg", ["-y", "-loglevel", "error", ...args]);

async function readRecord() {
  try {
    return JSON.parse(await readFile(recordPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function assetNames() {
  const entries = await readdir(out, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && !UNRECORDED.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

// Every asset must be recorded with its current sha256; `regenerating` files are skipped.
async function checkRecord(record, regenerating = new Set()) {
  assert.ok(record, `Missing ${recordPath}`);
  const names = await assetNames();
  const problems = [];
  for (const name of names) {
    if (regenerating.has(name)) continue;
    const entry = record.files[name];
    if (!entry) problems.push(`${name}: not recorded`);
    else if (entry.sha256 !== (await sha256(join(out, name))))
      problems.push(`${name}: sha256 differs`);
  }
  for (const name of Object.keys(record.files)) {
    if (!names.includes(name) && !regenerating.has(name)) {
      problems.push(`${name}: recorded but missing`);
    }
  }
  assert.equal(problems.length, 0, `home-media.json is out of date:\n${problems.join("\n")}`);
}

async function hardwareRecord(checkout) {
  const git = async (...args) => (await run("git", ["-C", checkout, ...args])).stdout.trim();
  const paths = Object.values(HARDWARE_INPUTS);
  const dirty = await git("status", "--porcelain", "--", ...paths);
  assert.equal(dirty, "", `Hardware inputs differ from the checked-out commit:\n${dirty}`);
  const inputs = {};
  for (const [key, path] of Object.entries(HARDWARE_INPUTS)) {
    inputs[key] = { path, sha256: await sha256(join(checkout, path)) };
  }
  return { repository: "origin89hq/hardware", commit: await git("rev-parse", "HEAD"), inputs };
}

async function size(path) {
  const { width, height, hasAlpha } = await sharp(path).metadata();
  return { width, height, hasAlpha };
}

// Alpha bounds (alpha > 8) of a transparent render.
async function alphaBounds(path) {
  const { data, info } = await sharp(path)
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let [left, top, right, bottom] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] <= 8) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + 1);
      bottom = Math.max(bottom, y + 1);
    }
  }
  assert.ok(right > 0, `${path} is empty`);
  return { left, top, right, bottom, width: info.width, height: info.height };
}

async function packageFilm(renders) {
  const dir = join(renders, "film");
  const anchors = join(dir, "anchors.json");
  const track = JSON.parse(await readFile(anchors, "utf8"));
  for (let frame = 1; frame <= track.frames; frame++) {
    await stat(join(dir, `frame-${String(frame).padStart(4, "0")}.png`));
  }
  const first = join(dir, "frame-0001.png");
  // The encodes below assume 1920 x 1080 frames; anchors.json gives the frame rate and count.
  assert.deepEqual(await size(first), { width: 1920, height: 1080, hasAlpha: true });
  // Each encode starts from the frames. HeroFilm.tsx picks AV1 where the browser plays it,
  // H.264 otherwise, and the 720p H.264 on narrow screens.
  const frames = (scale, pixels) => [
    ...["-framerate", String(track.fps), "-i", join(dir, "frame-%04d.png")],
    ...["-f", "lavfi", "-i", `color=c=0x${BACKGROUND.slice(1)}:s=1920x1080:r=${track.fps}`],
    ...["-filter_complex", `[1:v][0:v]overlay=shortest=1${scale},format=${pixels}`],
    ...["-frames:v", String(track.frames)],
  ];
  await ffmpeg(
    ...frames("", "yuv420p10le"),
    ...["-c:v", "libsvtav1", "-preset", "6", "-crf", "40", "-g", "300"],
    ...["-movflags", "+faststart", join(out, "hero-av1.mp4")],
  );
  await ffmpeg(
    ...frames("", "yuv420p"),
    ...["-c:v", "libx264", "-preset", "slow", "-crf", "26"],
    ...["-movflags", "+faststart", join(out, "hero.mp4")],
  );
  await ffmpeg(
    ...frames(",scale=1280:720", "yuv420p"),
    ...["-c:v", "libx264", "-preset", "slow", "-crf", "26"],
    ...["-movflags", "+faststart", join(out, "hero-720.mp4")],
  );
  await sharp(first)
    .flatten({ background: BACKGROUND })
    .webp({ quality: 86 })
    .toFile(join(out, "hero-poster.webp"));
}

async function packageChips(renders, work) {
  for (const chip of ["u7", "u8"]) {
    const source = join(renders, "chips", `${chip}.png`);
    assert.deepEqual(await size(source), { width: 1000, height: 1000, hasAlpha: true });
    const scaled = join(work, `${chip}-720.png`);
    await ffmpeg("-i", source, "-vf", "scale=720:720", scaled);
    await cwebp("-q", "90", "-alpha_q", "100", scaled, "-o", join(out, `chip-${chip}.webp`));
  }
}

async function packageStudio(renders, work) {
  for (const name of STUDIO) {
    const source = join(renders, "studio", `${name}.png`);
    assert.deepEqual(await size(source), { width: 1760, height: 1210, hasAlpha: true });
    await cwebp(
      ...["-q", "86", "-alpha_q", "90", "-resize", "1600", "1100"],
      ...[source, "-o", join(out, `${name}.webp`)],
    );
  }
  // The hub uses a fixed 1200 x 1320 window of the Hero frame, scaled to 900 x 990.
  const source = join(renders, "studio", "integrate-controller.png");
  const bounds = await alphaBounds(source);
  assert.deepEqual([bounds.width, bounds.height], [1600, 1800]);
  const crop = { left: 160, top: 20, width: 1200, height: 1320 };
  assert.ok(
    bounds.left > crop.left &&
      bounds.top > crop.top &&
      bounds.right < crop.left + crop.width &&
      bounds.bottom < crop.top + crop.height,
    "The Controller no longer fits the integrate crop; check the Hero camera",
  );
  const cropped = join(work, "integrate-controller.png");
  await ffmpeg(
    ...[
      "-i",
      source,
      "-vf",
      `crop=${crop.width}:${crop.height}:${crop.left}:${crop.top},scale=900:990`,
    ],
    cropped,
  );
  await cwebp("-q", "88", "-alpha_q", "95", cropped, "-o", join(out, "integrate-controller.webp"));
}

async function packageDioramas(renders, work) {
  const pad = 30;
  for (const name of DIORAMAS) {
    const source = join(renders, "dioramas", `audience-${name}.png`);
    const b = await alphaBounds(source);
    const left = Math.max(0, b.left - pad);
    const top = Math.max(0, b.top - pad);
    const region = {
      left,
      top,
      width: Math.min(b.width, b.right + pad) - left,
      height: Math.min(b.height, b.bottom + pad) - top,
    };
    const cropped = join(work, `audience-${name}.png`);
    await sharp(source).extract(region).png().toFile(cropped);
    await cwebp("-q", "88", "-alpha_q", "95", cropped, "-o", join(out, `audience-3d-${name}.webp`));
  }
}

const existing = await readRecord();
if (values.check) {
  await checkRecord(existing);
  console.log(`home-media.json matches ${(await assetNames()).length} files`);
  process.exit(0);
}

assert.ok(values.hardware && values.renders, "Pass --hardware and --renders, or --check");
const only = values.only ? values.only.split(",") : Object.keys(GROUPS);
for (const name of only) assert.ok(GROUPS[name], `Unknown group ${name}`);
const hardware = await hardwareRecord(resolve(values.hardware));
if (existing) {
  await checkRecord(existing, new Set(only.flatMap((name) => GROUPS[name].files)));
  const skipped = Object.keys(GROUPS).filter((name) => !only.includes(name));
  const stale = skipped.filter((name) =>
    GROUPS[name].inputs.some(
      (key) => existing.hardware.inputs[key]?.sha256 !== hardware.inputs[key].sha256,
    ),
  );
  assert.equal(stale.length, 0, `Hardware inputs changed; also package: ${stale.join(", ")}`);
}

const renders = resolve(values.renders);
const work = await mkdtemp(join(tmpdir(), "home-media-"));
const files = { ...existing?.files };
try {
  for (const name of only) {
    const group = GROUPS[name];
    await group.build(renders, work);
    for (const file of group.files) {
      files[file] = {
        sha256: await sha256(join(out, file)),
        script: group.script,
        inputs: group.inputs,
      };
    }
    console.log(`packaged ${name}: ${group.files.join(", ")}`);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(recordPath, `${JSON.stringify({ hardware, files: sorted }, null, 2)}\n`);
await checkRecord(JSON.parse(await readFile(recordPath, "utf8")));
