import { journalAssets } from "../src/react/lib/react-assets";

const { buddy, plate } = journalAssets;

import { SetupMap } from "../src/react/components/buddy/SetupMap";
import { emptySetup } from "../src/react/components/buddy/setup-model";
export default {
  title: "Buddy/Equipment map",
  component: SetupMap,
  parameters: { renderer: "react", reviewLayout: "map" },
  args: { state: emptySetup, buddyUrl: buddy, plateUrl: plate },
  argTypes: {
    buddyUrl: { table: { disable: true } },
    plateUrl: { table: { disable: true } },
    state: { control: "object" },
  },
};
export const TakingShape = {};
export const IdentifiedController = {
  args: {
    state: {
      ...emptySetup,
      stage: "done",
      controller: "Tracer 10415AN",
      port: "Display / logger",
      panelCount: "6",
      panel: "Not sure",
      battery: "Not sure",
      arrangement: "Not sure",
      example: true,
    },
  },
};
export const UnknownModel = {
  args: { state: { ...emptySetup, stage: "port", controller: "EPEVER 100 A" } },
};
export const PumpSite = {
  args: {
    state: {
      ...emptySetup,
      kind: "pump",
      stage: "done",
      controller: "Pump label to confirm",
      battery: "No batteries",
    },
  },
};
