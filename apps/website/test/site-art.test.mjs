import assert from "node:assert/strict";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ART, checkRecord } from "../scripts/site-art.mjs";

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
  await assert.rejects(checkRecord(dir), /extra\.webp: not recorded/);

  await rm(join(dir, "extra.webp"));
  await rm(join(dir, "mining.webp"));
  await assert.rejects(checkRecord(dir), /mining\.webp: recorded but missing/);

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
