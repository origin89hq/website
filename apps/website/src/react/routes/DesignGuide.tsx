import { ArrowDown, ArrowRight, ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { BuddyAvatar } from "../components/buddy/BuddyAvatar";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import { boardImage, controllerImage, journalAssets } from "../lib/react-assets";

const cssExample = `/* A frame: hairline edge and the Plate 89 corner. */
.panel {
  background: var(--o89-surface);
  color: var(--o89-fg);
  border: 1px solid var(--o89-line);
  border-radius: 14px;
  corner-shape: bevel;
}

/* Secondary copy on a surface uses muted, never faint. */
.panel p {
  color: var(--o89-muted);
}

/* Data paths and selection use signal blue. */
.panel [aria-selected="true"] {
  border-color: var(--o89-signal);
}`;
const chapters = [
  ["identity", "Identity"],
  ["color", "Colour"],
  ["type", "Typography"],
  ["components", "Plates and frames"],
  ["readings", "Readings and states"],
  ["renders", "Renders"],
  ["buddy", "Buddy"],
  ["downloads", "Downloads"],
];
const tokens = [
  ["Page", "--o89-page", "#07090c", "The ground of every page."],
  ["Surface", "--o89-surface", "#0d1116", "Sections and frames that lift off the page."],
  ["Raised surface", "--o89-surface-raised", "#12171e", "Dialogs, panels and pressed controls."],
  ["Line", "--o89-line", "#1e252e", "Rules between rows and the edge of a frame."],
  ["Strong line", "--o89-line-strong", "#2b343f", "Input edges and control outlines."],
  ["Foreground", "--o89-fg", "#e7eaee", "Headings, body copy and trusted readings."],
  ["Muted", "--o89-muted", "#9aa5b1", "Secondary copy and stale readings. Safe on every surface."],
  ["Faint", "--o89-faint", "#707b87", "Captions on the page ground only."],
  ["Action", "--o89-action", "#2b4a97", "The plate fill. Never used for text."],
  ["Action lit", "--o89-action-lit", "#3f61b3", "The plate fill on hover."],
  ["Link", "--o89-link", "#6279ad", "Links inside running text on the page ground."],
  ["Signal", "--o89-signal", "#7f9ce0", "Data paths, leader lines, selection and designators."],
  [
    "Nominal",
    "--o89-nominal",
    "#2f9d64",
    "A live reading that is healthy. At most once per screen.",
  ],
  ["Warning", "--o89-warning", "#e9a13c", "Pending and planned work."],
] as const;
const statusWords = [
  ["published", "Published", "The file, package or dataset is public today."],
  ["specified", "Specified", "Written into a specification, such as KM43, but not implemented."],
  ["planned", "Planned", "Intended work with no public implementation yet."],
  ["pending", "Pending bench", "A designed value that still needs a measurement on the board."],
] as const;
const downloads = [
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
];

export function DesignGuidePage() {
  const [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  return (
    <SiteShell>
      <PageIntro title="Build something that belongs.">
        <p>
          The Origin89 web language: a dark ground, hairline frames with the Plate 89 corner, and
          colour kept for state. Use these tokens and rules for anything that sits beside the
          website or the Offgrid app.
        </p>
        <a
          className="o89-text-link"
          href="https://github.com/origin89hq/brand/releases/latest/download/origin89-design-guide.pdf"
        >
          Download the identity guide <ArrowDown size={16} aria-hidden="true" />
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
          <section id="identity" aria-labelledby="identity-title">
            <h2 id="identity-title">The plate is the mark.</h2>
            <div className="guide-logo">
              <img
                src={journalAssets.logoWhite}
                alt="Origin89 horizontal logo, white"
                width="340"
                height="57"
              />
            </div>
            <p>
              On the dark ground, use the white horizontal logo. Keep the clipped corners, counters
              and wordmark intact, and leave clear space of at least one quarter of the plate’s
              height around the lockup. The blue logo is for light documents.
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

          <section id="color" aria-labelledby="color-title">
            <h2 id="color-title">A dark ground. Colour means state.</h2>
            <p>
              The site has one theme. Reference the tokens from <code>theme.css</code> rather than
              copying hex values, and let every colour travel with a label, a symbol or a line
              treatment.
            </p>
            <div className="guide-swatches">
              {tokens.map(([label, token, hex, role]) => (
                <div className="guide-swatch" key={token}>
                  <i style={{ background: `var(${token})` }} />
                  <div>
                    <strong>{label}</strong>
                    <code>{token}</code>
                    <code className="guide-hex">{hex}</code>
                    <p>{role}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="guide-note">
              Measured on the page ground: foreground 16.5:1, muted 8.0:1, faint 4.6:1, link 4.6:1.
              On a raised surface faint drops to 4.2:1, so secondary text there uses muted. The
              action fill is 2.4:1 against the ground, which is why the plate carries a white rim.
            </p>
            <div className="code-sample">
              <div className="code-sample-bar">
                <code>frame.css</code>
                <button
                  type="button"
                  className="o89-plate o89-plate-ghost o89-plate-sm"
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
                  {copied ? (
                    <>
                      <Check size={15} aria-hidden="true" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={15} aria-hidden="true" /> Copy CSS
                    </>
                  )}
                </button>
              </div>
              <pre>
                <code>{cssExample}</code>
              </pre>
              <span role="status">
                {copyError ? "Select and copy the code above." : copied ? "CSS copied." : ""}
              </span>
            </div>
          </section>

          <section id="type" aria-labelledby="type-title">
            <h2 id="type-title">Inter Tight for words. Plex Mono for data.</h2>
            <div className="guide-type-sample">
              <strong>Every terminal, named.</strong>
              <p>
                Headings use Inter Tight 700 in sentence case, tracked to about −0.035em. Body copy
                is 400 or 500 at 16 to 20 px, with lines of 65 to 75 characters.
              </p>
            </div>
            <dl className="guide-spec">
              <div>
                <dt>Bus</dt>
                <dd>RS-485 A/B</dd>
              </div>
              <div>
                <dt>Supply</dt>
                <dd>12 V</dd>
              </div>
              <div>
                <dt>Solar in</dt>
                <dd>2.10 kW · 8 s ago</dd>
              </div>
              <div>
                <dt>Board</dt>
                <dd>boards/controller-a</dd>
              </div>
            </dl>
            <p>
              IBM Plex Mono is for data only: designators, units, readings, file names and code.
              Labels and prose stay in Inter Tight. Do not put all-caps labels above headings; the
              heading carries the section. Use the supplied logo instead of typing the wordmark.
            </p>
          </section>

          <section id="components" aria-labelledby="components-title">
            <h2 id="components-title">Plates, frames and hairlines.</h2>
            <p>
              Buttons take the shape of the Plate 89 sign: clipped corners, a blue fill and a thin
              white rim. Ghost plates are outlined in the strong line and fill when pressed.
            </p>
            <div className="guide-buttons">
              <button
                type="button"
                className="o89-plate o89-plate-action"
                onClick={() => scrollTo("downloads")}
              >
                Primary action <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="o89-plate o89-plate-ghost"
                onClick={() => scrollTo("readings")}
              >
                Secondary action
              </button>
              <button type="button" className="o89-plate o89-plate-ghost o89-plate-sm" aria-pressed>
                Selected
              </button>
            </div>
            <pre className="guide-snippet">
              <code>{`<a class="o89-plate o89-plate-action">…</a>
<button class="o89-plate o89-plate-ghost o89-plate-sm" aria-pressed="true">…</button>`}</code>
            </pre>
            <div className="guide-frame-sample">
              <div className="guide-frame">
                <strong>Frame</strong>
                <p>
                  Cards, panels, inputs and table containers use a 1 px line and{" "}
                  <code>corner-shape: bevel</code>. Never a plain rounded rectangle, a glow or a
                  coloured side border.
                </p>
              </div>
              <ul className="equipment-chips" aria-label="Chip examples">
                <li>Small chips</li>
                <li>stay pills</li>
              </ul>
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
            <a className="o89-text-link" href="/storybook/">
              Open the component library <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </section>

          <section id="readings" aria-labelledby="readings-title">
            <h2 id="readings-title">Missing is a state, not zero.</h2>
            <div className="reading-examples">
              <div className="reading-measured">
                <span>Measured</span>
                <strong>76%</strong>
                <small>Battery · updated 8 s ago</small>
              </div>
              <div className="reading-estimated">
                <span>Estimated</span>
                <strong>≈4 h</strong>
                <small>Illustrative estimate · assumptions shown</small>
              </div>
              <div className="reading-stale">
                <span>Last known</span>
                <strong>78%</strong>
                <small>Battery · 12 min ago · current state unknown</small>
              </div>
              <div className="reading-missing">
                <span>Unavailable</span>
                <strong>——</strong>
                <small>No reading received</small>
              </div>
            </div>
            <p>
              Keep the observation, source and timestamp together. An old reading cannot become a
              fresh all-clear. Equipment research cannot become a claim of tested support.
            </p>
            <h3>Status words</h3>
            <dl className="guide-status">
              {statusWords.map(([status, word, meaning]) => (
                <div key={status}>
                  <dt>
                    <span className="status-word" data-status={status}>
                      {word}
                    </span>
                  </dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="renders" aria-labelledby="renders-title">
            <h2 id="renders-title">Renders come from the real files.</h2>
            <div className="guide-renders">
              <figure className="render-stage">
                <img
                  src={controllerImage}
                  alt="Origin89 Controller enclosure rendered from CAD"
                  width="600"
                  height="488"
                  loading="lazy"
                />
                <figcaption>Enclosure, rendered from the hardware repository CAD</figcaption>
              </figure>
              <figure className="render-stage">
                <img
                  src={boardImage}
                  alt="Controller board rendered from the same CAD scene"
                  width="600"
                  height="480"
                  loading="lazy"
                />
                <figcaption>Board, rendered from the same scene</figcaption>
              </figure>
            </div>
            <ul>
              <li>Render products from CAD and fabrication data. Do not paint or generate them.</li>
              <li>Light them in a dark studio. No gradient backdrops, glows or glass panels.</li>
              <li>
                Place renders frameless on the page ground, or over a faint dot grid that fades at
                the edges.
              </li>
              <li>Draw data paths, leader lines and selection in signal blue.</li>
              <li>Keep third-party equipment unbranded, and label generated scenes as concepts.</li>
            </ul>
          </section>

          <section id="buddy" aria-labelledby="buddy-title">
            <h2 id="buddy-title">Be useful. Leave room for the person.</h2>
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
              <li>
                Use one ease-out curve, <code>--o89-ease</code>, and honour reduced motion.
              </li>
            </ul>
          </section>

          <section id="downloads" aria-labelledby="downloads-title">
            <h2 id="downloads-title">Start with the real artwork.</h2>
            <div className="guide-downloads">
              {downloads.map(([label, file]) => (
                <a
                  key={file}
                  href={file.startsWith("http") ? file : `/brand/${file}`}
                  download={file.startsWith("http") ? undefined : true}
                >
                  {label}
                  <ArrowDown size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="guide-note">
              These assets come from the Origin89 brand source. The identity guide is version 1.0,
              September 8, 2026; this page covers the dark theme used on origin89.com.
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
