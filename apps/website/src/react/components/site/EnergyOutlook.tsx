import { ArrowUpRight, CloudSun, Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

// A transparent example of the evidence an assistant would need, not a live forecast.
const sample = {
  capacityKwh: 10,
  batteryPercent: 76,
  reservePercent: 20,
  loadKw: 0.85,
  efficiency: 0.92,
};
export function EnergyOutlook() {
  const [extraLoad, setExtraLoad] = useState(false);
  const loadKw = sample.loadKw + (extraLoad ? 0.5 : 0);
  const availableKwh = (sample.capacityKwh * (sample.batteryPercent - sample.reservePercent)) / 100;
  const minutes = Math.round(((availableKwh * sample.efficiency) / loadKw) * 60);
  const hours = Math.floor(minutes / 60);
  const remaining = String(minutes % 60).padStart(2, "0");
  return (
    <section className="energy-outlook" aria-label="Buddy energy forecast example">
      <div className="outlook-heading">
        <h3>On battery alone.</h3>
        <CloudSun size={19} strokeWidth={1.4} aria-hidden="true" />
      </div>
      <p className="outlook-intro">Buddy’s estimate: how long could your battery carry the load?</p>
      <div className="outlook-estimate" aria-live="polite" aria-atomic="true">
        <strong>
          ≈{hours}
          <small>h</small> {remaining}
          <small>m</small>
        </strong>
        <span>
          to your 20% reserve<small>At {loadKw.toFixed(2)} kW constant load</small>
        </span>
      </div>
      <div className="outlook-reserve" aria-hidden="true">
        <i className="outlook-reserve-floor" />
        <i className="outlook-available" />
        <span />
      </div>
      <div className="outlook-reserve-labels">
        <span>20% reserve</span>
        <span>76% now</span>
      </div>
      <fieldset className="outlook-scenarios" aria-label="Forecast load scenario">
        <button type="button" aria-pressed={!extraLoad} onClick={() => setExtraLoad(false)}>
          <SlidersHorizontal size={13} />
          Current load
        </button>
        <button type="button" aria-pressed={extraLoad} onClick={() => setExtraLoad(true)}>
          <Plus size={13} />
          500 W load
        </button>
      </fieldset>
      <details className="outlook-evidence">
        <summary>
          See the inputs & assumptions <Plus size={14} aria-hidden="true" />
        </summary>
        <dl>
          <div>
            <dt>Battery monitor · sample, 8 sec ago</dt>
            <dd>76%</dd>
          </div>
          <div>
            <dt>Usable capacity · sample configuration</dt>
            <dd>10.0 kWh</dd>
          </div>
          <div>
            <dt>Reserve · sample setting</dt>
            <dd>20%</dd>
          </div>
          <div>
            <dt>Consumption · {extraLoad ? "what-if scenario" : "sample, 8 sec ago"}</dt>
            <dd>{loadKw.toFixed(2)} kW</dd>
          </div>
          <div>
            <dt>Conversion efficiency · assumption</dt>
            <dd>92%</dd>
          </div>
        </dl>
        <p>
          5.6 kWh above reserve × 92% ÷ {loadKw.toFixed(2)} kW. Assumes no incoming generation and a
          constant load. Temperature, battery condition and changing demand can shorten the
          estimate.
        </p>
        <a href="https://data.origin89.com/">
          Find specifications for your equipment <ArrowUpRight size={13} />
        </a>
      </details>
      <p className="outlook-disclosure">
        Illustrative forecast · Sample inputs, not a live prediction.
      </p>
    </section>
  );
}
