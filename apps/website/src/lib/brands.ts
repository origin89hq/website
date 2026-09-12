/// The gear the controller talks to, in one place. Two sections draw this list —
/// the compatibility wall and the scroll act about protocols — and when it lived
/// in the wall alone the act had its own copy, which is two lists free to
/// disagree about which brands we claim to read.

export interface Brand {
  key: string;
  name: string;
  /** What the controller actually talks to it over. */
  bus: string;
}

/// Manufacturer logos, keyed by `Brand.key`. Drop `epever.svg` into
/// `src/assets/logos/` and both the compatibility wall and the scroll act start
/// drawing it; anything missing falls back to the name set in type, so neither
/// is ever half-broken while the files are still being collected.
///
/// The glob asks for `?url` on purpose: a bare SVG import in Astro resolves to a
/// component, not a path, and the two cannot be used interchangeably here.
const FILES = import.meta.glob("../assets/logos/*.{svg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export const LOGOS: Record<string, string> = Object.fromEntries(
  Object.entries(FILES).map(([path, url]) => [
    path
      .split("/")
      .pop()
      ?.replace(/\.(svg|png|webp)$/, "") ?? path,
    url,
  ]),
);

export const BRANDS: readonly Brand[] = [
  { key: "epever", name: "EPEver", bus: "RS-485" },
  { key: "victron", name: "Victron", bus: "VE.Direct" },
  { key: "renogy", name: "Renogy", bus: "RS-485" },
  { key: "pylontech", name: "Pylontech", bus: "CAN" },
  { key: "pzem", name: "PZEM", bus: "RS-485" },
  { key: "midnite", name: "MidNite Solar", bus: "analogue" },
  { key: "volthium", name: "Volthium", bus: "CAN" },
  { key: "honda", name: "Honda", bus: "contact" },
  { key: "firman", name: "FIRMAN", bus: "contact" },
  { key: "champion", name: "Champion", bus: "contact" },
];

/// Industrial equipment families that use the same protocol and field-I/O
/// building blocks. Keeping these beside the established power brands makes a
/// new manufacturer one data row plus its logo, rather than another hand-drawn
/// branch in the compatibility graphic.
///
/// These are integration families, not a blanket claim that every model from a
/// manufacturer has the same interface. Commissioning still starts by
/// qualifying the exact model, voltage, signal and safe failure state.
export const INDUSTRIAL_BRANDS: readonly Brand[] = [
  { key: "schneider", name: "Schneider Electric", bus: "contact / Modbus" },
  { key: "danfoss", name: "Danfoss", bus: "Modbus / field I/O" },
  { key: "endress", name: "Endress+Hauser", bus: "4–20 mA / Modbus" },
  { key: "burkert", name: "Bürkert", bus: "4–20 mA / Modbus" },
];

/// A conservative public-facing floor for the catalogue's model coverage. The
/// catalogue currently has more than a thousand model rows, some of which name
/// an entire series. This is deliberately not called a support count: a model
/// can be researched before its driver is shipped.
export const CATALOGUED_MODELS = 1000;
