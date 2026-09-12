import { BuddyApp } from "../components/site/BuddyApp";
import { MultiSiteNote } from "../components/site/MultiSiteNote";
import { PageIntro, SiteCTA, SiteShell } from "../components/site/SiteChrome";
import { type JournalSite, journalSites } from "../lib/journal-sites";
import { journalAssets } from "../lib/react-assets";
export function SitesPage() {
  return (
    <SiteShell>
      <PageIntro
        eyebrow="YOUR SITE / YOUR PRIORITIES"
        title="Different places. Familiar questions."
      >
        <p>
          What’s running? What needs a closer look? Start with the place you look after, and build a
          view around its equipment.
        </p>
      </PageIntro>
      <section className="site-stories-list">
        {journalSites.map((site) => (
          <article key={site.id} className="web-journal" data-active-site={site.id}>
            <a href={`/sites/${site.id}/`} className="site-story-image">
              <img
                src={journalAssets[site.id]}
                alt={site.alt}
                width="768"
                height="512"
                loading="lazy"
              />
            </a>
            <div>
              <span className="micro">{site.setting}</span>
              <h2>{site.lead}</h2>
              <p>{site.body}</p>
              <a className="underlined-action" href={`/sites/${site.id}/`}>
                Explore{" "}
                {site.id === "cottage"
                  ? "cottage setups"
                  : site.id === "mining"
                    ? "mining utilities"
                    : "remote telecom"}{" "}
                <span>↗</span>
              </a>
            </div>
          </article>
        ))}
      </section>
      <MultiSiteNote />
      <section className="content-section other-site">
        <h2>A maple operation? Another remote site?</h2>
        <p>
          Pumps, tanks, temperature sensors and local power belong in the same equipment
          conversation. Start with the reading or task that matters to your operation.
        </p>
        <a className="underlined-action" href="/contact/">
          Tell us about your installation <span>↗</span>
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
        <img src={journalAssets[siteId]} alt={site.alt} width="1536" height="1024" />
        <div>
          <span className="micro">{site.setting}</span>
          <h1>
            {site.id === "cottage"
              ? "A setup built over years."
              : site.id === "mining"
                ? "Keep the utilities in view."
                : "A clearer view from far away."}
          </h1>
          <p>{site.lead}</p>
          <a className="concept-action" href={`/contact/?site=${siteId}`}>
            Plan your site view <span>↗</span>
          </a>
        </div>
      </section>
      <div className="journal-index">
        <span className="micro">THE EQUIPMENT THAT MATTERS</span>
        {site.equipment.map((item) => (
          <span key={item}>{item}</span>
        ))}
        <a href="/equipment/">Explore the catalogue ↗</a>
      </div>
      <section className="journal-app-section">
        <div className="journal-app-copy">
          <span className="micro">OFFGRID + BUDDY</span>
          <h2>{site.appTitle.join(" ")}</h2>
          <p>{site.appBody}</p>
          <div className="editorial-caption">
            <span>{site.index}</span>
            <p>
              <strong>{site.proofTitle}</strong>
              <br />
              {site.proof}
            </p>
          </div>
          <a className="underlined-action" href={`/app/${siteId}/`}>
            Try this app scene <span>↗</span>
          </a>
        </div>
        <div className="journal-app-visual">
          <span className="scene-label">{site.sceneLabel}</span>
          <BuddyApp site={siteId} buddyUrl={journalAssets.buddy} />
          <span className="scene-footnote">Interactive app concept · Sample readings</span>
        </div>
      </section>
      <p className="content-section image-disclosure">
        Site image is a generated concept, not a customer installation.
      </p>
      {siteId !== "cottage" && <MultiSiteNote />}
      <SiteCTA />
    </SiteShell>
  );
}
