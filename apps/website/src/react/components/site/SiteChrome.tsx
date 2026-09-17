import { ArrowUpRight, Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { JournalSite } from "../../lib/journal-sites";
import { journalAssets } from "../../lib/react-assets";
import { siteConfig, siteNavigation } from "../../lib/site-config";
import { GitHubIcon } from "./GitHubIcon";

export function SiteHeader() {
  return (
    <header className="o89-nav">
      <a className="o89-nav-logo" href="/" aria-label="Origin89 home">
        <img src={journalAssets.logoWhite} alt="Origin89" width="132" height="22" />
      </a>
      <nav aria-label="Website navigation">
        {siteNavigation.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
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
            <a key={href} href={href}>
              {label}
            </a>
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
