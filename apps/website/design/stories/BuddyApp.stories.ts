import { BuddyApp } from "../../src/react/components/site/BuddyApp";
import { journalAssets } from "../../src/react/lib/react-assets";
export default {
  title: "App/Offgrid",
  component: BuddyApp,
  args: { site: "cottage", scene: "overview", buddyUrl: journalAssets.buddy },
  argTypes: {
    site: { control: "select", options: ["cottage", "mining", "telecom"] },
    scene: { control: "select", options: ["overview", "energy", "control", "care"] },
    buddyUrl: { table: { disable: true } },
  },
  parameters: { reviewLayout: "app" },
};
export const Cottage = {};
export const SolarTiming = { args: { scene: "energy" } };
export const BatteryCare = { args: { scene: "care" } };
export const Mining = { args: { site: "mining" } };
export const MiningUtilities = { args: { site: "mining", scene: "energy" } };
export const Telecom = { args: { site: "telecom" } };
export const TelecomLastKnown = { args: { site: "telecom", scene: "energy" } };

export const Controls = { args: { scene: "control" } };
