export const products = [
  {
    id: "controller",
    name: "Origin89 Controller",
    role: "AT YOUR SITE",
    title: "Control stays with your site.",
    summary: "Local control, designed for low power use and a direct 12 V battery-bank supply.",
    intro:
      "Bring mixed equipment into one system. Designed for low power use and direct 12 V battery power, with control beside the equipment.",
    features: [
      [
        "Start with the exact model.",
        "A make, model and interface tell us what can be read and which actions need an integration. Keep the equipment worth keeping.",
      ],
      [
        "Give control a local foundation.",
        "Configured decisions run at the site. Opening an app and asking Buddy a question are separate from operating equipment.",
      ],
      [
        "Low power. Straight from the bank.",
        "Designed for low power consumption and direct power from a compatible 12 V battery bank. No inverter is needed just to power the Controller. Final input limits and measured consumption will be published after hardware validation.",
      ],
      [
        "Make the system maintainable.",
        "The public hardware repository includes editable board projects, fabrication exports and enclosure CAD. Review the files and prototype status before adapting a design.",
      ],
    ],
  },
  {
    id: "offgrid",
    name: "Origin89 Offgrid",
    role: "IN YOUR HAND",
    title: "Check your site from the app.",
    summary: "Battery levels, temperatures, alarms and the age of each reading.",
    intro:
      "Check the battery before the weekend. Look at a pump alarm before the service trip. Keep the source and age beside every reading.",
    features: [
      [
        "Put your priorities first.",
        "Solar and temperature at a cottage. Fuel and pumps at a mine. Backup power and connection status at a relay. Shape the view around the work.",
      ],
      [
        "Know what’s current.",
        "A last-known reading keeps its timestamp. If updates stop, the app makes the gap visible. Missing data never becomes a zero or a fresh all-clear.",
      ],
      [
        "Understand the next step.",
        "Buddy explains what a reading means, asks for the missing context and helps you review a proposed check.",
      ],
    ],
  },
  {
    id: "buddy",
    name: "Buddy",
    role: "BESIDE THE TASK",
    title: "A little help with the technical parts.",
    summary: "Identify equipment from a label and ask questions about the specifications.",
    intro:
      "You shouldn’t need to become a solar expert to understand your cottage. Start with a photo, a model number or a question.",
    features: [
      [
        "Start a conversation.",
        "One short question at a time. Identify the equipment, confirm the label and build a useful picture of the installation.",
      ],
      [
        "Explain the useful part.",
        "A battery percentage needs capacity, load and freshness before it can become a runtime estimate. Buddy should explain both the reading and what’s missing.",
      ],
      [
        "Keep advice specific.",
        "A flooded battery and a sealed battery need different care. Confirm the chemistry and exact model before opening the manufacturer’s instructions.",
      ],
    ],
  },
] as const;
export type ProductId = (typeof products)[number]["id"];
