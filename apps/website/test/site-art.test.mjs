import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { ART, checkBrand, checkRecord, repoint } from "../scripts/site-art.mjs";

const run = promisify(execFile);
const SCRIPTS = ["situations/source/site_scenes.py", "situations/source/build_site_views.py"];

// A stand-in brand repository, so the check runs anywhere the tests do.
async function brandCheckout(t, contents) {
  const dir = await mkdtemp(join(tmpdir(), "brand-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const git = (...args) => run("git", ["-C", dir, ...args]);
  await git("init", "--quiet");
  await git("config", "user.email", "test@example.com");
  await git("config", "user.name", "Test");
  for (const [path, body] of Object.entries(contents)) {
    await mkdir(join(dir, dirname(path)), { recursive: true });
    await writeFile(join(dir, path), body);
  }
  await git("add", ".");
  await git("commit", "--quiet", "-m", "scripts");
  const commit = (await git("rev-parse", "HEAD")).stdout.trim();
  return { dir, commit };
}

async function copy(t) {
  const dir = await mkdtemp(join(tmpdir(), "site-art-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const record = JSON.parse(await readFile(join(ART, "site-art.json"), "utf8"));
  for (const name of Object.keys(record.files)) await copyFile(join(ART, name), join(dir, name));
  const write = (next) => writeFile(join(dir, "site-art.json"), JSON.stringify(next));
  await write(record);
  return { dir, record, write };
}

test("the committed site art matches its record", async () => {
  assert.deepEqual(await checkRecord(), ["cottage.webp", "mining.webp", "telecom.webp"]);
});

test("every site image names the brand commit and render it came from", async () => {
  const record = JSON.parse(await readFile(join(ART, "site-art.json"), "utf8"));
  assert.equal(record.brand.repository, "origin89hq/brand");
  assert.match(record.brand.commit, /^[0-9a-f]{40}$/);
  assert.deepEqual(Object.keys(record.brand.scripts), [
    "situations/source/site_scenes.py",
    "situations/source/build_site_views.py",
  ]);
  for (const [name, entry] of Object.entries(record.files)) {
    assert.match(entry.sha256, /^[0-9a-f]{64}$/, name);
    assert.match(entry.render, /^site-[a-z]+\.png$/, name);
  }
});

test("a changed, unrecorded or missing image fails the check", async (t) => {
  const { dir, record, write } = await copy(t);
  await writeFile(join(dir, "cottage.webp"), "not the published render");
  await assert.rejects(checkRecord(dir), /cottage\.webp: sha256 differs/);

  await copyFile(join(ART, "cottage.webp"), join(dir, "cottage.webp"));
  await copyFile(join(ART, "telecom.webp"), join(dir, "extra.webp"));
  await assert.rejects(checkRecord(dir), /extra\.webp: not a site view/);

  await rm(join(dir, "extra.webp"));
  await rm(join(dir, "mining.webp"));
  await assert.rejects(checkRecord(dir), /mining\.webp: missing from the directory/);

  await copyFile(join(ART, "mining.webp"), join(dir, "mining.webp"));
  await write({ ...record, files: {} });
  await assert.rejects(checkRecord(dir), /cottage\.webp: not recorded/);
});

test("the README and the record itself are not treated as assets", async (t) => {
  const { dir } = await copy(t);
  await writeFile(join(dir, "README.md"), "# Site art");
  await writeFile(join(dir, ".DS_Store"), "");
  assert.deepEqual(await checkRecord(dir), ["cottage.webp", "mining.webp", "telecom.webp"]);
});

test("a render mapped to the wrong view fails the check", async (t) => {
  const { dir, record, write } = await copy(t);
  await write({
    ...record,
    files: {
      ...record.files,
      "cottage.webp": { ...record.files["cottage.webp"], render: "site-mine.png" },
    },
  });
  await assert.rejects(
    checkRecord(dir),
    /cottage\.webp: recorded against site-mine\.png, not site-cottage\.png/,
  );
});

test("the recorded scripts must hash the same at the recorded commit", async (t) => {
  const bodies = Object.fromEntries(SCRIPTS.map((path, i) => [path, `# script ${i}\n`]));
  const { dir: brand, commit } = await brandCheckout(t, bodies);
  const { dir, record, write } = await copy(t);
  const { createHash } = await import("node:crypto");
  const digest = (body) => createHash("sha256").update(body).digest("hex");
  const scripts = Object.fromEntries(
    SCRIPTS.map((path) => [path, { sha256: digest(bodies[path]) }]),
  );

  await write({ ...record, brand: { repository: "origin89hq/brand", commit, scripts } });
  assert.equal(await checkBrand(brand, dir), commit);

  const tampered = { ...scripts, [SCRIPTS[0]]: { sha256: digest("# something else\n") } };
  await write({ ...record, brand: { repository: "origin89hq/brand", commit, scripts: tampered } });
  await assert.rejects(
    checkBrand(brand, dir),
    new RegExp(`${SCRIPTS[0].replace(/[./]/g, "\\$&")} at ${commit}`),
  );

  await write({ ...record, brand: { repository: "someone/else", commit, scripts } });
  await assert.rejects(checkBrand(brand, dir), /origin89hq\/brand/);
});

test("a view dropped from both the directory and the record still fails", async (t) => {
  const { dir, record, write } = await copy(t);
  const files = { ...record.files };
  delete files["mining.webp"];
  await write({ ...record, files });
  await rm(join(dir, "mining.webp"));
  await assert.rejects(checkRecord(dir), /mining\.webp: missing from the directory/);
  await assert.rejects(checkRecord(dir), /mining\.webp: not recorded/);
});

test("a stray file is not excused by a record entry without a render", async (t) => {
  const { dir, record, write } = await copy(t);
  await copyFile(join(ART, "telecom.webp"), join(dir, "extra.webp"));
  await write({
    ...record,
    files: { ...record.files, "extra.webp": { sha256: record.files["telecom.webp"].sha256 } },
  });
  await assert.rejects(checkRecord(dir), /extra\.webp: not a site view/);
  await assert.rejects(checkRecord(dir), /extra\.webp: recorded but not a site view/);
});

test("repointing follows the scripts to another commit, and refuses one without them", async (t) => {
  const bodies = Object.fromEntries(SCRIPTS.map((path, i) => [path, `# script ${i}\n`]));
  const { dir: brand, commit } = await brandCheckout(t, bodies);
  const git = (...args) => run("git", ["-C", brand, ...args]);
  // A squash-style commit carrying the same scripts, and one that changes them.
  await git("commit", "--quiet", "--allow-empty", "-m", "squashed");
  const squashed = (await git("rev-parse", "HEAD")).stdout.trim();
  await writeFile(join(brand, SCRIPTS[0]), "# rewritten\n");
  await git("add", ".");
  await git("commit", "--quiet", "-m", "rewrite");
  const rewritten = (await git("rev-parse", "HEAD")).stdout.trim();

  const { createHash } = await import("node:crypto");
  const digest = (body) => createHash("sha256").update(body).digest("hex");
  const scripts = Object.fromEntries(
    SCRIPTS.map((path) => [path, { sha256: digest(bodies[path]) }]),
  );
  const { dir, record, write } = await copy(t);
  await write({ ...record, brand: { repository: "origin89hq/brand", commit, scripts } });

  assert.equal(await repoint(brand, squashed, dir), squashed);
  assert.equal(await checkBrand(brand, dir), squashed);

  await assert.rejects(repoint(brand, rewritten, dir), new RegExp(`at ${rewritten}`));
  assert.equal(await checkBrand(brand, dir), squashed, "a refused repoint leaves the record alone");
});
