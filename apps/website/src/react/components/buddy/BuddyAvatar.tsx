import type { ImgHTMLAttributes } from "react";
import defaultBuddy from "../../generated/buddy.webp?url";
import { buddyAvatars } from "../../generated/buddy-avatars";

export type BuddyExpression = keyof typeof buddyAvatars;
export interface BuddyAvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height" | "srcSet" | "sizes"> {
  size?: number;
  /** Match the rendered CSS width when a layout changes size at breakpoints. */
  sizes?: string;
  expression?: BuddyExpression;
  framing?: "auto" | "avatar" | "scene" | "portrait";
  shape?: "auto" | "circle" | "rounded";
}

/** Front-facing circular avatars and wider portraits from the same native character. */
export function BuddyAvatar({
  size = 48,
  sizes = `${size}px`,
  expression = "welcoming",
  framing = "auto",
  shape = "auto",
  src,
  alt = "Buddy",
  decoding = "async",
  style,
  ...props
}: BuddyAvatarProps) {
  const crop = framing === "auto" ? (size <= 96 ? "avatar" : "portrait") : framing;
  const circular = shape === "circle" || (shape === "auto" && crop === "avatar");
  const variants = buddyAvatars[expression][crop];
  const shared = !src || src === defaultBuddy;
  const fallback =
    variants.find((variant) => variant.width >= size) ?? variants[variants.length - 1];
  return (
    <img
      {...props}
      src={shared ? fallback.src : src}
      srcSet={
        shared
          ? variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ")
          : undefined
      }
      sizes={shared ? sizes : undefined}
      width={size}
      height={size}
      alt={alt}
      decoding={decoding}
      style={{
        objectFit: "contain",
        ...(shared ? { aspectRatio: "1", height: "auto" } : {}),
        borderRadius: circular
          ? "50%"
          : shape === "rounded" || crop === "scene"
            ? Math.min(size * 0.08, 20)
            : 0,
        background: "transparent",
        ...style,
      }}
      data-buddy-avatar={shared ? expression : "custom"}
      data-buddy-framing={shared ? crop : "custom"}
      data-buddy-rendering={shared ? "3d" : "custom"}
    />
  );
}
