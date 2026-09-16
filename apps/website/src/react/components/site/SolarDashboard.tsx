import { ArrowDownLeft, ArrowUpRight, BatteryMedium, Sun } from "lucide-react";
import { useRef, useState } from "react";
import { EnergyHistory } from "./EnergyHistory";
import { EnergyOutlook } from "./EnergyOutlook";
import { EquipmentIllustration } from "./EquipmentIllustration";
import { EquipmentInspector } from "./EquipmentInspector";
import "../../styles/energy-dashboard.css";

const connections = {
  solar: { label: "Solar array", note: "Solar production · Sample reading, 8 sec ago." },
  generator: {
    label: "Generator / backup",
    note: "Standby · Sample, 8 sec ago. Connected, but not supplying power.",
  },
  home: { label: "Cottage", note: "Cottage consumption · Sample reading, 8 sec ago." },
  battery: { label: "Battery", note: "Charging · 1.25 kW available before conversion losses." },
};
export function SolarDashboard() {
  const details = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<keyof typeof connections>("solar");
  function inspect(kind: keyof typeof connections) {
    setSelected(kind);
    details.current?.showModal();
  }
  return (
    <div className="solar-dashboard">
      <div className="solar-heading">
        <h2>Running on sunshine.</h2>
        <Sun size={22} strokeWidth={1.3} aria-hidden="true" />
      </div>
      <section className="solar-flow" aria-label="Illustrative site power flow">
        <div className="flow-topline">
          <span>
            <i />
            Energy flow · sample
          </span>
          <span>Tap equipment to inspect</span>
        </div>
        <div className="flow-map">
          <svg
            className="flow-wires"
            viewBox="0 0 360 320"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M90 116V152H180V184M180 184H90V218M180 184H270V218" className="flow-track" />
            <path d="M270 116V152H180" className="flow-standby" />
            <path d="M90 116V152H180V184M180 184H90V218M180 184H270V218" className="flow-current" />
          </svg>
          <button
            type="button"
            className="flow-node flow-solar"
            aria-haspopup="dialog"
            aria-pressed={selected === "solar"}
            aria-label="Inspect solar production"
            onClick={() => inspect("solar")}
          >
            <EquipmentIllustration kind="solar" />
            <strong>
              2.10 <small>kW</small>
            </strong>
            <span>Solar production</span>
          </button>
          <button
            type="button"
            className="flow-node flow-generator"
            aria-haspopup="dialog"
            aria-pressed={selected === "generator"}
            aria-label="Inspect generator standby"
            onClick={() => inspect("generator")}
          >
            <EquipmentIllustration kind="generator" />
            <strong className="flow-state">Standby</strong>
            <span>Generator</span>
          </button>

          <span className="flow-junction" aria-hidden="true">
            Local control
          </span>
          <button
            type="button"
            className="flow-node flow-home"
            aria-haspopup="dialog"
            aria-pressed={selected === "home"}
            aria-label="Inspect cottage consumption"
            onClick={() => inspect("home")}
          >
            <EquipmentIllustration kind="cottage" />
            <strong>
              0.85 <small>kW</small>
            </strong>
            <span>Cottage use</span>
          </button>
          <button
            type="button"
            className="flow-node flow-battery"
            aria-haspopup="dialog"
            aria-pressed={selected === "battery"}
            aria-label="Inspect battery charging"
            onClick={() => inspect("battery")}
          >
            <EquipmentIllustration kind="battery" />
            <strong>
              76<small>%</small>
            </strong>
            <span>Charging</span>
          </button>
        </div>
        <div className="flow-detail" aria-live="polite">
          <span>{connections[selected].label}</span>
          <p>{connections[selected].note}</p>
        </div>
      </section>
      <div className="solar-metrics">
        <div>
          <span>
            <ArrowDownLeft size={13} />
            Available to charge
          </span>
          <strong>
            1.25 <small>kW</small>
          </strong>
          <p>Before conversion losses</p>
        </div>
        <div>
          <span>
            <BatteryMedium size={13} />
            Battery reserve
          </span>
          <strong>
            20<small>%</small>
          </strong>
          <p>Sample reserve setting</p>
        </div>
      </div>
      <EnergyHistory />
      <EnergyOutlook />
      <button className="dashboard-control-link" type="button" data-switch="control">
        Controls, local rules & cameras <ArrowUpRight size={15} />
      </button>
      <EquipmentInspector kind={selected === "home" ? "cottage" : selected} dialogRef={details} />
    </div>
  );
}
