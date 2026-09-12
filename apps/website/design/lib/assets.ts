import mono from "@origin89/brand/fonts/IBMPlexMono-Regular.ttf?url";
import inter from "@origin89/brand/fonts/InterTight-Variable.ttf?url";
import logoBlue from "@origin89/brand/logos/origin89-horizontal-blue.svg?url";
import logoWhite from "@origin89/brand/logos/origin89-horizontal-white.svg?url";
import plate from "@origin89/brand/logos/plate-89-blue.svg?url";
import icon from "../../src/assets/art/icon.webp?url";
import reserve from "../../src/assets/art/reserve.webp?url";
import board from "../../src/assets/product/controller-reveal-base-1200.webp";
import controller from "../../src/assets/product/controller-reveal-closed-1200.webp";
import forest from "../../src/assets/spruce-source.jpg";
// The Blender renders behind these are not in this repository; the webps are
// committed and rebuilt by design/react/prepare-assets.mjs where they are.
import buddy from "../generated/buddy-hero.webp?url";

export const art = {
  logoBlue,
  logoWhite,
  plate,
  inter,
  mono,
  buddy,
  icon,
  reserve,
  controller: controller.src,
  board: board.src,
  forest: forest.src,
};
