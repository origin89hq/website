import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { BuddyAvatar } from "../components/buddy/BuddyAvatar";
import { SetupMap } from "../components/buddy/SetupMap";
import { emptySetup } from "../components/buddy/setup-model";
import { BuddyApp } from "../components/site/BuddyApp";
import { MultiSiteNote } from "../components/site/MultiSiteNote";
import { ProductFamily } from "../components/site/ProductFamily";
import { PageIntro, SiteCTA, SiteShell } from "../components/site/SiteChrome";
import type { JournalSite } from "../lib/journal-sites";
import { type ProductId, products } from "../lib/products";
import { boardImage, controllerImage, journalAssets } from "../lib/react-assets";
import { siteConfig } from "../lib/site-config";

const productActions: Record<ProductId, { label: string; status: string }> = {
  controller: {
    label: "Plan your setup",
    status: "In active development. Not for sale yet.",
  },
  offgrid: {
    label: "Try the app scene",
    status: "In development. The app scene uses sample readings.",
  },
  buddy: {
    label: "Show Buddy your setup",
    status: "In development. The setup conversation is a preview.",
  },
};

export function ProductsPage() {
  return (
    <SiteShell>
      <PageIntro title="Meet the Controller, Offgrid and Buddy.">
        <p>
          Connect equipment at the site, see the readings in Offgrid and ask Buddy when something
          needs explaining.
        </p>
      </PageIntro>
      <div className="system-map-showcase">
        <SetupMap
          state={emptySetup}
          buddyUrl={journalAssets.buddy}
          plateUrl={journalAssets.plate}
        />
      </div>
      <ProductFamily linkToProducts={false} />
      <MultiSiteNote />
      <section className="content-section" aria-labelledby="product-roles-title">
        <div className="section-heading">
          <h2 id="product-roles-title">Each part has a job.</h2>
        </div>
        {/** biome-ignore lint/a11y/noNoninteractiveTabindex: The named panel or scroll region must be reachable by keyboard. */}
        {/** biome-ignore lint/a11y/useSemanticElements: The focusable scroll region and control group retain their existing layout and accessible names. */}
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Product roles">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Where it belongs</th>
                <th>What it does</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Controller</th>
                <td>Beside the equipment</td>
                <td>Reads supported equipment and runs configured local rules.</td>
              </tr>
              <tr>
                <th>Offgrid</th>
                <td>With the owner or crew</td>
                <td>Shows readings, freshness and site settings.</td>
              </tr>
              <tr>
                <th>Buddy</th>
                <td>In the app and documentation</td>
                <td>Explains the evidence and helps review a next step.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <SiteCTA />
    </SiteShell>
  );
}
export function ProductPage({ productId }: { productId: ProductId }) {
  const product = products.find((product) => product.id === productId)!;
  const [site, setSite] = useState<JournalSite>("cottage");
  const action = productActions[productId];
  return (
    <SiteShell site={site}>
      <section className="product-intro">
        <div className="product-intro-copy">
          <h1>{product.title}</h1>
          <p>{product.intro}</p>
          <div className="page-actions">
            <a
              className="o89-plate o89-plate-action"
              href={
                productId === "offgrid"
                  ? `/app/${site}/`
                  : productId === "buddy"
                    ? "/buddy/"
                    : "/contact/"
              }
            >
              {action.label} <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <p className="product-status">
            <i aria-hidden="true" />
            {action.status}
          </p>
        </div>
        <div className={`product-hero-art product-hero-${productId}`}>
          {productId === "controller" ? (
            <figure className="render-stage">
              <img
                src={controllerImage}
                alt="Origin89 Controller, rendered from the editable enclosure CAD"
                width="800"
                height="650"
              />
              <figcaption>
                Rendered from the enclosure CAD. Final markings are still in development.
              </figcaption>
            </figure>
          ) : productId === "buddy" ? (
            <>
              <div className="render-stage">
                <BuddyAvatar
                  src={journalAssets.buddy}
                  alt="Buddy, your Origin89 assistant"
                  size={360}
                  fetchPriority="high"
                />
              </div>
              <p className="buddy-hero-question">What would you like to understand?</p>
            </>
          ) : (
            <BuddyApp key={site} site={site} buddyUrl={journalAssets.buddy} />
          )}
        </div>
      </section>
      {productId === "offgrid" && (
        // biome-ignore lint/a11y/useSemanticElements: The focusable scroll region and control group retain their existing layout and accessible names.
        <div role="group" className="site-switch-row" aria-label="Choose an app setting">
          {(["cottage", "mining", "telecom"] as const).map((value) => (
            <button
              type="button"
              key={value}
              className="o89-plate o89-plate-ghost o89-plate-sm"
              aria-pressed={site === value}
              onClick={() => setSite(value)}
            >
              {value === "cottage"
                ? "Cottage"
                : value === "mining"
                  ? "Mining site"
                  : "Remote telecom"}
            </button>
          ))}
        </div>
      )}
      <section className="content-section feature-rows" aria-label={`${product.name} features`}>
        {product.features.map(([title, body]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      {productId === "controller" && (
        <section className="hardware-open-section" aria-labelledby="hardware-open-title">
          <figure className="render-stage">
            <img
              src={boardImage}
              alt="Controller circuit board rendered from its editable CAD source"
              width="800"
              height="640"
              loading="lazy"
            />
          </figure>
          <div>
            <h2 id="hardware-open-title">Inspect the boards.</h2>
            <p>
              The public hardware repository includes editable board projects, Gerbers, bills of
              materials and enclosure CAD, with the prototype status documented.
            </p>
            <a className="o89-text-link" href={siteConfig.repositories.hardware}>
              Browse hardware on GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <small>
              Rendered from the current CAD. Final product markings and release specifications are
              still in development.
            </small>
          </div>
        </section>
      )}
      {productId === "offgrid" && <MultiSiteNote />}
      <SiteCTA />
    </SiteShell>
  );
}
