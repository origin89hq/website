import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";
import "../src/react/styles/base.css";
import "../src/react/styles/buddy-setup.css";
import "./review.css";
import "../src/react/styles/ui.css";
import "../src/react/styles/website.css";
import "../src/react/styles/theme.css";
import "../src/react/styles/chrome.css";
import "../src/react/styles/home.css";

export default {
  initialGlobals: {
    site: "cottage",
    viewport: { value: undefined, isRotated: false },
  },
  globalTypes: {
    site: {
      description: "Site palette",
      toolbar: {
        title: "Site",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "cottage", title: "Cottage · warm" },
          { value: "mining", title: "Mining · industrial" },
          { value: "telecom", title: "Telecom · cold" },
        ],
      },
    },
  },
  decorators: [
    (_Story, context) =>
      createElement(
        "div",
        {
          className: `web-journal buddy-ui sb-theme-frame sb-layout-${context.parameters.reviewLayout || "component"}`,
          "data-active-site": context.args.site || context.globals.site,
        },
        _Story({
          args: {
            ...context.args,
            site: context.args.site || context.globals.site,
          },
        }),
      ),
  ],
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Start here", "Foundations", "Components", "Buddy", "App", "Website"],
      },
    },
    controls: { expanded: true },
    viewport: {
      options: {
        phone: {
          name: "Phone · 390 × 844",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
        smallPhone: {
          name: "Small phone · 320 × 740",
          styles: { width: "320px", height: "740px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet · 768 × 1024",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop · 1440 × 1000",
          styles: { width: "1440px", height: "1000px" },
          type: "desktop",
        },
      },
    },
    a11y: { test: "todo" },
  },
} satisfies Preview;
