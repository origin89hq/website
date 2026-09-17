import { ArrowLeft, ArrowRight, Rss } from "lucide-react";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import type { BlogPost } from "../lib/blog";

const feedPath = "/blog/feed.xml";

export function BlogIndexPage({ posts }: { posts: readonly BlogPost[] }) {
  return (
    <SiteShell>
      <PageIntro title="From the bench">
        <p>
          Notes from building Origin89 at km 43: what we tested, what we measured and what we
          changed because of it.
        </p>
        <a className="o89-text-link" href={feedPath}>
          <Rss size={16} aria-hidden="true" /> Follow with the Atom feed
        </a>
      </PageIntro>
      <section className="blog-list" aria-label="Posts">
        {posts.length ? (
          posts.map((post) => (
            <article key={post.slug}>
              <div>
                <h2>
                  <a href={`/blog/${post.slug}/`}>{post.title}</a>
                </h2>
                <p>{post.summary}</p>
              </div>
              <time className="micro" dateTime={post.date}>
                {post.date}
              </time>
              <ArrowRight size={20} aria-hidden="true" />
            </article>
          ))
        ) : (
          <p className="blog-empty">The first post is on its way.</p>
        )}
      </section>
    </SiteShell>
  );
}

export function BlogPostPage({ post, html }: { post: BlogPost; html: string }) {
  return (
    <SiteShell>
      <article className="blog-post">
        <header>
          <a className="o89-text-link" href="/blog/">
            <ArrowLeft size={16} aria-hidden="true" /> All posts
          </a>
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <time className="micro" dateTime={post.date}>
            {post.date}
          </time>
        </header>
        <div
          className="blog-post-body"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered at build time from Markdown committed to this repository
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <footer>
          <a className="o89-text-link" href="/blog/">
            <ArrowLeft size={16} aria-hidden="true" /> All posts
          </a>
          <a className="o89-text-link" href={feedPath}>
            <Rss size={16} aria-hidden="true" /> Atom feed
          </a>
        </footer>
      </article>
    </SiteShell>
  );
}
