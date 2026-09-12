import { Foundations } from "./Foundations";
export default {
  title: "Foundations/Site journal",
  component: Foundations,
  parameters: { renderer: "react", reviewLayout: "page" },
  args: { section: "palette" },
  argTypes: { section: { table: { disable: true } } },
};
export const Cottage = { globals: { site: "cottage" } };
export const Mining = { globals: { site: "mining" } };
export const Telecom = { globals: { site: "telecom" } };
export const Typography = { args: { section: "type" } };
export const Spacing = { args: { section: "spacing" } };
