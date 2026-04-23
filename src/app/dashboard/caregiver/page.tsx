"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import HeroCard from "@/components/dashboard/HeroCard";
import StatTile from "@/components/dashboard/StatTile";
import DonutChart from "@/components/dashboard/charts/DonutChart";
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

function PendingIcon() {
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

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function CaregiverDashboard() {
  const [hoveredDrawer, setHoveredDrawer] = useState<string | null>(null);
  const { profile, loading: profileLoading } = useProfile();
  const { loading: patientsLoading } = usePatients();
  const { drawers, loading: drawersLoading } = useDrawers();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { attendance, clockIn, clockOut } = useAttendance();

  const [pendingMedications, setPendingMedications] = useState<PendingMedication[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dispensing, setDispensing] = useState<string | null>(null);

  const supabase = createClient();

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

      setPendingMedications((prev) => prev.filter((med) => med.id !== logId));
      setRecentActivity((prev) => [
        {
          id: logId,
          action: "Medication dispensed",
          detail: patientName,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          type: "success",
        },
        ...prev.slice(0, 4),
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

  useEffect(() => {
    const fetchPendingMedications = async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from("medication_logs")
        .select(`
          id,
          scheduled_time,
          patient:patients(id, name, room),
          medication:medications(name, dosage)
        `)
        .eq("status", "pending")
        .gte("scheduled_time", startOfDay)
        .lte("scheduled_time", endOfDay)
        .order("scheduled_time", { ascending: true })
        .limit(10);

      if (data && !error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const medications: PendingMedication[] = data.map((log: any) => {
          const scheduledTime = new Date(log.scheduled_time);
          const now = new Date();
          const diffMinutes = (scheduledTime.getTime() - now.getTime()) / 60000;

          let priority: "high" | "medium" | "normal" = "normal";
          if (diffMinutes < 0) priority = "high";
          else if (diffMinutes < 30) priority = "medium";

          return {
            id: log.id,
            patientId: log.patient?.id || "",
            patientName: log.patient?.name || "Unknown",
            patientInitials: (log.patient?.name || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2),
            room: log.patient?.room || "N/A",
            medicine: log.medication?.name || "Unknown",
            dosage: log.medication?.dosage || "",
            time: scheduledTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
            priority,
          };
        });
        setPendingMedications(medications);
      }
    };

    fetchPendingMedications();
    const interval = setInterval(fetchPendingMedications, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  const drawerData = drawers.map((d) => {
    const fillPercentage =
      d.estimated_pill_count && d.minimum_pill_count
        ? Math.min(100, (d.estimated_pill_count / d.minimum_pill_count) * 100)
        : 100;

    let status: "ok" | "low" | "critical" = "ok";
    if (fillPercentage < 25) status = "critical";
    else if (fillPercentage < 60) status = "low";

    return {
      id: d.label,
      status,
      fill: Math.round(fillPercentage),
      medication: d.medication ? `${d.medication.name}` : "Empty",
    };
  });

  const isLoading = profileLoading || patientsLoading || drawersLoading || statsLoading;

  if (isLoading) {
    return (
      <DashboardLayout userRole="caregiver" userName="Loading...">
        <div className="space-y-5">
          <div className="skeleton-shimmer h-24 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 skeleton-shimmer h-96 rounded-2xl" />
            <div className="skeleton-shimmer h-96 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const totalTasks = stats.dispensedToday + stats.pendingMedications;
  const completionRate = totalTasks > 0 ? Math.round((stats.dispensedToday / totalTasks) * 100) : 0;

  const now = new Date();
  const overdueCount = pendingMedications.filter((m) => {
    const scheduled = new Date();
    const [t, meridiem] = m.time.split(" ");
    const [h, min] = t.split(":").map(Number);
    let hours = h;
    if (meridiem === "PM" && h !== 12) hours += 12;
    if (meridiem === "AM" && h === 12) hours = 0;
    scheduled.setHours(hours, min, 0, 0);
    return scheduled.getTime() < now.getTime();
  }).length;
  const onTimeCount = pendingMedications.length - overdueCount;

  return (
    <DashboardLayout userRole="caregiver" userName={userName}>
      <div className="space-y-5 max-w-full">
        {/* Welcome */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-xl font-bold text-white">{firstName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="text-sm text-[var(--text-muted)] truncate">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {attendance ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-emerald)]/10 rounded-xl border border-[var(--accent-emerald)]/20">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)] animate-pulse-slow" />
                    <span className="text-sm font-medium text-[var(--accent-emerald)] whitespace-nowrap">On Shift</span>
                  </div>
                  {!attendance.time_out && (
                    <button onClick={clockOut} className="btn btn-ghost text-sm whitespace-nowrap">
                      Clock Out
                    </button>
                  )}
                </>
              ) : (
                <button onClick={clockIn} className="btn btn-primary text-sm whitespace-nowrap">
                  Clock In to Start
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero + Stats — 5-col grid: hero=2, stat=1 × 3 = 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 min-w-0">
            <HeroCard
              label="Completion today"
              value={`${completionRate}`}
              unit="%"
              subtitle={`${stats.dispensedToday} of ${totalTasks} doses`}
              gradient="teal-emerald"
              icon={<CheckIcon />}
            />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <StatTile
              label="Pending medications"
              value={stats.pendingMedications}
              icon={<PendingIcon />}
              accent="amber"
              delta={stats.pendingMedications > 0 ? { value: "action", direction: "neutral" } : undefined}
            />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <StatTile
              label="Your patients"
              value={stats.assignedPatients}
              icon={<UsersIcon />}
              accent="blue"
            />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <StatTile
              label="Low stock alerts"
              value={stats.lowStockAlerts}
              icon={<AlertIcon />}
              accent="rose"
              delta={stats.lowStockAlerts > 0 ? { value: "alert", direction: "down" } : undefined}
              emphasize={stats.lowStockAlerts > 0}
            />
          </div>
        </div>

        {/* Queue (primary) + My Day */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel
            title="Medication Queue"
            className="lg:col-span-2"
            action={<span className="badge badge-blue">{pendingMedications.length} pending</span>}
            bodyPadding="0"
          >
            <div className="divide-y divide-[var(--glass-border)]">
              {pendingMedications.length > 0 ? (
                pendingMedications.slice(0, 6).map((med) => (
                  <div key={med.id} className="p-4 flex items-center gap-3 hover:bg-[var(--glass-highlight)] transition-colors min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                        med.priority === "high"
                          ? "bg-gradient-to-br from-[var(--accent-rose)] to-[var(--accent-amber)] text-white"
                          : med.priority === "medium"
                          ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                          : "bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]"
                      }`}
                    >
                      {med.patientInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{med.patientName}</p>
                        {med.priority === "high" && (
                          <span className="badge badge-rose text-[10px] flex-shrink-0">Overdue</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {med.medicine} • {med.dosage} • Room {med.room}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p
                        className={`text-sm font-medium ${
                          med.priority === "high" ? "text-[var(--accent-rose)]" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {med.time}
                      </p>
                    </div>
                    <button
                      onClick={() => dispenseMedication(med.id, med.patientName)}
                      disabled={dispensing === med.id}
                      className="btn btn-primary text-xs px-4 py-2 flex-shrink-0"
                    >
                      {dispensing === med.id ? "..." : "Dispense"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-[var(--accent-emerald)]/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[var(--accent-emerald)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">All caught up!</p>
                  <p className="text-xs text-[var(--text-dim)]">No pending medications</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="My Day">
            <DonutChart
              size={140}
              centerValue={`${completionRate}%`}
              centerLabel="done"
              segments={[
                { label: "Completed", value: stats.dispensedToday, color: "#34d399" },
                { label: "Remaining", value: onTimeCount, color: "#22d3ee" },
                { label: "Overdue", value: overdueCount, color: "#fb7185" },
              ]}
            />
          </Panel>
        </div>

        {/* Storage + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel
            title="Storage Unit Status"
            className="lg:col-span-2"
            action={<span className="text-xs text-[var(--text-dim)]">{drawerData.length} drawers</span>}
          >
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {drawerData.map((drawer) => (
                <div
                  key={drawer.id}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer min-w-0 ${
                    drawer.status === "critical"
                      ? "border-[var(--accent-rose)]/50 bg-[var(--accent-rose)]/10"
                      : drawer.status === "low"
                      ? "border-[var(--accent-amber)]/50 bg-[var(--accent-amber)]/10"
                      : "border-[var(--glass-border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-blue)]/30"
                  }`}
                  onMouseEnter={() => setHoveredDrawer(drawer.id)}
                  onMouseLeave={() => setHoveredDrawer(null)}
                >
                  <div className="text-xs font-semibold text-white mb-2 truncate">{drawer.id}</div>
                  <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        drawer.status === "critical"
                          ? "bg-[var(--accent-rose)]"
                          : drawer.status === "low"
                          ? "bg-[var(--accent-amber)]"
                          : "bg-[var(--accent-emerald)]"
                      }`}
                      style={{ width: `${drawer.fill}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[var(--text-dim)] mt-1">{drawer.fill}%</div>
                  {hoveredDrawer === drawer.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-lg text-xs text-white whitespace-nowrap z-10 shadow-xl">
                      {drawer.medication}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Recent Activity" bodyPadding="1rem">
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        a.type === "success"
                          ? "bg-[var(--accent-emerald)]"
                          : a.type === "warning"
                          ? "bg-[var(--accent-amber)]"
                          : "bg-[var(--accent-blue)]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-secondary)] truncate">{a.action}</p>
                      <p className="text-[11px] text-[var(--text-dim)] truncate">
                        {a.detail} • {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--text-dim)]">No activity yet today</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
