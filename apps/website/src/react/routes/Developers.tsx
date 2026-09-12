import { ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "../components/site/GitHubIcon";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import { SourceProjects } from "../components/site/SourceProjects";
import { siteConfig } from "../lib/site-config";

export function DevelopersPage() {
  return (
    <SiteShell>
      <PageIntro eyebrow="DEVELOPERS" title="Start with the source.">
        <p>
          Build a client with KM43, use the equipment dataset in your own tools, or inspect the
          controller boards. Each repository includes its source and licence.
        </p>
        <a
          className="underlined-action github-action"
          href={siteConfig.github}
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon /> origin89hq on GitHub <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </PageIntro>
      <section className="source-section" aria-labelledby="developer-projects-title">
        <div className="source-section-heading">
          <h2 id="developer-projects-title">Public repositories</h2>
          <span className="micro">CODE / DATA / HARDWARE</span>
        </div>
        <SourceProjects />
      </section>
      <section className="developer-toolbox" aria-labelledby="developer-toolbox-title">
        <div className="source-section-heading">
          <h2 id="developer-toolbox-title">Documentation & design</h2>
          <span className="micro">REFERENCE MATERIAL</span>
        </div>
        <div className="developer-resources">
          <a href={siteConfig.docs}>
            <h3>
              Technical documentation <ArrowUpRight size={18} aria-hidden="true" />
            </h3>
            <p>Protocol decisions, controller architecture and hardware reasoning.</p>
          </a>
          <a href="/developers/design-guide/">
            <h3>
              Design guide <ArrowUpRight size={18} aria-hidden="true" />
            </h3>
            <p>Origin89 colours, type, components and interface states.</p>
          </a>
          <a href="/storybook/?path=/story/start-here--design-direction">
            <h3>
              Component library <ArrowUpRight size={18} aria-hidden="true" />
            </h3>
            <p>Try the React components and their loading, error and mobile states.</p>
          </a>
          <a href={siteConfig.repositories.brand} target="_blank" rel="noreferrer">
            <h3>
              Brand source <ArrowUpRight size={18} aria-hidden="true" />
            </h3>
            <p>Versioned logos, fonts, colour tokens and Buddy artwork.</p>
          </a>
        </div>
      </section>
      <section className="contribution-note">
        <div>
          <span className="micro">CONTRIBUTE</span>
          <h2>Bring a model, a fix or a question.</h2>
        </div>
        <div>
          <p>
            A register map from a manufacturer’s manual, a reproducible protocol bug or a board
            review gives us something concrete to work with. Start in the relevant repository and
            include the source or steps to reproduce it.
          </p>
          <a
            href={`${siteConfig.repositories.km43}/blob/main/CONTRIBUTING.md`}
            className="text-action"
          >
            KM43 contribution guide <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
