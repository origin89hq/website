import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "../components/site/GitHubIcon";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import { SourceProjects } from "../components/site/SourceProjects";
import { siteConfig } from "../lib/site-config";

export function OpenSourcePage() {
  return (
    <SiteShell>
      <PageIntro title="Keep your equipment useful.">
        <p>
          A working battery bank or generator can outlast the software around it. We publish our
          board designs, protocol code and equipment data so you can inspect them, adapt them and
          keep building on what you own.
        </p>
        <a
          className="o89-text-link github-action"
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
          <a className="o89-text-link" href="/developers/">
            Developer resources <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <SourceProjects />
      </section>
      <section className="open-principles" aria-labelledby="open-principles-title">
        <h2 id="open-principles-title">You should be able to look inside.</h2>
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
            <a className="o89-text-link" href={siteConfig.data}>
              Explore data.origin89.com <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>
      <section className="source-release-notes">
        <div>
          <h2>Licences and status</h2>
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
          <h2>Also on GitHub</h2>
          <ul>
            <li>
              <a href={siteConfig.repositories.camera} className="o89-text-link">
                Camera hardware <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={siteConfig.repositories.brand} className="o89-text-link">
                Brand and Buddy artwork <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="/developers/" className="o89-text-link">
                Ways to contribute <ArrowRight size={16} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
