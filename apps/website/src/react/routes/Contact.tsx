import { useState } from "react";
import { PageIntro, SiteShell } from "../components/site/SiteChrome";
import { siteConfig } from "../lib/site-config";
export function ContactPage({
  equipment = "",
  profile = "",
  site = "cottage",
}: {
  equipment?: string;
  profile?: string;
  site?: string;
}) {
  const [feedback, setFeedback] = useState("");
  return (
    <SiteShell>
      <PageIntro
        eyebrow="LET’S START WITH YOUR SETUP"
        title="What would make your site easier to manage?"
      >
        <p>
          A clearer battery reading. A pump status before a trip. Equipment from different makers in
          one useful view. Start with one job that matters.
        </p>
      </PageIntro>
      <section className="content-section contact-layout">
        <form
          className="contact-form"
          onSubmit={(event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            const body = `Hello Origin89,\n\nI'd like to discuss my setup.\n\nSite: ${values.get("site")}\n\nEquipment:\n${values.get("equipment")}\n\nWhat I would like to monitor or manage:\n${values.get("job")}\n\nConnection: ${values.get("connection")}\n`;
            window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent("My Origin89 site setup")}&body=${encodeURIComponent(body)}`;
            setFeedback(
              "Your email draft is ready to review and send. If your email app did not open, use hello@origin89.com.",
            );
          }}
        >
          <div>
            <label htmlFor="contact-site">What kind of site?</label>
            <select id="contact-site" name="site" defaultValue={site}>
              <option value="cottage">Cottage or remote home</option>
              <option value="mining">Mining utilities</option>
              <option value="telecom">Remote telecom</option>
              <option value="maple">Maple operation</option>
              <option value="other">Another type of site</option>
            </select>
          </div>
          <div>
            <label htmlFor="contact-equipment">Equipment makes and exact models</label>
            <textarea
              id="contact-equipment"
              name="equipment"
              key={`${equipment}-${profile}`}
              defaultValue={(equipment + (profile ? `\nCatalogue profile: ${profile}` : "")).slice(
                0,
                1800,
              )}
              placeholder="Controller, inverter, batteries, generator, pumps…"
              required
              maxLength={1800}
            />
          </div>
          <div>
            <label htmlFor="contact-job">What would you like to monitor or manage?</label>
            <textarea
              id="contact-job"
              name="job"
              required
              maxLength={1800}
              placeholder="For example: check battery reserve and inside temperature before the weekend."
            />
          </div>
          <div>
            <label htmlFor="contact-connection">Internet at the site</label>
            <select id="contact-connection" name="connection">
              <option>Available most of the time</option>
              <option>Intermittent or unreliable</option>
              <option>No internet connection</option>
              <option>Still deciding</option>
            </select>
          </div>
          <button className="concept-action" type="submit">
            Prepare my email draft <span>↗</span>
          </button>
          <p className="form-disclosure">
            Opens an email draft for you to review and send. This form does not submit or store your
            details.
          </p>
          <p className="form-feedback" role="status">
            {feedback}
          </p>
        </form>
        <aside>
          <span className="micro">NOT SURE WHAT YOU HAVE?</span>
          <h2>A label is a good place to start.</h2>
          <p>
            Buddy’s interactive setup demo shows how a few photos and questions can build an
            equipment map.
          </p>
          <a className="underlined-action" href="/buddy/">
            Try the setup conversation <span>↗</span>
          </a>
          <div className="contact-direct">
            <span className="micro">PREFER EMAIL?</span>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </div>
          <p className="form-disclosure">
            Origin89 is in development. A conversation helps us scope the installation; it does not
            confirm support or product availability.
          </p>
        </aside>
      </section>
    </SiteShell>
  );
}
