import { cp, mkdir, rm } from "node:fs/promises";

const source = new URL("../storybook-static", import.meta.url);
const target = new URL("../design-dist/storybook", import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, {
  recursive: true,
  filter: (path) => {
    const relative = path.slice(source.pathname.length).split("/")[0];
    // The shared ngrok root already contains these website routes and assets.
    return ![
      "_astro",
      "_react",
      "concepts",
      "next",
      "field-guide",
      "instrument",
      "round-1",
    ].includes(relative);
  },
});
