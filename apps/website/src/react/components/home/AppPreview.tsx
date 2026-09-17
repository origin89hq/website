import { useEffect, useRef, useState } from "react";

const ago = (seconds: number) =>
  seconds < 60 ? `${Math.round(seconds)} s ago` : `${Math.floor(seconds / 60)} min ago`;

type Row = { what: string; value: string; via: string; age: number; limit?: number };
const ROWS: Row[] = [
  { what: "Battery bank", value: "12.62 V", via: "RS-485 1", age: 8 },
  { what: "Solar charging", value: "18.4 A", via: "RS-485 1", age: 8 },
  { what: "Fridge, middle shelf", value: "3.8 °C", via: "1-Wire", age: 41 },
  { what: "Outdoor air", value: "−4.2 °C", via: "1-Wire", age: 890, limit: 900 },
];

// Sample readings age in place; one probe goes stale while the visitor watches.
export function AppPreview() {
  const phone = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(ROWS);
  useEffect(() => {
    const element = phone.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !timer)
        timer = window.setInterval(() => {
          setRows((list) =>
            list.map((row) => ({
              ...row,
              age: row.limit ? row.age + 1 : row.age >= 30 ? 2 : row.age + 1,
            })),
          );
        }, 1000);
      if (!visible && timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      className="phone reveal"
      ref={phone}
      role="img"
      aria-label="Offgrid app screen with sample readings"
    >
      <div className="screen">
        <div className="notch" />
        <div className="app-top">
          <div>
            <small>Sample site</small>
            <b>Cottage</b>
          </div>
          <span className="sync">Controller online</span>
        </div>
        <div className="readings">
          {rows.map((row) => {
            const stale = row.limit !== undefined && row.age >= row.limit;
            return (
              <div className={`reading${stale ? " stale" : ""}`} key={row.what}>
                <span className="what">{row.what}</span>
                <span className="value">{row.value}</span>
                <span className="age">
                  {ago(row.age)}
                  <br />
                  {stale ? "stale" : row.via}
                </span>
              </div>
            );
          })}
          <div className="reading missing">
            <span className="what">Propane tank</span>
            <span className="value">No reading since 06:10</span>
            <span className="age">TNK</span>
          </div>
        </div>
        <div className="rule">
          <b>Generator rule</b> Starts below 11.9 V, runs at least 45 min, never between 22:00 and
          07:00.
        </div>
        <div className="app-tabbar">
          <span className="on">Site</span>
          <span>History</span>
          <span>Buddy</span>
          <span>Settings</span>
        </div>
      </div>
      <span className="sample-tag">Sample data · app in development</span>
    </div>
  );
}
