# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Hands-on off-grid owners.** People who built or maintain their own power wall at a cottage or camp: a charge controller, an inverter, a battery bank, a generator in the shed, a fridge, often from different makers and years apart. Comfortable wiring a screw terminal. They want to know what the site is doing and act on it without driving there.
- **Remote site operators.** Crews responsible for unattended sites (mining utilities, telecom shelters) who need the site's state between visits.
- Undecided: installers and integrators are not a primary homepage audience yet.

## Product Purpose

Origin89 is an off-grid controller system: the Controller on the wall, the Offgrid app and the Buddy assistant. The Controller reads the equipment already installed, runs the site's rules locally and records every reading with its time; the app and Buddy show and explain what changed. On the homepage today, success is a visitor joining the waitlist.

## Positioning

- Works with the gear you already have. Mixed makers and older equipment with no management of its own; Origin89 becomes the management layer. Control does not require a new, expensive solar system.
- Decisions run at the site. The app and Buddy explain; the site keeps running without the internet.
- Open from the board up. Board files, protocol code and the equipment dataset are public. Known hardware issues are tracked in the hardware repository, not listed on the website.
- Honest readings. Every value carries its age; a missing reading never looks like a fresh zero.
- Designed for low power, straight from a 12 V bank. Measured consumption is pending bench validation.
- Made by off-gridders for off-gridders, built at km 43.

## Operating Context

- A typical cottage power wall (from the owner's own photos): plywood backing, a battery state-of-charge meter, a blade fuse block, a DC breaker box, an RS-485 solar charge controller, an inverter/charger, a converter/charger, a water pump, six 6 V flooded golf-cart batteries, a generator in a shed with a two-wire start input, a propane tank, an off-grid top-freezer fridge.
- Controller board A: STM32G0B1, ESP32-C6, 3 × RS-485, CAN, 2 × VE.Direct, 1-Wire, SEL/SNS/TNK sense inputs, a link to generator board B; 12 V. Revision A fabricated; bench measurements in progress as of 2026-09-16. Generator board B assembled; bench proof pending.

## Capabilities and Constraints

- Prototype hardware. Nothing can be bought yet. Primary action: join a waitlist. The waitlist mechanism is not built; the current site only prepares an enquiry email.
- Public claims use CAD and design facts. Measured values (consumption, probe counts, cable lengths, watchdog timing, radio range) are shown as pending until the bench provides them.
- Equipment compatibility is verified model by model; no support claim without a test.
- Buddy's advice does not operate equipment. Unknown and stale readings stay distinct from zero and from current values.
- Published in English.

## Brand Commitments

- Name: Origin89. Identity from the `@origin89/brand` package: logos, Michroma wordmark, Inter Tight, IBM Plex Mono, colour tokens, and Buddy the moose.
- Voice: plain and specific, no AI filler, honest about prototype status. Pending measurements are labelled; defect lists stay in the repositories.
- Reference the owner made binding: flipper.net's product-page clarity, where a visitor sees exactly how the device works and what every port does.
- Third-party equipment in imagery stays unbranded.

## Evidence on Hand

- Controller renders from the real CAD: the Blender scene in origin89hq/hardware `enclosure/blender/`; homepage study and reveal plates in `src/assets/product/`.
- A cottage power wall scene with generic equipment (origin89hq/brand branch `david/cottage-wall-scene`, draft).
- Public repositories: hardware, km43, data; the reviewed equipment catalogue snapshot.
- Hardware issues documenting revision A defects (origin89hq/hardware issues).
- Absent, never fabricate: customers, testimonials, pricing, ship dates, certifications, measured performance.

## Product Principles

1. Show exactly how it works: every port, pin and limit visible.
2. Honest over impressive: prototype status, unknowns and known issues are stated.
3. Meet the site as it is: existing gear and modest budgets.
4. Local first: the site keeps running without the internet.
5. Open by default.
