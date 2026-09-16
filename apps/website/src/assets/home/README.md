# Homepage media

The homepage film, stills and 3D model are **rendered from Controller board A's
real CAD and fabrication data**: the Blender scene in origin89hq/hardware
([`enclosure/blender/origin89.blend`](https://github.com/origin89hq/hardware/tree/main/enclosure/blender),
enclosure from `shoe.py`, board from its STEP export) and the board's Gerbers,
pick-and-place and BOM from `boards/controller-a/build/2026-09-09`. The Gerber
artwork is drawn directly from the Gerbers. The audience miniatures are the
exception: generic scenes modelled in `render-dioramas.py`.

[`home-media.json`](home-media.json) records each file's sha256, the script that
produced it, which hardware inputs it depends on, and the hardware commit with the
sha256 of the scene, `gerber.zip`, `pick-and-place.csv` and `bom.csv`. Do not
hand-edit these files; regenerate and package them.

## Assets

| File | What it is | Script |
|---|---|---|
| `hero.mp4`, `hero-720.mp4` | Hero film loop, 24 fps, on `#07090c`: 1920 × 1080 (x264 CRF 19) and 1280 × 720 (CRF 23) | `render-film.py` |
| `hero-poster.webp` | First film frame on `#07090c` | `render-film.py` |
| `hero-anchors.json` | Shot ranges and per-frame callout positions, 0–1 of the frame | `render-film.py` |
| `chip-u7.webp`, `chip-u8.webp` | Orthographic top views of U7 (STM32G0B1) and U8 (ESP32-C6 module), 720 px | `render-chips.py` |
| `connect-*.webp` | Wired Controller from the scene's inspection cameras, 1600 × 1100 | `render-studio.py` |
| `integrate-controller.webp` | Closed Controller from the Hero camera, no cables, 900 × 990 | `render-studio.py` |
| `audience-3d-*.webp` | Cottage, telecom shelter and mine utility miniatures | `render-dioramas.py` |
| `gerber-u7.webp` | Top copper, pads and silkscreen around U7, x −4…44 mm, y −22…22 mm | `gerber-art.mjs` |
| `gerber-board-dim.webp` | The whole board's top layers, dimmed, on transparent | `gerber-art.mjs` |
| `trace-mask-u7.webp`, `trace-mask-board.webp` | Copper and pad coverage as alpha, for the trace highlight mask | `gerber-art.mjs` |
| `controller.glb` | Detailed scene without cables: `cover`, `board` and `plate` nodes, board top textured from the Gerbers, WebP textures, meshopt | `export-glb.py` |

The film, chips, studio stills and GLB use the detailed board scene from
`build-detailed-board.py`. It replaces the STEP's box components with parts
placed from pick-and-place, marked from the BOM, and textures the board from the
Gerber masks. Connectors keep the scene's datasheet-envelope proxies. The ESP32
module's matrix code is a fixed pseudo-random pattern. `render-chips.py` scales
the laser marking and mattes the finishes for the flat top view.

## Regenerate

Requires Blender 5.2 on a Mac with a Metal GPU (the render scripts select Metal
devices), `ffmpeg` with libx264, `cwebp`, installed website dependencies, and
network access for `npx`. From `apps/website`, with a clean origin89hq/hardware
checkout:

```sh
HW=/path/to/hardware
M=/tmp/home-media
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender

# 1. Gerber masks and artwork
unzip -o "$HW/boards/controller-a/build/2026-09-09/gerber.zip" -d "$M/gerber"
npx --yes --package pcb-stackup@4.2.8 -- \
  node scripts/render/gerber-layers.mjs --gerbers "$M/gerber" --out "$M/gerber-layers"
node scripts/render/gerber-art.mjs --layers "$M/gerber-layers" --out "$M/gerber-art"

# 2. Detailed board scene (keep $M/gerber-layers: the scene links those PNGs)
"$BLENDER" --background --python-exit-code 1 --python scripts/render/build-detailed-board.py -- \
  --hardware "$HW" --layers "$M/gerber-layers" --output "$M/controller-detailed.blend"

# 3. Film, chips and studio stills, rendered on the detailed scene
"$BLENDER" --background --python-exit-code 1 "$M/controller-detailed.blend" \
  --python scripts/render/render-film.py -- --out "$M/film"
for chip in U7 U8; do
  "$BLENDER" --background --python-exit-code 1 "$M/controller-detailed.blend" \
    --python scripts/render/render-chips.py -- --out "$M/chips" --chip "$chip"
done
"$BLENDER" --background --python-exit-code 1 "$M/controller-detailed.blend" \
  --python scripts/render/render-studio.py -- --out "$M/studio"

# 4. Web model
"$BLENDER" --background --python-exit-code 1 --python scripts/render/export-glb.py -- \
  "$M/controller-detailed.blend" --board-albedo "$M/gerber-art/board-albedo.jpg" \
  --output "$M/controller-raw.glb"
npx --yes @gltf-transform/cli@4.5.0 webp "$M/controller-raw.glb" "$M/controller-webp.glb"
npx --yes @gltf-transform/cli@4.5.0 meshopt "$M/controller-webp.glb" "$M/controller.glb"

# 5. Audience miniatures (no hardware input)
"$BLENDER" --background --python-exit-code 1 --python scripts/render/render-dioramas.py -- \
  --out "$M/dioramas"

# 6. Package into this directory and update home-media.json
node scripts/render/package-home-media.mjs --hardware "$HW" --renders "$M"
node scripts/render/package-home-media.mjs --check
```

None of the scripts save over the hardware scene. To repackage part of the set,
pass `--only` with any of `film,chips,studio,dioramas,gerber,model`. Files outside
those groups keep their records, which must still match; the packager refuses if
the hardware inputs changed for a group it is not repackaging.

Run one Blender process at a time; the renders share the GPU. The film is 1176
frames at 40 samples, about 6.5 s per frame on an M2 Max, so a little over two
hours. It skips frames that already exist, so an interrupted render resumes;
`--frames 1-120` renders part of it and `--anchors-only` rewrites
`anchors.json` without rendering. The stills (96 samples) and miniatures (128
samples) take seconds each.

From the renders behind the current files, packaging reproduced every file
byte for byte except `hero-poster.webp`, with sharp 0.35.3, cwebp 1.6.0, ffmpeg
7.1 (x264 core 164) and gltf-transform 4.5.0. New Cycles renders are not expected
to match the old hashes; the record identifies what was published.

## Presentation rules

- **Transparent renders.** Every Blender render has a transparent film. The film
  and poster are composited on `#07090c`, the page background, because H.264 has
  no alpha. The stills keep their alpha so section lighting shows through.
- **Crops come from alpha bounds.** The miniatures are cropped to their alpha
  bounds (alpha > 8) plus 30 px. `integrate-controller` uses a fixed
  1200 × 1320 window that the packager checks against the alpha bounds; it fails
  if the Controller no longer fits. Chips and connection stills keep the full frame.
- **Callouts follow the render camera.** `render-film.py` projects anchor points
  on board A (pick-and-place centres, part tops) through each frame's camera into
  `hero-anchors.json`, and `HeroFilm.tsx` places the labels from it. Change the
  film, anchors and callout names together; never position callouts by eye.
- **Third-party gear stays unbranded.** The miniatures show generic cabins,
  shelters, gensets, tanks and panels with no logos or model names.
- **Example data is labelled on the page.** Readings and app screens shown with
  these renders are samples, and the page says so.
- The status light is rendered in Blender, never painted in afterwards.

## Website consumers

[`HeroFilm.tsx`](../../react/components/home/HeroFilm.tsx) plays the film and
reads the anchors; [`DualMcu.tsx`](../../react/components/home/DualMcu.tsx) uses
the chips; [`Connections.tsx`](../../react/components/home/Connections.tsx) the
connection stills; [`Integrations.tsx`](../../react/components/home/Integrations.tsx)
the closed Controller; [`HomePage.tsx`](../../react/components/home/HomePage.tsx)
the miniatures, Gerber artwork and trace masks; and
[`Viewer3D.tsx`](../../react/components/home/Viewer3D.tsx) the GLB, lifting the
`cover` node.
