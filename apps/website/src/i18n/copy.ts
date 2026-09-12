/// The public site is English-only for now. Keeping its words behind one typed
/// shape still makes every component explicit about the content it renders.

/// How sure the controller is of a number. `Missing` is the one that matters:
/// it is why a dead probe reads blank instead of a plausible zero.
export type Quality = "counted" | "estimated" | "missing" | "state";

export interface Reading {
  label: string;
  value: string;
  /** Drives the dot colour and whether the value is dimmed. */
  quality: Quality;
  /** What sits under the label. Usually how long ago it was read, because that
   *  is what tells you the link is alive. Where the number carries a caveat the
   *  caveat comes first: an estimated state of charge stays labelled estimated,
   *  since a behaviour that needs a counted figure has to refuse it. */
  note: string;
}

/// One line on the lock screen. `when` is relative rather than a date, so the
/// mock-up never looks stale.
/// A node on the power-flow screen. The kind picks the icon and the colour, so
/// a new one cannot be added without deciding how it is drawn.
export type PowerKind = "solar" | "battery" | "load";

export interface PowerNode {
  kind: PowerKind;
  label: string;
  value: string;
}

/// One stop on the scroll walkthrough. The key picks which phone screen is shown
/// beside it, so a step cannot exist without a screen to go with it.
export type StepKey = "generator" | "frost" | "readings" | "power" | "safety";

export type SafetyLoadState = "protected" | "paused";

export interface SafetyLoad {
  label: string;
  value: string;
  state: SafetyLoadState;
}

export interface Step {
  key: StepKey;
  title: string;
  body: string;
}

/// One act of the scroll story. The key picks which drawing is pinned beside it,
/// so an act cannot exist without something to show for it.
export type ActKey = "alone" | "gear" | "health" | "open";

export interface Act {
  key: ActKey;
  /** The oversized promise that anchors the act. Kept deliberately to one word
   *  so the four sections scan as a matched set. */
  word: string;
  body: string;
}

export interface Notification {
  when: string;
  title: string;
  body: string;
  /** Compact evidence shown in the offline queue beside the event. */
  metric: string;
}

export interface Card {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Copy {
  meta: { title: string; description: string };
  nav: { how: string; devices: string; controller: string; docs: string };
  banner: string;
  hero: {
    eyebrow: string;
    titleLead: string;
    titleTail: string;
    lede: string;
    primary: string;
    secondary: string;
    note: string;
    badges: readonly string[];
  };
  phone: {
    lockDate: string;
    lockTime: string;
    appName: string;
    /** Invented on purpose. P-89 is a real MTQ structure number and km 43 narrows
     *  it further; adding the real lake would publish a route to a building that
     *  is empty most of the year. Nothing is lost by making this one up. */
    siteName: string;
    notifications: readonly Notification[];
    /** The readings screen. State of charge gets the
     *  ring because it is the number people look for, and it is the one the
     *  controller is least sure of. */
    state: {
      /** The view. The site name is the heading; this sits above it. */
      label: string;
      socLabel: string;
      /** Whole percent. Drives the ring, so it is a number and not a string. */
      socValue: number;
      socQuality: Quality;
      socNote: string;
      voltageLabel: string;
      voltageValue: string;
      rows: readonly Reading[];
    };
    /** Frost: a setpoint, what the room is actually at, and what the output is
     *  doing about it. The dead probe stays on this screen because on_unknown is
     *  the parameter that matters most here. */
    frost: {
      label: string;
      setpointLabel: string;
      setpointValue: string;
      rows: readonly Reading[];
    };
    /** The power screen. What the array is making, where it splits, and what each
     *  metered circuit is drawing. The arithmetic has to close: the source is
     *  the branches added up, and the branches' load is the circuits added up.
     *  A flow diagram that disagrees with its own numbers is worse than a list. */
    power: {
      label: string;
      source: PowerNode;
      branches: readonly PowerNode[];
      circuitsLabel: string;
      circuits: readonly { label: string; value: string }[];
      /** Today against the best day the log has stored this month. A measured
       *  best beats a predicted maximum: the controller keeps downsampled
       *  history, it does not model the sun. */
      today: { label: string; value: string };
      best: { label: string; value: string };
      /** Today as a percentage of that best, for the bar. */
      todayPercent: number;
    };
    /** The Safety mode screen. It is a site-wide energy policy, distinct from
     *  each output's electrical fail state. The screen names both the evidence
     *  that admitted the mode and the loads whose policy changed. */
    safety: {
      label: string;
      status: string;
      summary: string;
      reasonsLabel: string;
      reasons: readonly string[];
      loadsLabel: string;
      loads: readonly SafetyLoad[];
      syncLabel: string;
      syncWindow: string;
      urgentWake: string;
    };
  };
  /** The warm moment, then the facts. The prose says what the thing is for;
   *  the specs grid under the render carries the numbers, David's call: the
   *  page has to say exactly what the ports are. */
  meet: {
    kicker: string;
    title: string;
    body: string;
    /** Alt text for the render, or for the drawing standing in for it. */
    alt: string;
    reveal: {
      open: string;
      close: string;
      closedLabel: string;
      insideLabel: string;
      closedDescription: string;
      insideDescription: string;
      insideAlt: string;
    };
    /** Port-by-port spec list under the render; facts from docs/CONTROLLER-V1.md.
     *  Badge counts follow the CATALOGUED_MODELS convention in lib/brands.ts:
     *  conservative floors over the catalogue's model rows, never support claims. */
    specs: { label: string; detail: string; badge?: string }[];
    /** Kills the wrong reading of the model badges: breadth of catalogued
     *  gear, not simultaneous connections. Caught by David reading 200+ as
     *  a port capacity. */
    specsNote: string;
  };
  /** The scroll walkthrough. Replaces the old card grid: each step is explained
   *  next to the screen it produces, which a card cannot do. */
  walkthrough: { kicker: string; title: string; lede: string; steps: readonly Step[] };
  /** The four acts. The walkthrough in the hero says what it does; this says why
   *  it is built the way it is, one claim at a time, each pinned long enough to
   *  be read rather than scrolled past. */
  acts: readonly Act[];
  /** The handful of words burned into the drawings beside the acts. Keeping
   *  them here leaves the components responsible for presentation, not prose. */
  actLabels: {
    dialects: string;
    markets: readonly string[];
    queue: string;
    cloud: string;
    linkLost: string;
    source: string;
  };
  siteEnergy: {
    label: string;
    connection: string;
    inputLabel: string;
    inputValue: string;
    consumptionLabel: string;
    consumptionValue: string;
    balanceLabel: string;
    balanceValue: string;
    solarLabel: string;
    solarValue: string;
    generatorLabel: string;
    generatorValue: string;
    chartLabel: string;
    checked: string;
  };
  /** Squares worldwide notifications with local control: losing the cloud link
   *  delays sync, never a decision at the site. */
  privacy: { kicker: string; title: string; body: string };
  devices: { kicker: string; title: string; body: string };
  status: { kicker: string; title: string; body: string };
  contact: { title: string; body: string; cta: string };
  faq: { kicker: string; title: string; lede: string; items: readonly FaqItem[] };
  footer: { back: string; backNote: string; tagline: string; licence: string };
  notFound: { title: string; body: string; cta: string };
}

export const COPY: Copy = {
  meta: {
    title: "Origin 89 · off-grid control that keeps working offline",
    description:
      "Origin 89 monitors and controls your off-grid site locally. It keeps working offline, syncs when connected and sends alerts when something needs attention.",
  },

  nav: {
    how: "Overview",
    devices: "Equipment",
    controller: "Controller",
    docs: "Docs",
  },

  banner: "Built at km 43 for places where the grid ends.",

  hero: {
    eyebrow: "Off-grid monitoring and control",
    titleLead: "Your off-grid site",
    titleTail: "runs itself.",
    lede: "Origin 89 monitors the batteries, temperature and 120 V, then runs the site locally. It syncs when a connection is available and tells you when something needs attention.",
    primary: "Tell us about your setup",
    secondary: "Meet Origin 89",
    note: "In active development. The first units will prove every decision in watch-only mode before they control a single relay.",
    badges: ["Keeps running offline", "Cloud sync when connected"],
  },

  phone: {
    lockDate: "Tuesday 20 January",
    lockTime: "13:05",
    appName: "Origin 89",
    siteName: "Lac Perdu",
    notifications: [
      {
        when: "9:32",
        title: "Inverter back on",
        body: "Batteries at 13.1 V. The 120 V is back.",
        metric: "13.1 V",
      },
      {
        when: "9:30",
        title: "Generator stopped",
        body: "Charging finished. It ran for 2 h 10.",
        metric: "2 h 10",
      },
      {
        when: "7:20",
        title: "Generator started",
        body: "120 V confirmed. The batteries are charging.",
        metric: "120 V",
      },
      {
        when: "7:18",
        title: "Inverter cut",
        body: "The 120 V comes back after charging.",
        metric: "120 V off",
      },
      {
        when: "7:15",
        title: "Batteries low",
        body: "11.7 V for fifteen minutes.",
        metric: "11.7 V",
      },
    ],
    state: {
      label: "What it reads",
      socLabel: "State of charge",
      socValue: 78,
      socQuality: "estimated",
      socNote: "estimated · 2 min ago",
      voltageLabel: "Batteries",
      voltageValue: "12.8 V",
      rows: [
        { label: "Fridge", value: "3.8 °C", quality: "counted", note: "2 min ago" },
        { label: "Inside", value: "4.2 °C", quality: "counted", note: "2 min ago" },
        {
          label: "Outside",
          value: "No data",
          quality: "missing",
          note: "no reading since yesterday",
        },
        { label: "Generator", value: "Stopped", quality: "state", note: "" },
      ],
    },
    frost: {
      label: "The frost",
      setpointLabel: "Setpoint",
      setpointValue: "4 °C",
      rows: [
        { label: "Inside", value: "4.2 °C", quality: "counted", note: "2 min ago" },
        { label: "Heater", value: "Off", quality: "state", note: "" },
        {
          label: "Outside probe",
          value: "No data",
          quality: "missing",
          note: "no reading since yesterday",
        },
      ],
    },
    power: {
      label: "Where the watts go",
      source: { kind: "solar", label: "Solar", value: "312 W" },
      branches: [
        { kind: "battery", label: "Into the batteries", value: "+167 W" },
        { kind: "load", label: "Load", value: "145 W" },
      ],
      circuitsLabel: "By circuit",
      circuits: [
        { label: "Fridge", value: "62 W" },
        { label: "House", value: "83 W" },
      ],
      today: { label: "Today", value: "1.4 kWh" },
      best: { label: "Best day this month", value: "2.1 kWh" },
      todayPercent: 67,
    },
    safety: {
      label: "Safety mode",
      status: "Essentials protected",
      summary: "The remaining energy is reserved for the loads that keep the site safe.",
      reasonsLabel: "Why it entered",
      reasons: ["Fuel below reserve", "7 low-solar days", "90 cm snow · next 24 h"],
      loadsLabel: "Load policy",
      loads: [
        { label: "Fridge", value: "Running", state: "protected" },
        { label: "Frost protection", value: "Armed", state: "protected" },
        { label: "House circuits", value: "Off", state: "paused" },
      ],
      syncLabel: "Starlink sync",
      syncWindow: "10 min every 6 h",
      urgentWake: "Camera alert wakes it now",
    },
  },

  meet: {
    kicker: "Meet Origin 89",
    title: "One controller for the whole site.",
    body: "Connect Origin 89 to the batteries, generator, inverter, probes and loads you already own. It monitors them in one place and handles local control without depending on the internet.",
    alt: "The Origin 89 controller: a satin-black wall-mounted enclosure with silver Origin 89 lettering, one green status light, and wired connectors along the bottom and both sides.",
    reveal: {
      open: "See inside",
      close: "Close cover",
      closedLabel: "Built for your site.",
      insideLabel: "Control starts here.",
      closedDescription: "Scroll to lift the cover and explore inside.",
      insideDescription: "Local control and wireless communication, on one board.",
      insideAlt:
        "Inside Origin 89: the circuit board on its mounting plate, with the field connectors and cables gathered into a braided sleeve.",
    },
    specs: [
      {
        label: "3× RS-485",
        detail: "Talks to 200+ catalogued models: EPEver, Renogy, PZEM and more.",
        badge: "multi-drop",
      },
      {
        label: "1× CAN 500k",
        detail: "Reads 80+ catalogued packs and gear: Pylontech, VE.Can, more.",
        badge: "daisy-chain",
      },
      {
        label: "2× VE.Direct",
        detail: "Victron SmartShunt and MPPT plug straight in. No adapters needed.",
        badge: "1 per port",
      },
      {
        label: "1-Wire sensor bus",
        detail: "A string of sensors on one cable, fused and clamped for long runs.",
        badge: "up to 24",
      },
      {
        label: "Sense inputs",
        detail: "4-20 mA tank gauge, start-battery voltage and the panel selector.",
        badge: "3 channels",
      },
      {
        label: "Generator control",
        detail:
          "One generator on a dry contact, through two relays in series and a hardware watchdog.",
        badge: "1 generator",
      },
      {
        label: "Wi-Fi + Bluetooth",
        detail: "Set up from your phone, sync over Wi-Fi. Everything works offline.",
      },
      {
        label: "12 V supply",
        detail: "Reverse-polarity and surge protection right at the connector.",
      },
      {
        label: "24 devices, one box",
        detail: "Every reading carries its quality. A dead probe never reads as zero.",
      },
    ],
    specsNote: "One controller tracks up to 24 live devices across every bus at once.",
  },

  walkthrough: {
    kicker: "How it works",
    title: "The important work happens on site.",
    lede: "Four jobs handled locally, even when nobody is there.",
    steps: [
      {
        key: "generator",
        title: "Your off-grid site, running itself.",
        body: "Origin 89 monitors the batteries, starts the generator, verifies the 120 V and stops it when charging is done. It keeps working without internet and syncs once the connection returns.",
      },
      {
        key: "readings",
        title: "Check in from anywhere.",
        body: "Batteries, room temperature, generator and 120 V appear in one view. A missing sensor is shown as missing instead of displaying a number you cannot trust.",
      },
      {
        key: "frost",
        title: "Keep it above freezing.",
        body: "It keeps the room above the setpoint and switches the heater as needed. If a probe goes silent, Origin 89 reports a fault instead of inventing 0.0 °C.",
      },
      {
        key: "safety",
        title: "When energy runs low, protect what matters.",
        body: "Safety mode keeps the fridge and frost protection running, shuts down non-essential loads and wakes Starlink for ten minutes every six hours. A local camera alert can bring the link up immediately.",
      },
    ],
  },

  acts: [
    {
      key: "alone",
      word: "Resilient.",
      body: "Origin 89 keeps the site running when the connection disappears. It records every event, then syncs and notifies you when the link returns.",
    },
    {
      key: "gear",
      word: "Compatible.",
      body: "Bring solar equipment, heaters, pumps, valves and industrial sensors into one view. Origin 89 works with Modbus, CAN, 4–20 mA, dry contacts and standard sensors across off-grid power, maple operations and mine sites.",
    },
    {
      key: "health",
      word: "Observable.",
      body: "Origin 89 turns battery, temperature, generator and 120 V data into one clear answer. You see what changed, why and whether the site needs you before leaving home.",
    },
    {
      key: "open",
      word: "Open.",
      body: "The source, protocol maps and design decisions will be published under MIT or Apache-2.0, so your site stays yours. If this shop ever disappears, it keeps running.",
    },
  ],
  actLabels: {
    dialects: "models catalogued",
    markets: ["Power systems", "Maple operations", "Mine sites"],
    queue: "Offline queue",
    cloud: "Cloud",
    linkLost: "Link lost",
    source: "Source",
  },
  siteEnergy: {
    label: "Lac Perdu · Today",
    connection: "Live",
    inputLabel: "Energy in",
    inputValue: "2.6 kWh",
    consumptionLabel: "Consumption",
    consumptionValue: "2.1 kWh",
    balanceLabel: "Net",
    balanceValue: "+0.5 kWh",
    solarLabel: "Solar",
    solarValue: "2.0",
    generatorLabel: "Generator",
    generatorValue: "0.6",
    chartLabel: "Power through the day",
    checked: "2 min ago",
  },
  privacy: {
    kicker: "Offline first",
    title: "Remote when connected and local either way.",
    body: "Cloud sync and notifications let you follow the site from anywhere. An outage delays updates, but local control keeps working.",
  },

  devices: {
    kicker: "Equipment compatibility",
    title: "Built around the gear already there.",
    body: "The compatibility catalogue documents more than 1,000 model entries across power, heating, water and industrial systems. Each exact model and safe failure state is qualified before control is enabled.",
  },

  status: {
    kicker: "Now building",
    title: "Protocol maps come before hardware.",
    body: "The controller and cloud service are in development. Before a unit controls a relay, it runs in watch-only mode and records every decision for review.",
  },

  contact: {
    title: "Running an unusual off-grid setup?",
    body: "Tell us what is on the wall, which generator you run and what keeps you driving out there. Every real installation helps us extend the compatibility catalogue.",
    cta: "Tell us about it",
  },

  faq: {
    kicker: "Questions",
    title: "The practical details.",
    lede: "What to know before putting Origin 89 on your wall.",
    items: [
      {
        question: "Does it need the internet to keep the site running?",
        answer:
          "No. Monitoring and control happen at the site. If Starlink or another connection goes down, Origin 89 keeps working and stores events locally, then syncs them when the connection returns.",
      },
      {
        question: "Will it work with the equipment I already have?",
        answer:
          "That is the goal. Origin 89 is built to connect through Modbus, VE.Direct, CAN, dry contacts and ordinary sensors. We review each installation first to confirm the exact models and connections.",
      },
      {
        question: "Can it start and stop my generator automatically?",
        answer:
          "Yes, when the generator has a compatible remote-start interface. Origin 89 watches the batteries, starts the generator, confirms that 120 V is present and stops it when charging is complete.",
      },
      {
        question: "What happens if a sensor stops reporting?",
        answer:
          "A missing reading stays missing. Origin 89 reports the fault instead of replacing it with a believable number, and any decision that needs that reading can refuse to act.",
      },
      {
        question: "Is Origin 89 available now?",
        answer:
          "It is in active development. The first installations will begin in watch-only mode, recording what the controller would do before any control authority is enabled.",
      },
    ],
  },

  footer: {
    back: "Back to the top",
    backNote: "Replay the four-step walkthrough",
    tagline: "Made in Québec for off-grid systems.",
    licence: "MIT OR Apache-2.0",
  },

  notFound: {
    title: "You drove past km 43.",
    body: "This page does not exist.",
    cta: "Back down to km 43",
  },
};
