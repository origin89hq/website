# Origin89 website

The product website, interactive app demonstrations and Buddy web experience at [origin89.com](https://origin89.com). Equipment research lives at [data.origin89.com](https://data.origin89.com).

```sh
pnpm install --frozen-lockfile
just dev
just check
```

Use Node from `.node-version`, pnpm from `package.json`, and `just`. `apps/website` contains the React site, static rendering, Storybook and the public Cloudflare Worker. `just storybook` opens component development. `just check` covers lint, behavior tests, React and Worker types, and the full site/Storybook build. The committed equipment table is a reviewed website snapshot; builds do not read a private research checkout. Product demonstrations are illustrative, not live measurements.

Shared drawings come from the versioned [UI library](https://github.com/origin89hq/ui). Buddy contracts and its local fixture Worker come from a versioned [Buddy release](https://github.com/origin89hq/buddy). Their release tarballs and integrity hashes are pinned in `pnpm-lock.yaml`; a sibling checkout is not required. The working `/buddy/` frontend lives here, while inference, equipment tools, D1, R2 and sessions live in Buddy.

Asset preparation reuses outputs only when their bytes, source inputs and image-tool versions match. A clean checkout or any missing/modified output regenerates them. The reviewed equipment snapshot remains a tracked input.

## Local browser checks

Run `just build`, then `just fixture` to start the website and the packaged fixture service. Set `ORIGIN89_WEBSITE_URL` to the printed website address and `ORIGIN89_STORYBOOK_URL` to its `/storybook` path, then run `just browser-check`. Install Chromium once with `pnpm --filter origin89-website exec playwright install chromium`. Fixture mode makes no paid model calls.

## Deploy with GitHub Actions

The `Checks` workflow deploys the current `main` commit after its tests and browser checks pass. A manual run on `main` repeats those checks before deploying. PRs only run checks. Production runs are serialized and are not cancelled by newer pushes.

Use the organization Actions secret `CLOUDFLARE_API_TOKEN`, with access granted to this repository. Set `CLOUDFLARE_ACCOUNT_ID`, `WEBSITE_WORKER_NAME`, `BUDDY_WORKER_NAME` and `BUDDY_HOSTNAME` as repository variables. Restrict the `website-production` environment to `main`. Remove any repository or environment copy of the token after organization access is verified; those copies override the shared value. The workflow deploys only the website and preserves its existing Buddy service binding. Set `MAILCHIMP_API_KEY` and `TURNSTILE_SECRET_KEY` as `website-production` environment secrets; the deploy uploads them with the Worker version, and Wrangler refuses a deploy without them.

## Deploy directly to Cloudflare

Copy `apps/website/.env.example` to `apps/website/.env.production` and fill the account ID and intended targets. Authenticate with `pnpm --filter origin89-website exec wrangler login`, or supply `CLOUDFLARE_API_TOKEN`. Run `just check`, then `just deploy`. It builds the site and Storybook, generates an ignored target config, and deploys `origin89-website` with the existing Buddy service binding. GitHub Actions is not required. The named Buddy Worker must already exist; this command does not deploy Buddy or create its storage. It does not upload the waitlist secrets either, so Wrangler refuses it until a GitHub deploy has set them on the Worker.

See [LICENSING.md](LICENSING.md) for source, artwork and third-party terms.
