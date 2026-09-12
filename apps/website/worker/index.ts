// Keep inference, storage and session bindings in Buddy. Forward its responses
// directly so chat streams and session cookies reach the browser unchanged.
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
