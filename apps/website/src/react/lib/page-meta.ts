import { blogPosts } from "./blog";
import { journalSites } from "./journal-sites";
import { products } from "./products";
export const publicPaths = [
  "/",
  "/products/",
  ...products.map((product) => `/products/${product.id}/`),
  "/equipment/",
  "/sites/",
  ...journalSites.map((site) => `/sites/${site.id}/`),
  "/open-source/",
  "/developers/",
  "/developers/design-guide/",
  "/contact/",
  "/blog/",
  ...blogPosts.map((post) => `/blog/${post.slug}/`),
  "/buddy/",
  ...journalSites.map((site) => `/app/${site.id}/`),
];
const metadata: Record<string, [string, string]> = {
  "/buddy/": [
    "Understand your setup with Buddy",
    "A photo-led installation inventory preview. Add equipment, confirm details and build your setup record.",
  ],
  "/": [
    "One controller for the gear you already own",
    "The Origin89 Controller reads the charge controller, inverter, batteries, probes and generator on your wall and runs your rules at the site. In active development.",
  ],
  "/products/": [
    "One connected product family",
    "The Origin89 Controller, Offgrid app and Buddy each have a clear role. See how they fit your site.",
  ],
  "/equipment/": [
    "Find your equipment",
    "Explore exact models, communication profiles and research evidence. Start with your existing equipment and verify compatibility model by model.",
  ],
  "/sites/": [
    "Built around your site",
    "Explore cottage, mining and remote telecom setups with views that adapt to the equipment and work that matter.",
  ],
  "/open-source/": [
    "Open-source code, data and hardware",
    "Explore the public KM43 protocol, equipment dataset and controller hardware repositories, with editable source files and project licences.",
  ],
  "/developers/": [
    "Build with Origin89",
    "Build with the KM43 Rust crate and TypeScript bindings, download equipment data, and inspect the controller board designs on GitHub.",
  ],
  "/developers/design-guide/": [
    "Developer design guide",
    "Origin89 colour tokens, typography, plate buttons, reading states, render rules and downloadable brand assets.",
  ],
  "/contact/": [
    "Plan your Origin89 setup",
    "Tell us about your equipment and the job you want it to do. Prepare an email draft for a site conversation.",
  ],
  "/blog/": [
    "From the bench",
    "Notes from building Origin89 at km 43: bench tests, measurements and the design changes that follow.",
  ],
};
for (const post of blogPosts) metadata[`/blog/${post.slug}/`] = [post.title, post.summary];
for (const product of products)
  metadata[`/products/${product.id}/`] = [product.name, product.intro];
for (const site of journalSites) {
  metadata[`/sites/${site.id}/`] = [site.label, site.body];
  metadata[`/app/${site.id}/`] = [
    `Offgrid · ${site.label}`,
    `Explore an interactive Origin89 Offgrid app concept for ${site.label.toLowerCase()}. Sample equipment and readings.`,
  ];
}
export function pageMeta(path: string) {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "") + "/";
  const entry = metadata[normalized];
  return {
    title: (entry?.[0] || "Page not found") + " · Origin89",
    description:
      entry?.[1] || "Find your way back to Origin89 products, equipment and developer resources.",
    canonical: entry ? "https://origin89.com" + normalized : null,
    icon:
      normalized === "/buddy/"
        ? { href: "/brand/buddy-favicon-48.png", type: "image/png" }
        : { href: "/brand/plate-89.svg", type: "image/svg+xml" },
    appIcon: normalized === "/buddy/" ? "/brand/buddy-apple-touch.png" : null,
    manifest: normalized === "/buddy/" ? "/brand/buddy.webmanifest" : null,
    noindex: !entry || normalized.startsWith("/app/") || normalized === "/buddy/",
  };
}
export const legacyRoutes: Record<string, string> = {
  "/en": "/",
  "/en/": "/",
  "/next/equipment-first/": "/",
  "/next/site-first/": "/",
  "/next/ownership-first/": "/open-source/",
  "/next/system/": "/products/",
  "/next/controller/": "/products/controller/",
  "/next/offgrid/": "/products/offgrid/",
  "/next/buddy/": "/products/buddy/",
  "/next/equipment/": "/equipment/",
  "/next/open/": "/open-source/",
  "/next/sites/": "/sites/",
  "/next/plan/": "/contact/",
  "/next/cottages/": "/sites/cottage/",
  "/next/field/": "/sites/mining/",
  "/next/maple/": "/sites/",
  "/next/sample-site/": "/app/cottage/",
  "/next/research/": "/developers/",
  "/concepts/journal/": "/",
  "/concepts/app/journal/": "/app/cottage/",
  "/concepts/app/journal/cottage/": "/app/cottage/",
  "/concepts/app/journal/mining/": "/app/mining/",
  "/concepts/app/journal/telecom/": "/app/telecom/",
};
