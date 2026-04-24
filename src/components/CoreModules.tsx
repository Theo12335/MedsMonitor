"use client";

import Link from "next/link";

const modules = [
  {
    title: "Caregiver Logs",
    description:
      "Digital attendance tracking. Monitor staff patterns, time-in/out metrics, and staff allocation in real-time.",
    href: "/caregiver-logs",
    code: "MODULE_CARE_01",
    tone: "cyan",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: "Patient Logs",
    description:
      "Medication administration records. Track dosage, timing, and adherence with visual status indicators.",
    href: "/patient-logs",
    code: "MODULE_LOGS_02",
    tone: "emerald",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    title: "Master Dashboard",
    description:
      "Unified command center. High-density data visualization combining staff and patient metrics.",
    href: "/dashboard",
    code: "ADMIN_HUB",
    tone: "violet",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
] as const;

const toneClasses: Record<(typeof modules)[number]["tone"], { icon: string; accent: string; border: string; glow: string }> = {
  cyan: {
    icon: "text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10",
    accent: "text-[var(--accent-cyan)]",
    border: "hover:border-[var(--accent-cyan)]/40",
    glow: "group-hover:shadow-[0_20px_60px_-20px_rgba(34,211,238,0.4)]",
  },
  emerald: {
    icon: "text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10",
    accent: "text-[var(--accent-emerald)]",
    border: "hover:border-[var(--accent-emerald)]/40",
    glow: "group-hover:shadow-[0_20px_60px_-20px_rgba(52,211,153,0.4)]",
  },
  violet: {
    icon: "text-[var(--accent-violet)] bg-[var(--accent-violet)]/10",
    accent: "text-[var(--accent-violet)]",
    border: "hover:border-[var(--accent-violet)]/40",
    glow: "group-hover:shadow-[0_20px_60px_-20px_rgba(167,139,250,0.4)]",
  },
};

export default function CoreModules() {
  return (
    <section className="py-24 px-6 bg-[var(--bg-secondary)]">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="reveal mb-16">
          <h2 className="text-[36px] font-bold text-white tracking-[-0.02em] mb-4">
            CORE MODULES
          </h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-[var(--text-secondary)] text-base">
              Select interface to proceed
            </p>
            <p className="text-[var(--text-muted)] text-sm font-mono">VOL_DEL 3.8.2</p>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const tone = toneClasses[module.tone];
            return (
              <Link
                key={module.title}
                href={module.href}
                className={`reveal delay-${(index + 1) * 100} group relative p-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] ${tone.border} ${tone.glow} transition-all duration-300 hover:-translate-y-1 focus-ring no-underline`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${tone.icon}`}>
                  {module.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {module.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-5">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {module.code}
                  </span>
                  <span className={`text-sm inline-flex items-center gap-1 ${tone.accent}`}>
                    Access
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
