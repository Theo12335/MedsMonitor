"use client";

const statusItems = [
  { label: "DATA SYNC", status: "ACTIVE", tone: "emerald" },
  { label: "SECURE CONNECTION", status: "ENCRYPTED", tone: "blue" },
  { label: "SERVER STATUS", status: "OK", tone: "emerald" },
  { label: "LIVE DATA FEED", status: "STREAMING", tone: "cyan" },
  { label: "SECURE CONNECTION", status: "ENCRYPTED", tone: "blue" },
  { label: "SERVER STATUS", status: "OK", tone: "emerald" },
  { label: "LIVE DATA FEED", status: "STREAMING", tone: "cyan" },
  { label: "SECURE CONNECTION", status: "ENCRYPTED", tone: "violet" },
] as const;

const toneStatus: Record<(typeof statusItems)[number]["tone"], string> = {
  emerald: "text-[var(--accent-emerald)]",
  blue: "text-[var(--accent-blue)]",
  cyan: "text-[var(--accent-cyan)]",
  violet: "text-[var(--accent-violet)]",
};

const toneDot: Record<(typeof statusItems)[number]["tone"], string> = {
  emerald: "bg-[var(--accent-emerald)] shadow-[0_0_8px_var(--accent-emerald)]",
  blue: "bg-[var(--accent-blue)] shadow-[0_0_8px_var(--accent-blue)]",
  cyan: "bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]",
  violet: "bg-[var(--accent-violet)] shadow-[0_0_8px_var(--accent-violet)]",
};

export default function Marquee() {
  return (
    <div className="w-full overflow-hidden border-y border-[var(--glass-border)] bg-[var(--bg-primary)] py-4">
      <div className="animate-marquee flex whitespace-nowrap w-max">
        {[...statusItems, ...statusItems].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 mx-8 text-[13px] font-mono"
          >
            <span className={`w-2 h-2 rounded-full ${toneDot[item.tone]}`} />
            <span className="text-[var(--text-muted)] uppercase tracking-wider">
              {item.label}
            </span>
            <span className={`font-semibold ${toneStatus[item.tone]}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
