import { cp, rm } from "node:fs/promises";

const source = new URL("../storybook-static/", import.meta.url),
  target = new URL("../dist/storybook/", import.meta.url);
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
