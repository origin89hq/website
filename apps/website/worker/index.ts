import { handleWaitlist, type WaitlistEnv } from "./waitlist.ts";

// Keep inference, storage and session bindings in Buddy. Forward its responses
// directly so chat streams and session cookies reach the browser unchanged.
interface Env extends WaitlistEnv {
  BUDDY: Fetcher;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/buddy/")) return env.BUDDY.fetch(request);
    if (pathname === "/api/waitlist") return handleWaitlist(request, env);
    // Only the API paths run this worker first, so reaching here means the
    // asset layer had nothing and wants the 404 page.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
