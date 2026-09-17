/** Post metadata from the front matter of `src/content/blog/<slug>.md`. */
export type BlogPost = {
  slug: string;
  title: string;
  /** Publication day, YYYY-MM-DD. */
  date: string;
  summary: string;
};

// Metadata ships with every page. Each body is a separate chunk, fetched when its post opens.
const metadata = import.meta.glob<BlogPost>("../../content/blog/*.md", {
  eager: true,
  import: "default",
  query: "?post-meta",
});
const bodies = import.meta.glob<string>("../../content/blog/*.md", {
  import: "default",
  query: "?post-body",
});

/** Newest first; posts from the same day are ordered by slug. */
export const blogPosts: readonly BlogPost[] = Object.values(metadata).sort(
  (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
);

export const findBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);

/** Resolves to the post's rendered HTML. */
export function loadBlogPostBody(slug: string): Promise<string> {
  const load = bodies[`../../content/blog/${slug}.md`];
  return load ? load() : Promise.reject(new Error(`No blog post named ${slug}`));
}
