import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

export default {
  stories: ["../design/**/*.stories.@(ts|tsx)"],
  framework: "@storybook/react-vite",
  staticDirs: ["../public"],
  addons: ["@storybook/addon-a11y"],
  core: { disableTelemetry: true },
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins || []), tailwindcss()];
    const aliases = config.resolve?.alias || [];
    config.resolve = {
      ...config.resolve,
      dedupe: ["react", "react-dom"],
      alias: [
        ...(Array.isArray(aliases)
          ? aliases
          : Object.entries(aliases).map(([find, replacement]) => ({
              find,
              replacement,
            }))),
        {
          find: "@",
          replacement: fileURLToPath(new URL("../src/react", import.meta.url)),
        },
      ],
    };
    config.server = {
      ...config.server,
      fs: { allow: [fileURLToPath(new URL("../../..", import.meta.url))] },
    };
    return config;
  },
};
