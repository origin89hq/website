// Homepage facts. Hardware values come from origin89hq/hardware: board A README,
// LAYOUT-REQUIREMENTS.md, the 2026-09-09 BOM and board B. Measured values name
// their conditions; everything else is marked as design or pending bench.

export type Spec = { label: string; value: string; pending?: boolean };
export type Pin = { n: string; name: string; wire: string };

export type Port = {
  id: string;
  code: string;
  dot: [number, number];
  line: string;
  label: [number, number];
  anchor?: "start" | "end";
  text: string;
  role?: string;
  kind: string;
  title: string;
  summary: string;
  onWall?: string;
  pins?: Pin[];
  specs: Spec[];
  connect?: string[];
  limits?: string[];
  stage?: string;
};

const WIRE = {
  orange: "#d9772b",
  whiteOrange: "repeating-linear-gradient(90deg,#e7eaee 0 6px,#d9772b 6px 9px)",
  green: "#3e8a55",
  blue: "#3569b5",
  whiteBlue: "repeating-linear-gradient(90deg,#e7eaee 0 6px,#3569b5 6px 9px)",
  grey: "#8b9094",
  whiteGrey: "repeating-linear-gradient(90deg,#e7eaee 0 6px,#8b9094 6px 9px)",
  red: "#c1382a",
  black: "#3a3f45",
  none: "#2b343f",
};

const pins = (...rows: [string, string, string][]): Pin[] =>
  rows.map(([n, name, wire]) => ({ n, name, wire }));
const specs = (...rows: ([string, string] | [string, string, true])[]): Spec[] =>
  rows.map(([label, value, pending]) => ({ label, value, pending }));

const rs485 = {
  kind: "Field bus · half-duplex RS-485",
  title: "Talks to Modbus equipment.",
  summary:
    "Charge controllers, inverters and energy meters that publish readings over RS-485, usually as Modbus RTU. Each of the three ports is its own bus with its own transceiver.",
  pins: pins(["1", "A", WIRE.orange], ["2", "B", WIRE.whiteOrange], ["3", "GND", WIRE.green]),
  specs: specs(
    ["Terminal", "3-pin pluggable screw, 3.5 mm pitch"],
    ["Transceiver", "MAX13487E, direction switched automatically"],
    ["Termination", "120 Ω on a jumper beside the terminal, fitted when shipped"],
    ["Idle bias", "560 Ω fail-safe pull-up and pull-down"],
    ["Protection", "SM712 surge clamp at the terminal"],
    ["Activity", "Receive light on the board edge"],
  ),
  connect: ["Solar charge controllers", "Modbus energy meters", "Inverter/chargers with RS-485"],
  limits: [
    "One bus per port. Chain devices in a line and terminate the two ends.",
    "Fit the jumper only when the Controller sits at an end of the bus.",
    "Up to 500 kbit/s by the transceiver; Modbus gear commonly runs 9,600 to 115,200 baud.",
  ],
};

export const PORTS: Port[] = [
  {
    id: "dc-in",
    code: "DC IN",
    dot: [653, 1030],
    line: "653,1030 653,1395 690,1395",
    label: [700, 1402],
    text: "DC IN",
    role: "12 V",
    kind: "Power",
    title: "12 V straight from the battery bank.",
    summary:
      "Wire it to a fused circuit on the DC panel. Nothing has to stay on, inverter included, to keep the Controller awake.",
    onWall: "A circuit on the blade fuse block.",
    pins: pins(["1", "+12 V", WIRE.red], ["2", "GND", WIRE.black]),
    specs: specs(
      ["Terminal", "2-pin pluggable screw, 5.08 mm pitch"],
      ["Input", "12 V battery bank; revision A is built for 12 V"],
      ["Protection", "SMBJ18A clamp, 2 A resettable fuse, reverse-polarity protection"],
      ["Rails", "5 V for the bus transceivers, 3.3 V for logic and radio"],
      [
        "Idle draw",
        "38 mA at 13.1 V with Wi-Fi and Bluetooth on, 11 mA with the radio rail off; first bench readings",
      ],
    ),
    limits: ["24 V banks are planned for revision B, not supported on A."],
  },
  {
    id: "rs485-1",
    code: "RS-485 1",
    dot: [709, 1004],
    line: "709,1004 709,1345 760,1345",
    label: [770, 1352],
    text: "RS-485 1",
    ...rs485,
    onWall: "The solar charge controller's data jack.",
  },
  {
    id: "rs485-2",
    code: "RS-485 2",
    dot: [766, 977],
    line: "766,977 766,1295 830,1295",
    label: [840, 1302],
    text: "RS-485 2",
    ...rs485,
    onWall: "The inverter/charger's data port.",
  },
  {
    id: "rs485-3",
    code: "RS-485 3",
    dot: [822, 950],
    line: "822,950 822,1245 900,1245",
    label: [910, 1252],
    text: "RS-485 3",
    ...rs485,
    onWall: "Free. A DC energy meter is the usual third bus.",
  },
  {
    id: "can",
    code: "CAN",
    dot: [878, 925],
    line: "878,925 878,1195 970,1195",
    label: [980, 1202],
    text: "CAN",
    kind: "Field bus · CAN",
    title: "Reads battery management systems.",
    summary:
      "Lithium battery packs whose BMS reports state of charge, cell voltages and alarms over CAN.",
    onWall: "Unused. Flooded lead-acid batteries have no BMS to read.",
    pins: pins(["1", "CANH", WIRE.grey], ["2", "CANL", WIRE.whiteGrey], ["3", "GND", WIRE.green]),
    specs: specs(
      ["Terminal", "3-pin pluggable screw, 3.5 mm pitch"],
      ["Transceiver", "TJA1051T/3"],
      ["Termination", "120 Ω on a jumper beside the terminal, fitted when shipped"],
      ["Protection", "PESD1CAN clamp at the terminal"],
      ["Activity", "Receive light on the board edge"],
    ),
    connect: ["LiFePO4 packs with a CAN BMS", "Battery racks with a CAN port"],
    limits: [
      "Terminate the two ends of the bus.",
      "Battery protocols vary by maker; each pack is added to the equipment data after it is tested.",
    ],
  },
  {
    id: "one-wire",
    code: "1-WIRE",
    dot: [935, 898],
    line: "935,898 935,1145 1040,1145",
    label: [1050, 1152],
    text: "1-WIRE",
    kind: "Sensor bus · 1-Wire",
    title: "Temperature probes on one cable.",
    summary:
      "Digital probes of the DS18B20 kind share one three-wire cable. Each has its own address, so the fridge and the battery box never get confused.",
    onWall: "A tap near the busbars feeds the fridge shelf, the battery bank and the outdoor air.",
    pins: pins(["1", "3.3 V", WIRE.orange], ["2", "DATA", WIRE.blue], ["3", "GND", WIRE.whiteBlue]),
    specs: specs(
      ["Terminal", "3-pin pluggable screw at the bottom; a second landing on the right side"],
      ["Probe supply", "3.3 V through a 100 mA resettable fuse"],
      ["Protection", "ESD clamp at the terminal, 100 Ω series resistor"],
      ["Probes per bus", "Pending bench test", true],
    ),
    connect: ["Fridge and freezer", "Battery box", "Outdoor air", "Pump house"],
    limits: [
      "Run one trunk with short taps rather than a star.",
      "Long outdoor runs need the long-line 1-Wire practices.",
    ],
  },
  {
    id: "sel",
    code: "SEL",
    dot: [296, 757],
    line: "296,757 -40,757",
    label: [-50, 764],
    anchor: "end",
    text: "SEL",
    role: "selector",
    kind: "Input",
    title: "A switch on the panel.",
    summary: "Reads a panel selector, so the Controller sees a manual choice made at the wall.",
    onWall: "Unused here.",
    specs: specs(
      ["Terminal", "3-pin pluggable screw, left side"],
      ["Pin order", "Pending bench confirmation", true],
    ),
  },
  {
    id: "sns",
    code: "SNS",
    dot: [368, 857],
    line: "368,857 -40,857",
    label: [-50, 864],
    anchor: "end",
    text: "SNS",
    role: "start battery",
    kind: "Analog input",
    title: "The generator's starting battery.",
    summary:
      "Watches the battery that cranks the generator, so a weak one shows up before the generator is asked to start.",
    onWall: "Through the outdoor junction box to the generator shed.",
    specs: specs(
      ["Terminal", "2-pin pluggable screw, left side"],
      [
        "Measurement",
        "100 kΩ / 10 kΩ divider into the processor's ADC, about 36 V full scale by design",
      ],
      ["Filtering", "100 nF across the divider, read about once a second"],
      ["Accuracy", "Pending bench calibration", true],
    ),
  },
  {
    id: "tnk",
    code: "TNK",
    dot: [402, 905],
    line: "402,905 330,960 -40,960",
    label: [-50, 967],
    anchor: "end",
    text: "TNK",
    role: "tank level",
    kind: "Analog input · 4–20 mA",
    title: "Fuel or propane level.",
    summary: "Reads a 4–20 mA tank sender, the common output of level transmitters.",
    onWall: "Through the outdoor junction box to the tank.",
    specs: specs(
      ["Terminal", "3-pin pluggable screw, left side"],
      ["Sense", "150 Ω at the terminal: 20 mA reads as 3.0 V"],
      ["Loop supply", "From the board's 12 V"],
    ),
    connect: ["4–20 mA tank level senders"],
  },
  {
    id: "status",
    code: "STATUS",
    dot: [455, 753],
    line: "455,753 420,640 -40,640",
    label: [-50, 647],
    anchor: "end",
    text: "STATUS",
    role: "light",
    kind: "Indicator",
    title: "One light that shows it is running.",
    summary:
      "A single light pipe on the cover. A short blink every second or so means the Controller is running.",
    specs: specs(
      ["Pattern", "160 ms on, 1,140 ms off while running"],
      ["Other states", "Documented with the firmware"],
    ),
  },
  {
    id: "one-wire-side",
    code: "1W",
    dot: [833, 506],
    line: "833,506 1100,420 1260,420",
    label: [1270, 427],
    text: "1W",
    role: "same 1-Wire bus",
    kind: "Sensor bus · second landing",
    title: "The same 1-Wire bus, on the side.",
    summary:
      "For a probe inside the same enclosure or panel. It carries the same three nets as the 1-WIRE terminal at the bottom.",
    specs: specs(
      ["Terminal", "3-pin pluggable screw, right side"],
      ["Bus", "Shared with the bottom 1-WIRE terminal"],
    ),
  },
  {
    id: "ve-1",
    code: "VE.DIRECT 1",
    dot: [869, 555],
    line: "869,555 1150,520 1260,520",
    label: [1270, 527],
    text: "VE.DIRECT 1",
    kind: "Serial · VE.Direct",
    title: "Monitors and chargers that speak VE.Direct.",
    summary:
      "Battery monitors and solar chargers that use the VE.Direct text protocol, on a short lead inside the same enclosure or panel.",
    onWall: "Unused here.",
    specs: specs(
      ["Terminal", "JST PH 4-pin, right side"],
      ["Lead", "In-enclosure patch lead, not field wiring"],
    ),
  },
  {
    id: "lnk",
    code: "LNK",
    dot: [907, 609],
    line: "907,609 1180,620 1260,620",
    label: [1270, 627],
    text: "LNK",
    role: "generator box",
    kind: "Generator link",
    title: "Asks the generator box to run.",
    summary:
      "A five-wire link to the separate generator board. The Controller sends RUN and a once-a-second KICK; the start contact closes only while both keep coming, and the relays report what they did.",
    onWall: "The generator box beside the Controller, then one pair to the generator in the shed.",
    pins: pins(
      ["1", "+12 V", WIRE.none],
      ["2", "GND", WIRE.none],
      ["3", "RUN", WIRE.none],
      ["4", "KICK", WIRE.none],
      ["5", "FEEDBACK", WIRE.none],
    ),
    specs: specs(
      ["Link", "JST VH 5-pin, locking"],
      ["Contact", "Two relays in series, gold-clad contacts rated from 10 µA"],
      ["Watchdog", "Hardware timer: the contact opens about 4.5 s after the kicks stop, by design"],
      ["Output", "Dry contact, 30 V DC max, 2 A fuse, 30 V bidirectional clamp"],
      ["Watchdog timing", "Pending bench measurement", true],
    ),
    connect: ["Generators with a two-wire remote start input"],
    limits: [
      "Relays are rated for −25 to +65 °C ambient.",
      "The contact switches a signal, not engine current.",
    ],
    stage: "Generator board assembled; bench proof pending.",
  },
  {
    id: "ve-2",
    code: "VE.DIRECT 2",
    dot: [972, 701],
    line: "972,701 1200,720 1260,720",
    label: [1270, 727],
    text: "VE.DIRECT 2",
    kind: "Serial · VE.Direct",
    title: "A second VE.Direct device.",
    summary:
      "Same as the first port, for a second battery monitor or charger in the same enclosure or panel.",
    onWall: "Unused here.",
    specs: specs(["Terminal", "JST PH 4-pin, right side"]),
  },
  {
    id: "radio",
    code: "WI-FI + BLE",
    dot: [592, 396],
    line: "592,396 592,330 1260,330",
    label: [1270, 337],
    text: "WI-FI + BLUETOOTH",
    role: "inside",
    kind: "Radio · under the cover",
    title: "Set up from your phone. Sync when there is a connection.",
    summary:
      "An ESP32-C6 module carries the radio. The processor that runs the site is separate, so the rules keep running whatever the radio is doing.",
    specs: specs(
      ["Module", "ESP32-C6-WROOM-1: 2.4 GHz Wi-Fi 6 and Bluetooth LE"],
      ["Antenna", "The module's own, under the cover; no external stub"],
      ["Recovery", "On a switched rail, so a stuck radio restarts without a site visit"],
      ["Range in the enclosure", "Pending bench test", true],
    ),
  },
];

export const BENCH = {
  idleRadioOn: { mA: 38, volts: 13.1 },
  idleRadioOff: { mA: 11, volts: 13.1 },
  cerboWatts: 2.8,
};
