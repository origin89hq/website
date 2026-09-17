import { createRequestHandler, RouterServer } from "@tanstack/react-router/ssr/server";
import { renderToString } from "react-dom/server";
import { createRouter } from "./router";

export { blogPosts } from "./lib/blog";
export { legacyRoutes, pageMeta, publicPaths } from "./lib/page-meta";
export async function render(path: string) {
  const handler = createRequestHandler({
    request: new Request("https://origin89.com" + path),
    createRouter: () => createRouter(),
  });
  const response = await handler(({ router }) => {
    const body = renderToString(<RouterServer router={router} />);
    router.serverSsr!.setRenderFinished();
    const hydration = router.serverSsr!.takeBufferedHtml();
    return new Response(JSON.stringify({ body, hydration }));
  });
  if (response.status >= 300 && response.status < 400)
    throw new Error(
      `Unexpected pre-render redirect: ${path} -> ${response.headers.get("Location")}`,
    );
  return (await response.json()) as { body: string; hydration: string };
}
