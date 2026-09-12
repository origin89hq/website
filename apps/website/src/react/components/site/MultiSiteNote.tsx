import { ArrowUpRight } from "lucide-react";
export function MultiSiteNote() {
  return (
    <section
      className="content-section other-site multi-site-note"
      id="multiple-sites"
      aria-labelledby="multiple-sites-title"
    >
      <div>
        <span className="micro">PLANNED / MULTI-SITE MANAGEMENT</span>
        <h2 id="multiple-sites-title">
          One account.
          <br />
          Multiple locations.
        </h2>
      </div>
      <div>
        <p>
          We’re building Offgrid so you can manage multiple Origin89 Controllers from one account,
          grouped by location. For mining operations, telecom networks and teams looking after
          remote sites.
        </p>
        <p className="multi-site-local">Local control stays at each site.</p>
        <a className="underlined-action" href="/contact/">
          Tell us about your locations <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
