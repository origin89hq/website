import { mkdir } from "node:fs/promises";
import sharp from "sharp";

// The design guide's hero. Every other image it shows is a committed webp under
// src/assets/art, because its source is not in @origin89/brand.
const output = new URL("../generated/", import.meta.url);
const pkg = new URL("../../node_modules/@origin89/brand/", import.meta.url);
await mkdir(output, { recursive: true });
await sharp(new URL("art/portrait-welcoming-transparent.webp", pkg).pathname)
  .resize({ width: 840, withoutEnlargement: true })
  .webp({ quality: 88, alphaQuality: 100, effort: 6 })
  .toFile(new URL("buddy-hero.webp", output).pathname);
