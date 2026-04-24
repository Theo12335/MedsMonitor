"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-[var(--bg-primary)]">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 w-[640px] h-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-60"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.12), rgba(167,139,250,0.08) 50%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto">
        <div className="reveal flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 mb-6">
            <span className="status-dot status-dot-online status-pulse-dot"></span>
            Ready for Deployment
          </span>
          <h2 className="text-[40px] md:text-[48px] font-bold text-white mb-5 tracking-[-0.02em] leading-[1.1]">
            READY TO MONITOR?
          </h2>
          <p className="text-[var(--text-secondary)] text-base mb-10 max-w-[640px] leading-relaxed">
            Initialize the dashboard to begin tracking caregiver attendance and
            patient medication schedules.
          </p>
          <Link
            href="/login"
            className="group btn-shine inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] text-white font-semibold text-[15px] transition-all duration-300 hover:-translate-y-0.5 focus-ring"
            style={{ boxShadow: "0 12px 40px -10px rgba(59,130,246,0.55)" }}
          >
            Launch System
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
