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
  const explorer = page.locator(".explorer");
  await page.locator('g.port[data-port="rs485-1"] text').click();
  assert.equal(await explorer.getAttribute("data-active"), "rs485-1");
  assert.equal(await page.locator("#portPanel h3").innerText(), "Talks to Modbus equipment.");
  await page.keyboard.press("Escape");
  assert.equal(await explorer.getAttribute("data-active"), null);
  await page.getByRole("button", { name: /^LNK:/ }).focus();
  await page.keyboard.press("Enter");
  assert.match(
    await page.locator("#portPanel").innerText(),
    /Watchdog timing[\s\S]*Pending bench measurement/,
  );
  await page.getByRole("button", { name: "Close details", exact: true }).click();
  assert.equal(await explorer.getAttribute("data-active"), null);
  await page.getByRole("tab", { name: "STM32G0B1", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.getByRole("tab", { name: "ESP32-C6", exact: true }).getAttribute("aria-selected"),
    "true",
  );
  assert.equal(await page.locator("#mcu-esp32").isVisible(), true);
  assert.equal(await page.locator("#mcu-stm32").isVisible(), false);
  const connection = page.locator("#connectView");
  await page.getByRole("tab", { name: "12 V in", exact: true }).click();
  await connection.getByRole("button", { name: "Radio off", exact: true }).click();
  assert.match(await connection.locator(".big").innerText(), /^11/);
  await page.getByRole("tab", { name: "Generator", exact: true }).click();
  await connection.getByRole("button", { name: "Stop the kicks", exact: true }).click();
  await connection.locator(".state.open").waitFor({ timeout: 8000 });
  await connection.getByRole("button", { name: "Resume the kicks", exact: true }).click();
  await connection.locator(".state:not(.open)").waitFor();
  await page.locator("#ruleDo").selectOption("ha");
  assert.match(
    await page.locator(".rule-facts").innerText(),
    /Home Assistant[\s\S]*Needs your network[\s\S]*Planned/,
  );
  const filmToggle = page.locator(".film-toggle");
  const filmLabel = await filmToggle.getAttribute("aria-label");
  await filmToggle.click();
  assert.notEqual(await filmToggle.getAttribute("aria-label"), filmLabel);
  assert.equal(
    await page.locator("#waitlistEmail").evaluate((input) => input.checkValidity()),
    false,
  );
  // Turnstile loads on first use of the form. Stub it and the API so the check
  // stays offline and covers a sign-up, a refused retry and the fresh token each needs.
  const turnstileScript = "https://challenges.cloudflare.com/turnstile/v0/api.js*";
  await page.route(turnstileScript, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `let issued = 0, options;
        const issue = () => setTimeout(() => options.callback("stub-token-" + ++issued), 50);
        window.turnstile = {
          render(element, value) { options = value; issue(); return "stub"; },
          reset() { issue(); },
          remove() {},
        };`,
    }),
  );
  const signups = [];
  let waitlistReply = { status: 200, json: { status: "ok" } };
  await page.route("**/api/waitlist", (route) => {
    signups.push(route.request().postDataJSON());
    return route.fulfill(waitlistReply);
  });
  const waitlist = page.locator("#waitlist");
  const join = waitlist.getByRole("button", { name: "Join the waitlist", exact: true });
  await page.locator("#waitlistEmail").fill("sam@example.com");
  await join.click();
  await waitlist.locator('.waitlist-note[data-state="done"]').waitFor();
  const refusedAt = errors.length;
  waitlistReply = { status: 503, json: { error: "unavailable" } };
  await join.click();
  await waitlist.locator('.waitlist-note[data-state="error"]').waitFor();
  assert.match(await waitlist.locator(".waitlist-note").innerText(), /hello@origin89\.com/);
  assert.deepEqual(signups, [
    { email: "sam@example.com", token: "stub-token-1" },
    { email: "sam@example.com", token: "stub-token-2" },
  ]);
  // Chromium logs the stubbed 503 itself; any other error still fails the check.
  errors.splice(
    refusedAt,
    Infinity,
    ...errors.slice(refusedAt).filter((text) => !/status of 503/.test(text)),
  );
  await page.unroute(turnstileScript);
  await page.unroute("**/api/waitlist");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await open("/", 390);
  await page.waitForFunction(() => document.querySelector("#film")?.paused === true);
  assert.equal(await page.locator(".film-toggle").getAttribute("aria-label"), "Play the film");
  assert.equal(await page.locator(".reveal.pre").count(), 0);
  await page.locator(".port-list").getByRole("button", { name: "TNK", exact: true }).click();
  assert.match(await page.locator("#portPanel").innerText(), /4–20\smA/);
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  checks.push(
    "Homepage port explorer by pointer, keyboard and phone list; processor tabs; idle-draw and watchdog instruments; rule composer; waitlist sign-up and refusal; film pause and reduced motion",
  );

  await open("/developers/design-guide/");
  await page.locator("#color").scrollIntoViewIfNeeded();
  // Every documented swatch must render the hex value printed beside it, so the guide
  // cannot drift from theme.css.
  const swatches = await page.locator(".guide-swatch").evaluateAll((items) =>
    items.map((item) => ({
      token: item.querySelector("code")?.textContent,
      hex: item.querySelector(".guide-hex")?.textContent,
      rendered: getComputedStyle(item.querySelector("i")).backgroundColor,
    })),
  );
  assert.ok(swatches.length >= 14, `only ${swatches.length} colour tokens on the guide`);
  for (const { token, hex, rendered } of swatches) {
    const [r, g, b] = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
    assert.equal(rendered, `rgb(${r}, ${g}, ${b})`, `${token} renders ${hex}`);
  }
  assert.deepEqual(await page.locator("#readings .status-word").allTextContents(), [
    "Published",
    "Specified",
    "Planned",
    "Pending bench",
  ]);
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
  const copiedCSS = await page.evaluate(() => window.__copiedCSS);
  assert.match(copiedCSS, /var\(--o89-surface\)/);
  assert.match(copiedCSS, /corner-shape: bevel/);
  assert.doesNotMatch(copiedCSS, /--journal-/);
  await page.getByRole("button", { name: "Copied", exact: true }).waitFor();
  await shot("guide-colour-tokens");
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
  await page.getByRole("link", { name: "Readings and states", exact: true }).click();
  assert.equal(new URL(page.url()).hash, "#readings");
  await shot("guide-reading-states");
  checks.push(
    `${swatches.length} design-guide colour tokens match theme.css, status words, copyable CSS, chapter links and ${downloads.length} working downloads`,
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
  await page
    .getByRole("navigation", { name: "Website navigation" })
    .getByRole("link", { name: "Developers", exact: true })
    .click();
  await page.waitForURL("**/developers/");
  assert.equal(await page.evaluate(() => window.__sameDocument), true);
  assert.match(await page.title(), /Build with Origin89/);
  await page.goBack();
  await page.waitForURL(base + "/");
  assert.equal(await page.locator("#hero-title").isVisible(), true);
  await open("/sites/mining/");
  await page.evaluate(() => {
    window.__sameDocument = true;
  });
  await page.getByRole("link", { name: "Try this app scene" }).click();
  await page.waitForURL("**/app/mining/");
  assert.equal(await page.evaluate(() => window.__sameDocument), true);
  await page.reload({ waitUntil: "load" });
  await page.locator("[data-app-site=mining]").waitFor();
  checks.push("Client navigation, titles, browser back and app scene deep links");
  await open("/app/cottage/", 320);
  const solarPreview = page.locator(".buddy-app:visible");
  await solarPreview.getByRole("button", { name: "Inspect generator standby" }).click();
  assert.match(await solarPreview.locator(".flow-detail").innerText(), /not supplying power/);
  const equipmentDetails = solarPreview.getByRole("dialog");
  assert.match(await equipmentDetails.innerText(), /Runtime estimate[\s\S]*Unavailable/);
  await equipmentDetails.getByRole("button", { name: "Close equipment details" }).click();
  await solarPreview.getByRole("button", { name: "Inspect battery charging" }).click();
  assert.match(await solarPreview.locator(".flow-detail").innerText(), /before conversion losses/);
  assert.match(await equipmentDetails.innerText(), /10.0\skWh/);
  await equipmentDetails.getByRole("button", { name: "Close equipment details" }).click();
  await solarPreview.getByRole("button", { name: "Inspect cottage consumption" }).click();
  assert.match(await equipmentDetails.innerText(), /Total demand[\s\S]*850\sW/);
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
    "Solar chart keyboard boundaries and period units; forecast inputs, load scenarios and reduced motion at 320px",
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
  await open("/app/telecom/", 390);
  const appPreview = page.locator(".buddy-app:visible");
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
    "Telecom app scene: unknown readings, unavailable controls and camera, battery care and Buddy at 390px",
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
