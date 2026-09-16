import { Foundations } from "./Foundations";
export default {
  title: "Foundations/Web theme",
  component: Foundations,
  parameters: { renderer: "react", reviewLayout: "page" },
  args: { section: "palette" },
  argTypes: { section: { table: { disable: true } } },
};
export const Colour = {};
export const Typography = { args: { section: "type" } };
export const Spacing = { args: { section: "spacing" } };
