import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
  root: fileURLToPath(new URL("./design/react", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src/react", import.meta.url)) },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: fileURLToPath(new URL("./design-react-dist", import.meta.url)),
    emptyOutDir: true,
    assetsDir: "_react",
  },
  server: {
    host: "127.0.0.1",
    port: 4324,
    fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] },
  },
});
