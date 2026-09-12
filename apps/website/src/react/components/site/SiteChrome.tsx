import { ArrowUpRight, Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { JournalSite } from "../../lib/journal-sites";
import { journalAssets } from "../../lib/react-assets";
import { siteConfig, siteNavigation } from "../../lib/site-config";
import { GitHubIcon } from "./GitHubIcon";
export function SiteHeader() {
  return (
    <header className="concept-header">
      <a className="concept-logo" href="/" aria-label="Origin89 home">
        <img src={journalAssets.logo} alt="Origin89" width="186" height="32" />
      </a>
      <nav aria-label="Website navigation">
        {siteNavigation.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <a className="nav-cta" href="/contact/">
        Plan your setup <ArrowUpRight size={16} aria-hidden="true" />
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
          <a href="/contact/">
            Plan your setup <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </details>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <a href="/" aria-label="Origin89 home">
          <img src={journalAssets.logo} alt="Origin89" width="180" height="31" />
        </a>
        <p>Built in Québec for the equipment and places we depend on.</p>
        <a className="footer-github" href={siteConfig.github} target="_blank" rel="noreferrer">
          <GitHubIcon /> Origin89 on GitHub <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <nav aria-label="Product links">
        <span className="micro">THE SYSTEM</span>
        <a href="/products/controller/">Controller</a>
        <a href="/products/offgrid/">Offgrid app</a>
        <a href="/products/buddy/">Buddy</a>
        <a href="/equipment/">Equipment catalogue</a>
      </nav>
      <nav aria-label="Developer links">
        <span className="micro">OPEN SOURCE</span>
        <a href={siteConfig.repositories.km43}>
          KM43 protocol <ArrowUpRight size={13} aria-hidden="true" />
        </a>
        <a href={siteConfig.data}>
          Equipment data <ArrowUpRight size={13} aria-hidden="true" />
        </a>
        <a href={siteConfig.repositories.hardware}>
          Hardware & CAD <ArrowUpRight size={13} aria-hidden="true" />
        </a>
        <a href="/open-source/">All open-source projects</a>
      </nav>
      <nav aria-label="Resource links">
        <span className="micro">RESOURCES</span>
        <a href="/developers/">Developer resources</a>
        <a href="/developers/design-guide/">Design guide</a>
        <a href="/storybook/">Component library</a>
        <a href={siteConfig.docs}>
          Documentation <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </nav>
      <p className="footer-status">
        Products in development. App previews use sample readings. Equipment support is verified
        model by model. Published source and licences are linked in each project.
      </p>
      <span className="footer-location">ORIGIN89 / QUÉBEC</span>
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
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="site-page-intro">
      <span className="micro">{eyebrow}</span>
      <h1>{title}</h1>
      <div className="page-intro-copy">{children}</div>
    </section>
  );
}
export function SiteCTA() {
  return (
    <section className="site-cta">
      <div>
        <span className="micro">YOUR INSTALLATION</span>
        <h2>What would you like to monitor?</h2>
      </div>
      <a className="concept-action" href="/contact/">
        Tell us about your site <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
