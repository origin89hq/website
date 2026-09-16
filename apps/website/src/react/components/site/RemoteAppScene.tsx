import { ArrowRight, ArrowUpRight, Clock, TriangleAlert } from "lucide-react";
import { useRef } from "react";
import { EnergyHistory } from "./EnergyHistory";
import { EquipmentIllustration } from "./EquipmentIllustration";
import { EquipmentInspector } from "./EquipmentInspector";
export function RemoteAppScene({
  site,
  panel,
}: {
  site: "mining" | "telecom";
  panel: "overview" | "energy";
}) {
  const details = useRef<HTMLDialogElement>(null);
  return (
    <>
      {panel === "overview" && (
        <>
          <button
            type="button"
            className="remote-site-model"
            aria-label={`Inspect ${site === "mining" ? "mining site" : "telecom shelter"} equipment`}
            onClick={() => details.current?.showModal()}
          >
            <EquipmentIllustration kind={site} />
            <span>
              <small>Site equipment</small>
              {site === "mining" ? "Power, pumps & fuel" : "Shelter & backup power"}
            </span>
            <ArrowUpRight size={16} />
          </button>
          <EquipmentInspector kind={site} dialogRef={details} />
        </>
      )}
      {site === "mining" && panel === "overview" && (
        <>
          <h2>
            One alarm
            <br />
            to check.
          </h2>
          <p className="buddy-explanation">
            Site power is available. The sump monitor reports a high level at the pump station.
          </p>
          <div className="remote-alert">
            <span aria-hidden="true">
              <TriangleAlert size={18} strokeWidth={1.6} />
            </span>
            <p>
              <strong>Sump level: high</strong>
              <br />
              Reported 30 sec ago · Sample alarm
            </p>
          </div>
          <div className="battery-summary">
            <div className="metric-heading">
              <span>Site draw</span>
              <span>Generator running</span>
            </div>
            <div className="battery-number">
              43<span>kW</span>
            </div>
            <div className="energy-pair">
              <div>
                <span>Fuel tank</span>
                <strong>
                  62 <small>%</small>
                </strong>
              </div>
              <div>
                <span>Pump station</span>
                <strong className="metric-alarm">Check alarm</strong>
              </div>
            </div>
          </div>
          <EnergyHistory site={site} />
          <button className="buddy-tip" type="button" data-answer="alarm">
            <span className="tip-symbol" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
            <span>
              <small>Buddy’s next check</small>
              <strong>Start with the sump reading.</strong>
              <span>See the evidence behind the alarm.</span>
            </span>
            <b aria-hidden="true">
              <ArrowRight size={16} />
            </b>
          </button>
        </>
      )}
      {site === "mining" && panel === "energy" && (
        <>
          <h2>
            Keep the utilities
            <br />
            in view.
          </h2>
          <p className="buddy-explanation">
            Compare power, fuel and pump readings before arranging the next service visit.
          </p>
          <dl className="remote-readings">
            <div>
              <dt>
                Site draw<small>Power meter · 30 sec ago</small>
              </dt>
              <dd>
                43 <small>kW</small>
              </dd>
            </div>
            <div>
              <dt>
                Fuel tank<small>Level sensor · 30 sec ago</small>
              </dt>
              <dd>
                62 <small>%</small>
              </dd>
            </div>
            <div>
              <dt>
                Generator<small>Status input · 30 sec ago</small>
              </dt>
              <dd>Running</dd>
            </div>
            <div>
              <dt>
                Sump level<small>Level alarm · 30 sec ago</small>
              </dt>
              <dd className="metric-alarm">High</dd>
            </div>
          </dl>
          <p className="app-insight">
            A fuel percentage alone doesn’t tell us how long the generator can run. Tank capacity,
            usable reserve and fuel consumption matter too.
          </p>
          <button className="inline-question" data-answer="fuel" type="button">
            What should the crew check? <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </>
      )}
      {site === "telecom" && panel === "overview" && (
        <>
          <h2>
            What we last heard
            <br />
            from the site.
          </h2>
          <p className="buddy-explanation">
            The last update was 12 minutes ago. These readings describe that moment; the current
            condition is unknown.
          </p>
          <div className="remote-alert remote-stale">
            <span aria-hidden="true">
              <Clock size={18} strokeWidth={1.6} />
            </span>
            <p>
              <strong>Waiting for a fresh update</strong>
              <br />
              Tundra relay · Sample connection loss
            </p>
          </div>
          <div className="battery-summary last-known">
            <div className="metric-heading">
              <span>Battery</span>
              <span>Last known · 12 min ago</span>
            </div>
            <div className="battery-number">
              78<span>%</span>
            </div>
            <div className="battery-track">
              <i style={{ width: "78%" }}></i>
            </div>
            <div className="energy-pair">
              <div>
                <span>Shelter / last known</span>
                <strong>
                  +14 <small>°C</small>
                </strong>
              </div>
              <div>
                <span>Backup / last known</span>
                <strong className="metric-state">Standby</strong>
              </div>
            </div>
          </div>
          <EnergyHistory site={site} />
          <button className="buddy-tip" type="button" data-answer="link">
            <span className="tip-symbol" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
            <span>
              <small>Buddy’s next check</small>
              <strong>Check the update path.</strong>
              <span>See what we know—and what we don’t.</span>
            </span>
            <b aria-hidden="true">
              <ArrowRight size={16} />
            </b>
          </button>
        </>
      )}
      {site === "telecom" && panel === "energy" && (
        <>
          <h2>
            Check the link.
            <br />
            Then the numbers.
          </h2>
          <p className="buddy-explanation">
            A missing update alone doesn’t tell us whether the issue is at the gateway, backhaul or
            power supply.
          </p>
          <dl className="remote-readings">
            <div>
              <dt>
                Latest site update<small>Data age</small>
              </dt>
              <dd>
                12 <small>min ago</small>
              </dd>
            </div>
            <div>
              <dt>
                Battery<small>Last known · 12 min ago</small>
              </dt>
              <dd>
                78 <small>%</small>
              </dd>
            </div>
            <div>
              <dt>
                Shelter temperature<small>Last known · 12 min ago</small>
              </dt>
              <dd>
                +14 <small>°C</small>
              </dd>
            </div>
            <div>
              <dt>
                Generator<small>Last known · 12 min ago</small>
              </dt>
              <dd>Standby</dd>
            </div>
          </dl>
          <p className="app-insight">
            Current site condition: <strong>unknown.</strong> Follow the site’s communications and
            power checks before treating these readings as current.
          </p>
          <button className="inline-question" data-answer="link" type="button">
            Help me interpret this <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </>
      )}
    </>
  );
}
