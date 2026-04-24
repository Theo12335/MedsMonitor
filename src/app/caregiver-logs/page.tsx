"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollRevealWrapper from "@/components/ScrollRevealWrapper";
import Link from "next/link";

const attendanceLogs = [
  { id: 1, name: "Jane Smith", date: "2024-12-30", timeIn: "7:00 AM", timeOut: "—", status: "active" },
  { id: 2, name: "Mike Johnson", date: "2024-12-30", timeIn: "7:15 AM", timeOut: "—", status: "active" },
  { id: 3, name: "Sarah Williams", date: "2024-12-29", timeIn: "7:00 AM", timeOut: "3:00 PM", status: "completed" },
  { id: 4, name: "Jane Smith", date: "2024-12-29", timeIn: "3:00 PM", timeOut: "11:00 PM", status: "completed" },
  { id: 5, name: "Tom Brown", date: "2024-12-28", timeIn: "11:00 PM", timeOut: "7:00 AM", status: "completed" },
];

const stats = [
  {
    value: "2",
    label: "Active On Shift",
    tone: "emerald" as const,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "8",
    label: "Total Staff",
    tone: "blue" as const,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: "156",
    label: "Hours This Week",
    tone: "violet" as const,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const statTone: Record<"emerald" | "blue" | "violet", string> = {
  emerald: "text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10",
  blue: "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10",
  violet: "text-[var(--accent-violet)] bg-[var(--accent-violet)]/10",
};

export default function CaregiverLogsPage() {
  return (
    <ScrollRevealWrapper>
      <main className="min-h-screen bg-[var(--bg-primary)]">
        <Navbar />
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-[1280px] mx-auto">
            {/* Section Header */}
            <div className="reveal mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-[-0.02em] mb-3">
                CAREGIVER LOGS
              </h1>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-[var(--text-secondary)] text-base">
                  Staff attendance &amp; shift management
                </p>
                <p className="text-[var(--text-muted)] text-sm font-mono">MODULE_CARE_01</p>
              </div>
            </div>

            {/* Login Prompt Card */}
            <div className="reveal delay-100 glass-card p-10 sm:p-12 mb-12 text-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 500px 200px at 50% 0%, rgba(167,139,250,0.14), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-violet)]/15 border border-[var(--accent-violet)]/30 shadow-[0_8px_32px_-8px_rgba(167,139,250,0.4)]">
                  <svg className="w-10 h-10 text-[var(--accent-violet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Authentication Required
                </h2>
                <p className="text-[var(--text-secondary)] text-base mb-8 max-w-[420px] mx-auto leading-relaxed">
                  Please log in as a caregiver to access full attendance management features.
                </p>
                <Link
                  href="/login"
                  className="group btn-shine inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] text-white font-semibold text-[14px] transition-all duration-300 hover:-translate-y-0.5 focus-ring"
                  style={{ boxShadow: "0 10px 30px -8px rgba(59,130,246,0.55)" }}
                >
                  Login as Caregiver
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`reveal delay-${(index + 1) * 100} glass-card card-hover p-6`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${statTone[stat.tone]}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white leading-none tracking-tight">{stat.value}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Attendance Table */}
            <div className="reveal delay-200 glass-card">
              <div className="glass-card-header">
                <h2 className="text-base font-semibold text-white">Recent Attendance</h2>
                <span className="badge badge-violet">Public View</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <Th>Name</Th>
                      <Th>Date</Th>
                      <Th>Time In</Th>
                      <Th>Time Out</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--glass-border)]">
                    {attendanceLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-4 text-sm text-white font-medium">{log.name}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">{log.date}</td>
                        <td className="px-6 py-4 text-sm text-[var(--accent-emerald)] font-medium">{log.timeIn}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{log.timeOut}</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${log.status === "active" ? "badge-emerald" : "badge-blue"}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </ScrollRevealWrapper>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-[0.05em] whitespace-nowrap">
      {children}
    </th>
  );
}
