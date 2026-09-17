# Site art

The three site images on `/sites/` are **Blender renders of generic site models**,
built from primitives by origin89hq/brand's
[`situations/source/site_scenes.py`](https://github.com/origin89hq/brand/blob/main/situations/source/site_scenes.py)
and rendered wide by
[`build_site_views.py`](https://github.com/origin89hq/brand/blob/main/situations/source/build_site_views.py).
They are the same models as the homepage miniatures in
[`../home/`](../home/README.md), seen from the ground instead of above a plinth,
so the two sets always show the same site. No scene is a customer installation,
and the equipment carries no logos or model names.

[`site-art.json`](site-art.json) records each file's sha256, the render it came
from, and the brand commit with the sha256 of both scripts. Do not hand-edit
these files; regenerate and package them. `test/site-art.test.mjs` fails if the
record and the files drift apart.

The render script writes `render-source.json` beside its output with the hashes
of the scripts that ran, and the packager refuses a brand checkout whose scripts
differ from it. A record therefore cannot attribute renders to a checkout that
did not produce them. Cycles output is not reproducible run to run, so the
scripts are the only thing a later run can compare; re-rendering always changes
the image bytes.

## Assets

| File | What it is |
|---|---|
| `cottage.webp` | A cottage at night: lit windows, a solar rack, a woodshed generator and a propane tank |
| `mining.webp` | A mine utility: a Quonset building, a genset container, a tank and a battery skid |
| `telecom.webp` | A telecom shelter: a lattice tower with a beacon, a genset and a fuel tank |

Each is 1536 × 1024, opaque, WebP quality 94. The brand calls the mining site
"mine"; the website calls it "mining", and the record maps the two.

## Regenerate

The brand README (`situations/scenes/site-views/README.md`) has the render
commands and requirements.

```sh
BRAND=/path/to/brand   # clean checkout; its commit goes into the record
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender

(cd "$BRAND" && "$BLENDER" --background --python-exit-code 1 \
  --python situations/source/build_site_views.py -- --out /tmp/site-views)

node scripts/site-art.mjs --brand "$BRAND" --renders /tmp/site-views
node scripts/site-art.mjs --check
```

`--check` runs without a checkout and covers the images. Adding `--brand` also
reads both recorded scripts at the recorded commit and checks their hashes, which
needs a checkout holding that commit:

```sh
node scripts/site-art.mjs --check --brand "$BRAND"
```

Packaging requires `cwebp` and installed website dependencies. The record
identifies what was published; it is not a promise that a later render reproduces
those bytes.

## Presentation rules

- **Same world as the Controller renders.** Dark satin materials, a cool key, a
  blue rim, AgX Medium High Contrast. Signal blue marks the data paths on the
  ground, and one green status light marks the building holding the Controller.
- **Third-party gear stays unbranded.** Generic cabins, shelters, gensets, tanks
  and panels, with no logos or model names.
- **The page says what the image is.** `/sites/<id>/` captions the image as a
  rendered example, not a customer installation.
- **Move the camera, not the equipment.** Each view is one entry in the render
  script's `VIEWS`; the miniatures share the models it would otherwise disturb.

## Website consumers

[`Sites.tsx`](../../react/routes/Sites.tsx) shows each image on `/sites/` and
`/sites/<id>/`; [`SiteCamera.tsx`](../../react/components/site/SiteCamera.tsx)
uses it as the app scenes' sample camera frame; and
[`HomePage.tsx`](../../react/components/home/HomePage.tsx) passes `cottage.webp`
to the Buddy setup chat as the example installation photo. The browser checks
upload it as a sample photo.
