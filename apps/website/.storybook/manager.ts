import logo from "@origin89/brand/logos/origin89-horizontal-blue.svg?url";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Origin89 / Design system",
    brandImage: logo,
    colorPrimary: "#2b4a97",
    colorSecondary: "#2b4a97",
    appBg: "#f5f6f3",
    appContentBg: "#fff",
    appBorderColor: "#d4dcd5",
    textColor: "#27372d",
    barTextColor: "#647366",
    barSelectedColor: "#2b4a97",
  }),
  sidebar: { showRoots: true },
});
