import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter as createTanStackRouter,
  lazyRouteComponent,
  notFound,
  Outlet,
  stripSearchParams,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { HomePage } from "./components/home/HomePage";
import { BuddyApp } from "./components/site/BuddyApp";
import { SiteShell } from "./components/site/SiteChrome";
import { blogPosts, findBlogPost, loadBlogPostBody } from "./lib/blog";
import { type JournalSite, journalSites } from "./lib/journal-sites";
import { pageMeta } from "./lib/page-meta";
import { type ProductId, products } from "./lib/products";
import { journalAssets } from "./lib/react-assets";
import { BlogIndexPage, BlogPostPage } from "./routes/Blog";
import { ContactPage } from "./routes/Contact";
import { DesignGuidePage } from "./routes/DesignGuide";
import { DevelopersPage } from "./routes/Developers";
import { EquipmentPage } from "./routes/Equipment";
import { OpenSourcePage } from "./routes/OpenSource";
import { ProductPage, ProductsPage } from "./routes/Products";
import { SitePage, SitesPage } from "./routes/Sites";

const validSite = (value: unknown): JournalSite =>
  journalSites.some((site) => site.id === value) ? (value as JournalSite) : "cottage";
const stringValue = (value: unknown, max = 300) =>
  typeof value === "string" ? value.slice(0, max) : "";
function Root() {
  const router = useRouter(),
    location = useLocation();
  useEffect(() => {
    const meta = pageMeta(location.pathname);
    document.title = meta.title;
    const icon = document.querySelector('link[rel="icon"]');
    icon?.setAttribute("href", meta.icon.href);
    icon?.setAttribute("type", meta.icon.type);
    for (const [rel, href] of [
      ["apple-touch-icon", meta.appIcon],
      ["manifest", meta.manifest],
    ]) {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!href) {
        link?.remove();
        continue;
      }
      if (!link) {
        link = document.createElement("link");
        link.rel = rel!;
        document.head.append(link);
      }
      link.href = href;
    }
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", meta.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.setAttribute("href", meta.canonical || "https://origin89.com/404/");
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", meta.canonical || "https://origin89.com/404/");
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", meta.noindex ? "noindex, follow" : "index, follow");
  }, [location.pathname]);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || anchor.target === "_blank") return;
      const url = new URL(anchor.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname.startsWith("/storybook") ||
        url.pathname.startsWith("/brand") ||
        url.pathname.startsWith("/concepts")
      )
        return;
      if (
        !/^\/(?:$|products(?:\/|$)|equipment\/?$|sites(?:\/|$)|open-source\/?$|developers(?:\/|$)|contact\/?$|app(?:\/|$)|blog(?:\/[a-z0-9-]*\/?)?$)/.test(
          url.pathname,
        )
      )
        return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      )
        return;
      event.preventDefault();
      document.querySelectorAll<HTMLDetailsElement>(".concept-menu[open]").forEach((menu) => {
        menu.open = false;
      });
      void router.navigate({ href: url.pathname + url.search + url.hash });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Outlet />
    </>
  );
}
function NotFound() {
  return (
    <SiteShell>
      <section className="not-found">
        <h1>Let’s get you back to your site.</h1>
        <p>
          That page isn’t here. Explore the products or start with the equipment you already have.
        </p>
        <div className="page-actions">
          <a className="o89-plate o89-plate-action" href="/products/">
            Explore the products <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className="o89-text-link" href="/equipment/">
            Find your equipment <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
const rootRoute = createRootRoute({
  component: Root,
  notFoundComponent: NotFound,
});
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/",
  component: ProductsPage,
});
const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$product/",
  beforeLoad: ({ params }) => {
    if (!products.some((product) => product.id === params.product)) throw notFound();
  },
  component: () => {
    const { product } = productRoute.useParams();
    return <ProductPage key={product} productId={product as ProductId} />;
  },
});
const equipmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/equipment/",
  search: {
    middlewares: [stripSearchParams({ q: "", group: "", evidence: "" })],
  },
  validateSearch: (search: Record<string, unknown>) => ({
    q: stringValue(search.q),
    group: stringValue(search.group),
    evidence: stringValue(search.evidence),
  }),
  component: () => {
    const filters = equipmentRoute.useSearch(),
      navigate = equipmentRoute.useNavigate();
    return (
      <EquipmentPage
        filters={filters}
        onFiltersChange={(search) => {
          void navigate({ search, replace: true, resetScroll: false });
        }}
      />
    );
  },
});
const sitesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sites/",
  component: SitesPage,
});
const siteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sites/$site/",
  beforeLoad: ({ params }) => {
    if (!journalSites.some((site) => site.id === params.site)) throw notFound();
  },
  component: () => {
    const { site } = siteRoute.useParams();
    return <SitePage key={site} site={site as JournalSite} />;
  },
});
const openRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/open-source/",
  component: OpenSourcePage,
});
const developersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/developers/",
  component: DevelopersPage,
});
const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/developers/design-guide/",
  component: DesignGuidePage,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact/",
  search: {
    middlewares: [stripSearchParams({ equipment: "", profile: "", site: "cottage" })],
  },
  validateSearch: (search: Record<string, unknown>) => ({
    equipment: stringValue(search.equipment, 1800),
    profile: stringValue(search.profile),
    site: validSite(search.site),
  }),
  component: () => {
    const search = contactRoute.useSearch();
    return <ContactPage key={`${search.equipment}-${search.profile}-${search.site}`} {...search} />;
  },
});
const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/",
  component: () => <BlogIndexPage posts={blogPosts} />,
});
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug/",
  loader: async ({ params }) => {
    const post = findBlogPost(params.slug);
    if (!post) throw notFound();
    return { post, html: await loadBlogPostBody(post.slug) };
  },
  component: () => {
    const { post, html } = blogPostRoute.useLoaderData();
    return <BlogPostPage key={post.slug} post={post} html={html} />;
  },
});
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/$site/",
  beforeLoad: ({ params }) => {
    if (!journalSites.some((site) => site.id === params.site)) throw notFound();
  },
  component: () => {
    const { site } = appRoute.useParams();
    const setting = journalSites.find((setting) => setting.id === site)!;
    return (
      <main id="main" className={`standalone-app standalone-${site}`}>
        <BuddyApp key={site} site={setting.id} buddyUrl={journalAssets.buddy} />
        <div className="app-review-note">
          <strong>Origin89 Offgrid + Buddy</strong>
          <span>{setting.label} · Interactive concept · Sample data</span>
          <a href={`/sites/${site}/`}>
            See this site on the website <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </main>
    );
  },
});
const routeTree = rootRoute.addChildren([
  homeRoute,
  productsRoute,
  productRoute,
  equipmentRoute,
  sitesRoute,
  siteRoute,
  openRoute,
  developersRoute,
  guideRoute,
  contactRoute,
  blogRoute,
  blogPostRoute,
  appRoute,
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/buddy/",
    component: lazyRouteComponent(() => import("./components/buddy/BuddyPoc"), "BuddyPocPage"),
  }),
]);
export function createRouter(url?: string) {
  return createTanStackRouter({
    routeTree,
    history: url ? createMemoryHistory({ initialEntries: [url] }) : undefined,
    defaultPreload: "intent",
    scrollRestoration: true,
    trailingSlash: "always",
  });
}
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
