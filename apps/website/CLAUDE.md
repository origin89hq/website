Read the root `AGENTS.md` and load the shared TypeScript, brand, and testing
skills. The active website uses React and Vite; the Astro files support the
archived design. Inspect `package.json` before choosing a command.

From the repository root, use `just dev` for development, `pnpm --filter origin89-website check`
for types and generated inputs, and `just build` for production output.
Keep Storybook and the published site on the same components. Use the released
brand package's tokens and assets. Preserve the browser checks in `.github/workflows/check.yml`.
