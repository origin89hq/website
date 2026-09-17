import { ArrowLeft, Rss } from "lucide-react";
import { BlogPostList } from "../components/site/BlogPostList";
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
      <section className="blog-index" aria-label="Posts">
        {posts.length ? (
          <BlogPostList posts={posts} />
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
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <time className="micro" dateTime={post.date}>
            {post.date}
          </time>
        </header>
        <div
          className="blog-post-body"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered at build time from repository Markdown with raw HTML and unsafe link schemes rejected
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
