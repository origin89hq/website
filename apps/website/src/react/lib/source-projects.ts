import { siteConfig } from "./site-config";

// Describe published source, not product readiness. Keep licence scope explicit:
// KM43's code licence does not cover the draft specification.
export const sourceProjects = [
  {
    id: "km43",
    name: "KM43",
    category: "PROTOCOL",
    repository: siteConfig.repositories.km43,
    summary: "How a controller talks to its clients, across UART, USB, BLE and the network.",
    contents:
      "A no_std Rust crate, TypeScript bindings and test vectors alongside the draft specification.",
    format: "Rust / TypeScript",
    license: "Code: MIT OR Apache-2.0",
    links: [
      ["Rust crate", `${siteConfig.repositories.km43}/tree/main/crates/km43`],
      ["Test vectors", `${siteConfig.repositories.km43}/tree/main/docs/protocol/vectors`],
      ["Documentation", siteConfig.protocol],
    ],
  },
  {
    id: "data",
    name: "Equipment data",
    category: "DATASET",
    repository: siteConfig.repositories.data,
    summary: "Equipment specifications and register maps, with sources you can check.",
    contents:
      "Models, ratings and protocol dialects for batteries, inverters, charge controllers and more.",
    format: "Parquet / CSV / JSON",
    license: "MIT",
    links: [
      ["Browse the data", siteConfig.data],
      ["Download index", `${siteConfig.data}/manifest.json`],
      ["Source records", `${siteConfig.repositories.data}/tree/main/records`],
    ],
  },
  {
    id: "hardware",
    name: "Controller hardware",
    category: "ELECTRONICS & CAD",
    repository: siteConfig.repositories.hardware,
    summary:
      "The controller board, separate generator board and enclosure, down to the editable files.",
    contents:
      "EasyEDA projects, Gerbers, bills of materials and FreeCAD enclosure source. Prototype boards; validation is ongoing.",
    format: "EasyEDA / FreeCAD",
    license: "Designs: CERN-OHL-W-2.0",
    links: [
      ["Controller board", `${siteConfig.repositories.hardware}/tree/main/boards/controller-a`],
      ["Generator board", `${siteConfig.repositories.hardware}/tree/main/boards/generator-b`],
      ["Enclosure", `${siteConfig.repositories.hardware}/tree/main/enclosure`],
    ],
  },
] as const;
