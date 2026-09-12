import { ArrowUpRight } from "lucide-react";
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
export function ProductsPage() {
  return (
    <SiteShell>
      <PageIntro
        eyebrow="THE ORIGIN89 SYSTEM / IN DEVELOPMENT"
        title="Meet the Controller, Offgrid and Buddy."
      >
        <p>
          Origin89 helps its different parts work together. Connect at the site, see the readings in
          Offgrid, and ask Buddy when something needs explaining.
        </p>
      </PageIntro>
      <div className="system-map-showcase">
        <SetupMap
          state={emptySetup}
          buddyUrl={journalAssets.buddy}
          plateUrl={journalAssets.plate}
        />
      </div>
      <ProductFamily />
      <MultiSiteNote />
      <section className="content-section">
        <div className="section-heading">
          <span className="micro">COMPARE THE ROLES</span>
          <h2>Each part has a job.</h2>
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
  return (
    <SiteShell site={site}>
      <section className="product-intro">
        <div>
          <span className="micro">{product.name.toUpperCase()} / IN DEVELOPMENT</span>
          <h1>{product.title}</h1>
          <p>{product.intro}</p>
          <a
            className="concept-action"
            href={
              productId === "offgrid"
                ? `/app/${site}/`
                : productId === "buddy"
                  ? "/buddy/"
                  : "/contact/"
            }
          >
            {productId === "offgrid"
              ? "Try the app scene"
              : productId === "buddy"
                ? "Show Buddy your setup"
                : "Plan a connection"}{" "}
            <span>↗</span>
          </a>
        </div>
        <div className={`product-hero-art product-hero-${productId}`}>
          {productId === "controller" ? (
            <>
              <img
                src={controllerImage}
                alt="Origin89 Controller, rendered from the editable enclosure CAD"
                width="800"
                height="650"
              />
              <span className="micro">CAD CONCEPT / HARDWARE IN DEVELOPMENT</span>
            </>
          ) : productId === "buddy" ? (
            <>
              <BuddyAvatar
                src={journalAssets.buddy}
                alt="Buddy, your Origin89 assistant"
                size={360}
                fetchPriority="high"
              />
              <div className="buddy-hero-question">
                What would you like
                <br />
                to understand?
              </div>
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
      <section className="content-section feature-rows">
        {product.features.map(([title, body], index) => (
          <article key={title}>
            <span className="micro">0{index + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      {productId === "controller" && (
        <section className="hardware-open-section">
          <img
            src={boardImage}
            alt="Controller circuit board rendered from its editable CAD source"
            width="800"
            height="640"
            loading="lazy"
          />
          <div>
            <span className="micro">OPEN FROM THE BOARD UP</span>
            <h2>Inspect the boards.</h2>
            <p>
              The public hardware repository includes editable board projects, Gerbers, bills of
              materials and enclosure CAD, with the prototype status documented.
            </p>
            <a className="underlined-action" href={siteConfig.repositories.hardware}>
              Browse hardware on GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <small>
              Existing CAD artwork. Final product markings and release specifications are still in
              development.
            </small>
          </div>
        </section>
      )}
      {productId === "offgrid" && <MultiSiteNote />}
      <SiteCTA />
    </SiteShell>
  );
}
