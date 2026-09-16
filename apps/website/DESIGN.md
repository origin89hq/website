---
name: Origin89 website
description: Dark-only product site for the Origin89 off-grid Controller, Offgrid app and Buddy.
colors:
  page: "#07090c"
  surface: "#0d1116"
  surface-raised: "#12171e"
  line: "#1e252e"
  line-strong: "#2b343f"
  focus: "#ffffff"
  fg: "#e7eaee"
  muted: "#9aa5b1"
  faint: "#707b87"
  action: "#2b4a97"
  action-lit: "#3f61b3"
  link: "#6279ad"
  signal: "#7f9ce0"
  on-fill: "#ffffff"
  nominal: "#2f9d64"
  warning: "#e9a13c"
  alarm: "#e05a3c"
  info: "#7fb0d4"
typography:
  display:
    fontFamily: "Inter Tight, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(44px, 6.4vw, 104px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter Tight, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(38px, 4.9vw, 78px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Inter Tight, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(26px, 2.2vw, 32px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  figure:
    fontFamily: "Inter Tight, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(64px, 7.4vw, 116px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.05em"
    fontFeature: "tnum"
  lede:
    fontFamily: "Inter Tight, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(17px, 1.35vw, 20px)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Inter Tight, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter Tight, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.01em"
    fontFeature: "tnum"
rounded:
  pill: "999px"
  control: "10px"
  frame: "14px"
  panel: "16px"
  stage: "24px"
  plate-cut: "10px"
  plate-cut-sm: "7px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  max: "1320px"
  section: "clamp(96px, 13vw, 190px)"
  section-page: "clamp(72px, 9vw, 136px)"
  frame-pad: "16px"
  panel-pad: "22px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-fill}"
    rounded: "{rounded.plate-cut}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.action-lit}"
  button-ghost:
    backgroundColor: "{colors.page}"
    textColor: "{colors.fg}"
    rounded: "{rounded.plate-cut}"
    padding: "0 22px"
    height: "48px"
  button-ghost-pressed:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.fg}"
  button-small:
    rounded: "{rounded.plate-cut-sm}"
    padding: "0 16px"
    height: "40px"
  frame:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.frame}"
    padding: "{spacing.frame-pad}"
  chip:
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  nav:
    textColor: "{colors.muted}"
    rounded: "{rounded.frame}"
    padding: "10px 10px 10px 20px"
---

# Design System: Origin89 website

Brand-owned identity (logo, product colour, typography, 3D language, layout, voice and motion) lives in the brand guide, `origin89hq/brand` `identity/guide/design-guide.md`, sections 09, 10, 11, 18 and 19. This file records how the website build applies it; it does not restate the guide. Tokens ship in `src/react/styles/theme.css`, matching `@origin89/brand` 0.4.0 `tokens/themes.css` (dark). The site ships its own guide at `/developers/design-guide/` (`src/react/routes/DesignGuide.tsx`).

## Overview

**Creative North Star: "The Lit Bench"**

A black bench with the real board on it. The page is near-black ground; the Controller, its board and its chips are rendered from the real CAD and fabrication data and sit frameless in soft pools of action-blue light. Everything else is instrument: hairline frames with the Plate 89 bevel corner, signal-blue leader lines, mono designators, readings that carry their age. Colour is reserved for state.

Density is generous at section scale (sections of up to 190px vertical padding, one lead visual per section) and tight inside instruments (13px labels, 12.5px mono data, 1px hairlines). Headings are large, bold, sentence case and tightly tracked, and they carry the section alone.

The theme is dark only. A light theme may come later; it is not designed, and nothing in the build responds to a light colour-scheme preference (`color-scheme: dark` is forced on `:root`).

**Key Characteristics:**
- Near-black layered ground: page, surface, surface-raised.
- Plate 89 geometry: bevelled frames and clipped-polygon plate buttons.
- One job per colour: action fills, signal draws, green reports one live reading, amber marks pending.
- Renders from real CAD on black; site miniatures as dark dioramas.
- Inter Tight for words, IBM Plex Mono only for data.

## Colors

A cool near-black neutral ramp with two blues and two state colours, each with a single job.

### Primary
- **Plate Blue** (action): the fill of the one primary action on a screen (plate buttons, the "us" column head in the comparison table, the user's chat bubble). Never text. Its contrast on the ground is 2.4:1, which is why the plate carries a white rim.
- **Plate Blue Lit** (action-lit): hover fill for the primary plate and the text selection colour.

### Secondary
- **Signal Blue** (signal): draws, never fills large areas. Leader lines, data paths, port nodes on hover and selection, selected chip brackets, designators (`U7`, `A/B`, rule ids), spec-group icons, watchdog track, `Specified` status.
- **Link Blue** (link): links inside running text on the page ground.

### Tertiary
- **Nominal Green** (nominal): a live, healthy reading. At most once per screen: the relay-closed state light, the app preview's sync dot, the one completed bench item.
- **Pending Amber** (warning): pending and planned work, always beside its status word: `Planned`/`Pending bench` chips (dashed border), prototype status dots in hero and footer, `.o89-pending` table cells, outdated source tags in Buddy's replies.
- **Alarm** and **Info** ship with the token set for app mockups; the homepage does not use them.

### Neutral
- **Ground** (page): every page background, and the backdrop baked into the hero film and poster.
- **Surface** (surface): frames, spec groups, composer, table header cells, inputs.
- **Raised** (surface-raised): pressed ghost plates, mobile menu, on-wall notes, pin cells, app reading cards.
- **Hairline** (line) and **Strong Hairline** (line-strong): row rules and frame edges; control outlines, chips and inputs.
- **Foreground** (fg), **Muted** (muted), **Faint** (faint): headings and trusted values; secondary copy and stale readings; captions on the page ground only (faint drops to 4.2:1 on raised surfaces, so text there uses muted).
- **Focus** (focus): 2px white outline, 3px offset, on every focusable element.

**The One Job Rule.** Action blue fills the one primary action; signal blue draws lines and selection; nominal green appears at most once per screen for a live reading; amber marks pending or planned work. A `Published` status and table check marks are neutral (fg), never green.

**The Tokens Not Hex Rule.** Reference `var(--o89-*)`; the only literal colours in the build are alpha variants of these tokens for tints, borders and light pools.

## Typography

**Display Font:** Inter Tight variable (`Concept` face, fallback Helvetica Neue, Arial)
**Body Font:** Inter Tight
**Label/Mono Font:** IBM Plex Mono Regular (`Technical` face, fallback ui-monospace, SF Mono, Menlo)

**Character:** A tight, heavy grotesk that states the point in sentence case, paired with a plain mono that only ever holds measured or machine data.

### Hierarchy
- **Display** (700, `clamp(44px, 6.4vw, 104px)`, 0.98): hero title (capped at 11ch, `clamp(44px, 5.6vw, 92px)`) and the closing waitlist heading. The Statement section runs larger (`clamp(46px, 8.2vw, 138px)`) with staggered lines, the last two in faint.
- **Headline** (700, `clamp(38px, 4.9vw, 78px)`, 0.98): section headings. Inner pages use `clamp(44px, 5.6vw, 84px)` in the page intro.
- **Title** (600–700, 20–38px, 1.05–1.2, −0.02 to −0.03em): audience titles, port panel heading (28px), viewer bar, spec group heads (20px), MCU role.
- **Figure** (600, `clamp(64px, 7.4vw, 116px)`, 0.9, −0.05em, tabular): instrument readouts, with the unit as a 0.32em muted suffix. Smaller figures (22–40px, 600) in bus line, budget, temps and decode.
- **Lede** (400, `clamp(17px, 1.35vw, 20px)`, 1.55, muted, 46–60ch).
- **Body** (400–500, 14–17px, 1.55): 15–16px in panels and cards, 14px in lists and specs.
- **Label** (400–500, 13px, faint or muted): captions, frame headers, figcaptions, notes.
- **Data** (Plex Mono 400, 11–15px, tabular): designators, units, pin names, file paths, code, reading ages, protocol frames. Inline `.mono` is 0.82em.

**The Words And Data Rule.** Plex Mono holds data only: designators, units, readings, file names, code. Labels, headings and prose stay in Inter Tight. Headings are 700, sentence case, tracked −0.035em (theme.css sets it on h1–h4).

**The Heading Carries The Section Rule.** No kicker or eyebrow label above a heading, uppercase or otherwise. The heading names the section; supporting context goes below it in the lede.

## Layout

- **Container:** `min(100% − 2 × gutter, 1320px)`, centred (`.o89-wrap`). Gutter `clamp(16px, 4vw, 56px)`. Inner pages pad with `max(gutter, (100% − 1320px) / 2)`.
- **Section rhythm:** homepage sections `clamp(96px, 13vw, 190px)` vertical, consecutive sections drop the top padding; inner pages use `clamp(72px, 9vw, 136px)` top-only spacing. Within frames the steps are 4, 8, 12, 16, 24 px.
- **Grids in use:** two-column heads (1fr 1fr, heading left, lede right, aligned to end); 12-column open-hardware grid with a sticky copy column (top 120px); asymmetric 1.05fr / 0.95fr for MCU and rule composer; three-column audiences; CSS columns (`3 340px`) for the spec grid; hub layout 0.9fr / 1.2fr / 0.9fr.
- **Full bleed:** the hero film runs full bleed (height `max(640px, min(56.25vw, max(100svh, 42vw)))`) with copy in the content column, over bottom and left gradients to the ground. Render stages (explorer, 3D viewer) are wide frames inside the container.
- **Breakpoints actually used:** 980px (most grids collapse to one column; hub core moves first), 900px (nav collapses to a Menu disclosure, port panel becomes a bottom sheet, port labels hide and a mono port list appears), 800px (footer to two columns), 720px (hero stacks film above copy, callouts hide, caption line appears), 600px (composer sentence to 22px). Inner pages add 1100, 760 and 650px. Review at 320, 390 and 1440px.

**The One Lead Visual Rule.** Each section has one lead render or instrument; copy sits beside or over it, never competing with a second hero image.

## Elevation & Depth

Depth is tonal and lit, not shadowed. Surfaces step from page to surface to surface-raised, each edged by a 1px hairline. The lift comes from light: renders carry their own dark drop shadows (`drop-shadow(0 24px 30px rgba(0,0,0,.7))` to `0 40px 60px rgba(0,0,0,.8)`) and stand in blurred radial pools of action blue at 35–42% alpha. Signal elements glow faintly as instrument light (`box-shadow: 0 0 12px rgba(127,156,224,.7)`). Glass (blur 10–14px over 72–80% ground) is used only on overlays that sit above moving media or content: the sticky nav and hero callout labels.

### Shadow Vocabulary
- **Render drop** (`filter: drop-shadow(0 24px 30px rgba(0,0,0,.7))`): chip and Controller renders.
- **Instrument glow** (`box-shadow: 0 0 12px rgba(127,156,224,.7)`): lit signal tracks, bus dots, selected brackets.
- **State halo** (`box-shadow: 0 0 0 4px rgba(233,161,60,.14)`): status dots, in amber or (once) green.
- **Phone** (`box-shadow: inset 0 0 0 1px #2e353e, 0 50px 90px -30px rgba(0,0,0,.9)`): the app preview device only.

**The Light Belongs To The Object Rule.** Glow and light pools sit behind renders or on signal lines; frames, cards and buttons never glow and never take a coloured side border.

## Shapes

**The Plate 89 Rule.** Frames take the plate's 45° clipped corner through `corner-shape: bevel` on a normal `border-radius`; browsers without `corner-shape` fall back to rounded corners of the same radius. Frames, stages, panels, inputs, selects, segmented controls, table containers and callout labels all opt in. Radii scale with the object: 8–10px controls, 12–14px frames and callouts, 16px panels and spec groups, 20px composer, 24px render stages, 28px app section.

Plate buttons are cut, not radiused: an octagonal `clip-path` polygon with a 10px cut (7px small), which renders identically in every browser. Chips and pill tags stay fully round (999px) and are the only round-ended shape. Status dots are circles. Rows are divided by 1px hairlines; dot grids (14px pitch, 1.2px dots in line or line-strong, radially masked) sit behind renders and chips.

## Components

### Buttons (plate)
Sturdy, cut from the sign.
- **Shape:** octagonal clip, 10px cut; 48px tall, 22px side padding, 600 weight 15px; small variant 40px, 7px cut, 16px padding, 14px.
- **Primary** (`o89-plate o89-plate-action`): action fill inset 1px inside a 90% white rim (the rim is the outer element, the fill a clipped `::before`). One per view: "Join the waitlist" in nav and hero.
- **Hover:** fill moves to action-lit over 0.25s on the brand ease.
- **Ghost** (`o89-plate-ghost`): page fill inside a line-strong rim; hover rim turns muted; `aria-pressed`/`aria-selected` gives an fg rim over a raised fill. Used for secondary actions, tabs (connection tabs, MCU tabs in mono) and viewer controls.
- **Text link** (`o89-text-link`): 15px 600 fg with an arrow icon that shifts 4px right on hover; 44px min target.

### Chips and status words
- **Chips:** 999px pills, 1px line-strong, 13–14px muted, 4–5px × 10–12px padding.
- **Status words** (`status-word[data-status]`, `.node em`): exactly `Published` (fg, neutral line), `Specified` (signal text, signal border at 45%), `Planned` and `Pending bench` (amber text, dashed amber border).

### Frames
- **Corner:** 14px bevel. **Background:** surface. **Border:** 1px line (line-strong on nodes and panels). **Padding:** 16px (artifacts), 22px (spec groups), `clamp(22px, 3vw, 36px)` (composer, code sketch).
- **Header row:** 13px faint label with a right-aligned 12px mono reference, divided by a hairline.
- **Spec list:** `dt` faint / `dd` fg in a 38–40% / 1fr grid, hairline between rows.

### Inputs
- **Waitlist field:** 48px, surface, line-strong edge, 10px bevel, 15px; placeholder faint; focus 2px white outline.
- **Inline select** (rule composer): raised fill, line-strong edge, bevel, `field-sizing: content`, custom chevron in muted; hover edge muted.
- **Segmented control:** surface track with line-strong edge and 4px inset; pressed segment raised with an inset line-strong ring.

### Navigation
- **Style:** sticky (fixed on home) floating bar 12px from the top, 14px bevel, 80% ground with 14px backdrop blur and a 7% white edge; white logo 22px; links 14px 500 muted, fg on hover and `aria-current`; GitHub icon button; small primary plate.
- **Mobile (≤900px):** links, GitHub and CTA hide; a native `details` Menu disclosure with an 8px bevelled summary opens a raised bevelled sheet of 48px rows.
- **Footer:** hairline top, 1.3fr + three link columns, 14px muted; a small amber dot with the prototype status line.

### Render callouts (signature)
Hero film labels placed per frame from `hero-anchors.json`, the render camera's projection of board A anchor points. A white 1.5px leader with dot and ring leads to a 300px glass label: signal mono designator, 28px 700 white part name, 15px description. Labels fade in over 0.45s. Below 720px callouts hide and a single caption line (signal mono + muted text) replaces them.

### Port explorer and instruments (signature)
The port explorer draws terminal labels and polylines over the closed Controller render; hover, focus or selection turns line and node signal blue with a pulsing ring, dims other ports to 32%, and slides a detail panel in (bottom sheet on mobile). Instruments (idle draw, watchdog relay, RS-485 frames, 1-Wire temps, VE.Direct decode) pair a large tabular figure with signal tracks and faint notes that name conditions and label example data.

### Readings
App readings show value, source and age in mono. Stale readings take a dashed line-strong border on a transparent ground with a muted value; missing readings show an em-dash placeholder in faint, never a zero.

### Motion
One ease, `--o89-ease` `cubic-bezier(0.16, 1, 0.3, 1)`: 0.2–0.35s for colour and opacity, 0.45–0.7s for panels and transforms, 0.9s for section reveal (fade plus 28px rise, from a visible default, triggered once by IntersectionObserver). Continuous motion is limited to the hero film, the signal trace sweep over Gerber artwork (7s/11s alternating), the active port pulse and dash pulses along integration lines.

**The Still Under Reduced Motion Rule.** With `prefers-reduced-motion: reduce`, the hero film stays paused (its toggle can start it), reveals render immediately, the 3D lid lift snaps instead of easing, trace sweep, port pulse and render swap animations stop, panel moves become 0.2s linear fades, the 3D viewer stops auto-rotating, and in-page scrolling is instant.

## Do's and Don'ts

### Do:
- **Do** use the dark theme only, from `var(--o89-*)` tokens; layer page, surface, surface-raised.
- **Do** give frames, panels, stages and inputs `corner-shape: bevel` on their radius, and buttons the clipped plate polygon.
- **Do** render products from real CAD and fabrication data on black (`#07090c`, or transparent over the section's light), and keep site miniatures as generic dark dioramas.
- **Do** place callouts from the render camera's anchors, never by eye.
- **Do** use the four status words (Published, Specified, Planned, Pending bench) and put amber beside Planned and Pending bench.
- **Do** name the conditions of every measured value ("11 mA at 13.1 V, radio off") and label example data on the page ("Sample data · app in development", "Addresses are examples.").
- **Do** set IBM Plex Mono for designators, units, readings, file names and code, with tabular numerals.

### Don't:
- **Don't** put kicker or eyebrow labels above headings.
- **Don't** use nominal green for Published, check marks or decoration; at most one live reading per screen is green.
- **Don't** fill anything but the one primary action with action blue, or use it for text.
- **Don't** paint, generate or hand-edit product renders, or show third-party brands or model names on equipment in imagery.
- **Don't** list known hardware defects on the website; link to the hardware repository's issues.
- **Don't** use plain rounded rectangles for frames, glows on frames or buttons, or coloured side borders.
- **Don't** design or ship light-theme values yet.
