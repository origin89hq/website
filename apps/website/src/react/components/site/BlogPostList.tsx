import { ArrowRight } from "lucide-react";
import type { BlogPost } from "../../lib/blog";

/** Post rows for the blog index and the homepage; each whole row links to its post. */
export function BlogPostList({
  posts,
  heading: Heading = "h2",
}: {
  posts: readonly BlogPost[];
  heading?: "h2" | "h3";
}) {
  return (
    <div className="blog-list">
      {posts.map((post) => (
        <article key={post.slug}>
          <div>
            <Heading>
              <a href={`/blog/${post.slug}/`}>{post.title}</a>
            </Heading>
            <p>{post.summary}</p>
          </div>
          <time className="micro" dateTime={post.date}>
            {post.date}
          </time>
          <ArrowRight size={20} aria-hidden="true" />
        </article>
      ))}
    </div>
  );
}
