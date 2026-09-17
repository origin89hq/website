import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { Marked, Renderer } from "marked";

const fields = ["title", "date", "summary"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const assetMarker = /__o89_asset_(\d+)__/;

const unquote = (value) =>
  value.length > 1 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]
    ? value.slice(1, -1)
    : value;
const calendarDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);

/**
 * Reads a post file: front matter with exactly `title`, `date` (YYYY-MM-DD) and `summary`,
 * then a Markdown body. The file name without `.md` is the URL slug.
 */
export function parsePost(file, source) {
  const fail = (reason) => {
    throw new Error(`${file}: ${reason}`);
  };
  const slug = basename(file, ".md");
  if (!file.endsWith(".md") || !slugPattern.test(slug))
    fail("name posts with lowercase letters, digits and hyphens, ending in .md");
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/.exec(source.replaceAll("\r\n", "\n"));
  if (!match) fail("start the file with front matter between two --- lines");
  const [, header, markdown] = match;
  const values = new Map();
  for (const line of header.split("\n")) {
    if (!line.trim()) continue;
    const separator = line.indexOf(":"),
      key = line.slice(0, separator).trim();
    if (separator < 1 || !fields.includes(key)) fail(`unexpected front matter line: ${line}`);
    if (values.has(key)) fail(`${key} appears twice`);
    values.set(key, unquote(line.slice(separator + 1).trim()));
  }
  for (const key of fields) if (!values.get(key)) fail(`${key} is missing`);
  if (!calendarDate(values.get("date"))) fail("date must be a calendar date written YYYY-MM-DD");
  if (!markdown.trim()) fail("the post has no body");
  if (assetMarker.test(markdown)) fail("the body contains a reserved asset marker");
  return {
    meta: {
      slug,
      title: values.get("title"),
      date: values.get("date"),
      summary: values.get("summary"),
    },
    markdown,
  };
}

/**
 * Renders a post body. Links and images starting with ./ or ../ point at files beside the post;
 * they come back as markers in the HTML plus the list of paths to import.
 * Raw HTML and link schemes other than http, https and mailto are rejected; HTML comments are
 * dropped.
 */
export function renderPostBody(markdown) {
  const assets = [];
  const marked = new Marked({
    gfm: true,
    walkTokens(token) {
      if (token.type === "html") {
        if (!/^\s*<!--[\s\S]*-->\s*$/.test(token.raw))
          throw new Error(`Use Markdown instead of raw HTML in posts: ${token.raw.trim()}`);
        return;
      }
      if (token.type !== "image" && token.type !== "link") return;
      if (/^[a-z][a-z\d+.-]*:/i.test(token.href) && !/^(?:https?|mailto):/i.test(token.href))
        throw new Error(`Post links must use http, https, mailto or a path: ${token.href}`);
      if (!/^\.\.?\//.test(token.href)) return;
      if (/[?#]/.test(token.href))
        throw new Error(`Relative post files cannot use a query or fragment: ${token.href}`);
      if (!assets.includes(token.href)) assets.push(token.href);
      token.href = `__o89_asset_${assets.indexOf(token.href)}__`;
    },
    renderer: {
      html() {
        return "";
      },
      table(token) {
        return `<div class="post-table">${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
      image(token) {
        return Renderer.prototype.image
          .call(this, token)
          .replace(/^<img /, '<img loading="lazy" decoding="async" ');
      },
    },
  });
  return { html: marked.parse(markdown, { async: false }), assets };
}

/** Builds the JavaScript module for a post's metadata or its rendered body. */
export function postModule(post, part) {
  if (part === "meta") return `export default ${JSON.stringify(post.meta)};\n`;
  const { html, assets } = renderPostBody(post.markdown);
  const imports = assets.map(
    (path, index) => `import asset${index} from ${JSON.stringify(`${path}?url&no-inline`)};\n`,
  );
  const pieces = html
    .split(assetMarker)
    .map((piece, index) => (index % 2 ? `asset${piece}` : JSON.stringify(piece)));
  return `${imports.join("")}export default ${pieces.join(" + ")};\n`;
}

/**
 * Vite plugin: `post.md?post-meta` exports the post's metadata and `post.md?post-body`
 * exports its HTML, so pages can list every post without loading every body.
 */
export function blogPostsPlugin() {
  return {
    name: "origin89-blog-posts",
    enforce: "pre",
    async load(id) {
      const [file, query = ""] = id.split("?"),
        params = new URLSearchParams(query),
        part = params.has("post-meta") ? "meta" : params.has("post-body") ? "body" : null;
      if (!part || !file.endsWith(".md")) return null;
      this.addWatchFile(file);
      return postModule(parsePost(file, await readFile(file, "utf8")), part);
    },
  };
}

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * Atom feed of post summaries. `updated` is the newest post date, or `now` before the first post.
 */
export function atomFeed(posts, { origin, now }) {
  const newest = posts
      .map((post) => post.date)
      .sort()
      .at(-1),
    updated = newest ? `${newest}T00:00:00Z` : now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const entries = posts.map((post) => {
    const url = escapeXml(`${origin}/blog/${post.slug}/`),
      date = `${post.date}T00:00:00Z`;
    return `<entry><title>${escapeXml(post.title)}</title><link rel="alternate" type="text/html" href="${url}"/><id>${url}</id><published>${date}</published><updated>${date}</updated><summary>${escapeXml(post.summary)}</summary></entry>`;
  });
  return `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>Origin89 blog</title><subtitle>Notes from building Origin89.</subtitle><link rel="alternate" type="text/html" href="${origin}/blog/"/><link rel="self" type="application/atom+xml" href="${origin}/blog/feed.xml"/><id>${origin}/blog/</id><updated>${updated}</updated><author><name>Origin89</name></author>${entries.join("")}</feed>\n`;
}
