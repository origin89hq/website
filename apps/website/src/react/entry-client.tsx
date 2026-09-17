import { RouterProvider } from "@tanstack/react-router";
import { RouterClient } from "@tanstack/react-router/ssr/client";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";
import "./styles/base.css";
import "./styles/buddy-setup.css";
import "./styles/ui.css";
import "./styles/typography.css";
import "./styles/website.css";
import "./styles/theme.css";
import "./styles/chrome.css";
import "./styles/home.css";

const router = createRouter();
const root = document.getElementById("root")!;
// Static pages contain the default view. Query-driven previews start with their requested state.
if (root.children.length && !window.location.search)
  hydrateRoot(root, <RouterClient router={router} />);
else {
  await router.load();
  createRoot(root).render(<RouterProvider router={router} />);
}
