// Package the site views into src/assets/art/ and record their provenance in site-art.json.
//
//   node scripts/site-art.mjs --brand /path/to/brand --renders /tmp/site-views
//   node scripts/site-art.mjs --check
//   node scripts/site-art.mjs --check --brand /path/to/brand
//   node scripts/site-art.mjs --repoint <commit> --brand /path/to/brand
//
// --renders holds the output of origin89hq/brand situations/source/build_site_views.py,
// which models each site from primitives and renders it opaque at 1536 x 1024. --brand is
// the checkout the renders came from; its commit and the two scripts' hashes go into the
// record. --check verifies that site-art.json covers every file in src/assets/art/ with
// the current sha256, and runs as a test; adding --brand also verifies the recorded
// scripts against the recorded commit in that checkout. --repoint moves the record onto
// another commit holding the same scripts, which a squash merge of the brand PR requires.
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
// Written beside the renders by build_site_views.py.
const STAMP = "render-source.json";
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

// The directory and the record must both hold exactly the views in VIEWS, each with its
// current sha256. Checking their overlap instead would accept a view dropped from both,
// and would wave through a stray file whose entry simply omits `render`.
export async function checkRecord(dir = ART) {
  const record = JSON.parse(await readFile(join(dir, RECORD), "utf8"));
  const expected = Object.keys(VIEWS).sort();
  const names = await assetNames(dir);
  const problems = [];
  for (const name of expected) {
    const entry = record.files[name];
    const present = names.includes(name);
    if (!present) problems.push(`${name}: missing from the directory`);
    if (!entry) problems.push(`${name}: not recorded`);
    else if (entry.render !== VIEWS[name])
      problems.push(`${name}: recorded against ${entry.render}, not ${VIEWS[name]}`);
    else if (present && entry.sha256 !== (await sha256(join(dir, name))))
      problems.push(`${name}: sha256 differs`);
  }
  for (const name of names) {
    if (!expected.includes(name)) problems.push(`${name}: not a site view`);
  }
  for (const name of Object.keys(record.files)) {
    if (!expected.includes(name)) problems.push(`${name}: recorded but not a site view`);
  }
  assert.equal(problems.length, 0, `${RECORD} is out of date:\n${problems.join("\n")}`);
  return names;
}

async function scriptsAt(checkout, commit, scripts) {
  for (const [path, entry] of Object.entries(scripts)) {
    const blob = await run("git", ["-C", checkout, "show", `${commit}:${path}`], {
      encoding: "buffer",
      maxBuffer: 1 << 24,
    });
    const digest = createHash("sha256").update(blob.stdout).digest("hex");
    assert.equal(digest, entry.sha256, `${path} at ${commit} is not what ${RECORD} records`);
  }
}

// The recorded scripts must still hash the same at the recorded commit. Needs a brand
// checkout that has the commit; `--check` alone cannot reach it and skips this.
export async function checkBrand(checkout, dir = ART) {
  const record = JSON.parse(await readFile(join(dir, RECORD), "utf8"));
  assert.equal(record.brand.repository, "origin89hq/brand");
  await scriptsAt(checkout, record.brand.commit, record.brand.scripts);
  return record.brand.commit;
}

// A squash merge replaces the commit the renders were packaged from, and deleting the
// branch strands it, so the record has to follow the scripts to their commit on main.
// Only the commit moves, and only to one holding the scripts byte for byte.
export async function repoint(checkout, commit, dir = ART) {
  const path = join(dir, RECORD);
  const record = JSON.parse(await readFile(path, "utf8"));
  await scriptsAt(checkout, commit, record.brand.scripts);
  const moved = { ...record, brand: { ...record.brand, commit } };
  await writeFile(path, `${JSON.stringify(moved, null, 2)}\n`);
  return commit;
}

// The renders carry the hashes of the scripts that made them; the checkout being
// recorded must hold those same scripts, or the record would attribute them wrongly.
async function bindRenders(renders, checkout) {
  const stamp = JSON.parse(await readFile(join(renders, STAMP), "utf8"));
  for (const path of SOURCES) {
    const name = path.slice(path.lastIndexOf("/") + 1);
    assert.equal(
      stamp.scripts?.[name],
      await sha256(join(checkout, path)),
      `${name} in ${checkout} is not the script that produced these renders`,
    );
  }
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
      repoint: { type: "string" },
    },
  });
  if (values.repoint) {
    assert.ok(values.brand, "Pass --brand with --repoint");
    const moved = await repoint(resolve(values.brand), values.repoint);
    await checkRecord();
    await checkBrand(resolve(values.brand));
    console.log(`${RECORD} now records ${moved.slice(0, 10)}`);
  } else if (values.check) {
    const files = await checkRecord();
    let where = "";
    if (values.brand) where = ` at ${(await checkBrand(resolve(values.brand))).slice(0, 10)}`;
    console.log(`${RECORD} matches ${files.length} files${where}`);
  } else {
    assert.ok(values.brand && values.renders, "Pass --brand and --renders, or --check");
    const checkout = resolve(values.brand);
    const renders = resolve(values.renders);
    await bindRenders(renders, checkout);
    const brand = await brandRecord(checkout);
    await packageViews(renders);
    const files = {};
    for (const [file, render] of Object.entries(VIEWS)) {
      files[file] = { sha256: await sha256(join(ART, file)), render };
    }
    await writeFile(join(ART, RECORD), `${JSON.stringify({ brand, files }, null, 2)}\n`);
    await checkRecord();
    await checkBrand(checkout);
    console.log(`packaged ${Object.keys(VIEWS).join(", ")} from ${brand.commit.slice(0, 10)}`);
  }
}
