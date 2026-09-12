import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { prepareGeneratedAssets } from "../scripts/generated-assets.mjs";

async function fixture(t) {
  const root = pathToFileURL(`${await mkdtemp(join(tmpdir(), "website-assets-"))}/`);
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = new URL("source.txt", root),
    output = new URL("generated/", root);
  await writeFile(input, "source A");
  let runs = 0;
  const options = {
    inputs: [input],
    outputs: [output],
    stamp: new URL("cache.json", root),
    toolVersion: "test-v1",
    async generate() {
      runs++;
      await mkdir(output, { recursive: true });
      await writeFile(new URL("image.txt", output), await readFile(input));
    },
  };
  return { input, output, options, runs: () => runs };
}

test("prepares a clean checkout and reuses only matching source and output bytes", async (t) => {
  const f = await fixture(t);
  assert.equal(await prepareGeneratedAssets(f.options), true);
  assert.equal(await readFile(new URL("image.txt", f.output), "utf8"), "source A");
  assert.equal(await prepareGeneratedAssets(f.options), false);
  assert.equal(f.runs(), 1);
  await writeFile(f.input, "source B");
  assert.equal(await prepareGeneratedAssets(f.options), true);
  assert.equal(await readFile(new URL("image.txt", f.output), "utf8"), "source B");
  assert.equal(await prepareGeneratedAssets({ ...f.options, toolVersion: "test-v2" }), true);
});

test("repairs missing and modified outputs and malformed cache metadata", async (t) => {
  const f = await fixture(t);
  await prepareGeneratedAssets(f.options);
  const image = new URL("image.txt", f.output);
  await writeFile(image, "corrupt");
  assert.equal(await prepareGeneratedAssets(f.options), true);
  assert.equal(await readFile(image, "utf8"), "source A");
  await rm(f.output, { recursive: true });
  assert.equal(await prepareGeneratedAssets(f.options), true);
  for (const invalid of ["invalid JSON", "null", "[]"]) {
    await writeFile(f.options.stamp, invalid);
    assert.equal(await prepareGeneratedAssets(f.options), true);
  }
});

test("does not record failed generation or accept a missing source", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    prepareGeneratedAssets({
      ...f.options,
      generate: async () => {
        throw new Error("encoder failed");
      },
    }),
    /encoder failed/,
  );
  await assert.rejects(readFile(f.options.stamp), { code: "ENOENT" });
  assert.equal(await prepareGeneratedAssets(f.options), true);
  await rm(f.input);
  await assert.rejects(prepareGeneratedAssets(f.options), { code: "ENOENT" });
});

test("preserves tracked inputs excluded from generated outputs and rejects source changes mid-build", async (t) => {
  const f = await fixture(t);
  await prepareGeneratedAssets(f.options);
  const catalogue = new URL("catalogue.json", f.output);
  await writeFile(catalogue, "reviewed input");
  const options = { ...f.options, exclude: [catalogue] };
  assert.equal(await prepareGeneratedAssets(options), false);
  await writeFile(catalogue, "updated reviewed input");
  assert.equal(await prepareGeneratedAssets(options), false);
  await writeFile(f.input, "source C");
  await assert.rejects(
    prepareGeneratedAssets({
      ...options,
      generate: async () => {
        await writeFile(f.input, "source D");
      },
    }),
    /inputs changed/,
  );
  assert.equal(await prepareGeneratedAssets(options), true);
});
