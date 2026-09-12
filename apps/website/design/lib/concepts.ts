// Already 1536 px webp in the repository, so there is nothing left to resize:
// the originals are 8.8 MB of PNG and live with the brand sources.
import cottage from "../../src/assets/art/cottage.webp?url";
import mining from "../../src/assets/art/mining.webp?url";
import telecom from "../../src/assets/art/telecom.webp?url";
import buddy from "../../src/react/generated/buddy.webp?url";

export { art } from "./assets";

export const conceptArt = { cottage, buddy, mining, telecom };
export const directions = [
  {
    id: "journal",
    letter: "A",
    title: "Site journal",
    angle: "Adapts to the place you look after.",
    description:
      "Cozy cottages, remote mining and Arctic telecom. The same editorial approach adapts its mood, content and app to each site.",
    scene: "overview",
  },
  {
    id: "desk",
    letter: "B",
    title: "Equipment desk",
    angle: "Start with what people already own.",
    description:
      "A practical equipment list, precise typography and a helpful Buddy. Compatibility becomes something you can explore.",
    scene: "energy",
  },
  {
    id: "assembly",
    letter: "C",
    title: "Open assembly",
    angle: "Start with a system people can own.",
    description:
      "Bold blue, exposed hardware and a technical publication feel. An open stack, explained through useful everyday tools.",
    scene: "care",
  },
] as const;
