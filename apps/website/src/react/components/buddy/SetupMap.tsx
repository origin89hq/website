import { type MouseEvent, useState } from "react";
import { BuddyAvatar } from "./BuddyAvatar";
import {
  emptySetup,
  isUnknown,
  manufacturerModel,
  manufacturerSource,
  type SetupState,
} from "./setup-model";
export interface SetupMapProps {
  state?: SetupState;
  buddyUrl: string;
  plateUrl: string;
}
export function SetupMap({ state = emptySetup, buddyUrl, plateUrl }: SetupMapProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const model = manufacturerModel(state);
  const primaryTitle = {
    solar: "MPPT controller",
    pump: "Pump / motor",
    generator: "Generator",
    telecom: "Telecom equipment",
    battery: "Battery bank",
    other: "Equipment",
  }[state.kind];
  const primaryState = isUnknown(state.controller)
    ? state.stage === "start"
      ? "pending"
      : "question"
    : "active";
  const batteryState = state.battery
    ? isUnknown(state.battery)
      ? "question"
      : "active"
    : "pending";
  const panelState = state.panel || state.panelCount ? "question" : "pending";
  const details: Record<string, [string, string, string]> = {
    primary: [
      "YOUR EQUIPMENT",
      isUnknown(state.controller) ? "Model to confirm" : state.controller,
      model
        ? `The EPEVER ${model} reference lists 100 A rated charging current and RS-485/Modbus. That is a possible data path. Origin89 support is not confirmed. ${state.port === "Display / logger" ? "An existing display or logger means the shared bus needs review first." : "The exact interface and existing accessories still need review."}`
        : "Confirm the label and manufacturer documentation before choosing a data interface. No model or compatibility has been inferred from a photo.",
    ],
    battery: [
      "BATTERY BANK",
      isUnknown(state.battery) ? "Let’s identify the bank." : state.battery,
      "Confirm the model, chemistry and monitoring interface. A photo alone cannot show capacity, state of charge or whether a connection is safe.",
    ],
    panels: [
      "SOLAR ARRAY",
      isUnknown(state.panel) ? "Panel model to confirm" : state.panel,
      `${isUnknown(state.panelCount) ? "Panel count unknown." : state.panelCount + " panels reported."} ${isUnknown(state.arrangement) ? "String arrangement unknown." : state.arrangement + " (user-reported, unverified)."} A visible cable does not show whether panels are wired in series or parallel.`,
    ],
    origin: [
      "PROPOSED ORIGIN89 LINK",
      "The local connection point.",
      "Origin89 would read supported equipment data at the site. The lines show proposed data links. They are not electrical wiring or approved installation instructions.",
    ],
    app: [
      "YOUR VIEW",
      "Offgrid + Buddy",
      "Equipment readings and Buddy’s explanations in one place. This concept uses a guided conversation. It has no live image recognition or equipment connection.",
    ],
    other: [
      "ROOM TO EXTEND",
      "Add another device.",
      "Review pumps, inverters, generators and sensors by exact make and model, and note the readings you need. Their interfaces are not confirmed yet.",
    ],
  };
  const detail = selected ? details[selected] : null;
  function handleDeviceClick(event: MouseEvent<HTMLElement>) {
    const button = (event.target as Element).closest<HTMLElement>("[data-map-node]");
    if (button) setSelected(button.dataset.mapNode || null);
  }
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Native child buttons dispatch clicks for both pointer and keyboard activation.
    <aside
      className="setup-plan"
      id="setup-map"
      onClick={handleDeviceClick}
      aria-label="Interactive integration map"
    >
      <div className="map-heading">
        <h3>Where Origin89 could fit.</h3>
        <span className="map-status">
          {state.stage === "done"
            ? "First draft · Needs review"
            : state.controller
              ? "Mapping your equipment"
              : "Start with your equipment"}
        </span>
      </div>
      <div className="system-map" data-connected={Boolean(state.controller)}>
        <svg
          className="map-connections"
          viewBox="0 0 660 630"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            style={{ display: state.kind !== "solar" ? "none" : undefined }}
            className="map-line panel-link"
            d="M192 134 V196 Q192 210 176 210 H130 V247"
          />
          <path className="map-line primary-link" d="M178 285 H224 Q245 285 260 301 L293 336" />
          <path
            style={{
              display:
                state.kind === "battery" || state.battery === "No batteries" ? "none" : undefined,
            }}
            className="map-line battery-link"
            d="M185 471 H235 Q253 471 265 450 L305 382"
          />
          <path className="map-line other-link" d="M525 472 H475 Q455 472 439 451 L389 380" />
          <path className="map-line app-link" d="M387 311 L438 251 Q450 236 472 236 H527 V196" />
          <circle className="signal-point" cx="263" cy="304" r="4" />
          <circle className="signal-point" cx="444" cy="243" r="4" />
        </svg>
        <button
          type="button"
          hidden={state.kind !== "solar"}
          className="map-device map-panels"
          data-map-node="panels"
          data-state={panelState}
          aria-expanded={selected === "panels"}
        >
          <svg viewBox="0 0 100 66" aria-hidden="true">
            <path d="M20 7 H82 L91 44 H10 Z M26 7 L20 44 M45 7 L43 44 M64 7 L67 44 M17 20 H85 M14 32 H88 M49 44 V56 M31 59 H72" />
          </svg>
          <strong>Solar panels</strong>
          <small data-map-panels>
            {!isUnknown(state.panelCount)
              ? state.panelCount + " panels · layout unverified"
              : "Model to confirm"}
          </small>
        </button>
        <button
          type="button"
          className="map-device map-primary"
          data-map-node="primary"
          data-state={primaryState}
          aria-expanded={selected === "primary"}
        >
          <svg
            viewBox="0 0 100 85"
            aria-hidden="true"
            data-equipment-icon="solar other"
            className={["solar", "other"].includes(state.kind) ? "" : "map-icon-hidden"}
          >
            <path d="M22 7 H78 L84 13 V67 L78 73 H22 L16 67 V13 Z M27 16 H73 V37 H27 Z M30 48 H37 M45 48 H52 M60 48 H67 M30 58 H37 M45 58 H52 M60 58 H67 M31 73 V82 M44 73 V82 M57 73 V82 M70 73 V82" />
          </svg>
          <svg
            viewBox="0 0 100 85"
            aria-hidden="true"
            data-equipment-icon="pump"
            className={state.kind === "pump" ? "" : "map-icon-hidden"}
          >
            <path d="M17 35 H46 V64 H17 Z M23 35 V25 H36 V35 M46 38 H77 V62 H46 M52 43 H72 M52 50 H72 M52 57 H72 M22 64 V72 H77 M32 64 V72 M68 62 V72 M17 43 H7 V55 H17 M40 25 V15 H52 V25 Z" />
          </svg>
          <svg
            viewBox="0 0 100 85"
            aria-hidden="true"
            data-equipment-icon="generator"
            className={state.kind === "generator" ? "" : "map-icon-hidden"}
          >
            <path d="M11 27 L24 18 H78 L89 27 V66 H11 Z M11 27 H89 M23 37 H46 V55 H23 Z M58 37 H78 M58 43 H78 M58 49 H78 M58 55 H78 M20 66 V73 H32 V66 M70 66 V73 H82 V66 M37 18 V12 H59 V18" />
          </svg>
          <svg
            viewBox="0 0 100 85"
            aria-hidden="true"
            data-equipment-icon="telecom"
            className={state.kind === "telecom" ? "" : "map-icon-hidden"}
          >
            <path d="M49 29 L29 77 H71 Z M39 51 H60 M34 65 H66 M49 29 V16 M44 28 Q30 20 42 10 M55 28 Q69 20 57 10 M36 33 Q16 19 35 4 M63 33 Q82 19 64 4" />
            <circle cx="49" cy="17" r="3" />
          </svg>
          <svg
            viewBox="0 0 100 85"
            aria-hidden="true"
            data-equipment-icon="battery"
            className={state.kind === "battery" ? "" : "map-icon-hidden"}
          >
            <path d="M18 22 H82 V71 H18 Z M27 22 V12 H39 V22 M61 22 V12 H73 V22 M35 47 H65 M50 33 V61" />
          </svg>
          <strong data-primary-title>{primaryTitle}</strong>
          <small data-map-controller>
            {isUnknown(state.controller)
              ? "Model to confirm"
              : model
                ? "EPEVER " + model
                : state.controller}
          </small>
          <span className="node-marker">{model ? "↗" : "?"}</span>
        </button>
        <button
          type="button"
          hidden={state.kind === "battery" || state.battery === "No batteries"}
          className="map-device map-battery"
          data-map-node="battery"
          data-state={batteryState}
          aria-expanded={selected === "battery"}
        >
          <svg viewBox="0 0 100 83" aria-hidden="true">
            <path d="M17 23 L74 10 L89 20 V62 L31 77 L17 65 Z M17 23 L31 34 L89 20 M31 34 V77 M31 15 V7 H42 V13 M65 7 V1 H76 V8 M47 49 H65 M56 40 V59" />
          </svg>
          <strong>Batteries</strong>
          <small data-map-battery>
            {isUnknown(state.battery) ? "Model to confirm" : state.battery}
          </small>
          <span className="node-marker">?</span>
        </button>
        <button
          type="button"
          className="map-hub"
          data-map-node="origin"
          aria-expanded={selected === "origin"}
        >
          <span className="hub-halo"></span>
          <svg viewBox="0 0 180 160" aria-hidden="true">
            <path className="hub-bottom" d="M22 73 L106 45 L158 82 V108 L74 141 L22 100 Z" />
            <path className="hub-mid" d="M22 60 L106 32 L158 69 V92 L74 124 L22 84 Z" />
            <path className="hub-top" d="M22 46 L106 18 L158 55 L74 88 Z" />
            <path
              className="hub-edge"
              d="M74 88 V111 M34 82 L47 89 M34 90 L47 98 M102 97 L139 83"
            />
          </svg>
          <img src={plateUrl} alt="" width="47" height="36" />
          <strong>Origin89</strong>
          <small>The connection point</small>
        </button>
        <button
          type="button"
          className="map-device map-app"
          data-map-node="app"
          data-state="active"
          aria-expanded={selected === "app"}
        >
          <span className="map-phone">
            <BuddyAvatar src={buddyUrl} alt="" size={40} />
            <i></i>
            <b></b>
            <em></em>
          </span>
          <strong>Offgrid + Buddy</strong>
          <small>One view</small>
        </button>
        <button
          type="button"
          className="map-device map-other"
          data-map-node="other"
          data-state={"pending"}
          aria-expanded={selected === "other"}
        >
          <svg viewBox="0 0 100 82" aria-hidden="true">
            <path d="M20 18 H80 V66 H20 Z M30 29 H57 V45 H30 Z M65 29 H71 M65 38 H71 M30 55 H70 M28 18 V10 H37 V18 M64 18 V10 H73 V18 M29 66 V77 M71 66 V77" />
          </svg>
          <strong>More equipment</strong>
          <small>Pumps · inverter · sensors</small>
          <span className="node-marker">+</span>
        </button>
        <span className="map-inline-label">proposed data links</span>
      </div>
      <div className="map-legend">
        <span>
          <i></i> Your equipment
        </span>
        <span>
          <i className="legend-blue"></i> Origin89
        </span>
        <span>
          <b>?</b> Needs checking
        </span>
      </div>
      <p className="map-instruction">Tap a device for details</p>
      {detail && (
        <section className="map-detail" aria-label="Equipment details">
          <button
            type="button"
            className="map-detail-close"
            aria-label="Close equipment details"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <h4 data-detail-title>{detail[1]}</h4>
          <p data-detail-body>{detail[2]}</p>
          {selected === "primary" && model && (
            <a data-detail-source href={manufacturerSource} target="_blank" rel="noreferrer">
              Manufacturer specifications ↗
            </a>
          )}
          <small>Conceptual data map · Connections need verification</small>
        </section>
      )}
    </aside>
  );
}
