import { ReactNode } from "react";

type Accent = "blue" | "cyan" | "emerald" | "violet" | "amber" | "rose";

const GLASS_BORDER = "rgba(255,255,255,0.08)";

const ACCENT: Record<
  Accent,
  { iconBg: string; iconText: string; value: string; border: string; hoverBorder: string }
> = {
  blue:    { iconBg: "rgba(59,130,246,0.18)",  iconText: "#3b82f6", value: "#3b82f6", border: GLASS_BORDER, hoverBorder: "rgba(59,130,246,0.45)" },
  cyan:    { iconBg: "rgba(34,211,238,0.18)",  iconText: "#22d3ee", value: "#22d3ee", border: GLASS_BORDER, hoverBorder: "rgba(34,211,238,0.45)" },
  emerald: { iconBg: "rgba(52,211,153,0.18)",  iconText: "#34d399", value: "#34d399", border: GLASS_BORDER, hoverBorder: "rgba(52,211,153,0.45)" },
  violet:  { iconBg: "rgba(167,139,250,0.18)", iconText: "#a78bfa", value: "#a78bfa", border: GLASS_BORDER, hoverBorder: "rgba(167,139,250,0.45)" },
  amber:   { iconBg: "rgba(251,191,36,0.18)",  iconText: "#fbbf24", value: "#fbbf24", border: GLASS_BORDER, hoverBorder: "rgba(251,191,36,0.45)" },
  rose:    { iconBg: "rgba(251,113,133,0.18)", iconText: "#fb7185", value: "#fb7185", border: GLASS_BORDER, hoverBorder: "rgba(251,113,133,0.45)" },
};

interface StatTileProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent: Accent;
  delta?: { value: string; direction: "up" | "down" | "neutral" };
  emphasize?: boolean;
}

export default function StatTile({ label, value, icon, accent, delta, emphasize }: StatTileProps) {
  const a = ACCENT[accent];
  const deltaBg =
    delta?.direction === "up"
      ? "rgba(52,211,153,0.15)"
      : delta?.direction === "down"
      ? "rgba(251,113,133,0.15)"
      : "rgba(255,255,255,0.05)";
  const deltaText =
    delta?.direction === "up" ? "#34d399" : delta?.direction === "down" ? "#fb7185" : "#64748b";

  return (
    <div
      className="w-full min-w-0 flex flex-col justify-between transition-colors"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%), rgba(15,23,42,0.45)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        border: `1px solid ${a.border}`,
        borderRadius: "1rem",
        padding: "1.25rem 1.5rem",
        height: "100%",
        minHeight: "140px",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(2,6,23,0.45), 0 1px 0 rgba(255,255,255,0.05) inset",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = a.hoverBorder)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = a.border)}
    >
      <div className="flex items-start justify-between gap-2 w-full min-w-0">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.75rem",
            background: a.iconBg,
            color: a.iconText,
          }}
        >
          {icon}
        </div>
        {delta && (
          <span
            className="whitespace-nowrap"
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              padding: "0.125rem 0.5rem",
              borderRadius: "9999px",
              background: deltaBg,
              color: deltaText,
            }}
          >
            {delta.direction === "up" && "▲ "}
            {delta.direction === "down" && "▼ "}
            {delta.value}
          </span>
        )}
      </div>
      <div className="min-w-0 w-full" style={{ marginTop: "0.75rem" }}>
        <p
          className="font-bold leading-none truncate"
          style={{
            fontSize: "1.875rem",
            color: emphasize ? a.value : "#ffffff",
          }}
        >
          {value}
        </p>
        <p className="truncate" style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.5rem" }}>
          {label}
        </p>
      </div>
    </div>
  );
}
