# Manufacturer logos

Drop a file here named after the brand key in
[`lib/brands.ts`](../../lib/brands.ts). Both the established power brands and
the industrial integration families use the same lookup, so adding a brand is
one data row and one SVG, PNG or WebP file.

The protocols act on the scroll story
([`ActGear.astro`](../../components/ActGear.astro)) draws the list without
needing a hand-authored node, wire or pulse.

SVG is preferred; PNG and WebP also work. Anything missing falls back to the
brand name set in type, so neither is ever half-broken while these are being
collected.

Both flatten the file to a white silhouette — `brightness(0) invert(1)` at 70%
opacity — and neither stretches it. Greyscale was tried first and failed on the
colour marks: Volthium's green and yellow both land on a mid grey that is
invisible against `#12171e`. Flattening to white takes any mark, dark or light or
colour, and makes it legible, so a vendor's reversed variant is no longer needed.

The cost is that brand colour is gone. That is a deliberate call for a near-black
page, and it is worth knowing that some brand guidelines — Honda's in
particular — do not permit recolouring. If a manufacturer objects, drop their
file and the name in type comes back on its own.

These are other companies' trademarks. Showing them to say "the controller talks
to this device" is normal nominative use, but use the manufacturer's own current
file rather than something traced, keep the proportions, and drop any logo the
moment a manufacturer asks.

## Only equipment brands belong here

`src/lib/brands.ts` globs this whole directory eagerly, so **anything dropped in
here ships**, whether a page renders it or not. Two Origin 89 logo PNGs sat here
and were emitted into every build at 875 KB and 850 KB, referenced by nothing.

Our own marks live in `src/assets/brand/`. Keep them there.
