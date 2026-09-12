import { ArrowDown, ArrowUp, MoveHorizontal } from "lucide-react";
import { useId, useState } from "react";
import type { JournalSite } from "../../lib/journal-sites";

// Illustrative readings only. Hourly samples stop at the example's last update.
const profiles = {
  cottage: {
    title: "Energy today",
    first: "Solar",
    second: "Consumption",
    unit: "kW",
    max: 3,
    firstValues: [0, 0, 0, 0, 0, 0, 0.12, 0.44, 0.91, 1.62, 2.24, 2.58, 2.31, 1.84, 2.1],
    secondValues: [
      0.25, 0.24, 0.23, 0.26, 0.24, 0.3, 0.48, 0.91, 0.63, 0.52, 0.61, 0.89, 1.24, 0.76, 0.85,
    ],
    weekFirst: [16.2, 19.4, 12.6, 21.8, 18.5, 14.3, 20.1],
    weekSecond: [8.8, 9.2, 10.1, 8.4, 9.6, 11.2, 9.1],
  },
  mining: {
    title: "Site demand",
    first: "Site draw",
    second: "Pump station",
    unit: "kW",
    max: 60,
    firstValues: [28, 27, 29, 28, 30, 34, 38, 48, 45, 42, 49, 51, 47, 44, 43],
    secondValues: [4, 4, 4, 5, 4, 6, 8, 12, 9, 8, 14, 12, 10, 9, 8],
    weekFirst: [850, 912, 824, 968, 894, 736, 810],
    weekSecond: [164, 186, 142, 206, 176, 130, 152],
  },
  telecom: {
    title: "Battery history",
    first: "State of charge",
    second: null,
    unit: "%",
    max: 100,
    firstValues: [95, 95, 94, 93, 92, 92, 91, 89, 87, 86, 84, 82, 81, 80, 78],
    secondValues: [],
    weekFirst: [],
    weekSecond: [],
  },
};

export function EnergyHistory({ site = "cottage" }: { site?: JournalSite }) {
  const id = useId();
  const profile = profiles[site];
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [cursor, setCursor] = useState<number | null>(null);
  const weekly = site !== "telecom" && period === "week";
  const first = weekly ? profile.weekFirst : profile.firstValues;
  const second = weekly ? profile.weekSecond : profile.secondValues;
  const selected = Math.min(cursor ?? first.length - 1, first.length - 1);
  const unit = weekly ? "kWh" : profile.unit;
  const maximum = weekly ? Math.ceil(Math.max(...first) / 10) * 10 : profile.max;
  const labels = weekly
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : first.map((_, index) =>
        index === 14
          ? site === "telecom"
            ? "13:28"
            : "13:40"
          : `${String(index).padStart(2, "0")}:00`,
      );
  const endHour = site === "telecom" ? 13 + 28 / 60 : 13 + 40 / 60;
  const x = (index: number) =>
    4 + (weekly ? index / 6 : (index === 14 ? endHour : index) / endHour) * 352;
  const y = (value: number) => 120 - (value / maximum) * 108;
  const points = (values: number[]) =>
    values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const peakIndex = first.indexOf(Math.max(...first));
  const peakX = 4 + ((peakIndex + 0.5) * 352) / first.length - (weekly ? 4.5 : 3);
  const peakY = 114 - (first[peakIndex] / maximum) * 90;
  const valueText = `${labels[selected]} · ${profile.first} ${first[selected].toFixed(2)} ${unit}${profile.second ? ` · ${profile.second} ${second[selected].toFixed(2)} ${unit}` : " · Last-known sample"}`;
  return (
    <section
      className={`power-history ${site === "cottage" ? "solar-history" : ""}`}
      aria-label={`${weekly ? "Last week" : profile.title} chart`}
    >
      <div className="power-history-heading">
        <h3>{weekly ? "Last week" : site === "cottage" ? "Your day in energy" : profile.title}</h3>
        {site !== "telecom" ? (
          <fieldset className="history-period" aria-label="Chart period">
            {(["day", "week"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={period === value}
                onClick={() => {
                  setPeriod(value);
                  setCursor(null);
                }}
              >
                {value === "day" ? "Day" : "Week"}
              </button>
            ))}
          </fieldset>
        ) : (
          <span className="history-stale">Ends 12 min ago</span>
        )}
      </div>
      <div className="history-readout" aria-live="polite" aria-atomic="true">
        {site === "cottage" ? (
          <>
            <div className="solar-history-metric">
              <span>
                <ArrowUp size={10} aria-hidden="true" /> SOLAR GENERATED
              </span>
              <strong>
                {first[selected].toFixed(2)}
                <small>{unit}</small>
              </strong>
            </div>
            <div className="solar-history-metric solar-history-load">
              <span>
                <ArrowDown size={10} aria-hidden="true" /> CONSUMPTION
              </span>
              <strong>
                {second[selected].toFixed(2)}
                <small>{unit}</small>
              </strong>
            </div>
          </>
        ) : (
          <>
            <span className="history-time">
              {labels[selected]} <small>{weekly ? "daily total" : "sample"}</small>
            </span>
            <span className="history-value">
              <i />
              {first[selected].toFixed(2)} <small>{unit}</small>
            </span>
            {profile.second && (
              <span className="history-value history-use">
                <i />
                {second[selected].toFixed(2)} <small>{unit}</small>
              </span>
            )}
          </>
        )}
      </div>
      <div className="history-plot">
        {site === "cottage" ? (
          <>
            <div className="solar-chart-caption">
              <span>{weekly ? "DAILY ENERGY" : "POWER THROUGH THE DAY"}</span>
              <span>
                {labels[selected]} · {weekly ? "daily total" : "sample"}
              </span>
            </div>
            <svg
              className="solar-balance-chart"
              viewBox="0 0 360 190"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id={`${id}-hatch`} width="4" height="4" patternUnits="userSpaceOnUse">
                  <path d="M0 4L4 0" stroke="currentColor" strokeWidth=".7" />
                </pattern>
              </defs>
              {!weekly && <rect className="solar-night" x="0" y="8" width="136" height="172" />}
              {[24, 69, 114, 159].map((height) => (
                <path key={height} className="solar-grid" d={`M0 ${height}H360`} />
              ))}
              <text className="solar-scale-label" x="0" y="12">
                {maximum} {unit}
              </text>
              {first.map((value, index) => {
                const barX = 4 + (index * 352) / first.length;
                const barWidth = 352 / first.length - (weekly ? 9 : 6);
                return (
                  <g
                    key={labels[index]}
                    className="solar-bar-pair"
                    data-selected={index === selected}
                  >
                    <rect
                      className="solar-bar"
                      x={barX}
                      y={114 - (value / maximum) * 90}
                      width={barWidth}
                      height={Math.max((value / maximum) * 90, 1)}
                    />
                    <rect
                      className="solar-load-bar"
                      x={barX}
                      y="119"
                      width={barWidth}
                      height={(second[index] / maximum) * 90}
                    />
                    <rect
                      className="solar-load-texture"
                      x={barX}
                      y="119"
                      width={barWidth}
                      height={(second[index] / maximum) * 90}
                      fill={`url(#${id}-hatch)`}
                    />
                  </g>
                );
              })}
              <path className="solar-peak-tick" d={`M${peakX} ${peakY - 4}V${peakY - 14}h-22`} />
              <text className="solar-peak-label" x={peakX - 25} y={peakY - 12} textAnchor="end">
                PEAK {first[peakIndex].toFixed(2)}
              </text>
              <path className="solar-zero" d="M0 116.5H360" />
              <path
                className="solar-reading-line"
                d={`M${4 + ((selected + 0.5) * 352) / first.length - (weekly ? 4.5 : 3)} 16V182`}
              />
              <text className="solar-zero-label" x="356" y="111" textAnchor="end">
                0
              </text>
              {!weekly && (
                <text className="solar-night-label" x="10" y="84">
                  NO SOLAR
                </text>
              )}
            </svg>
          </>
        ) : (
          <>
            <span className="history-scale">
              {maximum} {unit}
            </span>
            <svg viewBox="0 0 360 128" aria-hidden="true" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="currentColor" stopOpacity=".2" />
                  <stop offset="1" stopColor="currentColor" stopOpacity=".015" />
                </linearGradient>
              </defs>
              {[12, 48, 84, 120].map((height) => (
                <path key={height} className="history-grid" d={`M4 ${height}H356`} />
              ))}
              <polygon points={`4,120 ${points(first)} 356,120`} fill={`url(#${id}-fill)`} />
              <polyline className="history-production" points={points(first)} />
              {second.length > 0 && (
                <polyline className="history-consumption" points={points(second)} />
              )}
              <path className="history-cursor" d={`M${x(selected)} 8V120`} />
              <circle className="history-dot" cx={x(selected)} cy={y(first[selected])} r="3.5" />
              {second.length > 0 && (
                <circle
                  className="history-dot history-use-dot"
                  cx={x(selected)}
                  cy={y(second[selected])}
                  r="3.5"
                />
              )}
            </svg>
          </>
        )}
        <input
          type="range"
          min="0"
          max={first.length - 1}
          step="1"
          value={selected}
          onChange={(event) => setCursor(Number(event.target.value))}
          aria-label="Inspect chart readings"
          aria-valuetext={valueText}
        />
      </div>
      <div className="history-axis">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels.at(-1)}</span>
      </div>
      {site === "cottage" ? (
        <div className="solar-chart-footer">
          <span>{weekly ? "Daily totals · Last week" : "Hourly samples · Today"}</span>
          <span>
            Slide to inspect <MoveHorizontal size={12} aria-hidden="true" />
          </span>
        </div>
      ) : (
        <div className="history-legend">
          <span>
            <i />
            {profile.first}
          </span>
          {profile.second && (
            <span>
              <i className="legend-use" />
              {profile.second}
            </span>
          )}
          <small>Drag to explore</small>
        </div>
      )}
      {site === "telecom" && (
        <p className="history-gap">No readings after 13:28. Current condition unknown.</p>
      )}
    </section>
  );
}
