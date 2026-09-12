import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

const output = new URL("../../design-dist", import.meta.url);
const source = new URL("../../design-react-dist", import.meta.url);
await cp(new URL("_react/", source), new URL("_react/", output), {
  recursive: true,
});
const html = await readFile(new URL("index.html", source), "utf8");
// The existing ngrok file server needs concrete files for SPA deep links.
for (const route of [
  "concepts/journal",
  ...["cottage", "mining", "telecom"].map((site) => `concepts/app/journal/${site}`),
]) {
  const directory = new URL(`${route}/`, output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.html", directory), html);
}
