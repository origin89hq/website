# Origin89 component review

Storybook renders the production React components directly. Its 43 stories cover foundations, shadcn buttons, Buddy conversation/map states, Offgrid app scenes, the journal website and developer pages. Controls include site palettes and phone/tablet/desktop viewports.

## Run and share

From the repository root:

```sh
pnpm design:storybook          # Component development at http://127.0.0.1:6006
pnpm web:dev                   # Website development at http://127.0.0.1:4321
pnpm design:storybook:build    # Static component library
pnpm web:build                 # Production website, including /storybook/
pnpm design:review             # Full build; refresh the existing ngrok file preview
pnpm web:check                 # Shared React and story types
```

Storybook does not require an Astro build. Its static assets come from `public/` and the same generated imports as the website. Production builds mount the library at `/storybook/`; ngrok serves it from `design-dist/storybook/`. The canonical journal website is now `/`, with app scenes at `/app/{site}/`. Previous journal preview URLs redirect there.

## Source map

- `src/react/components/site/SiteJournal.tsx`: responsive homepage, site tabs, app demonstrations and chat dialog.
- `src/react/components/site/BuddyApp.tsx` and `RemoteAppScene.tsx`: interactive app scenes and chemistry-specific care examples.
- `src/react/components/buddy/BuddyWorkspace.tsx`: AI Elements conversation, attachments, composer and AI SDK UI state.
- `src/react/components/buddy/SetupMap.tsx`: editable SVG equipment map and device details.
- `src/react/components/buddy/setup-model.ts` and `transport.ts`: deterministic fixtures, streaming mock and future Cloudflare transport.
- `src/react/routes/`: the full website pages, including the interactive developer design guide.
- `src/react/styles/`: shared site styles and semantic shadcn tokens.
- `design/stories/`: foundations, buttons, chat/map states, app scenes and website/developer stories.

AI Elements and shadcn components were installed from their official source registries and are maintained in `src/react/components/ai-elements/` and `ui/`. Local adjustments remove unused Streamdown plugins, update form submit types and apply Origin89 styling. `scripts/prepare-website.mjs` generates optimized images from existing source artwork; `scripts/prepare-catalogue.mjs` prepares structured research metadata. The editable brand/CAD sources remain authoritative.

## Buddy and Cloudflare

The shared stack is React 19, Tailwind 4, shadcn/ui, AI Elements and AI SDK UI `useChat`. TanStack Router handles the website. Components accept props and callbacks so Storybook can render them without a website router.

Cloudflare is the intended AI backend. `createCloudflareTransport()` prepares a same-origin `/api/buddy/chat` connection using the AI SDK UI message stream. The endpoint and inference provider are **not implemented**. Current stories and website use `createMockTransport()`: no remote photo analysis or equipment control occurs. Photos stay in memory; exported JSON contains file metadata only. Unknown models, occupied interfaces and stale readings remain visibly unresolved.

The production website now pre-renders React routes to HTML and hydrates them. Cloudflare serves the resulting static assets; no request-time rendering or AI Worker has been deployed as part of the migration.

## Verification

`.storybook/verify.mjs` checks all stories and images, live themes, attachment removal, empty submission, stop/retry, 320/390px chat/map behavior, app/site interactions and manager viewports. Run `pnpm --filter origin89-website verify:storybook` against a built/served Storybook. Reports go to ignored `storybook-report/`.

Set `ORIGIN89_PLAYWRIGHT_PATH` and `ORIGIN89_CHROMIUM_PATH` for a bundled browser runtime; `ORIGIN89_STORYBOOK_URL` overrides the default `http://127.0.0.1:6007`. The full website has a separate `verify:website` script; see the [website documentation](../README.md).

## References

- [Storybook React/Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite)
- [TanStack Router server rendering](https://tanstack.com/router/latest/docs/guide/ssr)
- [AI Elements setup](https://elements.ai-sdk.dev/docs/setup)
- [AI SDK UI chat](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [Cloudflare Workers AI with AI SDK](https://developers.cloudflare.com/workers-ai/configuration/ai-sdk/)
- [Cloudflare static-site routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
