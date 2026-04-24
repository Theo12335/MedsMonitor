"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-6 pb-12">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[480px] h-[480px] rounded-full blur-3xl"
          style={{
            top: "15%",
            left: "10%",
            background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)",
          }}
        />
        <div
          className="absolute w-[520px] h-[520px] rounded-full blur-3xl"
          style={{
            bottom: "15%",
            right: "10%",
            background: "radial-gradient(circle, rgba(34,211,238,0.14), transparent 70%)",
          }}
        />
        <div
          className="absolute w-[360px] h-[360px] rounded-full blur-3xl"
          style={{
            top: "60%",
            left: "40%",
            background: "radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-[900px] mx-auto">
        {/* Status badge */}
        <div className="reveal inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] mb-8">
          <span className="status-dot status-dot-online status-pulse-dot"></span>
          <span className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.12em] font-medium">
            System Operational
          </span>
        </div>

        {/* Main heading */}
        <h1 className="reveal delay-100 mb-7">
          <span className="block font-bold text-white leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(48px, 8vw, 80px)" }}>
            ADVANCED
          </span>
          <span
            className="block font-bold leading-[1.05] tracking-[-0.02em] bg-clip-text text-transparent"
            style={{
              fontSize: "clamp(48px, 8vw, 80px)",
              backgroundImage: "linear-gradient(90deg, var(--accent-cyan), var(--accent-blue), var(--accent-violet))",
            }}
          >
            MONITORING
          </span>
          <span className="block font-bold text-[var(--text-muted)] leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(48px, 8vw, 80px)" }}>
            ECOSYSTEM
          </span>
        </h1>

        {/* Description */}
        <p className="reveal delay-200 text-lg text-[var(--text-secondary)] max-w-[640px] mx-auto mb-10 leading-relaxed">
          Real-time healthcare data management system for tracking caregiver
          attendance and patient medication schedules with absolute precision.
        </p>

        {/* CTA Buttons */}
        <div className="reveal delay-300 flex flex-row items-center justify-center gap-4 flex-wrap">
          <Link
            href="/login"
            className="group btn-shine inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] text-white font-semibold text-[15px] transition-all duration-300 hover:-translate-y-0.5 focus-ring"
            style={{ boxShadow: "0 10px 30px -8px rgba(59,130,246,0.55)" }}
          >
            Initialize Dashboard
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/patient-logs"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white/[0.03] border border-[var(--glass-border)] text-white font-semibold text-[15px] transition-all duration-300 hover:bg-white/[0.08] hover:border-[var(--glass-border-hover)] hover:-translate-y-0.5 focus-ring"
          >
            Access Logs
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
