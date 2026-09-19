import assert from "node:assert/strict";
import test from "node:test";
import { pickSource } from "../.storybook/pick-source.mjs";

const OFFER = "a-48.webp 48w, a-96.webp 96w, a-192.webp 192w, a-384.webp 384w";

test("takes the narrowest candidate that still covers the drawn width", () => {
  assert.equal(pickSource(OFFER, 108), "a-192.webp");
  assert.equal(pickSource(OFFER, 50), "a-96.webp");
});

test("a width the candidates meet exactly is covered by that candidate", () => {
  // The boundary is the whole point: off by one here and the screenshot is of an upscaled file.
  assert.equal(pickSource(OFFER, 192), "a-192.webp");
  assert.equal(pickSource(OFFER, 193), "a-384.webp");
});

test("a drawn width past the widest candidate takes the widest", () => {
  assert.equal(pickSource(OFFER, 2000), "a-384.webp");
});

test("candidates the rule cannot read are skipped rather than picked", () => {
  // Density descriptors are chosen by the pixel ratio, which the run pins; a bare URL has no
  // width to compare. Either way there is nothing to choose between, so nothing is pinned.
  assert.equal(pickSource("a.webp 2x, b.webp 3x", 108), null);
  assert.equal(pickSource("a.webp", 108), null);
  assert.equal(pickSource("a.webp 0w, b.webp -5w", 108), null);
  assert.equal(pickSource(`${OFFER}, broken.webp 2x`, 108), "a-192.webp");
});

test("nothing to read means nothing to pin", () => {
  for (const empty of ["", "   ", null, undefined, 42]) assert.equal(pickSource(empty, 108), null);
});

test("a drawn width that is not a usable number falls back to the widest", () => {
  // An image the layout has not sized yet must not be pinned to the smallest file on offer.
  for (const bad of [0, -1, Number.NaN, undefined])
    assert.equal(pickSource(OFFER, bad), "a-384.webp");
});
