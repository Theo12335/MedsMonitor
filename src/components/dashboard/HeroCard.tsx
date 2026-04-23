import { ReactNode } from "react";

type Gradient = "blue-cyan" | "violet-indigo" | "teal-emerald" | "blue-violet" | "cyan-teal";

const GRADIENTS: Record<Gradient, string> = {
  "blue-cyan": "linear-gradient(135deg, #1e3a8a 0%, #22d3ee 100%)",
  "violet-indigo": "linear-gradient(135deg, #4c1d95 0%, #6366f1 100%)",
  "teal-emerald": "linear-gradient(135deg, #115e59 0%, #34d399 100%)",
  "blue-violet": "linear-gradient(135deg, #1e40af 0%, #a78bfa 100%)",
  "cyan-teal": "linear-gradient(135deg, #155e75 0%, #22d3ee 100%)",
};

interface HeroCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  gradient: Gradient;
  icon?: ReactNode;
}

export default function HeroCard({ label, value, unit, subtitle, gradient, icon }: HeroCardProps) {
  return (
    <div
      className="w-full min-w-0 flex flex-col justify-between"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%), ${GRADIENTS[gradient]}`,
        borderRadius: "1rem",
        padding: "1.25rem 1.5rem",
        height: "100%",
        minHeight: "140px",
        boxSizing: "border-box",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 10px 30px rgba(2,6,23,0.45), 0 1px 0 rgba(255,255,255,0.15) inset",
      }}
    >
      <div className="flex items-start justify-between gap-3 w-full min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white leading-tight">{label}</p>
          {subtitle && <p className="text-xs text-white/75 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className="flex items-center justify-center text-white flex-shrink-0"
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "0.75rem",
              background: "rgba(255, 255, 255, 0.18)",
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mt-3 min-w-0">
        <span className="text-4xl font-bold text-white leading-none tracking-tight">{value}</span>
        {unit && <span className="text-base font-medium text-white/85">{unit}</span>}
      </div>
    </div>
  );
}
