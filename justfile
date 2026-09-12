skills-sync:
    python3 .origin89/sync-engineering.py
check:
    pnpm check
dev:
    pnpm dev
build:
    pnpm build
fixture:
    pnpm --filter origin89-website preview
browser-check:
    pnpm --filter origin89-website verify:website
    pnpm --filter origin89-website verify:storybook
    pnpm --filter origin89-website verify:buddy-assets
deploy:
    pnpm run deploy
storybook:
    pnpm --filter origin89-website storybook
