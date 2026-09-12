import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";

const { chromium } = await import(process.env.ORIGIN89_PLAYWRIGHT_PATH || "playwright");
const { publicPaths } = await import("../.website-server/entry-server.js");
const base = (process.env.ORIGIN89_WEBSITE_URL || "http://127.0.0.1:4325").replace(/\/$/, "");
const out = new URL("../dist/", import.meta.url),
  report = new URL("../website-report/", import.meta.url);
await mkdir(report, { recursive: true });
const checks = [],
  errors = [];
let references = 0;
for (const path of [...publicPaths, "/404/"]) {
  const html = await readFile(
    new URL(path === "/404/" ? "404.html" : path.slice(1) + "index.html", out),
    "utf8",
  );
  assert.ok(!html.includes("\u0000"), "HTML must not contain raw NUL characters");
  assert.ok(html.includes('name="description"'));
  assert.ok(html.includes('rel="canonical"'));
  assert.ok(path.startsWith("/app/") || html.includes("<h1"), `${path}: content before JavaScript`);
  for (const [, url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"#]*)"/g)) {
    const pathname = new URL(url, "http://local").pathname;
    if (!pathname || pathname === "/") continue;
    const file = new URL(pathname.slice(1) + (pathname.endsWith("/") ? "index.html" : ""), out);
    await access(file).catch(() => {
      throw new Error(`${path}: missing internal target ${pathname}`);
    });
    references++;
  }
}
checks.push(
  `${publicPaths.length} pre-rendered pages, 404, metadata and ${references} internal references`,
);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ORIGIN89_CHROMIUM_PATH,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text().slice(0, 500));
});
async function open(path, width = 1440) {
  await page.setViewportSize({ width, height: width < 760 ? 844 : 1000 });
  const response = await page.goto(base + path, { waitUntil: "load" });
  assert.equal(response.status(), 200, path);
  await page.locator("main").waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function shot(name) {
  await page.screenshot({
    path: new URL(name + ".png", report).pathname,
    animations: "disabled",
  });
}
try {
  for (const path of publicPaths) {
    for (const width of [1440, 390]) {
      await open(path, width);
      await page.waitForTimeout(80);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${path}: overflow at ${width}`,
      );
      assert.equal(await page.locator("h1").count(), path.startsWith("/app/") ? 0 : 1);
      if (
        [
          "/",
          "/products/controller/",
          "/developers/",
          "/developers/design-guide/",
          "/equipment/",
        ].includes(path)
      )
        await shot((path.split("/").filter(Boolean).join("-") || "home") + "-" + width);
    }
  }
  checks.push(
    "All routes at 1440px and 390px, one page heading, no horizontal overflow or hydration errors",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open("/");
  const interior = page.getByRole("button", { name: "Show controller interior", exact: true });
  await page.waitForFunction(
    () => !document.querySelector(".controller-study-controls button").disabled,
  );
  await page.mouse.wheel(0, 650);
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector(".controller-cover")).opacity === "0",
  );
  assert.equal(await interior.getAttribute("aria-pressed"), "true");
  await page.mouse.wheel(0, -650);
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector(".controller-cover")).opacity === "1",
  );
  assert.equal(await interior.getAttribute("aria-pressed"), "false");

  await open("/", 320);
  await page.waitForFunction(
    () => !document.querySelector(".controller-study-controls button").disabled,
  );
  const detailHeights = [];
  for (const name of ["Inverter", "Battery", "Sensors"]) {
    await page.getByRole("button", { name, exact: true }).click();
    detailHeights.push(
      await page
        .locator(".controller-connection-detail")
        .evaluate((element) => element.getBoundingClientRect().height),
    );
  }
  assert.ok(
    Math.max(...detailHeights) - Math.min(...detailHeights) < 1,
    "Connection changes must not shift the narrow-screen layout",
  );
  const targets = await page.locator(".controller-hotspot").evaluateAll((elements) =>
    elements.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );
  for (let i = 1; i < targets.length; i++) {
    const left = targets[i - 1],
      right = targets[i];
    assert.ok(
      left.x + left.width <= right.x || left.y >= right.y + right.height,
      "Connection hit targets must not overlap at 320px",
    );
  }
  const zoom = page.getByRole("button", { name: "Zoom controller", exact: true });
  await zoom.click();
  assert.equal(await page.locator(".controller-study").getAttribute("data-zoomed"), "true");
  await zoom.click();
  assert.equal(await page.locator(".controller-study").getAttribute("data-zoomed"), "false");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await open("/", 390);
  await page.waitForFunction(
    () => !document.querySelector(".controller-study-controls button").disabled,
  );
  await interior.focus();
  await page.keyboard.press("Space");
  assert.equal(await interior.getAttribute("aria-pressed"), "true");
  assert.equal(
    await page
      .locator(".controller-cover")
      .evaluate((element) => getComputedStyle(element).transitionDuration),
    "0s",
  );
  assert.equal(
    await page
      .locator(".journal-opening")
      .evaluate((element) => getComputedStyle(element).position),
    "static",
  );
  await page.getByRole("button", { name: "Explore battery connection", exact: true }).click();
  await page.getByRole("link", { name: "Find your battery", exact: true }).click();
  await page.waitForURL("**/equipment/?q=battery");
  assert.equal(await page.locator("#equipment-query").inputValue(), "battery");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  checks.push(
    "Controller scroll teardown reverses, reduced-motion keyboard control works, and battery inspection opens filtered equipment results",
  );

  await open("/developers/design-guide/");
  await page.locator("#color").scrollIntoViewIfNeeded();
  const colors = new Set();
  for (const theme of ["Cottage · warm", "Mining · industrial", "Telecom · cold"]) {
    await page.getByRole("button", { name: theme, exact: true }).click();
    colors.add(
      await page
        .locator(".website-concept")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    );
  }
  assert.equal(colors.size, 3);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__copiedCSS = text;
        },
      },
    });
  });
  await page.getByRole("button", { name: "Copy CSS", exact: true }).click();
  assert.match(await page.evaluate(() => window.__copiedCSS), /var\(--journal-paper\)/);
  await page.getByRole("button", { name: "Copied ✓", exact: true }).waitFor();
  await shot("guide-telecom-palette");
  const downloads = await page
    .locator(".guide-downloads a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  assert.ok(downloads.length >= 10, `only ${downloads.length} downloads on the guide`);
  for (const download of downloads) {
    // Most are served by the site. The identity guide is a release asset in the
    // brand repository, so it is already absolute and pasting the base onto it
    // builds a URL that throws rather than a request that fails.
    const response = await page.request.get(
      download.startsWith("http") ? download : base + download,
    );
    assert.equal(response.status(), 200, download);
    assert.ok((await response.body()).length > 100, download);
  }
  await page.getByRole("link", { name: "Readings & states", exact: true }).click();
  assert.equal(new URL(page.url()).hash, "#readings");
  await shot("guide-reading-states");
  checks.push(
    `Three developer-guide themes, copyable CSS, chapter links and ${downloads.length} working downloads`,
  );
  await open("/equipment/");
  await page.getByRole("searchbox").fill("SmartSolar MPPT 100/30");
  await page.waitForFunction(() =>
    document.querySelector(".catalogue-result-count")?.textContent?.includes("Showing 3 of 3"),
  );
  assert.deepEqual(
    await page.locator(".catalogue-rows h2").allTextContents(),
    Array(3).fill("SmartSolar MPPT 100/30"),
  );
  assert.match(page.url(), /q=/);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(
    () => document.querySelector("input[type=search]")?.value === "SmartSolar MPPT 100/30",
  );
  await page.locator(".catalogue-rows article a").first().click();
  await page.waitForURL("**/contact/**");
  assert.match(
    await page.locator("textarea[name=equipment]").inputValue(),
    /SmartSolar MPPT 100\/30/,
  );
  assert.match(await page.locator("textarea[name=equipment]").inputValue(), /Catalogue profile:/);
  assert.equal(
    await page.locator("textarea[name=job]").evaluate((input) => input.checkValidity()),
    false,
  );
  await open("/equipment/");
  await page.getByRole("searchbox").fill("this-model-does-not-exist");
  await page.getByRole("heading", { name: "No exact match yet." }).waitFor();
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await page.getByRole("button", { name: "Show 24 more" }).click();
  assert.equal(await page.locator(".catalogue-rows article").count(), 48);
  await page.getByLabel("Equipment group", { exact: true }).selectOption("Passive equipment");
  assert.ok(
    (await page.locator(".catalogue-rows article").allTextContents()).every((text) =>
      text.includes("No data interface"),
    ),
  );
  checks.push(
    "Catalogue URL restoration, exact model/profile transfer, empty results, pagination and passive-equipment filtering",
  );
  await open("/");
  await page.evaluate(() => {
    window.__sameDocument = true;
  });
  await page.getByRole("link", { name: "Developers", exact: true }).first().click();
  await page.waitForURL("**/developers/");
  assert.equal(await page.evaluate(() => window.__sameDocument), true);
  assert.match(await page.title(), /Build with Origin89/);
  await page.goBack();
  await page.waitForURL(base + "/");
  const heroCopy = await page.locator(".journal-story").innerText();
  const heroBackground = await page
    .locator(".website-concept")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  for (const [name, id] of [
    ["Cottages", "cottage"],
    ["Mining sites", "mining"],
    ["Remote telecom", "telecom"],
  ]) {
    const tab = page.getByRole("tab", { name: new RegExp(name) });
    await tab.click();
    assert.equal(await tab.getAttribute("aria-controls"), `site-panel-${id}`);
    assert.equal(await page.getByRole("tabpanel").count(), 1);
    const panel = page.locator(`#site-panel-${id}`);
    assert.equal(await panel.isVisible(), true);
    assert.equal(await panel.locator(".underlined-action").getAttribute("href"), `/app/${id}/`);
    assert.equal(await page.locator(".journal-story").innerText(), heroCopy);
    assert.equal(
      await page
        .locator(".website-concept")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
      heroBackground,
    );
    assert.equal(await page.locator(".journal-context [role=tab]").count(), 0);
  }
  await page.getByRole("tab", { name: /Cottages/ }).focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    () =>
      document.querySelector(".journal-examples")?.getAttribute("data-active-site") === "mining",
  );
  assert.match(page.url(), /site=mining/);
  await page.locator(".site-example-copy:visible .underlined-action").click();
  await page.waitForURL("**/app/mining/");
  assert.equal(await page.evaluate(() => window.__sameDocument), true);
  await page.reload({ waitUntil: "load" });
  await page.locator("[data-app-site=mining]").waitFor();
  checks.push("Client navigation, titles, browser back, keyboard site selection and deep links");
  await open("/", 320);
  const solarPreview = page.locator(".app-preview:visible");
  await solarPreview.getByRole("button", { name: "Inspect generator standby" }).click();
  assert.match(await solarPreview.locator(".flow-detail").innerText(), /not supplying power/);
  const equipmentDetails = solarPreview.getByRole("dialog");
  assert.match(await equipmentDetails.innerText(), /Runtime estimate[\s\S]*Unavailable/);
  await equipmentDetails.getByRole("button", { name: "Close equipment details" }).click();
  await solarPreview.getByRole("button", { name: "Inspect battery charging" }).click();
  assert.match(await solarPreview.locator(".flow-detail").innerText(), /before conversion losses/);
  assert.match(await equipmentDetails.innerText(), /10.0 kWh/);
  await equipmentDetails.getByRole("button", { name: "Close equipment details" }).click();
  await solarPreview.getByRole("button", { name: "Inspect cottage consumption" }).click();
  assert.match(await equipmentDetails.innerText(), /Total demand[\s\S]*850 W/);
  assert.match(await equipmentDetails.innerText(), /branch-circuit measurements/);
  await page.keyboard.press("Escape");
  assert.equal(await equipmentDetails.isVisible(), false);
  assert.equal(
    await solarPreview
      .getByRole("button", { name: "Inspect cottage consumption" })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  const history = solarPreview.locator(".power-history:visible");
  const chartSlider = history.getByRole("slider", { name: "Inspect chart readings" });
  await chartSlider.focus();
  await page.keyboard.press("Home");
  assert.match(await chartSlider.getAttribute("aria-valuetext"), /00:00 · Solar 0.00 kW/);
  await page.keyboard.press("End");
  assert.match(
    await chartSlider.getAttribute("aria-valuetext"),
    /13:40 · Solar 2.10 kW · Consumption 0.85 kW/,
  );
  await history.getByRole("button", { name: "Week", exact: true }).click();
  assert.equal(await chartSlider.getAttribute("max"), "6");
  assert.match(await chartSlider.getAttribute("aria-valuetext"), /Sun · Solar 20.10 kWh/);
  await history.getByRole("button", { name: "Day", exact: true }).click();
  assert.equal(await chartSlider.getAttribute("max"), "14");
  const forecast = solarPreview.getByRole("region", { name: "Buddy energy forecast example" });
  assert.match(await forecast.locator(".outlook-estimate").innerText(), /≈6h 04m/);
  await forecast.getByRole("button", { name: "500 W load" }).click();
  assert.match(await forecast.locator(".outlook-estimate").innerText(), /≈3h 49m/);
  await forecast.locator("summary").click();
  assert.match(await forecast.locator("dl").innerText(), /1.35 kW/);
  assert.match(
    await forecast.locator(".outlook-evidence > p").innerText(),
    /Assumes no incoming generation/,
  );
  await forecast.getByRole("button", { name: "Current load" }).click();
  assert.match(await forecast.locator(".outlook-estimate").innerText(), /≈6h 04m/);
  assert.equal(
    await solarPreview.evaluate((element) => getComputedStyle(element).borderRadius),
    "0px",
  );
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await solarPreview
      .locator(".flow-current")
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  checks.push(
    "Solar chart keyboard boundaries and period units; forecast inputs, load scenarios, square edges and reduced motion at 320px",
  );
  await solarPreview.getByRole("button", { name: "Control", exact: true }).click();
  const porchSwitch = solarPreview.getByRole("switch", { name: "Example porch lights" });
  await porchSwitch.click();
  assert.equal(await porchSwitch.getAttribute("aria-checked"), "true");
  await porchSwitch.click();
  assert.equal(await porchSwitch.getAttribute("aria-checked"), "false");
  const cameraRule = solarPreview.getByRole("article", { name: "Gate 2 camera automation" });
  await cameraRule.getByRole("button", { name: "Person at gate", exact: true }).click();
  assert.match(
    await cameraRule.locator(".camera-rule-result").innerText(),
    /Event matches the rule/,
  );
  assert.equal(await cameraRule.locator(".camera-event-log li").count(), 3);
  const notification = solarPreview.getByRole("complementary", {
    name: "Sample phone notification",
  });
  assert.match(await notification.innerText(), /Someone at Gate 2/);
  await notification.getByRole("button", { name: "Open Gate 2 notification" }).click();
  assert.equal(await solarPreview.getByRole("dialog", { name: "Gate 2" }).isVisible(), true);
  await solarPreview.getByRole("button", { name: "Close camera view" }).click();
  await notification.getByRole("button", { name: "Dismiss Gate 2 notification" }).click();
  assert.equal(await notification.count(), 0);
  await cameraRule.getByRole("button", { name: "Person at gate", exact: true }).click();
  assert.equal(await notification.isVisible(), true);
  await cameraRule.getByRole("button", { name: "Offline", exact: true }).click();
  assert.match(
    await cameraRule.locator(".camera-rule-result").innerText(),
    /current view is unknown/,
  );
  assert.equal(await cameraRule.locator(".camera-event-log li").count(), 0);
  await cameraRule.getByRole("button", { name: "No event", exact: true }).click();
  assert.match(
    await cameraRule.locator(".camera-rule-result").innerText(),
    /Waiting for a person event/,
  );
  const cameraButton = solarPreview.getByRole("button", { name: "Inspect gate 2 camera" });
  await cameraButton.click();
  const cameraDialog = solarPreview.getByRole("dialog", { name: "Gate 2" });
  assert.match(await cameraDialog.innerText(), /Sample image · Not a live feed/);
  await cameraDialog.getByRole("button", { name: "Zoom camera image" }).click();
  assert.equal(
    await cameraDialog.locator(".camera-inspector-image").getAttribute("data-zoom"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(await cameraDialog.isVisible(), false);
  assert.equal(await cameraButton.evaluate((element) => element === document.activeElement), true);
  const temperatureRule = solarPreview.locator(".automation-rule").first();
  await temperatureRule.getByRole("button", { name: "31°C", exact: true }).click();
  assert.match(await temperatureRule.innerText(), /Would request ON/);
  await temperatureRule.getByRole("button", { name: "No reading", exact: true }).click();
  assert.match(await temperatureRule.innerText(), /Current temperature unknown/);
  await temperatureRule.getByRole("button", { name: "24°C", exact: true }).click();
  assert.match(await temperatureRule.innerText(), /threshold has not been reached/);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  checks.push(
    "Camera event rules, offline recovery, camera zoom and focus restoration, sample switches and missing temperature inputs at 320px",
  );
  await open("/?site=telecom", 390);
  await page.locator("#site-panel-telecom").waitFor({ state: "visible" });
  assert.equal(await page.locator("#site-tab-telecom").getAttribute("aria-selected"), "true");
  assert.equal(await page.locator(".website-concept").getAttribute("data-active-site"), "cottage");
  const appPreview = page.locator(".app-preview:visible");
  assert.equal(await appPreview.getByRole("group", { name: "Chart period" }).count(), 0);
  assert.match(await appPreview.locator(".history-gap").innerText(), /Current condition unknown/);
  assert.equal(await appPreview.locator(".flow-current").count(), 0);
  await appPreview.getByRole("button", { name: "Inspect telecom shelter equipment" }).click();
  assert.match(await appPreview.getByRole("dialog").innerText(), /Current condition[\s\S]*Unknown/);
  await appPreview.getByRole("button", { name: "Close equipment details" }).click();
  await appPreview.getByRole("button", { name: "Control", exact: true }).click();
  const unavailableSwitch = appPreview.getByRole("button", { name: "Example shelter lights" });
  assert.equal(await unavailableSwitch.isDisabled(), true);
  assert.match(await unavailableSwitch.innerText(), /Unknown/);
  assert.equal(await appPreview.getByRole("switch").count(), 0);
  assert.match(
    await appPreview.locator(".camera-rule-result").innerText(),
    /Waiting for camera connection/,
  );
  await appPreview.getByRole("button", { name: "Inspect gate 2 camera" }).click();
  assert.match(
    await appPreview.getByRole("dialog", { name: "Gate 2" }).innerText(),
    /Current view unavailable/,
  );
  await appPreview.getByRole("button", { name: "Close camera view" }).click();
  await appPreview.getByRole("button", { name: "Care", exact: true }).click();
  await appPreview.getByRole("combobox").selectOption("agm");
  assert.match(await appPreview.locator(".care-note").innerText(), /Do not open sealed/);
  await appPreview.getByRole("button", { name: "Overview", exact: true }).click();
  await appPreview.getByRole("button", { name: "Ask Buddy a question", exact: true }).click();
  await appPreview
    .getByRole("button", { name: "What does a missing update mean?", exact: true })
    .click();
  assert.match(
    await appPreview.locator(".buddy-answer").innerText(),
    /cannot confirm the current condition/,
  );
  await appPreview.getByRole("button", { name: "Close Buddy conversation", exact: true }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  checks.push(
    "Site tabs control their adjacent example panel, restore from the URL, and preserve the shared hero",
  );
  await open("/", 390);
  await page.locator(".concept-menu summary").click();
  await page
    .getByRole("navigation", { name: "Mobile website navigation" })
    .getByRole("link", { name: "Developers", exact: true })
    .click();
  await page.waitForURL("**/developers/");
  assert.equal(await page.locator(".concept-menu").getAttribute("open"), null);
  await open("/developers/design-guide/", 320);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  checks.push("Mobile navigation and 320px design-guide layout");
  await open("/");
  const posted = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posted.push(request.url());
  });
  await page.locator("[data-open-setup]").first().click();
  const dialog = page.locator("[data-setup-dialog]");
  const chip = (name) =>
    dialog.locator(".setup-quick-replies").getByRole("button", { name, exact: true });
  async function reply(name) {
    await chip(name).click();
    await dialog.locator("[data-chat-status=ready]").waitFor();
  }
  await reply("Try a solar example");
  await reply("Tracer 10415AN");
  await reply("Display / logger");
  await reply("Not sure");
  await reply("Not sure");
  await reply("6");
  await reply("Not sure");
  await dialog.locator("[data-map-node=primary]").click();
  assert.equal(await dialog.locator("[data-detail-source]").isVisible(), true);
  assert.match(await dialog.locator("[data-detail-body]").innerText(), /shared bus needs review/);
  await dialog.getByRole("button", { name: "Close equipment details" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog.locator("[data-setup-view=map]").click();
  assert.equal(await dialog.locator(".setup-conversation").isVisible(), false);
  await shot("buddy-equipment-map-390");
  await dialog.locator("[data-setup-view=chat]").click();
  await dialog.locator("[data-chat-reset]").click();
  await dialog
    .locator("input[type=file]")
    .setInputFiles(new URL("../src/assets/art/cottage.webp", import.meta.url).pathname);
  await dialog.getByRole("button", { name: "Send message", exact: true }).click();
  await dialog.locator(".chat-photo").waitFor();
  await dialog.locator("[data-chat-status=ready]").waitFor();
  assert.equal(await dialog.locator(".chat-photo").count(), 1);
  assert.deepEqual(posted, []);
  await page.keyboard.press("Escape");
  assert.equal(await dialog.isVisible(), false);
  checks.push(
    "Lazy-loaded Buddy, exact model source, occupied interface, mobile map and local photo handling",
  );
  await open("/next/equipment-first/");
  await page.waitForURL(base + "/");
  await open("/next/equipment/?q=EPEVER");
  await page.waitForURL("**/equipment/?q=EPEVER");
  await page.waitForFunction(
    () => document.querySelector('input[type="search"]')?.value === "EPEVER",
  );
  checks.push("Legacy preview redirects preserve query parameters");
  assert.deepEqual(errors, []);
  await writeFile(
    new URL("verification.json", report),
    JSON.stringify({ checkedAt: new Date().toISOString(), base, checks, errors }, null, 2) + "\n",
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
