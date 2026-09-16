import { useEffect, useRef, useState } from "react";
import controllerImage from "../../../assets/home/integrate-controller.webp?url";

type Status = "planned" | "specified" | "published";
const STATUS_LABEL: Record<Status, string> = {
  planned: "Planned",
  specified: "Specified in KM43",
  published: "Published",
};
type Node = { name: string; detail: string; mono?: boolean; status: Status };
const LEFT: Node[] = [
  {
    name: "Home Assistant",
    detail: "Readings as sensors, generator requests as actions.",
    status: "planned",
  },
  { name: "SmartThings", detail: "Site state inside your routines.", status: "planned" },
  { name: "MQTT", detail: "km43/<device_id>/tx", mono: true, status: "specified" },
];
const RIGHT: Node[] = [
  { name: "Local WebSocket", detail: "The app’s own API, on your network.", status: "specified" },
  { name: "Rust", detail: "km43 0.1.0 · crates.io", mono: true, status: "published" },
  { name: "TypeScript", detail: "@origin89/km43 0.1.1 · npm", mono: true, status: "published" },
];

const WHAT = {
  fridge: { label: "the fridge shelf", cond: "rises above 7 °C", via: "1-Wire probe on CN8" },
  battery: {
    label: "the battery bank",
    cond: "falls below 11.9 V",
    via: "Charge controller on RS-485 1",
  },
  propane: { label: "the propane tank", cond: "falls below 20 %", via: "4–20 mA sender on TNK" },
  outdoor: { label: "the outdoor air", cond: "drops below −25 °C", via: "1-Wire probe on CN8" },
};
const DO = {
  notify: {
    label: "notify my phone",
    where: "Controller",
    offline: "Decides offline",
    yes: true,
    planned: false,
    note: "The Controller decides at the site and sends the notification when it has a connection.",
  },
  generator: {
    label: "ask the generator to run",
    where: "Controller",
    offline: "Yes",
    yes: true,
    planned: false,
    note: "Runs on the Controller. Board B’s watchdog and the generator rule’s limits still apply.",
  },
  ha: {
    label: "run a Home Assistant automation",
    where: "Home Assistant",
    offline: "Needs your network",
    yes: false,
    planned: true,
    note: "Planned integration. Home Assistant reads the value and runs your automation; requests to equipment still pass the Controller’s rules.",
  },
  mqtt: {
    label: "publish it over MQTT",
    where: "Your broker",
    offline: "Needs your network",
    yes: false,
    planned: true,
    note: "MQTT topics are specified in KM43 and not yet implemented. Anything subscribed to the topic can act on it.",
  },
};

// A sketch of a client, split into highlighted tokens: [class, text].
const SKETCH: [string, string][][] = [
  [
    ["k", "import"],
    ["", " { MessageType, Quality } "],
    ["k", "from"],
    ["", " "],
    ["str", '"@origin89/km43"'],
    ["", ";"],
  ],
  [],
  [["c", "// Follow the Controller’s event stream,"]],
  [["c", "// and never act on an old or missing value."]],
  [["", "send({ type: MessageType.Subscribe });"]],
  [["", "onReading((r) => {"]],
  [
    ["", "  "],
    ["k", "if"],
    ["", " (r.quality === Quality.Stale) "],
    ["k", "return"],
    ["", ";"],
  ],
  [
    ["", "  "],
    ["k", "if"],
    ["", " (r.quality === Quality.Absent) "],
    ["k", "return"],
    ["", ";"],
  ],
  [
    ["", "  publish("],
    ["str", '"site/fridge_shelf"'],
    ["", ", r.value);"],
  ],
  [["", "});"]],
];

function HubNode({ node }: { node: Node }) {
  return (
    <li className="node" data-status={node.status}>
      <b>{node.name}</b>
      <span className={node.mono ? "mono" : undefined}>{node.detail}</span>
      <em>{STATUS_LABEL[node.status]}</em>
    </li>
  );
}

export function Integrations() {
  const hub = useRef<HTMLDivElement>(null);
  const redraw = useRef(() => {});
  const [paths, setPaths] = useState<{ d: string; status: Status }[]>([]);
  const [what, setWhat] = useState<keyof typeof WHAT>("fridge");
  const [duration, setDuration] = useState("10 min");
  const [action, setAction] = useState<keyof typeof DO>("notify");

  useEffect(() => {
    const element = hub.current;
    if (!element) return;
    const draw = () => {
      const core = element.querySelector(".hub-core img")?.getBoundingClientRect();
      if (!core || getComputedStyle(element.querySelector(".hub-lines")!).display === "none")
        return;
      const box = element.getBoundingClientRect();
      const cx = core.left - box.left + core.width / 2;
      const cy = core.top - box.top + core.height / 2;
      const next = [...element.querySelectorAll<HTMLElement>(".node")].map((node) => {
        const r = node.getBoundingClientRect();
        const left = r.left + r.width / 2 < core.left + core.width / 2;
        const x = (left ? r.right : r.left) - box.left;
        const y = r.top - box.top + r.height / 2;
        const tx = cx + (left ? -core.width * 0.28 : core.width * 0.28);
        const ty = cy + (y - cy) * 0.25;
        return {
          d: `M${x},${y} C${(x + tx) / 2},${y} ${(x + tx) / 2},${ty} ${tx},${ty}`,
          status: node.dataset.status as Status,
        };
      });
      setPaths(next);
    };
    redraw.current = draw;
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const w = WHAT[what];
  const act = DO[action];
  return (
    <section className="section integrate" id="integrations" aria-labelledby="integrate-title">
      <div className="o89-wrap">
        <div className="integrate-head reveal">
          <h2 id="integrate-title" className="h-l">
            Not locked in.
          </h2>
          <p className="lede">
            Your site’s data is yours. The Controller speaks KM43, an open protocol with a public
            specification and published libraries. Keep the safety rules on the Controller and
            automate everything else wherever you already do.
          </p>
        </div>
        <div className="hub" ref={hub}>
          <svg className="hub-lines" aria-hidden="true">
            {paths.map((p, i) => (
              <g key={p.d}>
                <path d={p.d} />
                <path
                  className={`pulse${p.status === "planned" ? " planned" : ""}`}
                  d={p.d}
                  style={{ animationDelay: `${-i * 0.7}s` }}
                />
              </g>
            ))}
          </svg>
          <ul className="hub-side">
            {LEFT.map((node) => (
              <HubNode key={node.name} node={node} />
            ))}
          </ul>
          <figure className="hub-core">
            <img
              src={controllerImage}
              alt="The closed Origin89 Controller"
              loading="lazy"
              onLoad={() => redraw.current()}
            />
            <figcaption>
              <span className="mono">KM43</span> requests, responses and an event stream
            </figcaption>
          </figure>
          <ul className="hub-side">
            {RIGHT.map((node) => (
              <HubNode key={node.name} node={node} />
            ))}
          </ul>
        </div>

        <div className="automate">
          <div className="composer reveal">
            <p className="sentence">
              When{" "}
              <label className="pick">
                <span className="o89-sr">Reading</span>
                <select
                  id="ruleWhat"
                  value={what}
                  onChange={(e) => setWhat(e.target.value as keyof typeof WHAT)}
                >
                  {Object.entries(WHAT).map(([id, item]) => (
                    <option key={id} value={id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>{" "}
              <span className="rule-cond">{w.cond}</span> for{" "}
              <label className="pick">
                <span className="o89-sr">Duration</span>
                <select id="ruleFor" value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option>10 min</option>
                  <option>2 min</option>
                  <option>30 min</option>
                </select>
              </label>
              ,{" "}
              <label className="pick">
                <span className="o89-sr">Action</span>
                <select
                  id="ruleDo"
                  value={action}
                  onChange={(e) => setAction(e.target.value as keyof typeof DO)}
                >
                  {Object.entries(DO).map(([id, item]) => (
                    <option key={id} value={id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              .
            </p>
            <dl className="rule-facts" aria-live="polite">
              <div>
                <dt>Runs on</dt>
                <dd>{act.where}</dd>
              </div>
              <div>
                <dt>Without internet</dt>
                <dd className={act.yes ? "yes" : undefined}>{act.offline}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className={act.planned ? "planned" : undefined}>
                  {act.planned ? "Planned" : "Core design"}
                </dd>
              </div>
              <div className="wide">
                <dt>Reads from</dt>
                <dd>
                  {w.via}. {act.note}
                </dd>
              </div>
            </dl>
          </div>
          <figure className="sketch reveal">
            <pre>
              <code>
                {SKETCH.map((line, n) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: the code lines are static and never reorder.
                  <span key={n} className="line">
                    {line.map(([kind, text], m) =>
                      kind ? (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static token list.
                        <span key={m} className={kind}>
                          {text}
                        </span>
                      ) : (
                        text
                      ),
                    )}
                    {"\n"}
                  </span>
                ))}
              </code>
            </pre>
            <p className="sketch-note">
              The enums are real, from <span className="mono">@origin89/km43</span>.{" "}
              <span className="mono">send</span>, <span className="mono">onReading</span> and{" "}
              <span className="mono">publish</span> stand in for your own code.
            </p>
          </figure>
        </div>
      </div>
    </section>
  );
}
