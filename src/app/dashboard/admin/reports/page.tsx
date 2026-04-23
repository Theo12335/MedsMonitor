"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import StatTile from "@/components/dashboard/StatTile";
import HeroCard from "@/components/dashboard/HeroCard";
import BarChart from "@/components/dashboard/charts/BarChart";
import DonutChart from "@/components/dashboard/charts/DonutChart";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/supabase/hooks";

interface DailyStats {
  date: string;
  dispensed: number;
  missed: number;
  pending: number;
}

interface CaregiverStats {
  id: string;
  name: string;
  dispensed: number;
  totalShiftHours: number;
}

interface MedicationStats {
  name: string;
  dosage: string;
  dispensed: number;
  missed: number;
}

type Range = "week" | "month" | "all";

export default function ReportsPage() {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<Range>("week");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [caregiverStats, setCaregiverStats] = useState<CaregiverStats[]>([]);
  const [medicationStats, setMedicationStats] = useState<MedicationStats[]>([]);
  const [totals, setTotals] = useState({
    totalDispensed: 0,
    totalMissed: 0,
    totalPending: 0,
    complianceRate: 0,
    totalPatients: 0,
    totalCaregivers: 0,
  });
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const startDate =
      dateRange === "week"
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : dateRange === "month"
        ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const { data: logs } = await supabase
      .from("medication_logs")
      .select(
        `id, status, scheduled_time, actual_time, caregiver_id,
         patient_medication:patient_medications(medication:medications(name, dosage)),
         caregiver:profiles(name)`
      )
      .gte("scheduled_time", startDate.toISOString())
      .lte("scheduled_time", now.toISOString());

    if (logs) {
      const dispensed = logs.filter((l) => l.status === "taken").length;
      const missed = logs.filter((l) => l.status === "missed").length;
      const pending = logs.filter((l) => l.status === "pending").length;
      const total = dispensed + missed;
      const complianceRate = total > 0 ? Math.round((dispensed / total) * 100) : 100;

      const dailyMap = new Map<string, DailyStats>();
      logs.forEach((log) => {
        const date = new Date(log.scheduled_time).toISOString().split("T")[0];
        const existing = dailyMap.get(date) || { date, dispensed: 0, missed: 0, pending: 0 };
        if (log.status === "taken") existing.dispensed++;
        else if (log.status === "missed") existing.missed++;
        else if (log.status === "pending") existing.pending++;
        dailyMap.set(date, existing);
      });
      setDailyStats(Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

      const caregiverMap = new Map<string, CaregiverStats>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logs.forEach((log: any) => {
        if (log.caregiver_id && log.status === "taken") {
          const existing = caregiverMap.get(log.caregiver_id) || {
            id: log.caregiver_id,
            name: log.caregiver?.name || "Unknown",
            dispensed: 0,
            totalShiftHours: 0,
          };
          existing.dispensed++;
          caregiverMap.set(log.caregiver_id, existing);
        }
      });

      const { data: attendance } = await supabase
        .from("attendance_logs")
        .select("caregiver_id, time_in, time_out")
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", now.toISOString().split("T")[0]);

      if (attendance) {
        attendance.forEach((att) => {
          const caregiver = caregiverMap.get(att.caregiver_id);
          if (caregiver && att.time_out) {
            const hours = (new Date(att.time_out).getTime() - new Date(att.time_in).getTime()) / 3600000;
            caregiver.totalShiftHours += hours;
          }
        });
      }

      setCaregiverStats(Array.from(caregiverMap.values()).sort((a, b) => b.dispensed - a.dispensed));

      const medMap = new Map<string, MedicationStats>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logs.forEach((log: any) => {
        const medName = log.patient_medication?.medication?.name;
        const medDosage = log.patient_medication?.medication?.dosage;
        if (medName) {
          const key = `${medName}-${medDosage}`;
          const existing = medMap.get(key) || { name: medName, dosage: medDosage || "", dispensed: 0, missed: 0 };
          if (log.status === "taken") existing.dispensed++;
          else if (log.status === "missed") existing.missed++;
          medMap.set(key, existing);
        }
      });
      setMedicationStats(Array.from(medMap.values()).sort((a, b) => b.dispensed - a.dispensed));

      const { count: patientCount } = await supabase.from("patients").select("*", { count: "exact", head: true });
      const { count: caregiverCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "caregiver");

      setTotals({
        totalDispensed: dispensed,
        totalMissed: missed,
        totalPending: pending,
        complianceRate,
        totalPatients: patientCount || 0,
        totalCaregivers: caregiverCount || 0,
      });
    }

    setLoading(false);
  }, [dateRange, supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={userName}>
        <div className="space-y-5">
          <div className="skeleton-shimmer h-20 rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton-shimmer h-80 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Reports &amp; Analytics</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">System performance and compliance</p>
            </div>
            <RangeButtons range={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Hero KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <HeroCard
            label="Compliance Rate"
            value={totals.complianceRate}
            unit="%"
            subtitle={dateRange === "week" ? "Last 7 days" : dateRange === "month" ? "Last 30 days" : "Last 12 months"}
            gradient={totals.complianceRate >= 90 ? "teal-emerald" : totals.complianceRate >= 70 ? "blue-cyan" : "violet-indigo"}
          />
          <HeroCard
            label="Total Dispensed"
            value={totals.totalDispensed}
            subtitle="Medication events"
            gradient="blue-cyan"
          />
          <HeroCard
            label="Missed Doses"
            value={totals.totalMissed}
            subtitle="Requires attention"
            gradient="blue-violet"
          />
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Pending" value={totals.totalPending} accent="amber" icon={<ClockIcon />} />
          <StatTile label="Patients" value={totals.totalPatients} accent="cyan" icon={<UsersIcon />} />
          <StatTile label="Caregivers" value={totals.totalCaregivers} accent="violet" icon={<StaffIcon />} />
          <StatTile
            label="Active medications"
            value={medicationStats.length}
            accent="emerald"
            icon={<PillIcon />}
          />
        </div>

        {/* Daily activity + compliance donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel
            title="Daily Activity"
            className="lg:col-span-2"
            action={
              <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                <LegendSwatch color="#34d399" label="Dispensed" />
                <LegendSwatch color="#fb7185" label="Missed" />
                <LegendSwatch color="#fbbf24" label="Pending" />
              </div>
            }
          >
            {dailyStats.length > 0 ? (
              <BarChart
                height={200}
                data={dailyStats.slice(-14).map((d) => ({
                  label: new Date(d.date).toLocaleDateString("en-US", { day: "numeric" }),
                  value: d.dispensed + d.missed + d.pending,
                }))}
                ariaLabel="Daily activity bar chart"
              />
            ) : (
              <div className="text-center py-10 text-[var(--text-dim)] text-sm">No data available for selected period</div>
            )}
          </Panel>

          <Panel title="Compliance">
            <DonutChart
              size={140}
              centerValue={`${totals.complianceRate}%`}
              centerLabel="rate"
              segments={[
                { label: "Dispensed", value: totals.totalDispensed, color: "#34d399" },
                { label: "Missed", value: totals.totalMissed, color: "#fb7185" },
                { label: "Pending", value: totals.totalPending, color: "#fbbf24" },
              ]}
            />
          </Panel>
        </div>

        {/* Caregiver + Medication stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel title="Caregiver Performance" bodyPadding="0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <Th>Caregiver</Th>
                    <Th>Dispensed</Th>
                    <Th>Hours</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {caregiverStats.length > 0 ? (
                    caregiverStats.slice(0, 10).map((cg) => (
                      <tr key={cg.id} className="hover:bg-white/5">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-emerald)] to-[var(--accent-blue)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {cg.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-white truncate">{cg.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-[var(--accent-emerald)] font-medium">{cg.dispensed}</td>
                        <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{cg.totalShiftHours.toFixed(1)}h</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-[var(--text-dim)] text-sm">
                        No caregiver data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Medication Statistics" bodyPadding="0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <Th>Medication</Th>
                    <Th>Dispensed</Th>
                    <Th>Missed</Th>
                    <Th>Rate</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {medicationStats.length > 0 ? (
                    medicationStats.slice(0, 10).map((med, idx) => {
                      const total = med.dispensed + med.missed;
                      const rate = total > 0 ? Math.round((med.dispensed / total) * 100) : 100;
                      return (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="px-5 py-3 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{med.name}</p>
                            <p className="text-xs text-[var(--text-dim)] truncate">{med.dosage}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-[var(--accent-emerald)]">{med.dispensed}</td>
                          <td className="px-5 py-3 text-sm text-[var(--accent-rose)]">{med.missed}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`badge ${rate >= 90 ? "badge-emerald" : rate >= 70 ? "badge-amber" : "badge-rose"}`}
                            >
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-[var(--text-dim)] text-sm">
                        No medication data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RangeButtons({ range, onChange }: { range: Range; onChange: (v: Range) => void }) {
  const options: { value: Range; label: string }[] = [
    { value: "week", label: "7 days" },
    { value: "month", label: "30 days" },
    { value: "all", label: "All time" },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map((o) => {
        const active = range === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
              active
                ? "bg-[var(--accent-violet)]/20 border-[var(--accent-violet)]/40 text-[var(--accent-violet)]"
                : "bg-white/5 border-[var(--glass-border)] text-[var(--text-muted)] hover:text-white hover:bg-white/10"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function StaffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function PillIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}
