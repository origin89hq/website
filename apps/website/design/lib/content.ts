export const directions = ["field-guide", "instrument"] as const;
export type Direction = (typeof directions)[number];
export const pages = [
  "",
  "products",
  "products/controller",
  "products/offgrid",
  "products/buddy",
  "solutions",
  "solutions/cottages",
  "solutions/maple",
  "solutions/field",
  "compatibility",
  "developers",
  "about",
  "contact",
];
export const href = (direction: Direction, page = "") => `/${direction}/${page ? `${page}/` : ""}`;

export const products = [
  {
    slug: "controller",
    name: "Controller",
    type: "Hardware at your site",
    number: "01",
    headline: "Control belongs where your equipment lives.",
    description:
      "The hardware that brings your equipment together and runs your configured rules at the site.",
    short: "Local control. A physical foundation.",
    art: "controller",
    details: [
      [
        "Keep decisions at the site",
        "Monitoring, schedules and configured rules belong on the Controller. A phone or internet connection is a way to reach it.",
      ],
      [
        "Bring different equipment together",
        "Connect through familiar field interfaces, with the exact equipment and installation reviewed before use.",
      ],
      [
        "Understand what happened",
        "Readings, their freshness and a record of decisions give you something concrete to investigate.",
      ],
    ],
    specs: [
      ["Field interfaces", "RS-485 / Modbus, CAN, VE.Direct, 1-Wire"],
      ["Site I/O", "Dry contacts and sensor inputs"],
      ["Control model", "Configured local rules and schedules"],
      ["Product stage", "In development; installation details to be confirmed"],
    ],
  },
  {
    slug: "offgrid",
    name: "Offgrid",
    type: "The app for your site",
    number: "02",
    headline: "Your whole site. A view that makes sense.",
    description:
      "Bring power, temperature and equipment into a view you can make your own. See what changed and what needs a closer look.",
    short: "One view. Made for your setup.",
    art: "icon",
    details: [
      [
        "Start with what matters to you",
        "Arrange your site around the equipment you actually have, from a battery bank to a pump or temperature probe.",
      ],
      [
        "Know how fresh a reading is",
        "A value without a timestamp is only part of the picture. Missing readings remain visibly missing.",
      ],
      [
        "Follow the story of your site",
        "Move from an overview to equipment details and recent events without losing the context of the site.",
      ],
    ],
    specs: [
      ["Designed for", "Site overview, equipment details and event history"],
      ["Works with", "Origin89 Controller"],
      ["Assistance", "Buddy beside the task"],
      ["Product stage", "App experience in development"],
    ],
  },
  {
    slug: "buddy",
    name: "Buddy",
    type: "Help in the app and docs",
    number: "03",
    headline: "A little help. A clearer next step.",
    description:
      "A familiar helper for unfamiliar readings. Buddy helps explain what you are seeing and work through the next check.",
    short: "Useful answers. Your decisions.",
    art: "buddy",
    details: [
      [
        "Explain a reading",
        "Start with the observation and its timestamp. Buddy helps put the information in context.",
      ],
      [
        "Work through a check",
        "Follow a practical sequence when a probe stops reporting or a number needs investigation.",
      ],
      [
        "Keep the decision yours",
        "A suggestion is presented as a suggestion. It is separate from a confirmed setting or equipment action.",
      ],
    ],
    specs: [
      ["Where Buddy belongs", "Origin89 Offgrid and documentation"],
      ["Role", "Explanation, guidance and proposed next steps"],
      ["Control", "The user decides; the Controller runs configured rules"],
      ["Product stage", "Assistant experience in development"],
    ],
  },
] as const;

export const solutions = [
  {
    slug: "cottages",
    name: "Cottages & off-grid",
    number: "01",
    tag: "A place you care about",
    headline: "Less wondering how the cottage is doing.",
    description:
      "Batteries, heat and backup power each tell part of the story. Bring them together so your next visit starts with a clearer picture.",
    equipment: [
      "Solar & batteries",
      "Backup generator",
      "Heating & temperature",
      "Water & tank levels",
    ],
    tasks: [
      [
        "See the available energy",
        "Bring battery readings and solar production into the same view, with their update times.",
      ],
      [
        "Keep an eye on the cold",
        "Follow temperature readings and review the frost rules configured for the site.",
      ],
      [
        "Understand backup power",
        "Distinguish a request to run the generator from a measurement confirming that it is running.",
      ],
    ],
  },
  {
    slug: "maple",
    name: "Maple operations",
    number: "02",
    tag: "Built around the season",
    headline: "A clearer view of a busy sugarbush.",
    description:
      "Follow the pumps, tanks and readings that matter during the run. Start with the equipment already in your operation.",
    equipment: ["Pumps & motors", "Tank levels", "Temperature probes", "Field power"],
    tasks: [
      [
        "Bring scattered readings together",
        "Review the sensors and meters available at the pump station and sugarhouse.",
      ],
      [
        "See which reading needs a check",
        "Keep a stale tank or temperature reading visibly distinct from a current measurement.",
      ],
      [
        "Build around your operation",
        "Map the exact equipment, communication interfaces and desired tasks before proposing a setup.",
      ],
    ],
  },
  {
    slug: "field",
    name: "Field & industrial",
    number: "03",
    tag: "Equipment you depend on",
    headline: "Know what is happening out there.",
    description:
      "For remote buildings, mine-site utilities and field equipment: bring useful readings into view and put site rules close to the equipment.",
    equipment: ["Pumps & valves", "4–20 mA sensors", "Modbus equipment", "Remote power"],
    tasks: [
      [
        "Start at the interface",
        "Identify the exact model, signal and available measurements for each piece of equipment.",
      ],
      [
        "Keep useful context",
        "Show units, timestamps and missing data alongside measurements, so a number has a clear meaning.",
      ],
      [
        "Scope the installation together",
        "Define the monitoring and control tasks, site constraints and existing equipment protections before choosing a configuration.",
      ],
    ],
  },
] as const;

export const faqs = [
  [
    "Can I buy Origin89 today?",
    "Origin89 is in active development. Tell us about your site to discuss its fit. Pricing, shipping dates and platform availability are not announced in this draft.",
  ],
  [
    "Does local control need the internet?",
    "The Controller is designed to run configured rules at the site without depending on a phone or cloud connection. Remote access and synchronization depend on connectivity.",
  ],
  [
    "Will it work with my equipment?",
    "The exact model, firmware, interface and intended task matter. Share that information so we can review the setup. A catalogue entry is research, not a guarantee of support.",
  ],
  [
    "Does Buddy operate my equipment?",
    "Buddy is an assistant for explanations and proposed next steps. A suggestion is separate from an applied configuration or a confirmed action.",
  ],
] as const;
