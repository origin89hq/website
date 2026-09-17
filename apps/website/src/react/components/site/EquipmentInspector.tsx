import { ArrowUpRight, X } from "lucide-react";
import { type RefObject, useId } from "react";
import { EquipmentIllustration } from "./EquipmentIllustration";

const equipment = {
  solar: {
    title: "Solar array",
    subtitle: "Lac des Pins · Sample readings, 8 sec ago",
    rows: [
      ["Output", "2.10 kW"],
      ["Array rating · sample configuration", "3.2 kWp"],
      ["Cottage consumption", "0.85 kW"],
      ["Available before conversion losses", "1.25 kW"],
    ],
    note: "The array rating is a sample configuration. Support depends on the exact inverter or charge controller model.",
    query: "solar",
  },
  generator: {
    title: "Backup generator",
    subtitle: "Lac des Pins · Sample status, 8 sec ago",
    rows: [
      ["Reported state", "Standby"],
      ["Fuel level", "Not provided"],
      ["Generator rating", "Not configured"],
      ["Runtime estimate", "Unavailable"],
    ],
    note: "Standby is the reported state. A runtime estimate also needs fuel level, usable tank capacity and consumption at the expected load. Control remains at the site.",
    query: "generator",
  },
  cottage: {
    title: "Inside the cottage",
    subtitle: "Lac des Pins · Sample circuit readings, 8 sec ago",
    rows: [
      ["Refrigerator", "120 W"],
      ["Water pump", "400 W"],
      ["Lights & router", "80 W"],
      ["Other circuits", "250 W"],
      ["Total demand", "850 W"],
    ],
    note: "This example includes branch-circuit measurements. A main meter alone cannot separate individual appliances from the total demand.",
    query: "power meter",
  },
  battery: {
    title: "Battery bank",
    subtitle: "Lac des Pins · Sample reading, 8 sec ago",
    rows: [
      ["State of charge", "76%"],
      ["Reported mode", "Charging"],
      ["Usable capacity · sample configuration", "10.0 kWh"],
      ["Reserve · sample setting", "20%"],
    ],
    note: "Buddy’s example uses this capacity and reserve with the measured demand. Battery condition, temperature and conversion losses affect the estimate.",
    query: "battery",
  },
  mining: {
    title: "North pit utilities",
    subtitle: "Sample mining site · Readings 30 sec ago",
    rows: [
      ["Site demand", "43 kW"],
      ["Pump station demand", "8 kW"],
      ["Generator", "Running"],
      ["Fuel tank", "62%"],
      ["Sump level", "High · check alarm"],
    ],
    note: "The sump input flags the alarm but not its cause. Compare the pump and level readings, then follow the site procedure before arranging work.",
    query: "generator",
  },
  telecom: {
    title: "Tundra relay shelter",
    subtitle: "Sample telecom site · Last heard 12 min ago",
    rows: [
      ["Current condition", "Unknown"],
      ["Battery · last known", "78%"],
      ["Shelter · last known", "+14 °C"],
      ["Generator · last known", "Standby"],
    ],
    note: "These are last-known readings. Missing updates don’t tell you the state of the power supply or equipment. Forecasting reserve needs fresh data.",
    query: "battery",
  },
};
export type EquipmentKind = keyof typeof equipment;
export function EquipmentInspector({
  kind,
  dialogRef,
}: {
  kind: EquipmentKind;
  dialogRef: RefObject<HTMLDialogElement | null>;
}) {
  const id = useId();
  const item = equipment[kind];
  return (
    <dialog ref={dialogRef} className="equipment-inspector" aria-labelledby={`${id}-title`}>
      <button
        className="equipment-inspector-close"
        type="button"
        aria-label="Close equipment details"
        onClick={() => dialogRef.current?.close()}
      >
        <X size={20} />
      </button>
      <EquipmentIllustration kind={kind} />
      <h2 id={`${id}-title`}>{item.title}</h2>
      <p className="equipment-inspector-source">{item.subtitle}</p>
      <dl>
        {item.rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="equipment-inspector-note">{item.note}</p>
      <a href={`/equipment/?q=${encodeURIComponent(item.query)}`}>
        Search the equipment catalogue <ArrowUpRight size={15} />
      </a>
    </dialog>
  );
}
