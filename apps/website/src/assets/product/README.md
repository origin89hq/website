# Product renders

`controller.webp` (still, status lamp lit) and `controller-live.webp`
(two-frame heartbeat: 160 ms on, 1140 ms off — "slow blink = running", the
lamp vocabulary in [controller documentation](https://docs.origin89.com))
are **rendered in Blender from the real CAD**: the enclosure from `shoe.py` and
board A from its EasyEDA STEP export, both in
[origin89hq/hardware](https://github.com/origin89hq/hardware). The Blender
scene itself is not published; it carries satin-black nylon, clean branding and
the production transfers as a switchable alternative.

To regenerate, render the saved scene so manual edits survive, or rebuild from
the CAD when a dimension changes there. Do not hand-edit the webps.

## Homepage controller study

`controller-study-*` uses the same edited CAD scene with cables and the sleeve
hidden, a higher camera, and a softer key light. Manufacturing geometry and
connector proxies are unchanged. The closed, base and cover plates share the
full transparent frame; none is cropped independently. `controller-study.json`
records the camera, PCB hash and source scene hash.

From `apps/website`, regenerate with the saved `origin89.blend` scene:

```sh
blender --background --python-exit-code 1 --python scripts/render-controller-study.py -- \
  --scene /path/to/origin89.blend --output /tmp/controller-study
node scripts/package-controller-study.mjs /tmp/controller-study
```

The render script reads the scene without saving it. The homepage uses these
plates for a reversible scroll reveal and explicit open/zoom controls. Connection
points lead to equipment searches; their positions illustrate the terminal row,
not pin-level wiring instructions. Cover movement is a presentation animation,
not a mechanical disassembly simulation. Reduced motion uses immediate controls.

## Website consumers

The homepage uses the aligned `controller-study-*` plates in
[`ControllerStudy.tsx`](../../react/components/site/ControllerStudy.tsx).
`react-assets.ts` also exposes the closed controller and board stills from the
`controller-reveal-*` set. Keep each set with its JSON record so the camera,
crop and source geometry remain traceable. The React reveal has explicit open
and zoom controls and respects reduced motion; it does not operate equipment.

## What the object is

The enclosure and PCB use the existing manufacturing geometry, with the
presentation finish and connector approximations described below:

| | |
|---|---|
| Form factor | Wall-hung box, **132 × 157 mm** face, **40 mm** off the wall; four mounting ears bring the wall footprint to **160 × 157 mm** |
| Face | Clean presentation option: Michroma wordmark, km-43 green bar, OFF-GRID CONTROLLER, the single STATUS light pipe and BUILT AT KM 43. The original full production transfer remains in the Blender file; fabrication artwork is unchanged. |
| Bottom mouth | The field row on pluggable KF2EDG blocks, labelled `DC IN RS485 1 RS485 2 RS485 3 CAN 1-WIRE` in the clean presentation |
| Left mouth | `SEL SNS TNK`, labelled on the cover's left margin; three connected black cables. The RTC cell stays inside the enclosure and has no field label. |
| Right wall | Top-exit notches for the VE.Direct pair and link header, plus the 1-Wire terminal; labelled on the cover's right margin |
| Networking | Wi-Fi and BLE via the module's own antenna, under the lid — no external stub |
| Cabling | Cat5e-style jackets and exposed twisted pairs on RS-485 and 1-Wire; separate red/black DC power lead. All individually jacketed leads converge into one charcoal braided sleeve, with retaining straps on the side leads. The Blender guide records the proposed conductor colours and the sleeve toggle. |
| Not on it | No RJ45 anywhere: every bus lands on pluggable screw blocks. An earlier concept had RJ45 shells and a rotary selector; the shipped board does not |

## Presentation rules

- **Transparent alpha**, so the section's own light pool shows through and
  nothing has to colour-match the page. (An earlier version of this file
  required a baked flat background — that rule was for image-model output,
  which cannot hand back a real alpha channel. Cycles can.)
- Both LED states are rendered directly from the saved Blender scene with
  matching camera, seed and resolution. `blender/package_web.py` converts
  and packages them into a still and animated WebP.
- Crop comes from the content's alpha bbox, never from fixed numbers — a
  guessed crop has already sliced cables and mounting ears twice.

The STEP's missing connector bodies are represented by the existing datasheet
envelopes, with approximate screw/socket details for rendering. Those proxies
are separate from the imported PCB meshes and do not change manufacturing CAD.
