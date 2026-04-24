"use client";

const infoCards = [
  {
    label: "System Provider",
    primary: "DoseKoPo! Healthcare Center",
  },
  {
    label: "Location Data",
    primary: "123 Healthcare Avenue",
    secondary: "Medical District, MD 12345",
  },
  {
    label: "Direct Channel",
    primary: "(555) 123-4567",
    secondary: "contact@dosekopo.com",
  },
  {
    label: "System Uptime",
    primary: "99.98%",
    secondary: "Last downtime: None recorded",
    highlight: true,
  },
];

export default function FacilityManifest() {
  return (
    <section className="py-24 px-6 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="reveal-left">
            <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-[-0.02em] mb-6">
              FACILITY<br />
              <span className="text-[var(--text-muted)]">MANIFEST</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-[420px] text-base leading-relaxed mb-8">
              Operational details and contact protocols for the DoseKoPo! network.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
              <span className="px-2.5 py-1.5 bg-[var(--bg-card)] rounded-md border border-[var(--glass-border)]">
                SYS_INFO
              </span>
              <span className="text-[var(--text-dim)]">|</span>
              <span>SYSTEM_CAT_01</span>
            </div>
          </div>

          {/* Right Content - Building Image Placeholder */}
          <div className="reveal-right">
            <div className="relative rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--bg-card)] aspect-[16/9] flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: "radial-gradient(circle at 30% 20%, rgba(34,211,238,0.18), transparent 50%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.15), transparent 50%)",
                }}
              />
              <div className="relative text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-violet)]/20 border border-[var(--glass-border-hover)]">
                  <svg className="w-12 h-12 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-[var(--accent-cyan)] font-semibold text-lg">DoseKoPo!</p>
                <p className="text-[var(--text-muted)] text-sm">Healthcare Facility</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {infoCards.map((card, index) => (
            <div
              key={card.label}
              className={`reveal delay-${(index + 1) * 100} p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] card-hover`}
            >
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2 font-medium">
                {card.label}
              </div>
              <p
                className={`font-bold leading-tight ${
                  card.highlight ? "text-[var(--accent-emerald)] text-3xl" : "text-white text-base"
                }`}
              >
                {card.primary}
              </p>
              {card.secondary && (
                <p className="text-[var(--text-secondary)] text-sm mt-1">{card.secondary}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
