// @ts-check

import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// Fonts are downloaded at build time and served from our own origin. A static
// site on Workers should not need a second host up before a headline has a
// typeface.
export default defineConfig({
  site: "https://origin89.com",

  redirects: {
    "/en": "/",
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter Tight",
      cssVariable: "--font-inter-tight",
      weights: [400, 500, 600],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Michroma",
      cssVariable: "--font-michroma",
      weights: [400],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-plex-mono",
      weights: [400, 500],
      subsets: ["latin"],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});
