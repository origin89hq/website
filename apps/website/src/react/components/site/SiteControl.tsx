import { ArrowRight, ArrowUpRight, Lightbulb, Thermometer, Zap } from "lucide-react";
import { useState } from "react";
import type { JournalSite } from "../../lib/journal-sites";
import { SiteCamera } from "./SiteCamera";

export function SiteControl({
  site,
  notificationHost,
}: {
  site: JournalSite;
  notificationHost: HTMLDivElement | null;
}) {
  const [lights, setLights] = useState(false);
  const [sample, setSample] = useState<"normal" | "warm" | "missing">("normal");
  const stale = site === "telecom";
  const temperature = stale || sample === "missing" ? undefined : sample === "warm" ? 31 : 24;
  const lightName = {
    cottage: "Porch lights",
    mining: "Service bay lights",
    telecom: "Shelter lights",
  }[site];
  const ruleStatus =
    temperature === undefined
      ? "Needs a reading"
      : temperature >= 28
        ? "Would request ON"
        : "Waiting";
  return (
    <div className="site-control">
      <div className="control-intro">
        <h2>Control your site.</h2>
        <p>Connect cameras, switch circuits, and build rules around what happens at your site.</p>
        <small>Interactive concept · No equipment connected.</small>
      </div>
      <div className="control-switch-row">
        <Lightbulb size={22} strokeWidth={1.4} />
        <div>
          <strong>{lightName}</strong>
          <span>
            {stale
              ? "Current state unknown · Last heard 12 min ago"
              : "Example relay · Manual control"}
          </span>
        </div>
        {stale ? (
          <button
            className="square-switch"
            type="button"
            aria-label={`Example ${lightName.toLowerCase()}`}
            disabled
          >
            <span>Unknown</span>
            <i aria-hidden="true" />
          </button>
        ) : (
          <button
            className="square-switch"
            type="button"
            role="switch"
            aria-checked={lights}
            aria-label={`Example ${lightName.toLowerCase()}`}
            onClick={() => setLights(!lights)}
          >
            <span>{lights ? "On" : "Off"}</span>
            <i aria-hidden="true" />
          </button>
        )}
      </div>
      <SiteCamera site={site} notificationHost={notificationHost} />
      <section className="local-rules" aria-label="Local automation examples">
        <div className="control-section-heading">
          <h3>Local rules</h3>
          <span>On the site controller</span>
        </div>
        <article className="automation-rule">
          <div className="automation-rule-title">
            <Thermometer size={18} strokeWidth={1.5} />
            <h4>Ventilate the shelter</h4>
            <span data-needs-reading={temperature === undefined}>{ruleStatus}</span>
          </div>
          <div className="automation-rule-condition">
            <span>
              <small>WHEN</small>Temperature ≥ 28°C
            </span>
            <ArrowRight size={15} />
            <span>
              <small>THEN</small>Request ventilation
            </span>
          </div>
          <p className="rule-evidence" aria-live="polite">
            {temperature === undefined
              ? "Current temperature unknown. The rule needs a fresh reading."
              : `Sample temperature: ${temperature}°C. ${temperature >= 28 ? "The threshold is met. The controller would check its output limits before acting." : "The threshold has not been reached."}`}
          </p>
          {!stale && (
            <fieldset className="rule-scenarios" aria-label="Automation sample">
              <legend>Try the rule</legend>
              {(
                [
                  ["normal", "24°C"],
                  ["warm", "31°C"],
                  ["missing", "No reading"],
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={sample === value}
                  onClick={() => setSample(value)}
                >
                  {label}
                </button>
              ))}
            </fieldset>
          )}
        </article>
        <article className="automation-rule reserve-rule">
          <div className="automation-rule-title">
            <Zap size={18} strokeWidth={1.5} />
            <h4>Protect the reserve</h4>
            <span>{stale ? "Needs a reading" : "Example rule"}</span>
          </div>
          <div className="automation-rule-condition">
            <span>
              <small>WHEN</small>Battery &lt; 30%
            </span>
            <ArrowRight size={15} />
            <span>
              <small>THEN</small>Shed a non-essential load
            </span>
          </div>
          <p className="rule-evidence">
            Essential circuits stay outside this example. The local controller checks equipment
            limits and switching permissions.
          </p>
        </article>
      </section>
      <button type="button" className="control-buddy-help" data-answer="automation">
        <span>How could Buddy help with a rule?</span>
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}
