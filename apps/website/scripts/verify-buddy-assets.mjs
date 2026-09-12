import assert from "node:assert/strict";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const { chromium } = await import(process.env.ORIGIN89_PLAYWRIGHT_PATH || "playwright");
const base = (process.env.ORIGIN89_WEBSITE_URL || "http://127.0.0.1:4325").replace(/\/$/, "");
const output = new URL("../website-report/buddy/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ORIGIN89_CHROMIUM_PATH,
});
const checks = [],
  samples = [],
  closeupSamples = [],
  heroSamples = [],
  websiteSamples = [],
  errors = [];
try {
  const html = await readFile(new URL("../dist/buddy/index.html", import.meta.url), "utf8");
  assert.match(html, /rel="icon" href="\/brand\/buddy-favicon-48.png"/);
  assert.match(html, /rel="apple-touch-icon" href="\/brand\/buddy-apple-touch.png"/);
  assert.match(html, /rel="manifest" href="\/brand\/buddy.webmanifest"/);
  const manifest = await (await fetch(base + "/brand/buddy.webmanifest")).json();
  assert.equal(manifest.start_url, "/buddy/");
  // The front-facing avatar every app icon must contain, read from the package
  // rather than from the icons themselves: a check whose witness is the thing
  // it checks is the same opinion written twice.
  const avatarSource = new URL(
    "../node_modules/@origin89/brand/art/avatar-welcoming.webp",
    import.meta.url,
  );
  for (const icon of manifest.icons) {
    const response = await fetch(base + icon.src);
    assert.equal(response.status, 200);
    const bytes = Buffer.from(await response.arrayBuffer());
    const meta = await sharp(bytes).metadata();
    assert.equal(`${meta.width}x${meta.height}`, icon.sizes);
    assert.deepEqual(
      await sharp(bytes).removeAlpha().raw().toBuffer(),
      await sharp(avatarSource.pathname)
        .resize(meta.width, meta.height)
        .removeAlpha()
        .raw()
        .toBuffer(),
      `${icon.src} must contain the current front-facing avatar`,
    );
  }
  const favicon = await sharp(
    Buffer.from(await (await fetch(base + "/brand/buddy-favicon-48.png")).arrayBuffer()),
  )
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(favicon.data[3], 0, "Circular favicon has transparent corners");
  assert.ok(favicon.data[(24 * 48 + 24) * favicon.info.channels + 3] > 250);
  const retired = (await readdir(new URL("../src/react/generated/", import.meta.url))).filter(
    (name) => /^buddy-.*\.svg$/.test(name),
  );
  assert.deepEqual(retired, [], "Retired SVG avatar files must be removed");
  checks.push("Native portrait app icons and circular PNG favicon replace the SVG artwork");
  checks.push(
    "Buddy route declares working favicon, Apple icon and app manifest with correctly sized icons",
  );
  for (const file of ["buddy-portrait.png", "buddy-full-body.png"]) {
    const response = await fetch(base + "/brand/" + file);
    assert.equal(response.status, 200);
    const stats = await sharp(Buffer.from(await response.arrayBuffer())).stats();
    assert.equal(stats.channels[3].min, 0);
    assert.equal(stats.channels[3].max, 255);
  }
  checks.push("Portrait and full-body downloads retain native alpha transparency");
  for (const density of [1, 2, 3]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: density,
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(
      `${base}/storybook/iframe.html?id=buddy-avatar--beside-a-message&viewMode=story`,
      { waitUntil: "load" },
    );
    assert.equal(response.status(), 200);
    const avatar = page.locator("[data-buddy-avatar]");
    await avatar.waitFor();
    await avatar.evaluate((img) => img.decode());
    const src = await avatar.evaluate((img) => img.currentSrc);
    assert.ok(!src.startsWith("data:"), "Avatar must not be embedded in the JavaScript bundle");
    assert.match(src, new RegExp(`buddy-welcoming-avatar-${[48, 96, 192][density - 1]}-`));
    assert.equal(await avatar.getAttribute("data-buddy-rendering"), "3d");
    assert.equal(await avatar.getAttribute("data-buddy-framing"), "avatar");
    assert.equal(await avatar.evaluate((img) => getComputedStyle(img).borderRadius), "50%");
    const image = await page.request.get(src);
    const bytes = (await image.body()).length;
    assert.ok(bytes < 6000, `${density}x chat avatar: ${bytes} bytes`);
    const requests = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) =>
          /buddy-(welcoming|explaining|thinking|delighted|concerned|surprised|playful)-[^/]+\.(svg|webp)$/.test(
            entry.name,
          ),
        )
        .map((entry) => entry.name),
    );
    assert.equal(requests.length, 1, "Only the selected avatar artwork should download");
    const meta = await sharp(await image.body()).metadata();
    assert.deepEqual(
      await image.body(),
      await readFile(
        new URL(
          `../src/react/generated/buddy-welcoming-avatar-${meta.width}.webp`,
          import.meta.url,
        ),
      ),
      "Storybook must serve the current generated avatar",
    );
    assert.equal(
      meta.hasAlpha,
      false,
      "Small avatars keep their opaque green background inside the CSS circle",
    );
    assert.ok(meta.width >= 48 * density);
    samples.push({ density, displayedPixels: 48, sourcePixels: meta.width, format: "webp", bytes });
    await page.screenshot({
      path: new URL(`chat-${density}x.png`, output).pathname,
    });
    await page.goto(`${base}/storybook/iframe.html?id=buddy-avatar--playful&viewMode=story`, {
      waitUntil: "load",
    });
    const closeup = page.locator('[data-buddy-avatar="playful"]').first();
    await closeup.waitFor();
    await closeup.evaluate((img) => img.decode());
    const displayed = await closeup.evaluate((img) => ({
      src: img.currentSrc,
      width: img.getBoundingClientRect().width,
    }));
    assert.match(displayed.src, /buddy-playful-portrait-/);
    const closeupResponse = await page.request.get(displayed.src);
    assert.equal(closeupResponse.status(), 200);
    const closeupBytes = await closeupResponse.body();
    const closeupMeta = await sharp(closeupBytes).metadata();
    assert.equal(closeupMeta.hasAlpha, true, "Large portraits retain native transparency");
    assert.ok(
      closeupMeta.width >= Math.ceil(displayed.width * density),
      "Large close-up avatars need enough source pixels for the display density",
    );
    closeupSamples.push({
      density,
      displayedPixels: displayed.width,
      sourcePixels: closeupMeta.width,
      bytes: closeupBytes.length,
    });
    await page.screenshot({
      path: new URL(`playful-${density}x.png`, output).pathname,
    });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(base + "/products/buddy/", { waitUntil: "load" });
      const hero = page.locator('.product-hero-buddy [data-buddy-avatar="welcoming"]');
      await hero.waitFor();
      await hero.evaluate((img) => img.decode());
      const shown = await hero.evaluate((img) => ({
        src: img.currentSrc,
        width: img.getBoundingClientRect().width,
      }));
      assert.match(shown.src, /buddy-welcoming-portrait-/);
      const response = await page.request.get(shown.src);
      assert.equal(response.status(), 200);
      const bytes = await response.body();
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.hasAlpha, true);
      assert.equal(await hero.evaluate((img) => getComputedStyle(img).borderRadius), "0px");
      assert.ok(
        metadata.width >= Math.ceil(shown.width * density),
        "Hero portrait must have enough source pixels at the actual display size",
      );
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      heroSamples.push({
        viewport: width,
        density,
        displayedPixels: shown.width,
        sourcePixels: metadata.width,
        bytes: bytes.length,
      });
      await page.screenshot({ path: new URL(`product-${width}-${density}x.png`, output).pathname });
    }
    // Use fresh pages to keep previously cached large portraits from masking
    // an undersized candidate on the first visit to a different layout.
    for (const width of [1440, 390]) {
      for (const path of [
        "/",
        "/products/",
        "/products/buddy/",
        "/products/offgrid/",
        "/sites/cottage/",
        "/sites/mining/",
        "/sites/telecom/",
        "/app/cottage/",
        "/app/mining/",
        "/app/telecom/",
        "/buddy/",
        "/developers/design-guide/",
      ]) {
        const fresh = await browser.newContext({
          viewport: { width, height: 1000 },
          deviceScaleFactor: density,
        });
        try {
          const screen = await fresh.newPage();
          screen.on("pageerror", (error) => errors.push(error.message));
          assert.equal((await screen.goto(base + path, { waitUntil: "load" })).status(), 200);
          // The energy view keeps Buddy in the conversation, opened by the user.
          if (await screen.locator("[data-buddy-app]").count()) {
            await screen.locator("[data-ask]").first().click();
            await screen.locator(".buddy-dialog[open]").waitFor();
          }
          const images = await screen.locator("[data-buddy-avatar]").evaluateAll(async (images) => {
            images.forEach((image) => {
              image.loading = "eager";
            });
            await Promise.all(images.map((image) => image.decode()));
            return images
              .map((image) => ({
                src: image.currentSrc,
                width: image.getBoundingClientRect().width,
                framing: image.dataset.buddyFraming,
                expression: image.dataset.buddyAvatar,
              }))
              .filter((image) => image.width > 0);
          });
          assert.ok(images.length > 0, `${path}: Buddy must be present`);
          for (const image of images) {
            assert.ok(
              ["avatar", "portrait"].includes(image.framing),
              `${path}: expected current Buddy artwork`,
            );
            const response = await screen.request.get(image.src);
            assert.equal(response.status(), 200);
            const bytes = await response.body();
            const metadata = await sharp(bytes).metadata();
            assert.deepEqual(
              bytes,
              await readFile(
                new URL(
                  `../src/react/generated/buddy-${image.expression}-${image.framing}-${metadata.width}.webp`,
                  import.meta.url,
                ),
              ),
              `${path}: website must serve the current generated Buddy artwork`,
            );
            assert.ok(
              metadata.width >= Math.ceil(image.width * density),
              `${path} at ${width}px / ${density}x: ${image.width}px Buddy needs ${Math.ceil(image.width * density)} source pixels, got ${metadata.width}`,
            );
            assert.equal(metadata.hasAlpha, image.framing === "portrait");
            websiteSamples.push({
              path,
              viewport: width,
              density,
              displayedPixels: image.width,
              sourcePixels: metadata.width,
              bytes: bytes.length,
            });
          }
        } finally {
          await fresh.close();
        }
      }
    }
    await context.close();
  }
  checks.push(
    "Website and Storybook serve the current generated Buddy artwork without requiring archived design outputs",
    "48 px chat avatar loads one circular native green portrait at 1x, 2x and 3x density",
    "Large playful close-ups have enough source pixels at 1x, 2x and 3x density",
    "Buddy product portrait is sharp at desktop and phone sizes at 1x, 2x and 3x density, without overflow",
    "Every visible Buddy image on twelve website routes has enough source pixels at desktop and phone widths at 1x, 2x and 3x density",
  );
  const page = await browser.newPage({
    viewport: { width: 1200, height: 850 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const story of [
    "greeting",
    "sizes",
    "expressions",
    "light-and-dark",
    "beside-a-message",
    "chat-framing",
    "app-icons",
    "playful",
    "rendering",
    "portrait-expressions",
    "portrait-backgrounds",
  ]) {
    await page.goto(`${base}/storybook/iframe.html?id=buddy-avatar--${story}&viewMode=story`, {
      waitUntil: "load",
    });
    await page.locator("#storybook-root img").first().waitFor();
    const broken = await page.locator("#storybook-root img").evaluateAll(async (images) => {
      await Promise.all(images.map((image) => image.decode()));
      return images.filter((image) => !image.naturalWidth).map((image) => image.src);
    });
    assert.deepEqual(broken, []);
    if (story === "portrait-expressions") {
      const portraits = await page.locator("[data-buddy-avatar]").evaluateAll((images) =>
        images.map((img) => ({
          expression: img.dataset.buddyAvatar,
          framing: img.dataset.buddyFraming,
          src: img.currentSrc,
        })),
      );
      assert.equal(portraits.length, 7);
      assert.equal(new Set(portraits.map((img) => img.src)).size, 7);
      for (const portrait of portraits) {
        assert.equal(portrait.framing, "portrait");
        assert.ok(portrait.src.includes(`buddy-${portrait.expression}-portrait-`));
      }
    }
    await page.screenshot({ path: new URL(`${story}.png`, output).pathname });
  }
  checks.push("Eleven avatar stories render with complete image assets");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(base + "/app/cottage/", { waitUntil: "load" });
    await page.locator("[data-ask]").first().click();
    await page.locator(".buddy-dialog[open] [data-buddy-avatar]").waitFor();
    await page
      .locator(".buddy-dialog[open] [data-buddy-avatar]")
      .first()
      .evaluate((image) => image.decode());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({
      path: new URL(`app-${width}.png`, output).pathname,
    });
  }
  await page.goto(
    `${base}/storybook/iframe.html?id=buddy-photo-inventory-poc--welcome&viewMode=story`,
    { waitUntil: "load" },
  );
  await page.locator(".poc-speaker [data-buddy-avatar]").waitFor();
  await page.locator(".poc-speaker [data-buddy-avatar]").evaluate((image) => image.decode());
  await page.screenshot({
    path: new URL("photo-inventory-phone.png", output).pathname,
  });
  checks.push(
    "Site app at desktop/phone sizes and Buddy photo-inventory fixture use the shared avatar",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    new URL("checks.json", output),
    JSON.stringify(
      { passed: true, checks, samples, closeupSamples, heroSamples, websiteSamples, errors },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ checks, samples, closeupSamples, heroSamples }, null, 2));
} finally {
  await browser.close();
}
