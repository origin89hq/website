import { ArrowRight, ArrowUpRight, ChevronDown, Plus } from "lucide-react";
import {
  createContext,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { JournalSite } from "../../lib/journal-sites";
import { type ProductId, products } from "../../lib/products";
import { journalAssets } from "../../lib/react-assets";
import { siteConfig, siteNavigation } from "../../lib/site-config";
import { BuddyAvatar } from "../buddy/BuddyAvatar";
import { GitHubIcon } from "./GitHubIcon";

/** The current pathname, so the header can mark the open page and close its menus on a
    navigation. Storybook renders the header outside the router and marks nothing. */
export const SitePathContext = createContext("");

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A 24px mark for each product: the Controller's terminals, the app's readings, Buddy himself. */
function ProductMark({ productId }: { productId: ProductId }) {
  if (productId === "buddy")
    return <BuddyAvatar size={34} sizes="34px" alt="" aria-hidden="true" />;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {productId === "controller" ? (
        <g {...stroke}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <rect x="8.5" y="9.5" width="7" height="5" rx="1" />
          <path d="M6.5 6V3.8M10 6V3.8M14 6V3.8M17.5 6V3.8" />
          <circle cx="5.6" cy="15" r=".9" />
        </g>
      ) : (
        <g {...stroke}>
          <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
          <path d="M10.5 18.8h3M9.6 13.5v2.2M12 10.2v5.5M14.4 12v3.7" />
        </g>
      )}
    </svg>
  );
}

/** Desktop only: hovering or activating "Products" opens the product panel. */
function ProductsMenu({ current }: { current: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const path = useContext(SitePathContext);
  // biome-ignore lint/correctness/useExhaustiveDependencies: The panel closes when the path changes, not when `open` does.
  useEffect(() => setOpen(false), [path]);
  const hover = (next: boolean) => (event: ReactPointerEvent) => {
    // A touch tap also fires pointerenter; leave those to the button's own click.
    if (event.pointerType === "mouse") setOpen(next);
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: The interactive elements are the trigger and the links; hovering the wrapper only mirrors what they already do.
    <div
      className="o89-nav-menu"
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        setOpen(false);
        trigger.current?.focus();
      }}
    >
      <button
        type="button"
        ref={trigger}
        aria-expanded={open}
        aria-controls={panelId}
        data-current={current || undefined}
        onClick={() => setOpen(!open)}
      >
        Products <ChevronDown size={15} aria-hidden="true" />
      </button>
      <div className="o89-nav-panel" id={panelId} data-open={open}>
        {products.map((product) => (
          <a key={product.id} href={`/products/${product.id}/`}>
            <span className="o89-nav-panel-mark">
              <ProductMark productId={product.id} />
            </span>
            <span>
              <strong>{product.name}</strong>
              <small>{product.summary}</small>
            </span>
          </a>
        ))}
        <div className="o89-nav-panel-foot">
          <a href="/products/">
            All products <ArrowRight size={14} aria-hidden="true" />
          </a>
          <a href="/equipment/">
            Equipment catalogue <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

/** Marks the open page, and its section for a link that stands for several pages. */
function currentPage(href: string, path: string) {
  if (!path) return {};
  if (path === href) return { "aria-current": "page", "data-current": true } as const;
  return path.startsWith(href) ? ({ "data-current": true } as const) : {};
}

export function SiteHeader() {
  const path = useContext(SitePathContext);
  return (
    <header className="o89-nav">
      <a className="o89-nav-logo" href="/" aria-label="Origin89 home">
        <img src={journalAssets.logoWhite} alt="Origin89" width="132" height="22" />
      </a>
      <nav aria-label="Website navigation">
        {siteNavigation.map(([label, href]) =>
          href === "/products/" ? (
            <ProductsMenu key={href} current={path.startsWith(href)} />
          ) : (
            <a key={href} href={href} {...currentPage(href, path)}>
              {label}
            </a>
          ),
        )}
      </nav>
      <a
        className="o89-nav-github"
        href={siteConfig.github}
        target="_blank"
        rel="noreferrer"
        aria-label="Origin89 on GitHub"
      >
        <GitHubIcon />
      </a>
      <a className="o89-plate o89-plate-action o89-plate-sm o89-nav-cta" href="/#waitlist">
        Join the waitlist
      </a>
      <details className="concept-menu">
        <summary>
          Menu <Plus size={18} aria-hidden="true" />
        </summary>
        <nav aria-label="Mobile website navigation">
          {siteNavigation.map(([label, href]) => (
            <div key={href}>
              <a href={href} {...currentPage(href, path)}>
                {label}
              </a>
              {href === "/products/" &&
                products.map((product) => (
                  <a
                    key={product.id}
                    className="o89-nav-sub"
                    href={`/products/${product.id}/`}
                    {...currentPage(`/products/${product.id}/`, path)}
                  >
                    {product.name}
                  </a>
                ))}
            </div>
          ))}
          <a href="/#waitlist">
            Join the waitlist <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </details>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="o89-footer">
      <div className="o89-wrap o89-footer-grid">
        <div className="o89-footer-brand">
          <a href="/" aria-label="Origin89 home">
            <img src={journalAssets.logoWhite} alt="Origin89" width="168" height="28" />
          </a>
          <p>Open control for the off-grid equipment you already own. Built at km 43, Québec.</p>
          <p className="o89-footer-status">
            <i aria-hidden="true" />
            In active development. Not for sale yet.
          </p>
        </div>
        <nav aria-label="Product links">
          <b>Products</b>
          <a href="/products/controller/">Controller</a>
          <a href="/products/offgrid/">Offgrid app</a>
          <a href="/products/buddy/">Buddy</a>
          <a href="/equipment/">Equipment catalogue</a>
        </nav>
        <nav aria-label="Open source links">
          <b>Open</b>
          <a href={siteConfig.repositories.hardware}>Hardware & CAD</a>
          <a href={siteConfig.repositories.km43}>KM43 protocol</a>
          <a href={siteConfig.data}>Equipment data</a>
          <a href="/open-source/">All projects</a>
        </nav>
        <nav aria-label="Resource links">
          <b>Resources</b>
          <a href="/blog/">Blog</a>
          <a href="/developers/">Developers</a>
          <a href="/developers/design-guide/">Design guide</a>
          <a href="/storybook/">Component library</a>
          <a href={siteConfig.docs}>Documentation</a>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </nav>
      </div>
    </footer>
  );
}

export function SiteShell({
  children,
  site = "cottage",
  className = "",
}: {
  children: ReactNode;
  site?: JournalSite;
  className?: string;
}) {
  return (
    <div className={`website-concept web-journal ${className}`} data-active-site={site}>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="site-page-intro">
      <h1>{title}</h1>
      <div className="page-intro-copy">{children}</div>
    </section>
  );
}

export function SiteCTA() {
  return (
    <section className="site-cta">
      <h2>What would you like to monitor?</h2>
      <a className="o89-plate o89-plate-action" href="/contact/">
        Tell us about your site <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
