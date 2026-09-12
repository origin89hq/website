import { ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "../components/site/GitHubIcon";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import { SourceProjects } from "../components/site/SourceProjects";
import { siteConfig } from "../lib/site-config";

export function OpenSourcePage() {
  return (
    <SiteShell>
      <PageIntro eyebrow="OPEN SOURCE AT ORIGIN89" title="Keep your equipment useful.">
        <p>
          A working battery bank or generator can outlast the software around it. We publish our
          board designs, protocol code and equipment data so you can inspect them, adapt them and
          keep building on what you own.
        </p>
        <a
          className="underlined-action github-action"
          href={siteConfig.github}
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon /> Explore the repositories <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </PageIntro>
      <section className="source-section" aria-labelledby="published-source-title">
        <div className="source-section-heading">
          <h2 id="published-source-title">Open and available today</h2>
          <a className="text-action" href="/developers/">
            Developer resources <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <SourceProjects />
      </section>
      <section className="open-principles" aria-labelledby="open-principles-title">
        <div>
          <span className="micro">WHY WE PUBLISH IT</span>
          <h2 id="open-principles-title">You should be able to look inside.</h2>
        </div>
        <div className="open-principle-rows">
          <article>
            <h3>Repair starts with the files.</h3>
            <p>
              Follow a circuit in the editable board project, find a part in the bill of materials
              or change the enclosure in FreeCAD.
            </p>
          </article>
          <article>
            <h3>Integrations need a shared reference.</h3>
            <p>
              Use the KM43 code and test vectors to build a client. Check an equipment register
              against its cited source before writing a driver.
            </p>
          </article>
          <article>
            <h3>The data is useful on its own.</h3>
            <p>
              Download the equipment tables for your own research or software. Each release includes
              file hashes and a published index.
            </p>
            <a className="text-action" href={siteConfig.data}>
              Explore data.origin89.com <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>
      <section className="source-release-notes">
        <div>
          <span className="micro">LICENCES & STATUS</span>
          <p>
            KM43 code is MIT OR Apache-2.0; the draft specification has separate terms still to be
            confirmed. Hardware designs are CERN-OHL-W-2.0. Data records and tools are MIT;
            manufacturer documents and imported feeds retain their own terms. The repositories hold
            the full licence details.
          </p>
          <p>
            The boards are prototypes and KM43 is a draft. Product validation and the Offgrid app
            are still in development.
          </p>
        </div>
        <div>
          <span className="micro">ALSO ON GITHUB</span>
          <a href={siteConfig.repositories.camera} className="text-action">
            Camera hardware <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href={siteConfig.repositories.brand} className="text-action">
            Brand & Buddy artwork <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href="/developers/" className="text-action">
            Ways to contribute <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
