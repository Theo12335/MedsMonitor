"use client";

const capabilities = [
  {
    title: "Real-Time Telemetry",
    description: "Instantaneous data transmission for caregiver attendance and patient vitals.",
    tone: "cyan" as const,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Secure Protocol",
    description: "End-to-end encryption for all patient records and staff logs.",
    tone: "blue" as const,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Live Sync",
    description: "Multi-device synchronization ensures data consistency across the facility.",
    tone: "emerald" as const,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

const toneIcon: Record<"cyan" | "blue" | "emerald", string> = {
  cyan: "text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 ring-[var(--accent-cyan)]/30",
  blue: "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 ring-[var(--accent-blue)]/30",
  emerald: "text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10 ring-[var(--accent-emerald)]/30",
};

const features = [
  {
    title: "High-Density Visualization",
    description: "Our interface is designed for rapid information processing. LED-style status indicators allow for immediate recognition of critical patient needs.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Smart Storage Integration",
    description: "Physical smart storage units with LED indicators and weight sensors connect wirelessly to provide real-time inventory tracking and guided medication retrieval.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function SystemCapabilities() {
  return (
    <section className="py-24 px-6 bg-[var(--bg-secondary)]">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="reveal text-center mb-16">
          <h2 className="text-[36px] font-bold text-white tracking-[-0.02em] mb-4">
            SYSTEM CAPABILITIES
          </h2>
          <p className="text-[var(--text-secondary)] max-w-[640px] mx-auto text-base">
            Advanced features designed for modern healthcare facility management
          </p>
        </div>

        {/* Top Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {capabilities.map((capability, index) => (
            <div
              key={capability.title}
              className={`reveal delay-${(index + 1) * 100} group text-center p-8`}
            >
              <div
                className={`inline-flex items-center justify-center w-[72px] h-[72px] rounded-full ring-1 mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_-4px_rgba(59,130,246,0.3)] ${toneIcon[capability.tone]}`}
              >
                {capability.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {capability.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">
                {capability.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`${index === 0 ? "reveal-left" : "reveal-right"} p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] card-hover`}
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 p-4 rounded-xl text-[var(--accent-cyan)] bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-violet)]/15 border border-[var(--glass-border)]">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-[15px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hardware Integration Preview */}
        <div className="reveal delay-200 mt-16 p-8 rounded-2xl border border-[var(--glass-border)] bg-gradient-to-br from-[var(--accent-blue)]/[0.06] via-[var(--accent-cyan)]/[0.04] to-[var(--accent-violet)]/[0.06]">
          <div className="flex flex-row flex-wrap items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center bg-[var(--bg-card)] border border-[var(--glass-border)]">
                <svg className="w-16 h-16 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-[280px]">
              <h3 className="text-2xl font-bold text-white mb-2">
                ESP32-Powered Hardware
              </h3>
              <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-4">
                Our smart storage system uses ESP32 microcontrollers for
                precise weight sensing and LED control, communicating via
                WebSocket with this dashboard.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-cyan">ESP32 Compatible</span>
                <span className="badge badge-blue">WebSocket API</span>
                <span className="badge badge-violet">Load Cells</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
