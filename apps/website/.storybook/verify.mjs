import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pickSource } from "./pick-source.mjs";

const { chromium } = await import(process.env.ORIGIN89_PLAYWRIGHT_PATH || "playwright");
const base = (process.env.ORIGIN89_STORYBOOK_URL || "http://127.0.0.1:6007").replace(/\/$/, "");
const output = new URL("../storybook-report/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ORIGIN89_CHROMIUM_PATH,
  // Pin what the compositor is free to vary between runs: which rasteriser draws an image, and
  // whether it refines a decode after first paint.
  args: [
    "--disable-gpu",
    "--disable-gpu-rasterization",
    "--disable-checker-imaging",
    "--disable-partial-raster",
    "--force-color-profile=srgb",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [],
  checks = [];
page.on("pageerror", (error) => errors.push(error.message));
const { entries } = await (await fetch(`${base}/index.json`)).json();
const stories = Object.values(entries).filter((entry) => entry.type === "story");
async function open(id, extra = "") {
  const response = await page.goto(`${base}/iframe.html?id=${id}&viewMode=story${extra}`, {
    waitUntil: "load",
  });
  assert.equal(response.status(), 200);
  await page.locator("#storybook-root > *").waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function ready() {
  await page.locator('[data-chat-status="ready"]').waitFor();
}
/**
 * Images are the reason these screenshots used to differ between two runs of the same build.
 * `waitUntil: "load"` covers the document, and `document.fonts.ready` covers text, but nothing
 * waited for an <img> to arrive and decode — and Buddy's avatar is a srcSet the browser resolves
 * per viewport, so a run could photograph it half-painted or not yet swapped. Five of the six
 * screenshots moved between runs; one by 4,528 pixels.
 */
async function imagesSettled() {
  // Every frame, not just the top document: the manager preset photographs a story through an
  // iframe and some stories embed the site through another, and the avatar inside those was
  // still moving once the outer page had settled.
  await Promise.all(
    page.frames().map(async (frame) => {
      try {
        // The choice is made here, with a rule that has its own tests, rather than inside the
        // page: a selector that quietly stopped parsing would otherwise restore the flake with
        // nothing to say so.
        const drawn = await frame.evaluate(() =>
          [...document.images].map((image, index) => ({
            index,
            srcset: image.getAttribute("srcset"),
            wanted: image.clientWidth * devicePixelRatio,
          })),
        );
        const pinned = drawn
          .map(({ index, srcset, wanted }) => ({ index, url: pickSource(srcset, wanted) }))
          .filter(({ url }) => url);
        await frame.evaluate((picks) => {
          for (const { index, url } of picks) {
            const image = document.images[index];
            if (!image) continue;
            image.removeAttribute("srcset");
            image.removeAttribute("sizes");
            if (image.getAttribute("src") !== url) image.setAttribute("src", url);
          }
        }, pinned);
        await frame.evaluate(async () => {
          const images = [...document.images];
          // A lazy image below the fold may never start loading while the page sits still, which
          // is how a screenshot ended up with the portrait missing entirely rather than half
          // drawn. Asking for it eagerly is what makes the run reproducible.
          for (const image of images) if (image.loading === "lazy") image.loading = "eager";
          const settled = (image) =>
            new Promise((resolve) => {
              if (image.complete) return resolve();
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            });
          await Promise.all(
            images.map(async (image) => {
              if (!image.getAttribute("src") && !image.srcset) return;
              // An asset that never arrives must not hold the run open; the asset check is what
              // reports a broken image, this only decides when to stop waiting.
              await Promise.race([settled(image), new Promise((r) => setTimeout(r, 5000))]);
              try {
                await image.decode();
              } catch {
                // Broken or cross-origin: nothing to wait for.
              }
            }),
          );
        });
        // Pinning is only worth doing if it took, and `currentSrc` alone does not say so: a URL
        // that 404s still becomes the current source, so a selector that started producing
        // nonsense would pass a test of that attribute while the page showed nothing at all.
        // What has to hold is that the pinned file is the one on screen and that it decoded.
        const wrong = await frame.evaluate(
          (picks) =>
            picks
              .filter(({ index, url }) => {
                const image = document.images[index];
                if (!image) return false;
                return !image.currentSrc.endsWith(url) || image.naturalWidth === 0;
              })
              .map(({ url }) => url),
          pinned,
        );
        assert.deepEqual(wrong, [], "a pinned image is not the one showing, or did not load");
      } catch (error) {
        // A frame can go away while a story swaps. Nothing to wait for if it has — but a failed
        // assertion is this run's own finding and must not be swallowed with it.
        if (error instanceof assert.AssertionError) throw error;
      }
    }),
  );
}

async function screenshot(name) {
  await imagesSettled();
  await page.screenshot({
    path: new URL(name + ".png", output).pathname,
    animations: "disabled",
  });
}

try {
  for (const story of stories) {
    await open(story.id);
    if (await page.locator(".sb-site-preview").count()) {
      await page.frameLocator(".sb-site-preview").locator("main").waitFor();
    }
    assert.equal(await page.locator(".sb-errordisplay").isVisible(), false, story.id);
    for (const frame of page.frames()) {
      const broken = await frame.evaluate(async () => {
        // Lazy images below the fold never start in a headless frame; load them so they are checked too.
        for (const image of document.images) if (image.loading === "lazy") image.loading = "eager";
        await Promise.all(
          [...document.images]
            .filter((image) => image.getClientRects().length > 0 && !image.complete)
            .map(
              (image) =>
                new Promise((resolve) => {
                  image.addEventListener("load", resolve, { once: true });
                  image.addEventListener("error", resolve, { once: true });
                }),
            ),
        );
        return [...document.images]
          .filter((image) => image.getClientRects().length > 0 && image.naturalWidth === 0)
          .map((image) => image.src);
      });
      assert.deepEqual(broken, [], `${story.id}: image assets`);
    }
  }
  checks.push(`${stories.length} stories render with working image assets`);

  await open("buddy-setup-conversation--start-with-a-photo", "&globals=site:telecom");
  assert.equal(await page.locator(".buddy-workspace").getAttribute("data-site"), "telecom");
  await open("buddy-setup-conversation--start-with-a-photo");
  assert.equal(
    await page.getByRole("button", { name: "Send message", exact: true }).isEnabled(),
    false,
  );
  const photo = new URL("../src/assets/art/cottage.webp", import.meta.url).pathname;
  await page.locator('input[type="file"]').setInputFiles(photo);
  await page.getByRole("button", { name: "Remove cottage.webp" }).click();
  assert.equal(
    await page.getByRole("button", { name: "Send message", exact: true }).isEnabled(),
    false,
  );
  await screenshot("buddy-welcome-desktop");

  await open("buddy-setup-conversation--connection-interrupted");
  await page.getByText("Connection interrupted. Your messages are still here.").waitFor();
  await page.getByRole("button", { name: "Try again" }).click();
  await ready();
  assert.match(await page.locator(".chat-buddy").last().innerText(), /Which EPEVER model/);
  await open("buddy-setup-conversation--streaming");
  await page.locator('[data-chat-status="streaming"]').waitFor();
  assert.ok(await page.getByRole("button", { name: "Stop reply" }).locator("svg").count());
  await page.getByRole("button", { name: "Stop reply" }).click();
  await ready();
  await page.getByText("Reply stopped. Your messages are still here.").waitFor();
  await page.getByRole("button", { name: "Try again" }).click();
  await ready();
  assert.match(await page.locator(".chat-buddy").last().innerText(), /Which EPEVER model/);
  checks.push("Live site palette, attachment removal, empty-send protection, stop and retry");

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await open("buddy-setup-conversation--setup-mapped");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.getByRole("button", { name: /Your map/ }).click();
    assert.equal(await page.locator(".setup-conversation").isVisible(), false);
    assert.equal(await page.locator(".setup-plan").isVisible(), true);
    await page.locator('[data-map-node="primary"]').click();
    assert.equal(await page.locator("[data-detail-source]").isVisible(), true);
    await page.getByRole("button", { name: "Close equipment details" }).click();
    await screenshot(`buddy-map-${width}`);
    await page.getByRole("button", { name: "Chat with Buddy" }).click();
    await page.locator("[data-chat-reset]").click();
    await screenshot(`buddy-welcome-${width}`);
    assert.equal(await page.locator(".chat-message").count(), 1);
  }
  checks.push("390px and 320px chat/map views, model details, reset, no horizontal overflow");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await open("app-offgrid--cottage");
  let frame = page;
  await frame.locator('.app-nav [data-switch="energy"]').click();
  assert.equal(await frame.locator('[data-panel="energy"]').isVisible(), true);
  await frame.locator('.app-nav [data-switch="care"]').click();
  await frame.getByRole("combobox").selectOption("agm");
  assert.match(await frame.locator(".care-note").innerText(), /Do not open sealed/);
  await open("app-offgrid--battery-care");
  await page.locator('[data-panel="care"]:visible').waitFor();
  await open("website-homepage--desktop");
  frame = page;
  await frame.getByRole("tab", { name: "ESP32-C6", exact: true }).click();
  assert.equal(await frame.locator("#mcu-esp32").isVisible(), true);
  await frame.locator("[data-open-setup]").first().click();
  await frame.locator("[data-setup-dialog][open]").waitFor();
  await frame.getByRole("button", { name: "Try a solar example" }).click();
  await frame.locator('[data-chat-status="ready"]').waitFor();
  assert.equal(
    await frame.getByRole("button", { name: "Tracer 10415AN", exact: true }).isVisible(),
    true,
  );
  checks.push(
    "Shared React app navigation and battery care; homepage processor tabs and Buddy chat",
  );

  await page.goto(`${base}/?path=/story/buddy-setup-conversation--phone`, {
    waitUntil: "load",
  });
  await page.frameLocator("#storybook-preview-iframe").locator(".buddy-workspace").waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector("#storybook-preview-iframe")?.getBoundingClientRect().width === 390,
  );
  await screenshot("storybook-phone-review");
  checks.push("Storybook manager and phone viewport preset");
  assert.deepEqual(errors, []);
  await writeFile(
    new URL("verification.json", output),
    JSON.stringify({ checkedAt: new Date().toISOString(), base, checks, errors }, null, 2) + "\n",
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
