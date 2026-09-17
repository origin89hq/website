export const products = [
  {
    id: "controller",
    name: "Origin89 Controller",
    role: "AT YOUR SITE",
    title: "Your rules run at the site.",
    summary:
      "Runs your rules at the site. Designed for low power use, straight from a 12 V battery bank.",
    intro:
      "Connect equipment from different makers to one controller mounted beside it. The Controller is designed to run on little power, straight from a 12 V battery bank.",
    features: [
      [
        "Start with the exact model.",
        "A make, model and interface tell us what can be read and which actions need an integration. Keep the equipment worth keeping.",
      ],
      [
        "Keep control local.",
        "The rules you configure run on the Controller at the site. Opening the app or asking Buddy a question does not operate equipment.",
      ],
      [
        "Low power, straight from the bank.",
        "Designed to use little power and run directly from a compatible 12 V battery bank. You don’t need an inverter to power the Controller. We’ll publish final input limits and measured consumption after hardware validation.",
      ],
      [
        "Work from the source files.",
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
      "Check the battery before the weekend or a pump alarm before the service trip. Every reading shows its source and age.",
    features: [
      [
        "Arrange the view around your site.",
        "Watch solar and temperature at a cottage, fuel and pumps at a mine, or backup power and connection status at a relay.",
      ],
      [
        "Know what’s current.",
        "A last-known reading keeps its timestamp. If updates stop, the app shows the gap. Missing data never becomes a zero or a fresh all-clear.",
      ],
      [
        "Ask Buddy about a reading.",
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
        "Buddy asks one short question at a time to identify the equipment, confirm the label and map the installation.",
      ],
      [
        "Show what an estimate needs.",
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
