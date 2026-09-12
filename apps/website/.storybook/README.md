# Component review

Storybook renders the production React components from `stories/`. It covers
foundations, buttons, Buddy conversation and equipment states, the three site
settings, and the website pages. Site palettes and viewport controls are available
in the toolbar.

From the repository root:

```sh
just storybook        # Component development on port 6006
just dev              # Website development on port 4321
just check            # Lint, behavior tests, React/Worker types and full build
just fixture          # Built website and packaged Buddy fixture
just browser-check    # Browser checks against the configured preview URLs
```

Set `ORIGIN89_WEBSITE_URL` to the fixture's website origin and
`ORIGIN89_STORYBOOK_URL` to its `/storybook` path. `just build` builds both the
website and the public component library. Install the browser once with
`pnpm --filter origin89-website exec playwright install chromium`.

The `src/react` components, styles and generated brand assets are shared with the
website. `scripts/prepare-website.mjs` verifies or regenerates the assets; the
reviewed equipment snapshot is tracked separately. `.storybook/verify.mjs` checks
story rendering, image loading, conversation states, attachment handling, app
controls, and phone layouts. Reports stay in ignored `storybook-report/`.

Storybook uses local conversation fixtures. The deployed website's `/buddy/`
frontend calls the same-origin API, forwarded to the separately deployed Buddy
service. Its inference, credentials, equipment database and sessions belong to
[Buddy](https://github.com/origin89hq/buddy).

See the [website guide](../README.md) for component locations and the
[repository README](../../../README.md) for direct Cloudflare deployment.
