# origin89.com

The production website uses React 19, Vite and TanStack Router. Routes are pre-rendered to complete HTML at build time and hydrate for client navigation. The Worker in `worker/index.ts` serves `dist/` on `origin89.com`, including the public component library at `/storybook/`, and forwards the same-origin Buddy API to its bound service. The product page is `/products/buddy/`; the working setup app is `/buddy/`.

The selected Site journal design covers cottage, mining and remote telecom settings. Products, equipment research, site applications, open-source status, developer resources, a design guide and setup enquiries each have their own pages. English is the published language. Previous `/en/`, `/next/` and journal preview links redirect to their canonical counterparts.

## Development

Install workspace dependencies with `pnpm install` at the repository root. These commands run from this package:

```sh
pnpm dev                # React/Vite at http://127.0.0.1:4321
pnpm check              # Generate assets; check React and Storybook types
pnpm build:site         # Build and pre-render the website
pnpm build              # Website plus the public Storybook
pnpm preview            # Serve dist/ with Wrangler's local runtime
pnpm storybook          # Shared components at http://127.0.0.1:6006
pnpm deploy:cf          # Deploy the built website directly with Wrangler
```

See the [repository README](../../README.md) for root commands, fixture checks and direct Cloudflare deployment. Deploy Buddy separately from its own repository.

## Source map

- `src/react/router.tsx`: typed routes, query validation, navigation and 404 handling.
- `src/react/routes/`: product, equipment, site, developer, design-guide, open-source and enquiry pages.
- `src/react/components/site/`: the journal homepage, shared navigation/footer and Offgrid app scenes.
- `src/react/components/buddy/`: Buddy conversation, editable equipment map, local fixtures and transport boundary.
- `src/react/components/ai-elements/` and `ui/`: maintained AI Elements and shadcn source.
- `src/react/styles/`: shared website and Storybook styling. `ui.css` maps shadcn semantics; `journal.css` defines site palettes; `website.css` covers the full website pages.
- `src/react/lib/page-meta.ts`: canonical URLs, metadata, sitemap routes and legacy redirects.
- `src/react/lib/site-config.ts`: public GitHub, documentation and contact links.
- `stories/` and `.storybook/`: component review and viewport controls.
- `scripts/build-website.mjs`: browser/server bundles, TanStack server rendering, HTML hydration data and Cloudflare assets metadata.

The React site and Storybook share components. `page-meta.ts` keeps legacy URLs
pointed at their current routes.

## Developer guide and brand sources

`/developers/design-guide/` documents identity, live cottage/mining/telecom palettes, typography, spacing, components, data states, Buddy interactions and motion. `/developers/` links the guide, Storybook, published KM43 documentation and the public GitHub organization.

Logos, fonts and colour tokens come from [`@origin89/brand`](https://github.com/origin89hq/brand), the installable brand package.

Brand assets are rebuilt from the pinned package and committed editable inputs under `src/assets/`. Generated directories are ignored; the reviewed equipment snapshot at `src/react/generated/catalogue.json` is committed. Preparation verifies hashes of the source inputs and every generated output, reusing matching files. Missing or altered outputs, changed inputs, or a changed Sharp version regenerate the assets. The cache is ignored and is never required by a fresh clone. Fonts and artwork are served from the website origin. `.website-server/` is disposable.

Use the shared `BuddyAvatar` for Buddy images. It supplies WebP `srcSet` variants for Retina displays, front-facing green circular avatars up to 96 CSS pixels, and transparent portraits above that size. Set `framing="avatar"` when a larger placement is still an avatar. Its `size` is the displayed width; if CSS changes that width at a breakpoint, pass a matching `sizes` hint, such as `sizes="(max-width: 760px) 78px, 100px"`. Browsers choose the image resolution for the screen density without downloading every variant.

## Equipment and product claims

`src/react/generated/catalogue.json` preserves the reviewed equipment snapshot extracted with this website. Its entries can repeat across profiles or represent series: research coverage is not a count of supported devices. Exact models and intended actions still need integration verification. Review snapshot changes against their original sources and use data.origin89.com for the ongoing dataset.

The open-source and developer pages link the public KM43, Data and Hardware repositories, with file-level entry points and scoped licence labels maintained in `src/react/lib/source-projects.ts`. The homepage, developer and open-source pages, equipment page and footer link `data.origin89.com`; the main menu stays focused on Products, Equipment, Your site and Developers. Public source does not imply completed hardware validation or product availability. KM43 code and its draft specification have separate licence scopes.

The homepage's `ControllerStudy` reuses the aligned CAD layers documented in `src/assets/product/README.md`. On a desktop viewport with enough height, scrolling separates the enclosure from the board; the open/close and zoom controls also work independently. Smaller viewports and reduced-motion preferences use the explicit controls. The closed render remains available if interior assets fail, and extra scroll distance is added only after the layers decode. Numbered connection points and matching buttons lead to model searches in the equipment catalogue; they do not operate equipment or establish compatibility.

## Buddy, app scenes and enquiries

The React UI uses Tailwind 4, shadcn/ui, AI Elements and AI SDK UI `useChat`. The `/buddy/` setup POC connects to the same-origin Worker API, uses OpenAI for conversation and photo analysis, stores private photos in R2 and retrieves equipment specifications from D1. Credentials stay server-side. Sessions and preview budgets are held in Durable Objects. Local fixture mode and illustrative app scenes remain available for design review and browser tests. Unknown or stale readings stay distinct from zero and from current measurements; Buddy's advice does not control equipment.

The enquiry form prepares an unsent email draft. The visitor reviews and sends it in their mail app; the website does not store or submit the form.

## Verification

After a full build, serve `dist/` locally and run:

```sh
pnpm verify:website
pnpm verify:storybook
pnpm verify:buddy-assets
```

The browser scripts use Playwright. Set `ORIGIN89_PLAYWRIGHT_PATH` and `ORIGIN89_CHROMIUM_PATH` for an existing bundled runtime. `ORIGIN89_WEBSITE_URL` defaults to `http://127.0.0.1:4325`; `ORIGIN89_STORYBOOK_URL` defaults to `http://127.0.0.1:6007`. To use one Wrangler preview, point the first at its origin and the second at its `/storybook` path.

Buddy checks compare the decoded source pixels with the actual CSS width at 1x, 2x and 3x density on desktop and phone layouts. They cover twelve website routes, the expression stories, transparent downloads and app icons. The website CI runs this check after rebuilding.

Website checks cover generated HTML/internal assets, desktop/mobile routes, developer-guide controls/downloads, catalogue search and model transfer, client navigation, site themes, mobile menus, Buddy chat/map/photo handling and legacy redirects. Storybook checks cover all stories, image assets, streaming/error/retry states, mobile chat/map views and manager viewports. Reports are written to ignored `website-report/` and `storybook-report/` directories.

This app is the public Worker. It owns the hostname and the pre-rendered site, and forwards `/api/buddy/*` across a service binding to `origin89-buddy`, which has no route of its own. `pnpm preview` runs the website and released Buddy fixture together for local API checks:

```sh
pnpm preview            # website worker plus the packaged Buddy fixture
```

That also checks Cloudflare redirects, trailing-slash handling, headers and real 404 responses. Build success alone does not mean the site has been deployed.

The Worker also answers `POST /api/waitlist` for the homepage form. It checks the visitor's Cloudflare Turnstile token, then adds the address to the Mailchimp audience in `wrangler.jsonc` as pending with the `controller-waitlist` tag, so Mailchimp sends the confirmation email. `MAILCHIMP_API_KEY` and `TURNSTILE_SECRET_KEY` are required Worker secrets; the GitHub deploy uploads them with each version from the `website-production` environment. Production accepts tokens only from the Worker's own hostnames. For local sign-ups, put both secrets in an ignored `apps/website/.dev.vars` and add `localhost` and `127.0.0.1` to the Turnstile widget. Without the secrets, the route answers 503 and the form asks visitors to write to the contact address.
