import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// A separate build keeps unapproved design work out of the production website.
export default defineConfig({
  srcDir: "./design",
  publicDir: "./design/public",
  outDir: "./design-dist",
  cacheDir: "./node_modules/.astro-design",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
  server: { host: "127.0.0.1", port: 4322 },
});
