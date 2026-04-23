import { ReactNode } from "react";

interface PanelProps {
  title: string;
  action?: ReactNode;
  className?: string;
  bodyPadding?: string;
  children: ReactNode;
}

export default function Panel({
  title,
  action,
  className = "",
  bodyPadding = "1.25rem 1.5rem",
  children,
}: PanelProps) {
  return (
    <div
      className={`flex flex-col min-w-0 w-full transition-colors ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%), rgba(15,23,42,0.45)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(2,6,23,0.45), 0 1px 0 rgba(255,255,255,0.05) inset",
        boxSizing: "border-box",
      }}
    >
      <div
        className="flex items-center justify-between gap-4"
        style={{
          padding: "0.875rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2 className="text-base font-semibold text-white truncate">{title}</h2>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="flex-1 min-w-0" style={{ padding: bodyPadding }}>
        {children}
      </div>
    </div>
  );
}
