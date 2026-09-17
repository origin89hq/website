import type { ReactNode, SVGProps } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Icon({
  children,
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" {...stroke} strokeWidth={1.6} />
    </svg>
  );
}

export function MarkIcon({ kind }: { kind: "yes" | "no" | "part" }) {
  const color =
    kind === "yes" ? "var(--o89-fg)" : kind === "part" ? "var(--o89-warning)" : "var(--o89-faint)";
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style={{ color }}>
      <circle cx="10" cy="10" r="8.5" {...stroke} strokeWidth={1.4} />
      {kind === "yes" && <path d="M6.2 10.3l2.5 2.5 5.1-5.4" {...stroke} strokeWidth={1.7} />}
      {kind === "part" && <path d="M6.5 10h7" {...stroke} strokeWidth={1.7} />}
      {kind === "no" && <path d="M7 7l6 6M13 7l-6 6" {...stroke} strokeWidth={1.6} />}
    </svg>
  );
}

export const SpecIcons = {
  chip: (
    <Icon>
      <g {...stroke}>
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
        <rect x="9.5" y="9.5" width="5" height="5" rx=".5" />
        <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" />
      </g>
    </Icon>
  ),
  bus: (
    <Icon>
      <g {...stroke}>
        <path d="M3 8h18M3 16h18" />
        <rect x="5" y="5" width="4" height="6" rx="1" />
        <rect x="15" y="13" width="4" height="6" rx="1" />
        <path d="M7 11v5M17 8v5" />
      </g>
    </Icon>
  ),
  temp: (
    <Icon>
      <g {...stroke}>
        <path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z" />
        <path d="M12 9v7M17 6h3M17 9h2" />
      </g>
    </Icon>
  ),
  power: (
    <Icon>
      <g {...stroke}>
        <rect x="3" y="7" width="16" height="11" rx="2" />
        <path d="M19 11h2v3h-2M7 12.5h3M8.5 11v3M13 12.5h3" />
      </g>
    </Icon>
  ),
  gen: (
    <Icon>
      <g {...stroke}>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M7 7V5h4v2M12.5 10l-2.5 4h4l-2.5 4" />
      </g>
    </Icon>
  ),
  radio: (
    <Icon>
      <g {...stroke}>
        <circle cx="12" cy="17" r="1.5" />
        <path d="M8.5 13.5a5 5 0 0 1 7 0M5.5 10.5a9 9 0 0 1 13 0M2.8 7.6a13 13 0 0 1 18.4 0" />
      </g>
    </Icon>
  ),
  store: (
    <Icon>
      <g {...stroke}>
        <ellipse cx="12" cy="6" rx="7" ry="2.5" />
        <path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
      </g>
    </Icon>
  ),
  board: (
    <Icon>
      <g {...stroke}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="6.5" cy="6.5" r=".8" />
        <circle cx="17.5" cy="17.5" r=".8" />
        <path d="M8 17h4l3-3V9h3M8 12h3l2-2V6" />
      </g>
    </Icon>
  ),
  box: (
    <Icon>
      <g {...stroke}>
        <path d="M4 7.5l8-4 8 4v9l-8 4-8-4z" />
        <path d="M4 7.5l8 4 8-4M12 11.5v9" />
      </g>
    </Icon>
  ),
  code: (
    <Icon>
      <g {...stroke}>
        <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />
      </g>
    </Icon>
  ),
};
