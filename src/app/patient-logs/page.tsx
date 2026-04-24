"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollRevealWrapper from "@/components/ScrollRevealWrapper";
import Link from "next/link";

const patientMedications = [
  { id: 1, patient: "John Doe", room: "101A", medicine: "Aspirin 100mg", time: "8:00 AM", status: "taken" },
  { id: 2, patient: "John Doe", room: "101A", medicine: "Metformin 500mg", time: "12:00 PM", status: "pending" },
  { id: 3, patient: "Jane Smith", room: "102B", medicine: "Lisinopril 10mg", time: "8:00 AM", status: "taken" },
  { id: 4, patient: "Bob Wilson", room: "103C", medicine: "Vitamin D 1000 IU", time: "9:00 AM", status: "pending" },
  { id: 5, patient: "Mary Johnson", room: "104D", medicine: "Omeprazole 20mg", time: "7:00 AM", status: "taken" },
];

const stats = [
  {
    value: "3",
    label: "Medications Taken Today",
    tone: "emerald" as const,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "2",
    label: "Pending Today",
    tone: "amber" as const,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "12",
    label: "Active Patients",
    tone: "blue" as const,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const statTone: Record<"emerald" | "amber" | "blue", string> = {
  emerald: "text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10",
  amber: "text-[var(--accent-amber)] bg-[var(--accent-amber)]/10",
  blue: "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10",
};

export default function PatientLogsPage() {
  return (
    <ScrollRevealWrapper>
      <main className="min-h-screen bg-[var(--bg-primary)]">
        <Navbar />
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-[1280px] mx-auto">
            {/* Section Header */}
            <div className="reveal mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-[-0.02em] mb-3">
                PATIENT LOGS
              </h1>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-[var(--text-secondary)] text-base">
                  Medication administration records
                </p>
                <p className="text-[var(--text-muted)] text-sm font-mono">MODULE_LOGS_02</p>
              </div>
            </div>

            {/* Login Prompt Card */}
            <div
              className="reveal delay-100 glass-card p-10 sm:p-12 mb-12 text-center relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 500px 200px at 50% 0%, rgba(34,211,238,0.12), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-cyan)]/15 to-[var(--accent-blue)]/15 border border-[var(--accent-cyan)]/30 shadow-[0_8px_32px_-8px_rgba(34,211,238,0.35)]">
                  <svg className="w-10 h-10 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Access Patient Records
                </h2>
                <p className="text-[var(--text-secondary)] text-base mb-8 max-w-[420px] mx-auto leading-relaxed">
                  Sign in as a caregiver or admin to view and manage patient medication schedules.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="group btn-shine inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-emerald)] text-white font-semibold text-[14px] transition-all duration-300 hover:-translate-y-0.5 focus-ring"
                    style={{ boxShadow: "0 10px 30px -8px rgba(34,211,238,0.55)" }}
                  >
                    Sign in as Caregiver
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="group btn-shine inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] text-white font-semibold text-[14px] transition-all duration-300 hover:-translate-y-0.5 focus-ring"
                    style={{ boxShadow: "0 10px 30px -8px rgba(167,139,250,0.5)" }}
                  >
                    Sign in as Admin
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
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

            {/* Today's Schedule Table */}
            <div className="reveal delay-200 glass-card">
              <div className="glass-card-header">
                <h2 className="text-base font-semibold text-white">
                  Today&apos;s Medication Schedule
                </h2>
                <span className="badge badge-blue">Public View</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <Th>Patient</Th>
                      <Th>Room</Th>
                      <Th>Medication</Th>
                      <Th>Scheduled</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--glass-border)]">
                    {patientMedications.map((med) => (
                      <tr
                        key={med.id}
                        className="transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-4 text-sm text-white font-medium">{med.patient}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">{med.room}</td>
                        <td className="px-6 py-4 text-sm text-white">{med.medicine}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{med.time}</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${med.status === "taken" ? "badge-emerald" : "badge-amber"}`}>
                            {med.status}
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
