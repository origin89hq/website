import { SiteJournal } from "../src/react/components/site/SiteJournal";
import { journalAssets } from "../src/react/lib/react-assets";
export default {
  title: "Website/Site journal",
  component: SiteJournal,
  parameters: { reviewLayout: "page" },
  args: { site: "cottage", assets: journalAssets },
  argTypes: {
    assets: { table: { disable: true } },
    onSiteChange: { table: { disable: true } },
    onOpenApp: { table: { disable: true } },
    site: { control: "select", options: ["cottage", "mining", "telecom"] },
  },
};
export const Cottage = {};
export const Mining = { args: { site: "mining" } };
export const Telecom = { args: { site: "telecom" } };
export const Phone = {
  globals: { viewport: { value: "phone", isRotated: false } },
};
