import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import renderBottom from "../../../assets/home/connect-bottom.webp?url";
import renderCable from "../../../assets/home/connect-cable.webp?url";
import renderHarness from "../../../assets/home/connect-harness.webp?url";
import renderLeft from "../../../assets/home/connect-left.webp?url";
import renderRight from "../../../assets/home/connect-right.webp?url";
import { BENCH } from "./data";

const ago = (seconds: number) =>
  seconds < 60 ? `${Math.round(seconds)} s ago` : `${Math.floor(seconds / 60)} min ago`;
const celsius = (value: number) => `${value.toFixed(1).replace("-", "−")} °C`;

function PowerInstrument() {
  const [radio, setRadio] = useState<"on" | "off">("on");
  const reading = radio === "on" ? BENCH.idleRadioOn : BENCH.idleRadioOff;
  const perDay = (reading.mA / 1000) * 24;
  const cerboPerDay = (BENCH.cerboWatts / reading.volts) * 24;
  return (
    <div className="inst">
      <div className="big">
        {reading.mA}
        <small>mA</small>
      </div>
      <div className="inst-row">
        <fieldset className="seg" aria-label="Radio">
          {(["on", "off"] as const).map((state) => (
            <button
              key={state}
              type="button"
              aria-pressed={radio === state}
              onClick={() => setRadio(state)}
            >
              Radio {state}
            </button>
          ))}
        </fieldset>
        <span className="inst-watts">
          {((reading.volts * reading.mA) / 1000).toFixed(2)} W ·{" "}
          {radio === "on" ? "Wi-Fi and Bluetooth on" : "Radio rail off"}
        </span>
      </div>
      <div className="versus">
        <div>
          <span>Origin89, per day</span>
          <span className="mono">{perDay.toFixed(2)} Ah</span>
          <i style={{ ["--w" as string]: `${Math.max(2, (perDay / cerboPerDay) * 100)}%` }} />
        </div>
        <div>
          <span>Cerbo GX MK2, per day</span>
          <span className="mono">{cerboPerDay.toFixed(1)} Ah</span>
          <i style={{ ["--w" as string]: "100%", ["--c" as string]: "#3a4452" }} />
        </div>
      </div>
      <p className="inst-note">
        Both at {reading.volts} V. Origin89: first bench readings on board revision A. Cerbo GX MK2:{" "}
        {BENCH.cerboWatts} W from Victron’s datasheet.
      </p>
    </div>
  );
}

function WatchdogInstrument() {
  const WINDOW = 4.5;
  const [kicking, setKicking] = useState(true);
  const [remain, setRemain] = useState(WINDOW);
  const [kick, setKick] = useState(false);
  const last = useRef(0);
  const kickingRef = useRef(true);
  useEffect(() => {
    kickingRef.current = kicking;
    if (kicking) last.current = performance.now();
  }, [kicking]);
  useEffect(() => {
    last.current = performance.now();
    const beat = window.setInterval(() => {
      if (!kickingRef.current) return;
      last.current = performance.now();
      setKick(true);
      window.setTimeout(() => setKick(false), 160);
    }, 1000);
    const tick = window.setInterval(() => {
      setRemain(Math.max(0, WINDOW - (performance.now() - last.current) / 1000));
    }, 50);
    return () => {
      window.clearInterval(beat);
      window.clearInterval(tick);
    };
  }, []);
  const open = remain === 0;
  return (
    <div className="inst">
      <div className={`big state${open ? " open" : ""}`}>
        <i />
        <span>{open ? "Stopped" : "Running"}</span>
      </div>
      <div className="wd-meter">
        <div className="track">
          <i style={{ transform: `scaleX(${remain / WINDOW})` }} />
        </div>
        <div className="labels">
          <span className="sig">
            <i className="on" />
            RUN
          </span>
          <span className="sig">
            <i className={kick ? "on" : undefined} />
            KICK
          </span>
          <span>{remain.toFixed(1)} s left</span>
        </div>
      </div>
      <div className="inst-row">
        <button
          type="button"
          className="o89-plate o89-plate-ghost"
          onClick={() => setKicking((k) => !k)}
        >
          {kicking ? "Stop the kicks" : "Resume the kicks"}
        </button>
      </div>
      <p className="inst-note">
        RUN alone isn’t enough. If the kicks stop, the Controller resets or the cable is cut, board
        B opens the contact on its own. About 4.5 s by design; bench timing pending.
      </p>
    </div>
  );
}

const FRAMES = [
  ["→", "01 03 01 00 00 04 45 F5", "Ask the charge controller for 4 registers"],
  ["←", "01 03 08 04 F0 00 B8 …", "Battery 12.64 V, solar 18.4 A"],
  ["→", "02 03 02 1A 00 02 E5 BD", "Ask the inverter for its load"],
  ["←", "02 03 04 01 2C 00 00 …", "300 W out"],
] as const;

function ModbusInstrument() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const timer = window.setInterval(() => setCount((c) => c + 1), 2200);
    return () => window.clearInterval(timer);
  }, []);
  const rows = [0, 1, 2].map((back) => ({
    n: count - 1 - back,
    frame: FRAMES[(count - 1 - back) % FRAMES.length]!,
  }));
  return (
    <div className="inst">
      <div className="frames">
        {rows.map(({ n, frame: [dir, bytes, meaning] }) => (
          <div key={n}>
            <span className="dir">{dir}</span>
            <span>
              {bytes}
              <span className="meaning">{meaning}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="inst-note">
        Illustrative Modbus RTU frames. Register maps come from each model’s documentation and are
        verified per model.
      </p>
    </div>
  );
}

const PROBES = [
  { id: "28-3c01d607b91a", where: "Fridge, middle shelf", t: 3.8, age: 41 },
  { id: "28-3c01d607c24e", where: "Battery box", t: 6.1, age: 12 },
  { id: "28-3c01d6071f83", where: "Outdoor air", t: -4.2, age: 26 },
];

function ProbesInstrument() {
  const [probes, setProbes] = useState(PROBES);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setProbes((list) => list.map((p) => ({ ...p, age: p.age >= 60 ? 1 : p.age + 1 })));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="inst">
      <div className="temps">
        {probes.map((p) => (
          <div key={p.id}>
            <span>{p.where}</span>
            <b>{celsius(p.t)}</b>
            <span className="mono">
              {p.id} · {ago(p.age)}
            </span>
          </div>
        ))}
      </div>
      <p className="inst-note">
        Each probe answers to its own 64-bit address, so swapped cables can’t swap readings.
        Addresses are examples.
      </p>
    </div>
  );
}

function DecodeInstrument() {
  return (
    <div className="inst">
      <div className="decode">
        <div>
          <b>12.64 V</b>
          <span>V 12640</span>
        </div>
        <div>
          <b>−1.25 A</b>
          <span>I -1250</span>
        </div>
        <div>
          <b>87.6 %</b>
          <span>SOC 876</span>
        </div>
      </div>
      <p className="inst-note">
        Decoded from an example VE.Direct text frame, which a monitor sends about once a second. CAN
        battery packs are added per model after testing.
      </p>
    </div>
  );
}

const CONNECT = [
  {
    id: "power",
    tab: "12 V in",
    title: "Runs on almost nothing.",
    text: "One fused circuit on the battery bank. No inverter has to stay on to keep it awake.",
    img: renderCable,
    alt: "The Controller's DC IN terminal with its red and black power conductors landed, beside the RS-485 terminals",
    cap: "CN1 · DC IN",
    Instrument: PowerInstrument,
  },
  {
    id: "generator",
    tab: "Generator",
    title: "Starts the generator. Stops it if anything fails.",
    text: "The start contact lives on its own board, behind two relays in series and a hardware watchdog. Try it.",
    img: renderLeft,
    alt: "The left side of the Controller with the selector, start-battery and tank-level terminals wired",
    cap: "LNK · SNS · TNK",
    Instrument: WatchdogInstrument,
  },
  {
    id: "rs485",
    tab: "RS-485 × 3",
    title: "The charge controller and the inverter.",
    text: "Three separate RS-485 ports read Modbus gear from different makers, each on its own short bus.",
    img: renderBottom,
    alt: "The Controller's bottom terminal row with twisted pairs landed in DC IN, the three RS-485 ports, CAN and 1-Wire",
    cap: "CN2 · CN3 · CN4",
    Instrument: ModbusInstrument,
  },
  {
    id: "one-wire",
    tab: "1-Wire",
    title: "Is the fridge still cold?",
    text: "Temperature probes share one thin cable: the fridge shelf, the battery box and the outdoor air.",
    img: renderHarness,
    alt: "The Controller's wired terminal row from below, cables gathered into one sleeve",
    cap: "CN8 · 1-WIRE",
    Instrument: ProbesInstrument,
  },
  {
    id: "battery",
    tab: "CAN + VE.Direct",
    title: "Battery systems that report.",
    text: "Lithium packs whose BMS talks CAN, and monitors or chargers that speak VE.Direct.",
    img: renderRight,
    alt: "The right side of the Controller with the VE.Direct and generator link connectors",
    cap: "CN6 · CN7 · VE.DIRECT",
    Instrument: DecodeInstrument,
  },
];

export function Connections() {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = CONNECT[index]!;
  const { Instrument } = current;
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = (i + (event.key === "ArrowRight" ? 1 : -1) + CONNECT.length) % CONNECT.length;
    setIndex(next);
    tabs.current[next]?.focus();
  };
  return (
    <section className="section connect" id="connections" aria-labelledby="connect-title">
      <div className="o89-wrap">
        <h2 id="connect-title" className="h-l reveal">
          Wires into what’s already on the wall.
        </h2>
        <div className="connect-tabs" role="tablist" aria-label="Connection">
          {CONNECT.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`ctab-${c.id}`}
              aria-controls="connectView"
              aria-selected={i === index}
              tabIndex={i === index ? 0 : -1}
              className="o89-plate o89-plate-ghost o89-plate-sm"
              onClick={() => setIndex(i)}
              onKeyDown={(event) => onKey(event, i)}
            >
              {c.tab}
            </button>
          ))}
        </div>
      </div>
      <div
        className="connect-stage"
        id="connectView"
        role="tabpanel"
        aria-labelledby={`ctab-${current.id}`}
      >
        <div className="connect-grid">
          <div className="connect-copy">
            <h3>{current.title}</h3>
            <p>{current.text}</p>
            <Instrument key={current.id} />
          </div>
        </div>
        <figure className="connect-render">
          <img key={current.img} src={current.img} alt={current.alt} loading="lazy" />
          <figcaption>{current.cap}</figcaption>
        </figure>
      </div>
    </section>
  );
}
