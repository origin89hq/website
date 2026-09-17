import { useEffect, useRef, useState } from "react";
import { studyClosed } from "../../lib/react-assets";
import { PORTS, type Port } from "./data";

function PortPanel({ port, onClose }: { port: Port; onClose: () => void }) {
  return (
    <>
      <div className="panel-top">
        <span className="panel-kind">{port.kind}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="panel-code">{port.code}</span>
          <button
            type="button"
            className="panel-close"
            aria-label="Close details"
            onClick={onClose}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2 2l8 8M10 2l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <h3 id="panelTitle">{port.title}</h3>
      <p className="summary">{port.summary}</p>
      {port.onWall && (
        <div className="on-wall">
          <b>On a typical cottage wall</b>
          <span>{port.onWall}</span>
        </div>
      )}
      {port.pins && (
        <div className="panel-block">
          <span className="panel-kind">Pins, left to right</span>
          <div className="pins">
            {port.pins.map((pin) => (
              <div className="pin" key={pin.n}>
                <div className="n">{pin.n}</div>
                <div className="name">{pin.name}</div>
                <div className="wire" style={{ background: pin.wire }} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="panel-block">
        <span className="panel-kind">Specifications</span>
        <dl>
          {port.specs.map((spec) => (
            <div className="spec" key={spec.label}>
              <dt>{spec.label}</dt>
              <dd className={spec.pending ? "o89-pending" : undefined}>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {port.connect && (
        <div className="panel-block">
          <span className="panel-kind">Connect</span>
          <ul className="chips">
            {port.connect.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {port.limits && (
        <div className="panel-block">
          <span className="panel-kind">Limits</span>
          <ul className="limits">
            {port.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="panel-stage">
        {port.stage ?? "Controller board revision A fabricated; bench measurements in progress."}
      </p>
    </>
  );
}

export function PortExplorer() {
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const leave = useRef(0);
  // Closing lets the Controller grow back under a cursor that hasn't moved, and the browser
  // then reports a hover on whichever terminal lands there. Hover waits for real movement.
  const pointer = useRef<[number, number]>([-1, -1]);
  const heldAt = useRef<[number, number] | null>(null);
  const port = PORTS.find((p) => p.id === active) ?? null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        heldAt.current = pointer.current;
        setPinned(null);
        setActive(null);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  // A pointer leaving the explorer schedules a hide; any explicit choice cancels it.
  const pin = (id: string) => {
    window.clearTimeout(leave.current);
    setPinned((current) => (current === id ? null : id));
    setActive(id);
  };
  const choose = (id: string) => {
    window.clearTimeout(leave.current);
    setPinned(id);
    setActive(id);
  };
  const close = () => {
    heldAt.current = pointer.current;
    setPinned(null);
    setActive(null);
  };

  return (
    <div
      className="explorer"
      data-active={active ?? undefined}
      onPointerMove={(event) => {
        pointer.current = [event.clientX, event.clientY];
      }}
      onPointerLeave={() => {
        if (!pinned) leave.current = window.setTimeout(() => setActive(null), 450);
      }}
    >
      <div className="explorer-stage">
        <fieldset
          className="explorer-visual"
          aria-label="Origin89 Controller terminals. Choose a terminal for its details."
        >
          <svg viewBox="-560 300 2320 1150">
            <title>Origin89 Controller with its terminals labelled</title>
            <image href={studyClosed} x="0" y="0" width="1200" height="1350" />
            {PORTS.map((p) => {
              const [lx, ly] = p.label;
              const anchor = p.anchor ?? "start";
              return (
                // biome-ignore lint/a11y/useSemanticElements: SVG groups cannot be <button>; role and keyboard handling are provided.
                <g
                  key={p.id}
                  data-port={p.id}
                  className={`port${active === p.id ? " is-active" : ""}`}
                  tabIndex={0}
                  role="button"
                  aria-controls="portPanel"
                  aria-pressed={active === p.id}
                  aria-label={`${p.code}: ${p.title}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return;
                    const held = heldAt.current;
                    if (held && Math.hypot(event.clientX - held[0], event.clientY - held[1]) < 4) {
                      return;
                    }
                    heldAt.current = null;
                    window.clearTimeout(leave.current);
                    if (!pinned) setActive(p.id);
                  }}
                  onClick={() => pin(p.id)}
                  onFocus={() => {
                    window.clearTimeout(leave.current);
                    setActive(p.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      choose(p.id);
                    }
                  }}
                >
                  <polyline
                    className="hit"
                    points={p.line}
                    style={{ stroke: "transparent", strokeWidth: 14 }}
                  />
                  <polyline points={p.line} />
                  <circle className="pulse" cx={p.dot[0]} cy={p.dot[1]} r="8" />
                  <circle className="node" cx={p.dot[0]} cy={p.dot[1]} r="7" />
                  <text x={lx} y={ly} textAnchor={anchor}>
                    {p.text}
                    {p.role && <tspan className="role"> · {p.role}</tspan>}
                  </text>
                  <rect
                    className="hit"
                    x={anchor === "end" ? lx - 420 : lx - 10}
                    y={ly - 30}
                    width="430"
                    height="44"
                  />
                </g>
              );
            })}
          </svg>
        </fieldset>
        <aside
          className="port-panel"
          id="portPanel"
          aria-live="polite"
          aria-labelledby={port ? "panelTitle" : undefined}
          onPointerEnter={() => window.clearTimeout(leave.current)}
        >
          {port && <PortPanel port={port} onClose={close} />}
        </aside>
        <p className="explorer-hint">Point at or tap a terminal</p>
      </div>
      <fieldset className="port-list" aria-label="Terminals">
        {PORTS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={active === p.id}
            onClick={() => choose(p.id)}
          >
            {p.code}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
