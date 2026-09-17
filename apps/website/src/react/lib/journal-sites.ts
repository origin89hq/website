export type JournalSite = "cottage" | "mining" | "telecom";

export const journalSites = [
  {
    id: "cottage",
    label: "Cottages",
    exampleTitle: ["Solar, batteries", "and backup power."],
    exampleBody:
      "Follow the cottage’s energy, switch supported circuits and check the camera. Local rules handle the routines.",
    assistantTitle: "A forecast you can question.",
    assistantBody:
      "We’re building Buddy to combine equipment specifications with site readings, estimate what comes next and show the assumptions. Try the battery forecast: add a load, then inspect the inputs behind the answer.",
    index: "01",
    setting: "COTTAGES / QUÉBEC",
    alt: "A modest timber cottage and small solar array in Québec woodland",
    caption: "Cottage, solar array and equipment added over the years.",
    lead: "Solar from one brand, batteries from another and a generator that’s been there for years.",
    body: "We’re building Origin89 to bring those readings into one app, with the control rules running at your site.",
    note: "Controller and app in development.",
    equipment: ["Solar & batteries", "Generators & loads", "Water & temperature"],
    appTitle: ["You don’t need to be", "a solar expert."],
    appBody:
      "Buddy helps you understand what your equipment is telling you, when to use more of your solar power, and what needs a little care.",
    proofTitle: "An answer with the readings behind it.",
    proof:
      "See how much solar is coming in, what the cottage is using and whether the battery is charging.",
    sceneLabel: "AN AFTERNOON AT LAC DES PINS",
  },
  {
    id: "mining",
    label: "Mining sites",
    exampleTitle: ["Power and utilities", "across the site."],
    exampleBody:
      "Bring power, fuel, pumps and cameras together, with local rules and supported switches for the site utilities.",
    assistantTitle: "An alarm with the evidence.",
    assistantBody:
      "Buddy will bring the relevant readings, equipment limits and service guidance together, so the crew can trace an alarm and decide what to check next.",
    index: "02",
    setting: "MINING / REMOTE UTILITIES",
    alt: "A generator shelter and industrial pump station beside a remote Canadian mine",
    caption: "Power, fuel and pumping equipment at a remote mine.",
    lead: "Generators, pumps, fuel tanks and sensors, spread across a working site.",
    body: "Bring supported site utilities into one view and see which readings need attention before the next service visit.",
    note: "Controller and app in development.",
    equipment: ["Site power & fuel", "Pumps & tank levels", "Sensors & alarms"],
    appTitle: ["Know what needs", "a closer look."],
    appBody:
      "Buddy brings the relevant readings together, explains what triggered an alarm and helps the crew find the next check in the site procedure.",
    proofTitle: "An alarm with context.",
    proof:
      "See the reported level, the age of the reading and the equipment involved before planning the next step.",
    sceneLabel: "NORTH PIT / UTILITIES CHECK",
  },
  {
    id: "telecom",
    label: "Remote telecom",
    exampleTitle: ["Backup power", "between visits."],
    exampleBody:
      "Check backup power, shelter conditions and cameras. See which updates are missing before using a remote control.",
    assistantTitle: "Know when the data runs out.",
    assistantBody:
      "Buddy will use reading history and equipment specifications to help plan visits. When updates stop, it needs to show what is unknown before making a forecast.",
    index: "03",
    setting: "TELECOM / NUNAVUT",
    alt: "A container-based telecom shelter and communications mast on snowy, treeless Nunavut tundra",
    caption: "A telecom shelter and backup power on the tundra.",
    lead: "A telecom shelter in Nunavut, with backup power, batteries and temperature sensors from different makers.",
    body: "See the last reported conditions and when data stopped arriving, then plan the next check.",
    note: "Controller and app in development.",
    equipment: ["Backup power & batteries", "Shelter temperature", "Connection & alarms"],
    appTitle: ["Know what’s current.", "Know what isn’t."],
    appBody:
      "Buddy makes missing updates visible. The last battery or shelter reading stays useful, with its age attached and the current condition marked unknown.",
    proofTitle: "Last update, with a timestamp.",
    proof:
      "An old reading should never look like a fresh all-clear. Check the link and the local equipment using your site procedure.",
    sceneLabel: "TUNDRA RELAY / NUNAVUT",
  },
] as const;
