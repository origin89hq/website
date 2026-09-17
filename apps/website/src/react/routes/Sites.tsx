import { ArrowRight } from "lucide-react";
import { BuddyApp } from "../components/site/BuddyApp";
import { MultiSiteNote } from "../components/site/MultiSiteNote";
import { PageIntro, SiteCTA, SiteShell } from "../components/site/SiteChrome";
import { type JournalSite, journalSites } from "../lib/journal-sites";
import { journalAssets } from "../lib/react-assets";

const exploreLabels: Record<JournalSite, string> = {
  cottage: "Explore cottage setups",
  mining: "Explore mining utilities",
  telecom: "Explore remote telecom",
};
const detailTitles: Record<JournalSite, string> = {
  cottage: "A setup built over years.",
  mining: "Keep the utilities in view.",
  telecom: "Check the shelter between visits.",
};

export function SitesPage() {
  return (
    <SiteShell>
      <PageIntro title="Different sites, the same questions.">
        <p>
          What’s running, and what needs a closer look? Start with the place you look after and
          build a view around its equipment.
        </p>
      </PageIntro>
      <section className="site-stories-list" aria-label="Site examples">
        {journalSites.map((site) => (
          <article key={site.id} className="site-story">
            <figure className="site-story-image">
              <a href={`/sites/${site.id}/`}>
                <img
                  src={journalAssets[site.id]}
                  alt={site.alt}
                  width="768"
                  height="512"
                  loading="lazy"
                />
              </a>
              <figcaption>{site.caption}</figcaption>
            </figure>
            <div className="site-story-copy">
              <h2>{site.label}</h2>
              <p className="site-story-lead">{site.lead}</p>
              <p>{site.body}</p>
              <ul className="equipment-chips" aria-label={`${site.label} equipment`}>
                {site.equipment.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className="o89-text-link" href={`/sites/${site.id}/`}>
                {exploreLabels[site.id]} <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </section>
      <MultiSiteNote />
      <section className="content-section other-site" aria-labelledby="other-site-title">
        <h2 id="other-site-title">Maple operations and other remote sites</h2>
        <p>
          Pumps, tanks, temperature sensors and local power show up at these sites too. Start with
          the reading or task that matters to your operation.
        </p>
        <a className="o89-text-link" href="/contact/">
          Tell us about your installation <ArrowRight size={16} aria-hidden="true" />
        </a>
      </section>
      <SiteCTA />
    </SiteShell>
  );
}
export function SitePage({ site: siteId }: { site: JournalSite }) {
  const site = journalSites.find((item) => item.id === siteId)!;
  return (
    <SiteShell site={siteId}>
      <section className="site-detail-hero">
        <div className="site-detail-copy">
          <h1>{detailTitles[siteId]}</h1>
          <p>{site.lead}</p>
          <div className="page-actions">
            <a className="o89-plate o89-plate-action" href={`/contact/?site=${siteId}`}>
              Plan your site view <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <figure className="site-detail-image">
          <img src={journalAssets[siteId]} alt={site.alt} width="1536" height="1024" />
          <figcaption>{site.caption} A rendered example, not a customer installation.</figcaption>
        </figure>
      </section>
      <section className="site-equipment" aria-labelledby="site-equipment-title">
        <h2 id="site-equipment-title">Equipment at this site</h2>
        <ul className="equipment-chips">
          {site.equipment.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <a className="o89-text-link" href="/equipment/">
          Search the equipment catalogue <ArrowRight size={16} aria-hidden="true" />
        </a>
      </section>
      <section className="site-app-section" aria-labelledby="site-app-title">
        <div className="site-app-copy">
          <h2 id="site-app-title">{site.appTitle.join(" ")}</h2>
          <p>{site.appBody}</p>
          <div className="site-app-proof">
            <strong>{site.proofTitle}</strong>
            <p>{site.proof}</p>
          </div>
          <a className="o89-text-link" href={`/app/${siteId}/`}>
            Try this app scene <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <figure className="site-app-visual">
          <BuddyApp site={siteId} buddyUrl={journalAssets.buddy} />
          <figcaption>Interactive app concept · Sample readings</figcaption>
        </figure>
      </section>
      {siteId !== "cottage" && <MultiSiteNote />}
      <SiteCTA />
    </SiteShell>
  );
}
