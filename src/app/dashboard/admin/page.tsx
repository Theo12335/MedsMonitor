"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import HeroCard from "@/components/dashboard/HeroCard";
import StatTile from "@/components/dashboard/StatTile";
import LineChart from "@/components/dashboard/charts/LineChart";
import DonutChart from "@/components/dashboard/charts/DonutChart";
import BarChart from "@/components/dashboard/charts/BarChart";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, useAdminDashboardData } from "@/lib/supabase/hooks";

interface RecentActivity {
  id: string;
  message: string;
  time: string;
  tone: "success" | "warn" | "info";
}

const SERVICES = [
  { name: "Database", latency: "12ms" },
  { name: "Auth", latency: "8ms" },
  { name: "Storage", latency: "24ms" },
  { name: "Hardware", latency: "online" },
];

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const { data, loading: dataLoading } = useAdminDashboardData();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const supabase = createClient();

  const userName = profile?.name || "Loading...";
  const firstName = profile?.name?.split(" ")[0] || "Admin";

  useEffect(() => {
    const fetchActivity = async () => {
      const { data: logs } = await supabase
        .from("medication_logs")
        .select(`
          id,
          status,
          actual_time,
          scheduled_time,
          patient:patients(name),
          caregiver:profiles(name)
        `)
        .order("updated_at", { ascending: false })
        .limit(6);

      if (logs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activities: RecentActivity[] = logs.map((log: any) => {
          const tone: "success" | "warn" | "info" =
            log.status === "taken" ? "success" : log.status === "pending" ? "warn" : "info";
          return {
            id: log.id,
            message:
              log.status === "taken"
                ? `${log.caregiver?.name || "Caregiver"} dispensed to ${log.patient?.name || "Patient"}`
                : `Pending dose for ${log.patient?.name || "Patient"}`,
            time: log.actual_time || log.scheduled_time,
            tone,
          };
        });
        setRecentActivity(activities);
      }
    };
    fetchActivity();
  }, [supabase]);

  const loading = profileLoading || dataLoading;

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName="Loading...">
        <div className="space-y-5">
          <div className="skeleton-shimmer h-24 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1.4fr_1fr_1fr] gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 skeleton-shimmer h-72 rounded-2xl" />
            <div className="skeleton-shimmer h-72 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const todayTotal = data.dispensedToday + data.pendingToday + data.missedToday;

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      <div className="space-y-5 max-w-full">
        {/* Welcome */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">Welcome back, {firstName}</h1>
                <p className="text-sm text-[var(--text-muted)] truncate">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-emerald)]/10 rounded-xl border border-[var(--accent-emerald)]/20 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)] animate-pulse-slow" />
              <span className="text-sm font-medium text-[var(--accent-emerald)] whitespace-nowrap">All Systems Online</span>
            </div>
          </div>
        </div>

        {/* Hero + Stats row — 6-col grid: hero=2, stat=1 → 2+2+1+1 = 6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 min-w-0">
            <HeroCard
              label="Adherence rate"
              value={data.adherenceRate}
              unit="%"
              subtitle="Last 7 days"
              gradient="blue-cyan"
              icon={<HeartIcon />}
            />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <HeroCard
              label="On-time rate"
              value={data.onTimeRate}
              unit="%"
              subtitle="Within 10 minutes"
              gradient="violet-indigo"
              icon={<ClockIcon />}
            />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <StatTile
              label="Patients"
              value={data.totalPatients}
              icon={<UsersIcon />}
              accent="cyan"
              delta={
                data.patientsDelta > 0
                  ? { value: `${data.patientsDelta} new`, direction: "up" }
                  : undefined
              }
            />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <StatTile
              label="Low stock alerts"
              value={data.lowStockAlerts}
              icon={<AlertIcon />}
              accent="rose"
              delta={data.lowStockAlerts > 0 ? { value: "action", direction: "down" } : undefined}
              emphasize={data.lowStockAlerts > 0}
            />
          </div>
        </div>

        {/* Trend chart + donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel
            title="Dispenses vs Missed Doses"
            className="lg:col-span-2"
            action={
              <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
                  Dispensed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-rose)]" />
                  Missed
                </span>
              </div>
            }
          >
            <LineChart
              height={220}
              xLabels={data.dayLabels}
              ariaLabel="Dispenses vs missed doses, last 7 days"
              series={[
                { label: "Dispensed", data: data.dailyDispensed, color: "#22d3ee", fill: true },
                { label: "Missed", data: data.dailyMissed, color: "#fb7185", dashed: true },
              ]}
            />
          </Panel>

          <Panel title="Today's Status">
            <DonutChart
              size={130}
              centerValue={todayTotal > 0 ? `${Math.round((data.dispensedToday / todayTotal) * 100)}%` : "0%"}
              centerLabel="done"
              segments={[
                { label: "Dispensed", value: data.dispensedToday, color: "#34d399" },
                { label: "Pending", value: data.pendingToday, color: "#fbbf24" },
                { label: "Missed", value: data.missedToday, color: "#fb7185" },
              ]}
            />
          </Panel>
        </div>

        {/* Quick actions */}
        <Panel
          title="Quick Actions"
          action={<span className="text-xs text-[var(--text-dim)] hidden md:inline">Manage your healthcare system</span>}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              href="/dashboard/admin/patients"
              label="Add Patient"
              subtitle="Register new patient"
              accent="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            />
            <QuickAction
              href="/dashboard/admin/staff"
              label="Manage Staff"
              subtitle="Caregivers & roles"
              accent="emerald"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <QuickAction
              href="/dashboard/admin/medications"
              label="Medications"
              subtitle="Inventory & drawers"
              accent="violet"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
            />
            <QuickAction
              href="/dashboard/admin/reports"
              label="Reports"
              subtitle="Analytics & insights"
              accent="amber"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          </div>
        </Panel>

        {/* Bottom: Bar + Activity + System */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel title="Doses by Day">
            <BarChart
              height={170}
              data={data.dailyDispensed.map((v, i) => ({ label: data.dayLabels[i], value: v }))}
              ariaLabel="Dispensed doses by day"
            />
          </Panel>

          <Panel title="Recent Activity" bodyPadding="1rem">
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        a.tone === "success"
                          ? "bg-[var(--accent-emerald)]"
                          : a.tone === "warn"
                          ? "bg-[var(--accent-amber)]"
                          : "bg-[var(--accent-blue)]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{a.message}</p>
                      <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                        {new Date(a.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--text-dim)]">No recent activity</p>
              </div>
            )}
          </Panel>

          <Panel title="System" action={<span className="badge badge-emerald">All Operational</span>}>
            <div className="space-y-3">
              {SERVICES.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3 p-2.5 bg-[var(--bg-elevated)] rounded-lg min-w-0">
                  <span className="text-sm text-white truncate">{s.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--accent-emerald)] flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-emerald)]" />
                    {s.latency}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickAction({
  href,
  label,
  subtitle,
  icon,
  accent,
}: {
  href: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: "blue" | "emerald" | "violet" | "amber";
}) {
  const accentClasses: Record<typeof accent, { bg: string; text: string; border: string; hoverBg: string }> = {
    blue: {
      bg: "bg-[var(--accent-blue)]/15",
      text: "text-[var(--accent-blue)]",
      border: "hover:border-[var(--accent-blue)]/50",
      hoverBg: "hover:bg-[var(--accent-blue)]/5",
    },
    emerald: {
      bg: "bg-[var(--accent-emerald)]/15",
      text: "text-[var(--accent-emerald)]",
      border: "hover:border-[var(--accent-emerald)]/50",
      hoverBg: "hover:bg-[var(--accent-emerald)]/5",
    },
    violet: {
      bg: "bg-[var(--accent-violet)]/15",
      text: "text-[var(--accent-violet)]",
      border: "hover:border-[var(--accent-violet)]/50",
      hoverBg: "hover:bg-[var(--accent-violet)]/5",
    },
    amber: {
      bg: "bg-[var(--accent-amber)]/15",
      text: "text-[var(--accent-amber)]",
      border: "hover:border-[var(--accent-amber)]/50",
      hoverBg: "hover:bg-[var(--accent-amber)]/5",
    },
  };
  const c = accentClasses[accent];

  return (
    <a
      href={href}
      className={`group block p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--glass-border)] transition-all min-w-0 ${c.border} ${c.hoverBg}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-white truncate">{label}</p>
      <p className="text-xs text-[var(--text-dim)] mt-0.5 truncate">{subtitle}</p>
    </a>
  );
}
