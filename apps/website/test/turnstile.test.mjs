import assert from "node:assert/strict";
import { test } from "node:test";

// The loader only touches `window.turnstile`, `document.createElement` and
// `document.head.append`, so small fakes stand in for the browser.
const scripts = [];
globalThis.window = {};
globalThis.document = {
  createElement: () => ({
    removed: false,
    remove() {
      this.removed = true;
    },
  }),
  head: { append: (script) => scripts.push(script) },
};
const { loadTurnstile, TURNSTILE_LOAD_TIMEOUT_MS } = await import("../src/react/lib/turnstile.ts");

test("gives up on a stalled script, removes it and lets the next attempt retry", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const attempt = loadTurnstile();
  assert.equal(scripts.length, 1);
  assert.match(scripts[0].src, /^https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/);
  t.mock.timers.tick(TURNSTILE_LOAD_TIMEOUT_MS);
  await assert.rejects(attempt, /timed out/);
  assert.equal(scripts[0].removed, true);
  // A late load of the abandoned script cannot settle anything.
  assert.equal(scripts[0].onload, null);

  const retry = loadTurnstile();
  assert.equal(scripts.length, 2);
  scripts[1].onerror();
  await assert.rejects(retry, /did not load/);
  assert.equal(scripts[1].removed, true);
});

test("rejects a script that loads without starting Turnstile", async () => {
  const attempt = loadTurnstile();
  scripts.at(-1).onload();
  await assert.rejects(attempt, /did not start/);
  assert.equal(scripts.at(-1).removed, true);
});

test("resolves once Turnstile starts and reuses it afterwards", async () => {
  const attempt = loadTurnstile();
  const api = { render() {}, reset() {}, remove() {} };
  window.turnstile = api;
  scripts.at(-1).onload();
  assert.equal(await attempt, api);
  const count = scripts.length;
  assert.equal(await loadTurnstile(), api);
  assert.equal(scripts.length, count);
});
