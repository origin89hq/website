# Homepage media

The homepage film, stills and 3D model are **rendered from Controller board A's
real CAD and fabrication data**: the Blender scene in origin89hq/hardware
([`enclosure/blender/origin89.blend`](https://github.com/origin89hq/hardware/tree/main/enclosure/blender),
enclosure from `shoe.py`, board from its STEP export) and the board's Gerbers,
pick-and-place and BOM from `boards/controller-a/build/2026-09-09`. The Gerber
artwork is drawn directly from the Gerbers. The render scripts live beside those
inputs, in
[`enclosure/blender/web/`](https://github.com/origin89hq/hardware/tree/main/enclosure/blender/web).
The audience miniatures are the exception: generic scenes modelled by
origin89hq/brand's
[`situations/source/build_site_miniatures.py`](https://github.com/origin89hq/brand/blob/main/situations/source/build_site_miniatures.py).

[`home-media.json`](home-media.json) records each file's sha256, the script that
produced it as `repository:path`, which hardware inputs it depends on, and the
hardware commit with the sha256 of the scene, `gerber.zip`, `pick-and-place.csv`
and `bom.csv`. Do not hand-edit these files; regenerate and package them.

## Assets

| File | What it is | Script |
|---|---|---|
| `hero-av1.mp4`, `hero.mp4`, `hero-720.mp4` | Hero film loop, one continuous 48 s shot at 30 fps with motion blur, on `#07090c`: 1920 × 1080 in AV1 (SVT-AV1 CRF 36, 10-bit) and H.264 (x264 CRF 23), and 1280 × 720 in H.264 (CRF 23), each encoded from the frames | hardware `render_film.py` |
| `hero-poster.webp` | First film frame on `#07090c` | hardware `render_film.py` |
| `hero-anchors.json` | Callout windows and per-frame callout positions, 0–1 of the frame | hardware `render_film.py` |
| `chip-u7.webp`, `chip-u8.webp` | Orthographic top views of U7 (STM32G0B1) and U8 (ESP32-C6 module), 720 px | hardware `render_chips.py` |
| `connect-*.webp` | Wired Controller from the scene's inspection cameras, 1600 × 1100 | hardware `render_studio.py` |
| `integrate-controller.webp` | Closed Controller from the Hero camera, no cables, 900 × 990 | hardware `render_studio.py` |
| `audience-3d-*.webp` | Cottage, telecom shelter and mine utility miniatures | brand `build_site_miniatures.py` |
| `gerber-u7.webp` | Top copper, pads and silkscreen around U7, x −4…44 mm, y −22…22 mm | hardware `gerber_art.mjs` |
| `gerber-board-dim.webp` | The whole board's top layers, dimmed, on transparent | hardware `gerber_art.mjs` |
| `trace-mask-u7.webp`, `trace-mask-board.webp` | Copper and pad coverage as alpha, for the trace highlight mask | hardware `gerber_art.mjs` |
| `controller.glb` | Detailed scene without cables: `cover`, `board` and `plate` nodes, board top textured from the Gerbers, WebP textures, meshopt | hardware `export_glb.py` |

The film, chips, studio stills and GLB use a detailed copy of the scene: parts
placed from pick-and-place and marked from the BOM, and the board textured from
the Gerbers. The hardware scripts' README describes it.

## Regenerate

Render into one directory from both repositories, then package from
`apps/website`. The hardware README (`enclosure/blender/web/README.md`) has the
render commands, requirements and GPU times; the brand README
(`situations/scenes/site-miniatures/README.md`) covers the miniatures.

```sh
HW=/path/to/hardware   # clean checkout; its commit goes into the record
BRAND=/path/to/brand
M=/tmp/home-media
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender

# 1. Controller renders: run the commands in $HW/enclosure/blender/web/README.md
#    from $HW with the same M. They write film/, chips/, studio/, gerber-art/ and
#    controller.glb.

# 2. Audience miniatures
(cd "$BRAND" && "$BLENDER" --background --python-exit-code 1 \
  --python situations/source/build_site_miniatures.py -- --out "$M/dioramas")

# 3. Package into this directory and update home-media.json
node scripts/package-home-media.mjs --hardware "$HW" --renders "$M"
node scripts/package-home-media.mjs --check
```

Packaging requires `ffmpeg` with libx264 and libsvtav1, `cwebp` and installed website
dependencies. To repackage part of the set, pass `--only` with any of
`film,chips,studio,dioramas,gerber,model`. Files outside those groups keep their
records, which must still match; the packager refuses if the hardware inputs
changed for a group it is not repackaging. The record names the hardware commit
but not the brand commit behind the miniatures.

From the renders behind the current files, packaging reproduced every file
byte for byte except `hero-poster.webp` and `hero-av1.mp4`, with sharp 0.35.3,
cwebp 1.6.0, ffmpeg 7.1 (x264 core 164) and gltf-transform 4.5.0. SVT-AV1 2.3.0
writes a slightly different file on each run from the same frames. New Cycles
renders are not expected to match the old hashes; the record identifies what was
published.

## Presentation rules

- **Transparent renders.** Every Blender render has a transparent film. The film
  and poster are composited on `#07090c`, the page background, because H.264 has
  no alpha. The stills keep their alpha so section lighting shows through.
- **Crops come from alpha bounds.** The miniatures are cropped to their alpha
  bounds (alpha > 8) plus 30 px. `integrate-controller` uses a fixed
  1200 × 1320 window that the packager checks against the alpha bounds; it fails
  if the Controller no longer fits. Chips and connection stills keep the full frame.
- **Callouts follow the render camera.** `render_film.py` projects anchor points
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
