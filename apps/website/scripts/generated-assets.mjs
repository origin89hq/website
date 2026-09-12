import { createHash } from "node:crypto";
import { readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function snapshot(paths, excluded) {
  const files = {};
  async function visit(path) {
    if (excluded.has(path)) return;
    const info = await stat(path);
    if (info.isDirectory()) {
      for (const name of (await readdir(path)).sort()) await visit(join(path, name));
    } else if (info.isFile()) {
      files[path] = createHash("sha256")
        .update(await readFile(path))
        .digest("hex");
    }
  }
  for (const path of paths) await visit(fileURLToPath(path));
  return JSON.stringify(files);
}

/** Reuse generated assets only when both source and output bytes still match. */
export async function prepareGeneratedAssets({
  inputs,
  outputs,
  exclude = [],
  stamp,
  toolVersion,
  generate,
}) {
  const excluded = new Set(exclude.map((path) => fileURLToPath(path)));
  const sources = await snapshot(inputs, excluded);
  let previous;
  try {
    previous = JSON.parse(await readFile(stamp, "utf8"));
    if (
      previous?.sources === sources &&
      previous.toolVersion === toolVersion &&
      previous.outputs === (await snapshot(outputs, excluded))
    )
      return false;
  } catch (error) {
    if (!(error instanceof SyntaxError) && error.code !== "ENOENT") throw error;
  }
  await generate();
  if (sources !== (await snapshot(inputs, excluded)))
    throw new Error("Asset inputs changed during generation; run preparation again.");
  const result = { sources, toolVersion, outputs: await snapshot(outputs, excluded) };
  const temporary = new URL(`${stamp.pathname}.${process.pid}.tmp`, stamp);
  await writeFile(temporary, JSON.stringify(result));
  await rename(temporary, stamp);
  return true;
}
