"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/supabase/hooks";

interface DashboardStats {
  totalPatients: number;
  totalCaregivers: number;
  totalMedications: number;
  pendingToday: number;
  dispensedToday: number;
  lowStockAlerts: number;
  activeShifts: number;
}

interface RecentActivity {
  id: string;
  type: "dispense" | "login" | "alert";
  message: string;
  time: string;
}

export default function AdminDashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalCaregivers: 0,
    totalMedications: 0,
    pendingToday: 0,
    dispensedToday: 0,
    lowStockAlerts: 0,
    activeShifts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const userName = profile?.name || "Loading...";
  const firstName = profile?.name?.split(" ")[0] || "Admin";

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // Fetch all counts
      const [
        { count: patientCount },
        { count: caregiverCount },
        { count: medicationCount },
        { count: pendingCount },
        { count: dispensedCount },
        { count: lowStockCount },
        { count: activeShiftCount },
      ] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "caregiver"),
        supabase.from("medications").select("*", { count: "exact", head: true }),
        supabase.from("medication_logs").select("*", { count: "exact", head: true })
          .eq("status", "pending").gte("scheduled_time", startOfDay).lte("scheduled_time", endOfDay),
        supabase.from("medication_logs").select("*", { count: "exact", head: true })
          .eq("status", "taken").gte("scheduled_time", startOfDay).lte("scheduled_time", endOfDay),
        supabase.from("drawers").select("*", { count: "exact", head: true })
          .in("status", ["low_stock", "empty"]),
        supabase.from("attendance_logs").select("*", { count: "exact", head: true })
          .eq("date", new Date().toISOString().split("T")[0]).is("time_out", null),
      ]);

      setStats({
        totalPatients: patientCount || 0,
        totalCaregivers: caregiverCount || 0,
        totalMedications: medicationCount || 0,
        pendingToday: pendingCount || 0,
        dispensedToday: dispensedCount || 0,
        lowStockAlerts: lowStockCount || 0,
        activeShifts: activeShiftCount || 0,
      });

      // Fetch recent medication logs for activity
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
        .limit(5);

      if (logs) {
        const activities: RecentActivity[] = logs.map((log: any) => ({
          id: log.id,
          type: "dispense" as const,
          message: log.status === "taken"
            ? `${log.caregiver?.name || "Caregiver"} dispensed medication to ${log.patient?.name || "Patient"}`
            : `Medication pending for ${log.patient?.name || "Patient"}`,
          time: log.actual_time || log.scheduled_time,
        }));
        setRecentActivity(activities);
      }

      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  if (loading || profileLoading) {
    return (
      <DashboardLayout userRole="admin" userName="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      <div className="space-y-6 overflow-hidden">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{firstName}</span>
            </h1>
            <p className="text-slate-400 mt-1">System overview and management</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            <span className="text-purple-400 font-medium text-sm">System Online</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl border border-blue-500/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium">Patients</span>
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
            <p className="text-sm text-slate-500">Total registered</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium">Caregivers</span>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalCaregivers}</p>
            <p className="text-sm text-emerald-400">{stats.activeShifts} on shift</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl border border-amber-500/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium">Today&apos;s Meds</span>
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.dispensedToday}/{stats.dispensedToday + stats.pendingToday}</p>
            <p className="text-sm text-amber-400">{stats.pendingToday} pending</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl border border-red-500/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium">Alerts</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.lowStockAlerts}</p>
            <p className="text-sm text-red-400">Low stock items</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-5">
              <a
                href="/dashboard/admin/patients"
                className="p-5 bg-[#1e293b] rounded-xl hover:bg-[#334155] transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Add Patient</p>
                <p className="text-sm text-slate-400">Register new patient</p>
              </a>

              <a
                href="/dashboard/admin/staff"
                className="p-5 bg-[#1e293b] rounded-xl hover:bg-[#334155] transition-colors group"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Add Caregiver</p>
                <p className="text-sm text-slate-400">Register new staff</p>
              </a>

              <a
                href="/dashboard/admin/medications"
                className="p-5 bg-[#1e293b] rounded-xl hover:bg-[#334155] transition-colors group"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-white font-medium">Add Medication</p>
                <p className="text-sm text-slate-400">Add to inventory</p>
              </a>

              <a
                href="/dashboard/admin/reports"
                className="p-5 bg-[#1e293b] rounded-xl hover:bg-[#334155] transition-colors group"
              >
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white font-medium">View Reports</p>
                <p className="text-sm text-slate-400">Analytics & insights</p>
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === "dispense" ? "bg-emerald-500" : "bg-blue-500"
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white break-words">{activity.message}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.time).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6">
          <h2 className="text-lg font-semibold text-white mb-5">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="flex items-center gap-3 p-5 bg-[#1e293b] rounded-xl">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="text-white font-medium">Database</p>
                <p className="text-xs text-slate-400">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 bg-[#1e293b] rounded-xl">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="text-white font-medium">Auth Service</p>
                <p className="text-xs text-slate-400">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 bg-[#1e293b] rounded-xl">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="text-white font-medium">Storage Unit</p>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 bg-[#1e293b] rounded-xl">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="text-white font-medium">API</p>
                <p className="text-xs text-slate-400">Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
