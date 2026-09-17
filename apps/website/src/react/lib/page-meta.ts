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
  "/buddy/",
  ...journalSites.map((site) => `/app/${site.id}/`),
];
const metadata: Record<string, [string, string]> = {
  "/buddy/": [
    "Understand your setup with Buddy",
    "Preview Buddy’s setup conversation. Add equipment from photos, confirm the details and build your setup record.",
  ],
  "/": [
    "One controller for the gear you already own",
    "The Origin89 Controller reads the charge controller, inverter, batteries, probes and generator on your wall and runs your rules at the site. In active development.",
  ],
  "/products/": [
    "Controller, Offgrid app and Buddy",
    "The Origin89 Controller runs your rules at the site, the Offgrid app shows the readings and Buddy explains them.",
  ],
  "/equipment/": [
    "Find your equipment",
    "Search exact models, communication profiles and research evidence for the equipment you already own. Verify compatibility model by model.",
  ],
  "/sites/": [
    "Cottage, mining and telecom sites",
    "Example cottage, mining and remote telecom setups, with app views built around each site’s equipment.",
  ],
  "/open-source/": [
    "Open-source code, data and hardware",
    "Explore the public KM43 protocol, equipment dataset and controller hardware repositories, with editable source files and licences.",
  ],
  "/developers/": [
    "Build with Origin89",
    "Use the KM43 Rust crate and TypeScript bindings, download equipment data and inspect the controller board designs on GitHub.",
  ],
  "/developers/design-guide/": [
    "Developer design guide",
    "Origin89 colour tokens, typography, plate buttons, reading states, render rules and downloadable brand assets.",
  ],
  "/contact/": [
    "Plan your Origin89 setup",
    "Tell us about your equipment and the job you want it to do. The form prepares an email draft for you to send.",
  ],
};
for (const product of products)
  metadata[`/products/${product.id}/`] = [product.name, product.intro];
for (const site of journalSites) {
  metadata[`/sites/${site.id}/`] = [site.label, site.body];
  metadata[`/app/${site.id}/`] = [
    `Offgrid · ${site.label}`,
    `An interactive Origin89 Offgrid app concept for ${site.label.toLowerCase()}, with sample equipment and readings.`,
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
