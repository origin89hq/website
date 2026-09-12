# Current website / September 8, 2026

The selected Site journal has become the production website source: React, Vite and TanStack Router, with 17 pre-rendered pages and a public Storybook. Website and mobile app scenes share `src/react/` components. Buddy uses AI Elements, shadcn/ui, Tailwind and AI SDK UI with local fixtures; its Cloudflare AI backend is still to be implemented.

Run `pnpm design:review` to refresh the website and `/storybook/` on the existing ngrok file preview. The canonical site is `/`; `/developers/design-guide/` is the interactive developer guide. Existing `/next/` and journal preview URLs redirect to the new pages. See [website documentation](../README.md) and [component review documentation](../.storybook/README.md) for current commands, sources and verification.

The studies and commands below are historical. Astro remains available through `archive:dev` and `archive:build`; it no longer builds the production website. Building or refreshing ngrok does not publish to origin89.com.

---

# Origin89 website study 02

The current comparison is `/`, with three distinct homepage concepts:

- `/next/equipment-first/` — recommended. Make the equipment an owner bought over time work together; begin with exact-model discovery.
- `/next/site-first/` — lead with checking a remote site before a trip and a large app concept.
- `/next/ownership-first/` — lead with ownership, exposed hardware and the open stack.

All three connect to the same new full website structure: system comparison; dedicated Controller, Offgrid and Buddy pages; equipment catalogue; interactive sample site; open-stack release status; cottage, maple and field applications; and a site enquiry. `/next/research/` contains the official-source competitor review, business hypotheses and repository claim audit. The first round is preserved at `/round-1/`, `/field-guide/` and `/instrument/`.

## Positioning decision

Primary audience: owners of remote and off-grid sites. The founder describes neighbouring cottage owners who buy mixed equipment over time because an entire replacement or single-brand setup is out of reach. Lead with the existing investment and a useful starting point. Treat this observation as an interview hypothesis, not market-wide evidence or a verified $30,000 comparison.

Recommended hierarchy: existing equipment → exact-model connection path → useful site view → local control → ownership through an open stack → product details. The website can become an equipment-discovery and setup-planning tool. Potential commercial offers such as hardware, commissioning and support are hypotheses; no pricing or subscription terms have been invented.

## Evidence and behaviour

`lib/catalogue.ts` reads the eight catalogue documents at build time. It counts only Model tables beneath Dialect headings, excluding the README example. It does not expand series, infer unique devices or label entries as shipped support. Current snapshot: **1,124 model-table entries; 732 communication/local-I/O entries; 392 passive-equipment entries; 202 communication/I/O profiles.**

The directory renders an initial 24 rows and searches the full metadata set locally, with group/evidence filters and pagination. Search state is URL-addressable. A selected model carries into a site enquiry. The form collects no remote data: an explicit submit prepares an unsent mailto draft for the visitor to review and send.

The sample console changes all live-reading freshness labels together when connectivity is lost. It preserves last received values, labels them as old, and makes no claim about present equipment state. Historical events remain historical. No actual equipment control is provided.

Whole-stack openness is the user's intended direction. Cargo declares MIT OR Apache-2.0, but a public source release, complete licence files, hardware licensing and app source/licences were not established. The declared GitHub URL returned public HTTP 404 on 7 September 2026. `/next/open/` states the release work without broken download links. No licence was applied or changed.

Official research sources are maintained in `lib/research.ts`. SPAN, Framework and Home Assistant were also inspected in the browser for product presentation and directory structure. Assets remain editable in the existing brand and CAD sources; no competitor images were copied. The old enclosure artwork remains visible on inherited CAD renders.

## Preview and build

The independent design build is served through the previously authorized ngrok file tunnel. Rebuild with `pnpm --filter origin89-website design:build`. Production still uses `src/` and `dist/`; all design routes use `design/` and `design-dist/` and include noindex metadata. No production deployment or source-release action is part of this iteration.

## Round 02 verification / 7 September 2026

- Astro check: 68 files, zero errors, warnings or hints. The installed Node/Astro executable was used directly after the pnpm version-switch wrapper could not reach registry signature verification.
- Astro build: 44 static pages (17 new/reworked round-two pages, the archived comparison and 26 original direction pages).
- Static audit: 1,638 internal link/asset references resolved; each page has one H1 and noindex metadata; internal fragment destinations resolved.
- Browser layout checks: all 17 round-two pages at 1280 and 375 px, without horizontal page overflow; the recommended homepage also inspected at 390 px.
- Browser interaction checks: model search, URL-restored search, group and evidence filters, pagination, empty results, model/profile transfer to the enquiry, mobile menu, sample connection loss and recovery.
- Reviewed all three desktop hero compositions and the recommended mobile composition. Adjusted sample-reading label size and the app-first console text contrast after visual inspection.
- Final ngrok request returned HTTP 200 with X-Robots-Tag: noindex. No enquiry was sent, no source was published and no production deployment was performed.

The first-round notes below are historical and are superseded by this recommendation.

---

# Origin89 website study 01

A complete first website draft based on the brand design guide, a copy of which is served at `public/brand/design-guide.md`.

```sh
pnpm --filter origin89-website design:dev
pnpm --filter origin89-website design:check
pnpm --filter origin89-website design:build
```

Open http://127.0.0.1:4322 for the comparison, `/field-guide/` for the recommended direction or `/instrument/` for the hardware-led alternative. Each direction has 13 complete routes. The review strip switches between the same page in either direction. Production still uses `src/`, `astro.config.mjs` and `dist/`; the study uses `design/`, `astro.design.config.mjs` and `design-dist/`. No draft pages enter the production build. All draft pages are noindex.

## Recommendation

Use **Field guide** as the website foundation: paper, bridge blue, generous spacing, a clear site overview and tangible product artwork. Borrow the dark **Instrument** studio treatment for the Controller and technical explainers. A company website should make the family understandable before asking visitors to learn about an individual device.

The homepage has five jobs: state the value; introduce Controller, Offgrid and Buddy; help visitors find their type of site; explain equipment fit; start a conversation. Product pages explain roles, example tasks and the relationships between products. Site pages begin with the owner's equipment and questions. Compatibility supports a precise installation discussion. Developers leads into the existing authoritative documentation.

## Page architecture

| Page                | Job                                         | Primary next step            |
| ------------------- | ------------------------------------------- | ---------------------------- |
| Home                | Introduce Origin89 and the family           | Products                     |
| Products            | Explain and compare product roles           | Individual product           |
| Controller          | Explain the local hardware foundation       | Discuss a setup              |
| Offgrid             | Show the app experience and data clarity    | Discuss a setup              |
| Buddy               | Show useful assistance and user agency      | Discuss a setup              |
| Your site           | Help visitors identify their context        | Specific site page           |
| Cottages & off-grid | Energy, heat, water and backup power        | Compatibility / contact      |
| Maple operations    | Pumps, tanks, probes and field power        | Compatibility / contact      |
| Field & industrial  | Remote utilities, pumps, valves and sensors | Compatibility / contact      |
| Compatibility       | Explain interfaces and exact-model review   | Contact                      |
| Developers          | Architecture, KM43, integration context     | Existing docs                |
| Our story           | Establish purpose and useful principles     | Contact                      |
| Contact             | Make a concrete equipment enquiry           | Visitor-reviewed email draft |

## Design and content decisions

- Official outlined logo artwork; Inter Tight for language, IBM Plex Mono for readings and labels. The wordmark is never reconstructed in text.
- Preserve the brand architecture: Origin89 Controller, Origin89 Offgrid and Buddy. KM43 is the protocol, not the app or firmware brand.
- EN copy. Useful customer language first; interface and architecture detail on the relevant pages.
- Three actual family members; do not create speculative SKUs for future modules or sell Buddy as a standalone subscription.
- Keep development status visible; no invented availability, pricing, download buttons, certifications, endorsements or customer statistics.
- Catalogue research does not establish shipping support. Compatibility requires the exact model and intended task.
- Missing data is not zero. The Offgrid interaction distinguishes a stale battery reading while other sample readings remain current.
- No equipment controls. Buddy proposes; measurements, suggestions and confirmed actions remain distinct.
- Native navigation, disclosures and select controls; visible focus; readable mobile flow; no scroll pinning or perpetual motion. Reduced motion disables transitions.
- No contact data is collected. The mailto is visitor-initiated and creates an unsent draft.

## Provenance and next design pass

`lib/assets.ts` imports original assets directly. Buddy comes from the active shared library, not from a new or independent character model. Brand PNGs are optimized to WebP through Astro without editing the source art. Controller imagery is the existing CAD-backed render. The existing forest illustration establishes a setting without inventing customer installations.

Before a production launch:

1. Select the site direction and refine the product and use-case wording against the actual release scope.
2. Update the Controller's face artwork in `tools/enclosure/blender/origin89.blend` using the delivered Plate 89 SVG. Regenerate all reveal layers together, preserving their camera and crop.
3. Select specific, licensed photography for maple operations and industrial sites. The shared forest illustration is an explicitly documented first-draft treatment.
4. Confirm product availability, platform targets, pricing approach and how early installation enquiries will be handled.
5. Deep-link developer topics to verified live documentation routes. This draft uses the existing configured documentation home.
6. If an enquiry form is selected, define its submission, privacy and retention behavior; the current email route is already functional.
7. Integrate the selected design into the production source, add approved metadata and redirects, review mobile behavior, then publish the approved build.

The comparison page includes these open design items so the draft remains reviewable without presenting proposed experiences as shipped functionality.

## Verification / 7 September 2026

- `design:check`: 49 Astro files checked; zero errors, warnings or hints.
- `design:build`: all 27 pages built successfully, including optimized brand images.
- Static audit: 1,141 internal link and asset references resolved; every page has one H1 and noindex metadata.
- Browser layout checks: both 13-page directions at 1280 px and 375 px; the recommended direction also at 390 px. No horizontal page overflow after correcting the narrow comparison tables.
- Exercised mobile navigation, switching directions on a product page, both sample reading states, the equipment category filter, the board disclosure and a FAQ disclosure.
- Production publishing was not performed. The preview is local to this Mac.
