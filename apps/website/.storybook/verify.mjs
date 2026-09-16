import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const { chromium } = await import(process.env.ORIGIN89_PLAYWRIGHT_PATH || "playwright");
const base = (process.env.ORIGIN89_STORYBOOK_URL || "http://127.0.0.1:6007").replace(/\/$/, "");
const output = new URL("../storybook-report/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ORIGIN89_CHROMIUM_PATH,
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
async function screenshot(name) {
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
