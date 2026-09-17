import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { blogPostsPlugin } from "./scripts/blog-posts.mjs";

const absolute = (path) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: absolute("./src/react/"),
  publicDir: absolute("./public/"),
  plugins: [blogPostsPlugin(), react(), tailwindcss()],
  resolve: {
    alias: { "@": absolute("./src/react") },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: absolute("./dist/"),
    emptyOutDir: true,
    assetsDir: "assets",
    target: "es2022",
  },
  server: {
    host: "127.0.0.1",
    port: 4321,
    fs: { allow: [absolute("../..")] },
    proxy: { "/api/buddy": { target: "http://127.0.0.1:8790" } },
  },
});
