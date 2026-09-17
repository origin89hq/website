// Package the site views into src/assets/art/ and record their provenance in site-art.json.
//
//   node scripts/site-art.mjs --brand /path/to/brand --renders /tmp/site-views
//   node scripts/site-art.mjs --check
//
// --renders holds the output of origin89hq/brand situations/source/build_site_views.py,
// which models each site from primitives and renders it opaque at 1536 x 1024. --brand is
// the checkout the renders came from; its commit and the two scripts' hashes go into the
// record. --check verifies that site-art.json covers every file in src/assets/art/ with
// the current sha256, and runs as a test.
//
// Requires cwebp on PATH.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
export const ART = fileURLToPath(new URL("../src/assets/art/", import.meta.url));
const RECORD = "site-art.json";
const UNRECORDED = new Set(["README.md", RECORD]);
// The brand scripts behind every render: one models the sites, the other renders them.
const SOURCES = ["situations/source/site_scenes.py", "situations/source/build_site_views.py"];
// The render each file comes from. The brand calls the mining site "mine".
const VIEWS = {
  "cottage.webp": "site-cottage.png",
  "mining.webp": "site-mine.png",
  "telecom.webp": "site-telecom.png",
};
const SIZE = { width: 1536, height: 1024 };
// Near-black gradients band early, and the renders are small enough to pay for the quality.
const QUALITY = 94;

const sha256 = async (path) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");

async function assetNames(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && !UNRECORDED.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

// Every file in the directory must be recorded with its current sha256, and nothing else.
export async function checkRecord(dir = ART) {
  const record = JSON.parse(await readFile(join(dir, RECORD), "utf8"));
  const names = await assetNames(dir);
  const problems = [];
  for (const name of names) {
    const entry = record.files[name];
    if (!entry) problems.push(`${name}: not recorded`);
    else if (entry.sha256 !== (await sha256(join(dir, name))))
      problems.push(`${name}: sha256 differs`);
  }
  for (const name of Object.keys(record.files)) {
    if (!names.includes(name)) problems.push(`${name}: recorded but missing`);
  }
  assert.equal(problems.length, 0, `${RECORD} is out of date:\n${problems.join("\n")}`);
  return names;
}

async function brandRecord(checkout) {
  const git = async (...args) => (await run("git", ["-C", checkout, ...args])).stdout.trim();
  const dirty = await git("status", "--porcelain", "--", ...SOURCES);
  assert.equal(dirty, "", `Brand render scripts differ from the checked-out commit:\n${dirty}`);
  const scripts = {};
  for (const path of SOURCES) scripts[path] = { sha256: await sha256(join(checkout, path)) };
  return { repository: "origin89hq/brand", commit: await git("rev-parse", "HEAD"), scripts };
}

async function packageViews(renders) {
  for (const [file, render] of Object.entries(VIEWS)) {
    const source = join(renders, render);
    const { width, height, hasAlpha } = await sharp(source).metadata();
    assert.deepEqual(
      { width, height, hasAlpha },
      { ...SIZE, hasAlpha: false },
      `${render} is not an opaque ${SIZE.width} x ${SIZE.height} render`,
    );
    await run("cwebp", ["-quiet", "-q", String(QUALITY), source, "-o", join(ART, file)]);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      brand: { type: "string" },
      renders: { type: "string" },
      check: { type: "boolean", default: false },
    },
  });
  if (values.check) {
    console.log(`${RECORD} matches ${(await checkRecord()).length} files`);
  } else {
    assert.ok(values.brand && values.renders, "Pass --brand and --renders, or --check");
    const brand = await brandRecord(resolve(values.brand));
    await packageViews(resolve(values.renders));
    const files = {};
    for (const [file, render] of Object.entries(VIEWS)) {
      files[file] = { sha256: await sha256(join(ART, file)), render };
    }
    await writeFile(join(ART, RECORD), `${JSON.stringify({ brand, files }, null, 2)}\n`);
    await checkRecord();
    console.log(`packaged ${Object.keys(VIEWS).join(", ")} from ${brand.commit.slice(0, 10)}`);
  }
}
