"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
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

export default function ReportsPage() {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"week" | "month" | "all">("week");
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

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    return { startDate: startDate.toISOString(), endDate: now.toISOString() };
  };

  // Fetch all stats
  const fetchStats = async () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange();

    // Fetch medication logs
    const { data: logs } = await supabase
      .from("medication_logs")
      .select(`
        id,
        status,
        scheduled_time,
        actual_time,
        caregiver_id,
        patient_medication:patient_medications(
          medication:medications(name, dosage)
        ),
        caregiver:profiles(name)
      `)
      .gte("scheduled_time", startDate)
      .lte("scheduled_time", endDate);

    if (logs) {
      // Calculate totals
      const dispensed = logs.filter((l) => l.status === "taken").length;
      const missed = logs.filter((l) => l.status === "missed").length;
      const pending = logs.filter((l) => l.status === "pending").length;
      const total = dispensed + missed;
      const complianceRate = total > 0 ? Math.round((dispensed / total) * 100) : 100;

      // Group by date for daily stats
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

      // Group by caregiver
      const caregiverMap = new Map<string, CaregiverStats>();
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

      // Fetch attendance for shift hours
      const { data: attendance } = await supabase
        .from("attendance_logs")
        .select("caregiver_id, time_in, time_out")
        .gte("date", startDate.split("T")[0])
        .lte("date", endDate.split("T")[0]);

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

      // Group by medication
      const medMap = new Map<string, MedicationStats>();
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

      // Fetch patient and caregiver counts
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
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={userName}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const maxDaily = Math.max(...dailyStats.map((d) => d.dispensed + d.missed + d.pending), 1);

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      <div className="space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-slate-400">System performance and compliance reports</p>
          </div>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <button
              onClick={() => setDateRange("week")}
              style={{ padding: '12px 20px' }}
              className={`rounded-xl font-medium transition-colors ${
                dateRange === "week" ? "bg-purple-500 text-white" : "bg-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange("month")}
              style={{ padding: '12px 20px' }}
              className={`rounded-xl font-medium transition-colors ${
                dateRange === "month" ? "bg-purple-500 text-white" : "bg-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange("all")}
              style={{ padding: '12px 20px' }}
              className={`rounded-xl font-medium transition-colors ${
                dateRange === "all" ? "bg-purple-500 text-white" : "bg-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <p className="text-3xl font-bold text-white">{totals.totalDispensed}</p>
            <p className="text-sm text-emerald-400 mt-1">Dispensed</p>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <p className="text-3xl font-bold text-white">{totals.totalMissed}</p>
            <p className="text-sm text-red-400 mt-1">Missed</p>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <p className="text-3xl font-bold text-white">{totals.totalPending}</p>
            <p className="text-sm text-amber-400 mt-1">Pending</p>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <p className="text-3xl font-bold text-white">{totals.complianceRate}%</p>
            <p className="text-sm text-purple-400 mt-1">Compliance</p>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <p className="text-3xl font-bold text-white">{totals.totalPatients}</p>
            <p className="text-sm text-blue-400 mt-1">Patients</p>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <p className="text-3xl font-bold text-white">{totals.totalCaregivers}</p>
            <p className="text-sm text-slate-400 mt-1">Caregivers</p>
          </div>
        </div>

        {/* Daily Chart */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Activity</h2>
          {dailyStats.length > 0 ? (
            <div className="space-y-3">
              {dailyStats.slice(-14).map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-24 flex-shrink-0">
                    {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1 flex items-center gap-1 h-6">
                    <div
                      className="h-full bg-emerald-500 rounded-l"
                      style={{ width: `${(day.dispensed / maxDaily) * 100}%` }}
                      title={`Dispensed: ${day.dispensed}`}
                    ></div>
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${(day.missed / maxDaily) * 100}%` }}
                      title={`Missed: ${day.missed}`}
                    ></div>
                    <div
                      className="h-full bg-amber-500 rounded-r"
                      style={{ width: `${(day.pending / maxDaily) * 100}%` }}
                      title={`Pending: ${day.pending}`}
                    ></div>
                  </div>
                  <span className="text-sm text-white w-16 text-right">
                    {day.dispensed + day.missed + day.pending}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No data available for selected period</p>
          )}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#1e293b]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-sm text-slate-400">Dispensed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-slate-400">Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span className="text-sm text-slate-400">Pending</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Caregiver Performance */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="p-4 border-b border-[#1e293b]">
              <h2 className="text-lg font-semibold text-white">Caregiver Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1e293b]">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Caregiver</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Dispensed</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {caregiverStats.length > 0 ? (
                    caregiverStats.slice(0, 10).map((cg) => (
                      <tr key={cg.id} className="hover:bg-[#1e293b]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                              {cg.name.charAt(0)}
                            </div>
                            <span className="text-white">{cg.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-medium">{cg.dispensed}</td>
                        <td className="px-4 py-3 text-slate-400">{cg.totalShiftHours.toFixed(1)}h</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        No caregiver data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Medication Statistics */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
            <div className="p-4 border-b border-[#1e293b]">
              <h2 className="text-lg font-semibold text-white">Medication Statistics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1e293b]">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Medication</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Dispensed</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Missed</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {medicationStats.length > 0 ? (
                    medicationStats.slice(0, 10).map((med, idx) => {
                      const total = med.dispensed + med.missed;
                      const rate = total > 0 ? Math.round((med.dispensed / total) * 100) : 100;
                      return (
                        <tr key={idx} className="hover:bg-[#1e293b]/50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">{med.name}</p>
                              <p className="text-xs text-slate-500">{med.dosage}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-emerald-400">{med.dispensed}</td>
                          <td className="px-4 py-3 text-red-400">{med.missed}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rate >= 90 ? "bg-emerald-500/20 text-emerald-400" :
                              rate >= 70 ? "bg-amber-500/20 text-amber-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No medication data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Compliance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={totals.complianceRate >= 90 ? "#10b981" : totals.complianceRate >= 70 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="12"
                    strokeDasharray={`${(totals.complianceRate / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{totals.complianceRate}%</span>
                </div>
              </div>
              <p className="text-slate-400">Overall Compliance Rate</p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">On-Time Dispensing</span>
                  <span className="text-emerald-400 font-medium">{totals.totalDispensed}</span>
                </div>
                <div className="w-full bg-[#1e293b] rounded-full h-2">
                  <div
                    className="h-2 bg-emerald-500 rounded-full"
                    style={{ width: `${(totals.totalDispensed / (totals.totalDispensed + totals.totalMissed + totals.totalPending || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Missed Doses</span>
                  <span className="text-red-400 font-medium">{totals.totalMissed}</span>
                </div>
                <div className="w-full bg-[#1e293b] rounded-full h-2">
                  <div
                    className="h-2 bg-red-500 rounded-full"
                    style={{ width: `${(totals.totalMissed / (totals.totalDispensed + totals.totalMissed + totals.totalPending || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Pending</span>
                  <span className="text-amber-400 font-medium">{totals.totalPending}</span>
                </div>
                <div className="w-full bg-[#1e293b] rounded-full h-2">
                  <div
                    className="h-2 bg-amber-500 rounded-full"
                    style={{ width: `${(totals.totalPending / (totals.totalDispensed + totals.totalMissed + totals.totalPending || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-[#1e293b] rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Quick Insights</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-300">
                    {totals.complianceRate >= 90 ? "Excellent compliance rate!" : totals.complianceRate >= 70 ? "Good compliance, room for improvement" : "Compliance needs attention"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-300">
                    {caregiverStats.length} active caregivers in period
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-slate-300">
                    {medicationStats.length} medications tracked
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
