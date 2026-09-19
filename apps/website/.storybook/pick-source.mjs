/**
 * Which file a responsive image should be photographed showing.
 *
 * A `srcset` is a set of permissions rather than an instruction. Asked for 108 pixels with a 192w
 * and a 384w on offer, Chromium took the 192 on some runs and the 384 on others, and the two
 * downscale to slightly different pixels — which is the whole of what used to move between two
 * runs of one build. The browser is entitled to either; a screenshot comparison is not.
 *
 * The rule here is the one the selection algorithm states: the narrowest candidate that still
 * covers the drawn width. Density descriptors are left alone, because an `x` candidate is chosen
 * by the device pixel ratio, which the run already pins.
 *
 * @param {string | null | undefined} srcset the attribute, in any shape a page might carry
 * @param {number} wanted drawn width in device pixels — CSS width times the pixel ratio
 * @returns {string | null} the URL to pin, or null when there is nothing to choose between
 */
export function pickSource(srcset, wanted) {
  if (typeof srcset !== "string") return null;
  const candidates = srcset
    .split(",")
    .map((part) => part.trim().split(/\s+/))
    .filter(([url, width]) => url && /^\d+w$/.test(width ?? ""))
    .map(([url, width]) => ({ url, width: Number.parseInt(width, 10) }))
    .filter(({ width }) => Number.isFinite(width) && width > 0)
    .sort((a, b) => a.width - b.width);
  if (!candidates.length) return null;
  if (!Number.isFinite(wanted) || wanted <= 0) return candidates.at(-1).url;
  return (candidates.find((candidate) => candidate.width >= wanted) ?? candidates.at(-1)).url;
}
