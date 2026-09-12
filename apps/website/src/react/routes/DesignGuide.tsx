import { useState } from "react";
import { BuddyAvatar } from "../components/buddy/BuddyAvatar";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import { Button } from "../components/ui/button";
import type { JournalSite } from "../lib/journal-sites";
import { journalAssets } from "../lib/react-assets";

const cssExample = `/* Use semantic values. The site supplies its theme. */\n.site-panel {\n  background: var(--journal-paper);\n  color: var(--journal-ink);\n  border: 1px solid var(--journal-line);\n}\n\n.primary-action {\n  background: var(--primary);\n  color: var(--primary-foreground);\n}`;
const chapters = [
  ["identity", "Identity"],
  ["color", "Color & themes"],
  ["type", "Typography"],
  ["components", "Components"],
  ["readings", "Readings & states"],
  ["buddy", "Buddy & motion"],
  ["downloads", "Downloads"],
];
export function DesignGuidePage() {
  const [site, setSite] = useState<JournalSite>("cottage"),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  return (
    <SiteShell site={site}>
      <PageIntro eyebrow="ORIGIN89 / DEVELOPER DESIGN GUIDE" title="Build something that belongs.">
        <p>
          A calm cottage overview. A clear view of industrial equipment. One recognizable system,
          with room to adapt.
        </p>
        <a
          className="underlined-action"
          href="https://github.com/origin89hq/brand/releases/latest/download/origin89-design-guide.pdf"
        >
          Download the identity guide <span>↓</span>
        </a>
      </PageIntro>
      <div className="guide-layout">
        <nav className="guide-toc" aria-label="Design guide contents">
          {chapters.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="guide-content">
          <section id="identity">
            <span className="micro">01 / IDENTITY</span>
            <h2>The plate is the mark.</h2>
            <div className="guide-logo">
              <img
                src={journalAssets.logo}
                alt="Origin89 horizontal logo"
                width="340"
                height="60"
              />
            </div>
            <p>
              Use the supplied outlined artwork. Keep the clipped corners, counters and wordmark
              intact. Leave clear space of at least one quarter of the plate’s height around the
              complete lockup.
            </p>
            <div className="guide-two-columns">
              <div>
                <h3>At small sizes</h3>
                <p>
                  Start at 24 px for the symbol or 170 px for the horizontal signature. Use the
                  symbol alone when the full name becomes cramped.
                </p>
              </div>
              <div>
                <h3>Product names</h3>
                <p>
                  Origin89 Controller. Origin89 Offgrid. Buddy. KM43 names the protocol; it is not
                  the app or firmware brand.
                </p>
              </div>
            </div>
          </section>
          <section id="color">
            <span className="micro">02 / COLOR & THEMES</span>
            <h2>Fit the place. Keep the identity.</h2>
            <p>
              Bridge blue stays recognizable. Paper, ink and supporting surfaces follow the site.
              Reference semantic variables in components.
            </p>
            {/** biome-ignore lint/a11y/useSemanticElements: ARIA group labels these related controls without fieldset form semantics. */}
            <div role="group" className="site-switch-row" aria-label="Preview a site palette">
              {(["cottage", "mining", "telecom"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={site === value}
                  onClick={() => setSite(value)}
                >
                  {value === "cottage"
                    ? "Cottage · warm"
                    : value === "mining"
                      ? "Mining · industrial"
                      : "Telecom · cold"}
                </button>
              ))}
            </div>
            <div className="guide-swatches">
              {[
                ["Paper", "--journal-paper"],
                ["Ink", "--journal-ink"],
                ["Secondary text", "--journal-muted"],
                ["Dividers", "--journal-line"],
                ["Visual field", "--journal-field"],
                ["Bridge blue", "--primary"],
              ].map(([label, token]) => (
                <div key={token}>
                  <i style={{ background: `var(${token})` }} />
                  <strong>{label}</strong>
                  <code>{token}</code>
                </div>
              ))}
            </div>
            <div className="code-sample">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(cssExample);
                    setCopied(true);
                    setCopyError(false);
                  } catch {
                    setCopyError(true);
                  }
                }}
              >
                {copied ? "Copied ✓" : "Copy CSS"}
              </button>
              <pre>
                <code>{cssExample}</code>
              </pre>
              <span role="status">
                {copyError ? "Select and copy the code above." : copied ? "CSS copied." : ""}
              </span>
            </div>
            <p className="guide-note">
              Brand blue is #2B4A97. State colors need their own contrast checks. Color always
              travels with a label, symbol or line treatment.
            </p>
          </section>
          <section id="type">
            <span className="micro">03 / TYPOGRAPHY</span>
            <h2>Clear words. Quiet details.</h2>
            <div className="guide-type-sample">
              <span className="micro">INTER TIGHT / HEADINGS & INTERFACE</span>
              <strong>
                Your site.
                <br />
                At a glance.
              </strong>
              <p>
                Use sentence case and short, concrete instructions. Default body text: 16 px with 24
                px line height.
              </p>
            </div>
            <div className="guide-mono-sample">
              <span>SOLAR IN</span>
              <strong>2.10 kW</strong>
              <span>UPDATED 8 SEC AGO</span>
            </div>
            <p>
              IBM Plex Mono is for readings, timestamps, model numbers and technical labels. Keep
              units beside values. Use the supplied logo instead of typing a replacement wordmark.
            </p>
            <div className="guide-spacing">
              {[4, 8, 16, 24, 40, 64].map((size) => (
                <div key={size}>
                  <i style={{ height: size }} />
                  <span>{size}px</span>
                </div>
              ))}
            </div>
            <p className="guide-note">
              The spacing foundation is 4, 8, 16, 24, 40 and 64 px. Add intermediate steps only when
              a component needs them.
            </p>
          </section>
          <section id="components">
            <span className="micro">04 / COMPONENTS</span>
            <h2>Build once. Review in context.</h2>
            <p>
              Use the shared React components in <code>src/react/components</code>. Keep variants in
              Storybook, with normal, loading, empty, error and disabled states where they apply.
            </p>
            <div className="guide-buttons buddy-ui">
              <Button
                onClick={() =>
                  document.getElementById("downloads")?.scrollIntoView({
                    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                      ? "instant"
                      : "smooth",
                  })
                }
              >
                Primary action
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById("readings")?.scrollIntoView()}
              >
                Secondary action
              </Button>
              <Button disabled>Unavailable</Button>
            </div>
            <div className="guide-two-columns">
              <div>
                <h3>On a phone</h3>
                <p>
                  Review at 320 and 390 px. Give chat and the equipment map their own views. Keep
                  the next useful action reachable.
                </p>
              </div>
              <div>
                <h3>For every input</h3>
                <p>
                  Provide a visible label, keyboard focus and a readable error. Prefer native
                  buttons, links and form controls over simulated controls.
                </p>
              </div>
            </div>
            <a className="underlined-action" href="/storybook/">
              Open the component library <span>↗</span>
            </a>
          </section>
          <section id="readings">
            <span className="micro">05 / READINGS & STATES</span>
            <h2>Missing is a state, not zero.</h2>
            <div className="reading-examples">
              <div>
                <span>Measured</span>
                <strong>76%</strong>
                <small>Battery · Updated 8 sec ago</small>
              </div>
              <div className="reading-estimated">
                <span>Estimated</span>
                <strong>≈ 4 h</strong>
                <small>Illustrative estimate · Assumptions required</small>
              </div>
              <div className="reading-stale">
                <span>Last known</span>
                <strong>78%</strong>
                <small>Battery · 12 min ago · Current state unknown</small>
              </div>
              <div className="reading-missing">
                <span>Unavailable</span>
                <strong>—</strong>
                <small>No reading received</small>
              </div>
            </div>
            <p>
              Keep the observation, source and timestamp together. An old reading cannot become a
              fresh all-clear. Equipment research cannot become a claim of tested support.
            </p>
          </section>
          <section id="buddy">
            <span className="micro">06 / BUDDY & MOTION</span>
            <h2>Be useful. Leave room for the person.</h2>
            <div className="guide-buddy">
              <BuddyAvatar
                src={journalAssets.buddy}
                alt="Buddy"
                size={100}
                sizes="(max-width: 760px) 78px, 100px"
                framing="avatar"
              />
              <p>“No new reading for 12 minutes. Let’s check the update path.”</p>
            </div>
            <ul>
              <li>Ask one question at a time. Explain the useful part first.</li>
              <li>Identify the exact equipment before giving model-specific advice.</li>
              <li>Separate proposed checks, measurements and confirmed actions.</li>
              <li>Use still poses beside readings. Motion should explain a change.</li>
              <li>Keep transitions around 180–240 ms and honor reduced motion.</li>
            </ul>
            <p className="guide-note">
              Buddy’s current setup conversation is a local design demo. Cloudflare inference and
              real image analysis are separate implementation work.
            </p>
          </section>
          <section id="downloads">
            <span className="micro">07 / DOWNLOADS</span>
            <h2>Start with the real artwork.</h2>
            <div className="guide-downloads">
              {[
                [
                  "Identity guide · PDF",
                  "https://github.com/origin89hq/brand/releases/latest/download/origin89-design-guide.pdf",
                ],
                ["Identity guide · Markdown", "design-guide.md"],
                ["Horizontal logo · Blue SVG", "origin89-blue.svg"],
                ["Horizontal logo · White SVG", "origin89-white.svg"],
                ["Plate 89 · SVG", "plate-89.svg"],
                ["Buddy avatar · PNG", "buddy-avatar.png"],
                ["Buddy portrait · transparent PNG", "buddy-portrait.png"],
                ["Buddy full character · transparent PNG", "buddy-full-body.png"],
                ["Buddy app icon · PNG", "buddy-app-512.png"],
                ["Buddy favicon · ICO", "buddy-favicon.ico"],
                ["Brand tokens · CSS", "brand-tokens.css"],
                ["Brand tokens · JSON", "brand-tokens.json"],
              ].map(([label, file]) => (
                <a
                  key={file}
                  href={file.startsWith("http") ? file : `/brand/${file}`}
                  download={file.startsWith("http") ? undefined : true}
                >
                  {label}
                  <span>↓</span>
                </a>
              ))}
            </div>
            <p className="guide-note">
              These assets come from the Origin89 brand source. The identity guide is version 1.0,
              September 8, 2026; this web guide adds the Site journal component conventions.
            </p>
            <p className="guide-note">
              Buddy’s poses, avatars and icons are rebuilt from the shared Blender model in the{" "}
              <a href="https://github.com/origin89hq/brand">brand repository</a>, which publishes
              them at web sizes as <code>@origin89/brand</code>.
            </p>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
