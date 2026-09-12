export function Foundations({
  section = "palette",
}: {
  section?: "palette" | "type" | "spacing" | "principles";
}) {
  if (section === "principles")
    return (
      <article className="sb-doc">
        <span className="micro">ORIGIN89 / DESIGN SYSTEM · 01</span>
        <h1>
          One system.
          <br />
          Built for real sites.
        </h1>
        <p>Keep the equipment you have. Understand it with Buddy. See how it can work together.</p>
        <div className="sb-rule-list">
          <div>
            <h3>Show the useful part.</h3>
            <p>One question at a time. Visual equipment maps. Details when you ask.</p>
          </div>
          <div>
            <h3>Fit the place.</h3>
            <p>
              Warm cottages. Working mines. Cold telecom shelters. The same components, with the
              right character.
            </p>
          </div>
          <div>
            <h3>Keep the unknowns.</h3>
            <p>
              A researched model isn’t confirmed support. An old reading isn’t the current
              condition.
            </p>
          </div>
        </div>
        <h2>Start with Buddy.</h2>
        <p>
          Open Setup conversation in the sidebar. Try the photo flow, switch the site theme, then
          check the phone stories.
        </p>
        <p className="sb-note">
          React · shadcn/ui · Tailwind CSS · AI Elements · AI SDK UI. Cloudflare is the planned AI
          backend. All responses here are local design fixtures; photos stay in the browser.
        </p>
      </article>
    );
  return (
    <article className="sb-doc">
      <span className="micro">FOUNDATIONS / SITE JOURNAL</span>
      <h1>
        {section === "palette"
          ? "A palette that fits the place."
          : section === "type"
            ? "Clear words. Quiet details."
            : "Give the useful parts room."}
      </h1>
      {section === "palette" ? (
        <>
          <p>
            Bridge blue stays consistent. The paper, ink and supporting surfaces adapt to the site.
          </p>
          <h2>Semantic colors</h2>
          <div className="sb-swatch-grid">
            {[
              ["Paper", "--journal-paper"],
              ["Ink", "--journal-ink"],
              ["Secondary text", "--journal-muted"],
              ["Dividers", "--journal-line"],
              ["Visual field", "--journal-field"],
              ["Origin89 blue", "--primary"],
            ].map(([label, token]) => (
              <div className="sb-swatch" key={token}>
                <i style={{ background: `var(${token})` }} />
                <strong>{label}</strong>
                <code>{token}</code>
              </div>
            ))}
          </div>
        </>
      ) : section === "type" ? (
        <>
          <div className="sb-type-row">
            <small>INTER TIGHT / TITLE</small>
            <h2 style={{ margin: 0, fontSize: 48 }}>A clearer picture of your site.</h2>
          </div>
          <div className="sb-type-row">
            <small>INTER TIGHT / CONVERSATION</small>
            <p style={{ fontSize: 20 }}>What batteries do you have?</p>
          </div>
          <div className="sb-type-row">
            <small>IBM PLEX MONO / LABELS & MEASUREMENTS</small>
            <p style={{ fontFamily: "Technical", fontSize: 12 }}>SOLAR IN · 2.10 kW · 8 SEC AGO</p>
          </div>
          <p className="sb-note">
            Headlines say one useful thing. Chat asks one question. Model numbers and timestamps
            stay precise.
          </p>
        </>
      ) : (
        <>
          <p>Use the same spacing scale in the website, app and conversations.</p>
          <h2>Spacing scale</h2>
          <div className="sb-spaces">
            {[4, 8, 12, 16, 24, 32, 48, 64].map((size) => (
              <span key={size}>
                <i style={{ height: size }} />
                {size}px
              </span>
            ))}
          </div>
          <h2>Responsive review</h2>
          <p>Phone: 390 × 844. Small phone: 320 × 740. Tablet: 768 × 1024. Desktop: 1440 × 1000.</p>
          <p className="sb-note">
            On touch screens, chat and the map get their own views. Essential actions stay
            reachable.
          </p>
        </>
      )}
    </article>
  );
}
