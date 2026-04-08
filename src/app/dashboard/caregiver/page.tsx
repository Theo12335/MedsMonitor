"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, usePatients, useDrawers, useDashboardStats, useAttendance } from "@/lib/supabase/hooks";

interface PendingMedication {
  id: string;
  patientName: string;
  patientInitials: string;
  room: string;
  medicine: string;
  dosage: string;
  time: string;
  priority: "high" | "medium" | "normal";
  patientId: string;
}

interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: "success" | "warning" | "info";
}

export default function CaregiverDashboard() {
  const [hoveredDrawer, setHoveredDrawer] = useState<string | null>(null);
  const { profile, loading: profileLoading } = useProfile();
  const { patients, loading: patientsLoading } = usePatients();
  const { drawers, loading: drawersLoading } = useDrawers();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { attendance, clockIn, clockOut } = useAttendance();

  const [pendingMedications, setPendingMedications] = useState<PendingMedication[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [lowStockItems, setLowStockItems] = useState<{ name: string; drawer: string; current: number; threshold: number }[]>([]);
  const [dispensing, setDispensing] = useState<string | null>(null);

  const supabase = createClient();

  // Dispense medication function
  const dispenseMedication = async (logId: string, patientName: string) => {
    if (dispensing) return;
    setDispensing(logId);

    try {
      const { error } = await supabase
        .from("medication_logs")
        .update({
          status: "taken",
          actual_time: new Date().toISOString(),
          caregiver_id: profile?.id,
        })
        .eq("id", logId);

      if (error) throw error;

      // Remove from pending list
      setPendingMedications(prev => prev.filter(med => med.id !== logId));

      // Add to recent activity
      setRecentActivity(prev => [
        {
          id: logId,
          action: "Medication dispensed",
          detail: patientName,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          type: "success",
        },
        ...prev.slice(0, 3),
      ]);

    } catch (err) {
      console.error("Error dispensing medication:", err);
      alert("Failed to dispense medication. Please try again.");
    } finally {
      setDispensing(null);
    }
  };

  const userName = profile?.name || "Loading...";
  const firstName = profile?.name?.split(" ")[0] || "Caregiver";

  // Fetch pending medications with patient info
  useEffect(() => {
    const fetchPendingMedications = async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: logs } = await supabase
        .from("medication_logs")
        .select(`
          id,
          scheduled_time,
          status,
          patient:patients(id, name, room_number),
          patient_medication:patient_medications(
            dosage,
            medication:medications(name, drawer_location)
          )
        `)
        .eq("status", "pending")
        .gte("scheduled_time", startOfDay)
        .lte("scheduled_time", endOfDay)
        .order("scheduled_time")
        .limit(8);

      if (logs) {
        const medications: PendingMedication[] = logs.map((log: any, index: number) => {
          const scheduledTime = new Date(log.scheduled_time);
          const now = new Date();
          const diffMinutes = (scheduledTime.getTime() - now.getTime()) / 60000;

          let priority: "high" | "medium" | "normal" = "normal";
          if (diffMinutes < 0) priority = "high"; // Overdue
          else if (diffMinutes < 30) priority = "medium"; // Due soon

          return {
            id: log.id,
            patientName: log.patient?.name || "Unknown",
            patientInitials: log.patient?.name?.split(" ").map((n: string) => n[0]).join("") || "?",
            room: log.patient?.room_number || "N/A",
            medicine: log.patient_medication?.medication?.name || "Unknown",
            dosage: log.patient_medication?.dosage || "N/A",
            time: scheduledTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
            priority,
            patientId: log.patient?.id,
          };
        });
        setPendingMedications(medications);
      }
    };

    fetchPendingMedications();
  }, [supabase]);

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      const { data: logs } = await supabase
        .from("medication_logs")
        .select(`
          id,
          status,
          actual_time,
          patient:patients(name)
        `)
        .eq("status", "taken")
        .order("actual_time", { ascending: false })
        .limit(4);

      if (logs) {
        const activities: RecentActivity[] = logs.map((log: any) => ({
          id: log.id,
          action: "Medication dispensed",
          detail: log.patient?.name || "Unknown patient",
          time: log.actual_time ? new Date(log.actual_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "N/A",
          type: "success" as const,
        }));
        setRecentActivity(activities);
      }
    };

    fetchRecentActivity();
  }, [supabase]);

  // Process low stock items from drawers
  useEffect(() => {
    if (drawers.length > 0) {
      const lowStock = drawers
        .filter(d => d.status === "low_stock" || d.status === "empty")
        .map(d => ({
          name: d.medication?.name ? `${d.medication.name} ${d.medication.dosage}` : `Drawer ${d.label}`,
          drawer: d.label,
          current: d.estimated_pill_count,
          threshold: d.minimum_pill_count,
        }));
      setLowStockItems(lowStock);
    }
  }, [drawers]);

  // Map drawers for visualization
  const drawerData = drawers.map(d => {
    const fillPercentage = d.minimum_pill_count > 0
      ? Math.min(100, (d.estimated_pill_count / d.minimum_pill_count) * 100)
      : 100;

    let fillStatus: "full" | "mid" | "empty" = "full";
    if (fillPercentage < 25) fillStatus = "empty";
    else if (fillPercentage < 60) fillStatus = "mid";

    return {
      id: d.label,
      fillStatus,
      fill: Math.round(fillPercentage),
      medication: d.medication ? `${d.medication.name} ${d.medication.dosage}` : "Empty",
    };
  });

  const isLoading = profileLoading || patientsLoading || drawersLoading || statsLoading;

  if (isLoading) {
    return (
      <DashboardLayout userRole="caregiver" userName="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver" userName={userName}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="overflow-hidden">
        {/* Welcome Header */}
        <div style={{ gap: '16px' }} className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{firstName}</span>
            </h1>
            <p style={{ marginTop: '4px' }} className="text-slate-400">Here&apos;s your shift overview for today</p>
          </div>
          <div style={{ gap: '12px' }} className="flex items-center flex-shrink-0 flex-wrap">
            {attendance ? (
              <>
                <div style={{ padding: '8px 16px', gap: '8px' }} className="flex items-center bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-medium text-sm whitespace-nowrap">Shift Active</span>
                </div>
                <span className="text-slate-500 text-sm hidden lg:block whitespace-nowrap">
                  Started: {new Date(attendance.time_in).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
                {!attendance.time_out && (
                  <button
                    onClick={clockOut}
                    style={{ padding: '12px 20px' }}
                    className="bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-colors whitespace-nowrap"
                  >
                    Clock Out
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={clockIn}
                style={{ padding: '14px 24px' }}
                className="bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors whitespace-nowrap"
              >
                Clock In
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ gap: '24px' }} className="grid grid-cols-2 lg:grid-cols-4">
          {/* Pending Medications */}
          <div style={{ padding: '24px' }} className="group relative bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div style={{ marginBottom: '12px' }} className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Pending Meds</span>
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p style={{ marginBottom: '4px' }} className="text-3xl font-bold text-white">{stats.pendingMedications}</p>
              <p style={{ gap: '4px' }} className="text-sm text-amber-400 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
                Requires attention
              </p>
            </div>
          </div>

          {/* Patients Assigned */}
          <div style={{ padding: '24px' }} className="group relative bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div style={{ marginBottom: '12px' }} className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Patients</span>
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p style={{ marginBottom: '4px' }} className="text-3xl font-bold text-white">{stats.assignedPatients}</p>
              <p style={{ marginTop: '4px' }} className="text-sm text-slate-500">Active patients</p>
            </div>
          </div>

          {/* Dispensed Today */}
          <div style={{ padding: '24px' }} className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div style={{ marginBottom: '12px' }} className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Dispensed</span>
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p style={{ marginBottom: '4px' }} className="text-3xl font-bold text-white">{stats.dispensedToday}</p>
              <p style={{ gap: '4px' }} className="text-sm text-emerald-400 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Today&apos;s count
              </p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div style={{ padding: '24px' }} className="group relative bg-gradient-to-br from-red-500/10 to-rose-500/5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div style={{ marginBottom: '12px' }} className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Low Stock</span>
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p style={{ marginBottom: '4px' }} className="text-3xl font-bold text-white">{stats.lowStockAlerts}</p>
              <p style={{ gap: '4px' }} className="text-sm text-red-400 flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Needs restocking
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ gap: '24px' }} className="grid grid-cols-1 xl:grid-cols-3">
          {/* Assigned Patients Cards */}
          <div className="xl:col-span-2 bg-[#0a0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
            <div style={{ padding: '20px' }} className="border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Pending Medications</h2>
                <p style={{ marginTop: '2px' }} className="text-sm text-slate-500">Medications due for dispensing</p>
              </div>
            </div>

            {/* Card Grid */}
            <div style={{ padding: '24px', gap: '20px' }} className="grid grid-cols-1 md:grid-cols-2">
              {pendingMedications.length > 0 ? (
                pendingMedications.map((med) => (
                  <div key={med.id} style={{ padding: '24px' }} className="group rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
                    <div style={{ gap: '16px', marginBottom: '16px' }} className="flex items-center">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {med.patientInitials}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0f1a] ${
                          med.priority === 'high' ? 'bg-red-500' :
                          med.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">{med.patientName}</h3>
                        <p className="text-sm text-slate-400">Room {med.room}</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ gap: '8px' }} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400 flex-shrink-0">Medication</span>
                        <span className="text-sm font-medium text-white truncate">{med.medicine}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Dosage</span>
                        <span style={{ padding: '4px 8px' }} className="text-xs bg-slate-800 rounded text-slate-300">{med.dosage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Scheduled</span>
                        <span className={`text-sm font-semibold ${
                          med.priority === 'high' ? 'text-red-400' :
                          med.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{med.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => dispenseMedication(med.id, med.patientName)}
                      disabled={dispensing === med.id}
                      style={{ padding: '14px 20px' }}
                      className={`w-full rounded-xl text-sm font-medium transition-all ${
                        dispensing === med.id
                          ? 'bg-emerald-500/5 text-emerald-400/50 cursor-wait'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {dispensing === med.id ? 'Dispensing...' : 'Dispense Medication'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No pending medications at this time</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="min-w-0 overflow-hidden">
            {/* Recent Activity */}
            <div className="bg-[#0a0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
              <div style={{ padding: '20px' }} className="border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <p style={{ marginTop: '2px' }} className="text-sm text-slate-500">Latest updates from your shift</p>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      style={{ padding: '12px', gap: '12px' }}
                      className="flex items-start rounded-xl hover:bg-white/[0.02] transition-colors overflow-hidden"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        activity.type === 'success' ? 'bg-emerald-500' :
                        activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                        <p className="text-xs text-slate-500 truncate">{activity.detail}</p>
                      </div>
                      <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '16px 0' }} className="text-center text-slate-500">No recent activity</p>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <div className="bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl border border-red-500/20 overflow-hidden">
                <div style={{ padding: '20px', gap: '12px' }} className="border-b border-red-500/10 flex items-center">
                  <div className="w-10 h-10 flex-shrink-0 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white">Low Stock Alert</h2>
                    <p className="text-sm text-slate-500">Items below threshold</p>
                  </div>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {lowStockItems.map((item, index) => (
                    <div
                      key={index}
                      style={{ padding: '20px' }}
                      className="bg-red-500/5 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-colors"
                    >
                      <div style={{ gap: '8px', marginBottom: '8px' }} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">{item.name}</span>
                        <span className="text-sm text-red-400 font-bold flex-shrink-0">{item.current} left</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Drawer {item.drawer}</span>
                        <span>Min: {item.threshold}</span>
                      </div>
                      <div style={{ marginTop: '8px' }} className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-400"
                          style={{ width: `${Math.min(100, (item.current / item.threshold) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Smart Storage Status */}
        {drawerData.length > 0 && (
          <div style={{ padding: '24px' }} className="bg-[#0a0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5">
            <div style={{ gap: '16px', marginBottom: '24px' }} className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Smart Storage Unit Status</h2>
                <p style={{ marginTop: '2px' }} className="text-sm text-slate-500">Real-time drawer monitoring</p>
              </div>
              <div style={{ padding: '8px 16px', gap: '8px' }} className="flex items-center bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium text-sm">Connected</span>
              </div>
            </div>
            <div style={{ gap: '20px' }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {drawerData.map((drawer) => (
                <div
                  key={drawer.id}
                  style={{ padding: '16px' }}
                  className={`relative rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                    drawer.fillStatus === "empty"
                      ? "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30 hover:border-red-400/50"
                      : drawer.fillStatus === "mid"
                      ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30 hover:border-amber-400/50"
                      : "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-400/50"
                  }`}
                  onMouseEnter={() => setHoveredDrawer(drawer.id)}
                  onMouseLeave={() => setHoveredDrawer(null)}
                >
                  {hoveredDrawer === drawer.id && (
                    <div style={{ padding: '6px 12px' }} className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 rounded-lg text-xs text-white whitespace-nowrap z-10 border border-slate-700">
                      {drawer.medication}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
                    </div>
                  )}
                  <p style={{ marginBottom: '4px' }} className="text-sm font-semibold text-white">Drawer {drawer.id}</p>
                  <p className={`text-xs font-medium ${
                    drawer.fillStatus === "empty" ? "text-red-400" :
                    drawer.fillStatus === "mid" ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {drawer.fillStatus === "empty" ? "Low" : drawer.fillStatus === "mid" ? "Mid" : "Full"}
                  </p>
                  <div style={{ marginTop: '12px' }} className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        drawer.fillStatus === "empty"
                          ? "bg-gradient-to-r from-red-500 to-red-400"
                          : drawer.fillStatus === "mid"
                          ? "bg-gradient-to-r from-amber-500 to-amber-400"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      }`}
                      style={{ width: `${drawer.fill}%` }}
                    ></div>
                  </div>
                  <p style={{ marginTop: '8px' }} className="text-xs text-slate-500">{drawer.fill}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
