import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  atomFeed,
  blogPostsPlugin,
  parsePost,
  postModule,
  renderPostBody,
} from "../scripts/blog-posts.mjs";

const post = (header, body = "First paragraph.\n") => `---\n${header}\n---\n${body}`;
const header = "title: Board A: first power-up\ndate: 2026-09-17\nsummary: We measured it.";

test("reads front matter, keeps colons in values, strips quotes and accepts CRLF files", () => {
  assert.deepEqual(parsePost("/blog/board-a.md", post(header)), {
    meta: {
      slug: "board-a",
      title: "Board A: first power-up",
      date: "2026-09-17",
      summary: "We measured it.",
    },
    markdown: "First paragraph.\n",
  });
  const quoted = post("summary: \"Idle draw\"\ntitle: 'Bench 2'\ndate: 2026-09-18").replaceAll(
    "\n",
    "\r\n",
  );
  assert.deepEqual(parsePost("bench-2.md", quoted).meta, {
    slug: "bench-2",
    title: "Bench 2",
    date: "2026-09-18",
    summary: "Idle draw",
  });
});

test("rejects invalid file names, front matter and empty posts with the file named", () => {
  const cases = [
    ["Board_A.md", post(header), /lowercase letters/],
    ["board-a.markdown", post(header), /lowercase letters/],
    ["board-a.md", "title: No front matter\n", /front matter between/],
    ["board-a.md", post("title: A\ndate: 2026-09-17"), /summary is missing/],
    ["board-a.md", post('title: ""\ndate: 2026-09-17\nsummary: S'), /title is missing/],
    ["board-a.md", post(`${header}\nauthor: Sam`), /unexpected front matter line: author: Sam/],
    ["board-a.md", post(`${header}\ntitle: Again`), /title appears twice/],
    ["board-a.md", post(`${header}\njust text`), /unexpected front matter line/],
    ["board-a.md", post(header.replace("2026-09-17", "2026-02-30")), /calendar date/],
    ["board-a.md", post(header.replace("2026-09-17", "17/09/2026")), /calendar date/],
    ["board-a.md", post(header, "\n  \n"), /no body/],
    ["board-a.md", `---\n${header}\n---`, /no body/],
    ["board-a.md", post(header, "Text __o89_asset_0__\n"), /reserved asset marker/],
  ];
  for (const [file, source, message] of cases)
    assert.throws(
      () => parsePost(file, source),
      (error) => {
        assert.match(error.message, new RegExp(`^${file.replace(".", "\\.")}: `));
        assert.match(error.message, message);
        return true;
      },
    );
});

test("renders GFM tables in a scroll frame and lazy-loads images", () => {
  const { html, assets } = renderPostBody(
    '| Rail | Draw |\n| --- | --: |\n| 12 V | 11 mA |\n\n![Scope capture](/assets/scope.png "Scope")\n',
  );
  assert.deepEqual(assets, []);
  assert.match(html, /^<div class="post-table"><table>\n<thead>/);
  assert.match(html, /<th align="right">Draw<\/th>/);
  assert.match(html, /<\/table>\n<\/div>/);
  assert.match(
    html,
    /<img loading="lazy" decoding="async" src="\/assets\/scope\.png" alt="Scope capture" title="Scope">/,
  );
});

test("turns relative images and files into asset markers once per path", () => {
  const { html, assets } = renderPostBody(
    "![Board](./board-a/top.jpg)\n\n[Raw data](../data/draw.csv), [again](../data/draw.csv), [home](/blog/), [site](https://origin89.com/) and [section](#results)\n",
  );
  assert.deepEqual(assets, ["./board-a/top.jpg", "../data/draw.csv"]);
  assert.match(html, /src="__o89_asset_0__"/);
  assert.equal(html.match(/href="__o89_asset_1__"/g).length, 2);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /href="https:\/\/origin89\.com\/"/);
  assert.match(html, /href="#results"/);
  assert.throws(() => renderPostBody("![Plot](./plot.png?v=2)"), /query or fragment/);
  assert.throws(() => renderPostBody("[Log](./log.txt#end)"), /query or fragment/);
});

test("rejects raw HTML and unsafe link schemes, and drops HTML comments", () => {
  for (const [markdown, message] of [
    [
      '<img src="./scope.png" onerror="alert(1)">\n',
      /raw HTML in posts: <img src="\.\/scope\.png"/,
    ],
    ['Idle draw <span onclick="x()">11 mA</span>\n', /raw HTML in posts: <span onclick/],
    ["| Rail |\n| --- |\n| <b>12 V</b> |\n", /raw HTML in posts: <b>/],
    [
      "[Run](javascript:alert(1))\n",
      /must use http, https, mailto or a path: javascript:alert\(1\)/,
    ],
    ["![Plot](data:image/png;base64,AA)\n", /must use http, https, mailto or a path: data:/],
  ])
    assert.throws(() => renderPostBody(markdown), message);
  const { html } = renderPostBody(
    "<!-- draft: add the scope capture -->\n\nMail [us](mailto:hello@origin89.com) or see [the repo](http://github.com/origin89hq) <!-- inline note -->\n",
  );
  assert.equal(
    html,
    '<p>Mail <a href="mailto:hello@origin89.com">us</a> or see <a href="http://github.com/origin89hq">the repo</a> </p>\n',
  );
});

test("builds metadata and body modules with bundled asset imports", async () => {
  const parsed = parsePost(
    "board-a.md",
    post(header, "![Top](./top.jpg) and ![Top again](./top.jpg)\n"),
  );
  assert.equal(
    postModule(parsed, "meta"),
    'export default {"slug":"board-a","title":"Board A: first power-up","date":"2026-09-17","summary":"We measured it."};\n',
  );
  const body = postModule(parsed, "body");
  assert.equal(body.match(/^import /gm).length, 1);
  assert.match(body, /^import asset0 from "\.\/top\.jpg\?url&no-inline";\n/);
  const module = await import(
    `data:text/javascript,${encodeURIComponent(body.replace(/^import .*\n/, 'const asset0 = "/assets/top-1a2b.jpg";\n'))}`
  );
  assert.equal(
    module.default,
    '<p><img loading="lazy" decoding="async" src="/assets/top-1a2b.jpg" alt="Top"> and <img loading="lazy" decoding="async" src="/assets/top-1a2b.jpg" alt="Top again"></p>\n',
  );
});

test("the Vite plugin loads only blog queries on Markdown files", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "website-blog-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "board-a.md");
  await writeFile(file, post(header));
  const watched = [];
  const plugin = blogPostsPlugin(),
    context = { addWatchFile: (path) => watched.push(path) };
  assert.match(await plugin.load.call(context, `${file}?post-meta&import`), /"slug":"board-a"/);
  assert.equal(
    await plugin.load.call(context, `${file}?post-body`),
    'export default "<p>First paragraph.</p>\\n";\n',
  );
  assert.deepEqual(watched, [file, file]);
  assert.equal(await plugin.load.call(context, file), null);
  assert.equal(await plugin.load.call(context, `${file}?raw`), null);
  assert.equal(await plugin.load.call(context, `${directory}/notes.txt?post-meta`), null);
  await writeFile(file, post("title: Missing fields"));
  await assert.rejects(
    plugin.load.call(context, `${file}?post-meta`),
    /board-a\.md: date is missing/,
  );
});

test("writes an escaped Atom feed dated by the newest post", () => {
  const feed = atomFeed(
    [
      {
        slug: "idle-draw",
        title: "Idle <draw> & sleep",
        date: "2026-10-02",
        summary: 'Said "11 mA"',
      },
      { slug: "board-a", title: "Board A", date: "2026-09-17", summary: "Built." },
    ],
    { origin: "https://origin89.com", now: new Date("2027-01-01T12:00:00.000Z") },
  );
  assert.match(
    feed,
    /^<\?xml version="1\.0" encoding="utf-8"\?>\n<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/,
  );
  assert.match(
    feed,
    /<id>https:\/\/origin89\.com\/blog\/<\/id><updated>2026-10-02T00:00:00Z<\/updated>/,
  );
  assert.match(
    feed,
    /<link rel="self" type="application\/atom\+xml" href="https:\/\/origin89\.com\/blog\/feed\.xml"\/>/,
  );
  assert.match(feed, /<title>Idle &lt;draw&gt; &amp; sleep<\/title>/);
  assert.match(feed, /<summary>Said &quot;11 mA&quot;<\/summary>/);
  assert.ok(feed.indexOf("/blog/idle-draw/") < feed.indexOf("/blog/board-a/"));
  assert.equal(feed.match(/<entry>/g).length, 2);
  assert.match(
    feed,
    /<entry><title>Board A<\/title><link rel="alternate" type="text\/html" href="https:\/\/origin89\.com\/blog\/board-a\/"\/><id>https:\/\/origin89\.com\/blog\/board-a\/<\/id><published>2026-09-17T00:00:00Z<\/published><updated>2026-09-17T00:00:00Z<\/updated>/,
  );
});

test("an empty feed is still valid and dated by the build", () => {
  const feed = atomFeed([], {
    origin: "https://origin89.com",
    now: new Date("2026-09-17T15:04:05.123Z"),
  });
  assert.match(feed, /<updated>2026-09-17T15:04:05Z<\/updated>/);
  assert.doesNotMatch(feed, /<entry>/);
});
