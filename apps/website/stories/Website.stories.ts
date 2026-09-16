import { HomePage } from "../src/react/components/home/HomePage";

export default {
  title: "Website/Homepage",
  component: HomePage,
  parameters: { reviewLayout: "page" },
};
export const Desktop = {};
export const Phone = {
  globals: { viewport: { value: "phone", isRotated: false } },
};
