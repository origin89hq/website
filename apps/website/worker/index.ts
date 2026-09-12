// The public edge. It owns the hostname and the pre-rendered site, and holds no
// secret: the OpenAI key, the knowledge database, the photo bucket and the
// session Durable Objects all belong to Buddy, which has no route of its own and
// is reachable only through this binding.
//
// Forwarded as a request rather than called as a typed method because
// `/api/buddy/chat` streams its reply, and forwarding preserves the stream end
// to end. Typed RPC is worth adding for the calls that return a value, once
// something other than this worker needs them.
interface Env {
  BUDDY: Fetcher;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname.startsWith("/api/buddy/")) return env.BUDDY.fetch(request);
    // Only `/api/buddy/*` runs this worker first, so reaching here means the
    // asset layer had nothing and wants the 404 page.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
