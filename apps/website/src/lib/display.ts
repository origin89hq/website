import type { PowerKind, Quality } from "../i18n/copy";

/// Absence gets a hollow ring. Colouring a dead probe red would say something is
/// wrong with the installation; the installation is fine, the controller simply
/// does not know the outdoor temperature and says so rather than inventing
/// 0,0 °C. Shared so the three screens that show readings cannot drift apart.
export const QUALITY_DOT: Record<Quality, string> = {
  counted: "bg-info",
  estimated: "bg-warning",
  missing: "border border-white/40",
  state: "hidden",
};

/// Ember is what the sun and the heat make, frost blue is what the batteries
/// hold, white is what the site spends.
export const POWER_ACCENT: Record<PowerKind, { stroke: string; text: string; fill: string }> = {
  solar: { stroke: "stroke-warning", text: "text-warning", fill: "bg-warning/12" },
  battery: { stroke: "stroke-info", text: "text-info", fill: "bg-info/12" },
  load: { stroke: "stroke-white/70", text: "text-white", fill: "bg-white/8" },
};
