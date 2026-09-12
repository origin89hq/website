import { ArrowUpRight } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { type JournalSite, journalSites } from "../../lib/journal-sites";
import { siteConfig } from "../../lib/site-config";
import { BuddyAvatar } from "../buddy/BuddyAvatar";
import { BuddyApp } from "./BuddyApp";
import { ControllerStudy } from "./ControllerStudy";
import { GitHubIcon } from "./GitHubIcon";
import { MultiSiteNote } from "./MultiSiteNote";
import { ProductFamily } from "./ProductFamily";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { SourceProjects } from "./SourceProjects";

const BuddyWorkspace = lazy(() => import("../buddy/BuddyWorkspace"));
export interface JournalAssets {
  buddy: string;
  logo: string;
  plate: string;
  cottage: string;
  mining: string;
  telecom: string;
}
export interface SiteJournalProps {
  site?: JournalSite;
  assets: JournalAssets;
  onSiteChange?: (site: JournalSite) => void;
  onOpenApp?: (site: JournalSite) => void;
}
export function SiteJournal({
  site = "cottage",
  assets,
  onSiteChange,
  onOpenApp,
}: SiteJournalProps) {
  const [activeSite, setActiveSite] = useState(site);
  const dialog = useRef<HTMLDialogElement>(null);
  const [chatOpened, setChatOpened] = useState(false);
  function openChat() {
    setChatOpened(true);
    dialog.current?.showModal();
  }
  useEffect(() => setActiveSite(site), [site]);
  useEffect(() => {
    window.parent.postMessage({ type: "origin89:journal-site", site: activeSite }, location.origin);
  }, [activeSite]);
  function selectSite(next: JournalSite) {
    setActiveSite(next);
    onSiteChange?.(next);
  }
  return (
    <div className="website-concept web-journal" data-active-site="cottage">
      <SiteHeader />
      <main id="main">
        <section className="journal-context" aria-label="Origin89 controller and app">
          <div className="journal-opening">
            <div className="journal-story">
              <span className="micro">OPEN CONTROL / REMOTE & OFF-GRID</span>
              <h1>
                A clearer picture
                <br />
                of your site.
              </h1>
              <div className="journal-setting-copy">
                <p className="setting-lead">
                  Solar, batteries, generators and sensors. Different makers, one site.
                </p>
                <p>
                  We’re building Origin89 to bring supported equipment into one app, with the
                  control rules running at your site.
                </p>
              </div>
              <button className="concept-action" type="button" data-open-setup onClick={openChat}>
                Show Buddy your setup <ArrowUpRight size={16} aria-hidden="true" />
              </button>
              <a className="journal-browse" href={siteConfig.data}>
                Browse the open equipment data <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <span className="journal-note">Controller and app in development.</span>
            </div>
            <div className="journal-photographs">
              <ControllerStudy />
            </div>
          </div>
        </section>
        <section
          className="journal-examples"
          data-active-site={activeSite}
          aria-labelledby="site-examples-title"
        >
          <div className="journal-examples-heading">
            <div>
              <h2 id="site-examples-title">Explore a site.</h2>
              <p>Three examples of the equipment Origin89 is being built for.</p>
            </div>
            <div className="journal-site-tabs" role="tablist" aria-label="Example site">
              {journalSites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  role="tab"
                  id={`site-tab-${site.id}`}
                  aria-controls={`site-panel-${site.id}`}
                  aria-selected={site.id === activeSite}
                  tabIndex={site.id === activeSite ? 0 : -1}
                  data-journal-site={site.id}
                  onClick={() => selectSite(site.id)}
                  onKeyDown={(event) => {
                    const i = journalSites.findIndex((item) => item.id === site.id);
                    const next =
                      event.key === "ArrowRight"
                        ? (i + 1) % 3
                        : event.key === "ArrowLeft"
                          ? (i + 2) % 3
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? 2
                              : -1;
                    if (next < 0) return;
                    event.preventDefault();
                    selectSite(journalSites[next].id);
                    event.currentTarget.parentElement
                      ?.querySelectorAll<HTMLButtonElement>("button")
                      [next]?.focus();
                  }}
                >
                  <span>{site.index}</span>
                  {site.label}
                </button>
              ))}
            </div>
          </div>
          {journalSites.map((site) => (
            <div
              key={site.id}
              role="tabpanel"
              id={`site-panel-${site.id}`}
              aria-labelledby={`site-tab-${site.id}`}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: The selected example panel must be reachable by keyboard.
              tabIndex={0}
              data-journal-content={site.id}
              hidden={site.id !== activeSite}
            >
              <section className="site-example" aria-label={`${site.label}: Origin89 Offgrid app`}>
                <div className="site-example-copy">
                  <span className="micro">{site.setting}</span>
                  <h2>
                    {site.exampleTitle[0]}
                    <br />
                    {site.exampleTitle[1]}
                  </h2>
                  <p>{site.exampleBody}</p>
                  <div className="site-example-equipment">
                    <span className="micro">TYPICAL EQUIPMENT</span>
                    <ul>
                      {site.equipment.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="site-example-assistant">
                    <span className="micro">AI GROUNDED IN YOUR EQUIPMENT</span>
                    <h3>{site.assistantTitle}</h3>
                    <p>{site.assistantBody}</p>
                  </div>
                  <a
                    className="underlined-action"
                    href={`/app/${site.id}/`}
                    onClick={(event) => {
                      if (onOpenApp) {
                        event.preventDefault();
                        onOpenApp(site.id);
                      }
                    }}
                  >
                    Open the app example <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
                <div className="site-example-preview">
                  <BuddyApp
                    buddyUrl={assets.buddy}
                    site={site.id}
                    scene="overview"
                    presentation="preview"
                  />
                  <span className="scene-footnote">
                    App concept · Sample equipment and readings
                  </span>
                </div>
              </section>
            </div>
          ))}
        </section>
        <ProductFamily />
        <section className="source-home" id="open-foundation" aria-labelledby="home-source-title">
          <div className="source-home-intro">
            <span className="micro">
              <GitHubIcon width={16} height={16} /> OPEN SOURCE
            </span>
            <h2 id="home-source-title">The files are part of the product.</h2>
            <p>
              We publish the board designs, KM43 protocol code and equipment dataset so you can
              inspect them and use them in your own projects.
            </p>
            <a className="text-action" href="/open-source/">
              Why we build in the open <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <SourceProjects compact />
        </section>
        <MultiSiteNote />
        <section className="buddy-setup-intro" id="show-buddy">
          <BuddyAvatar
            src={assets.buddy}
            alt="Buddy"
            size={88}
            sizes="(max-width: 760px) 56px, (max-width: 1050px) 90px, 88px"
          />
          <div className="buddy-setup-copy">
            <span className="micro">IDENTIFY YOUR EQUIPMENT</span>
            <h2>Show Buddy your setup.</h2>
            <p>Upload an equipment label and work through the details with Buddy.</p>
          </div>
          <button className="concept-action" type="button" data-open-setup onClick={openChat}>
            Start with a photo <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </section>
        <dialog
          ref={dialog}
          className="setup-dialog"
          data-setup-dialog
          aria-label="Buddy setup chat"
        >
          {chatOpened && (
            <Suspense
              fallback={
                <p className="chat-loading" role="status">
                  Opening Buddy…
                </p>
              }
            >
              <BuddyWorkspace
                buddyUrl={assets.buddy}
                plateUrl={assets.plate}
                photoUrl={assets.cottage}
                site={activeSite}
                onClose={() => dialog.current?.close()}
              />
            </Suspense>
          )}
        </dialog>
      </main>
      <SiteFooter />
    </div>
  );
}
