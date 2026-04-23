"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import StatTile from "@/components/dashboard/StatTile";
import HeroCard from "@/components/dashboard/HeroCard";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, useAttendance } from "@/lib/supabase/hooks";

interface AttendanceRecord {
  id: string;
  date: string;
  time_in: string;
  time_out: string | null;
  notes: string | null;
  caregiver?: { name: string };
}

function ShiftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function AttendancePage() {
  const { profile } = useProfile();
  const { attendance, clockIn, clockOut } = useAttendance();
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("attendance_logs")
        .select(`*, caregiver:profiles(name)`)
        .eq("caregiver_id", user.id)
        .order("date", { ascending: false })
        .order("time_in", { ascending: false })
        .limit(30);

      if (data) setAttendanceLogs(data);
      setLoading(false);
    };
    fetchAttendanceLogs();
  }, [supabase, attendance]);

  const calculateWeeklyHours = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let totalMinutes = 0;
    attendanceLogs.forEach((log) => {
      const logDate = new Date(log.date);
      if (logDate >= startOfWeek && log.time_out) {
        const timeIn = new Date(log.time_in);
        const timeOut = new Date(log.time_out);
        totalMinutes += (timeOut.getTime() - timeIn.getTime()) / 60000;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateShiftDuration = () => {
    if (!attendance || attendance.time_out) return "0h 0m";
    const timeIn = new Date(attendance.time_in);
    const diff = currentTime.getTime() - timeIn.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <DashboardLayout userRole="caregiver" userName={userName}>
        <div className="space-y-5">
          <div className="skeleton-shimmer h-20 rounded-2xl" />
          <div className="skeleton-shimmer h-40 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isOnShift = Boolean(attendance && !attendance.time_out);

  return (
    <DashboardLayout userRole="caregiver" userName={userName}>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Attendance Log</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">Track your work hours and shifts</p>
            </div>
            {isOnShift ? (
              <button
                onClick={() => clockOut()}
                className="btn btn-ghost text-sm whitespace-nowrap flex-shrink-0"
                style={{ background: "rgba(251,113,133,0.15)", color: "#fb7185", borderColor: "rgba(251,113,133,0.35)" }}
              >
                Clock Out
              </button>
            ) : (
              <button onClick={() => clockIn()} className="btn btn-primary text-sm whitespace-nowrap flex-shrink-0">
                Clock In
              </button>
            )}
          </div>
        </div>

        {/* Current Status — Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <div className="min-w-0">
            <HeroCard
              label="Current Time"
              value={currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              subtitle={currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              gradient={isOnShift ? "teal-emerald" : "blue-cyan"}
              icon={<ClockIcon />}
            />
          </div>
          <div className="min-w-0">
            <HeroCard
              label={isOnShift ? "Shift duration" : "Status"}
              value={isOnShift ? calculateShiftDuration() : "Off duty"}
              subtitle={
                isOnShift && attendance
                  ? `Since ${new Date(attendance.time_in).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
                  : "Not clocked in"
              }
              gradient={isOnShift ? "violet-indigo" : "blue-violet"}
              icon={<ShiftIcon />}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Total Shifts" value={attendanceLogs.length} icon={<ShiftIcon />} accent="emerald" />
          <StatTile label="This Week" value={calculateWeeklyHours()} icon={<ClockIcon />} accent="blue" />
          <StatTile
            label="Current Status"
            value={isOnShift ? "Active" : "Off Duty"}
            icon={<CalendarIcon />}
            accent={isOnShift ? "emerald" : "violet"}
            emphasize={isOnShift}
          />
        </div>

        {/* Attendance History */}
        <Panel title="Attendance History" bodyPadding="0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <Th>Date</Th>
                  <Th>Clock In</Th>
                  <Th>Clock Out</Th>
                  <Th>Duration</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {attendanceLogs.map((log) => {
                  const timeIn = new Date(log.time_in);
                  const timeOut = log.time_out ? new Date(log.time_out) : null;
                  const duration = timeOut
                    ? Math.round((timeOut.getTime() - timeIn.getTime()) / 60000)
                    : null;
                  const durationStr = duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : "-";

                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--accent-emerald)] font-medium">
                        {timeIn.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                        {timeOut
                          ? timeOut.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{durationStr}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${log.time_out ? "badge-blue" : "badge-emerald"}`}>
                          {log.time_out ? "Completed" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {attendanceLogs.length === 0 && (
            <div className="text-center py-10 text-[var(--text-dim)] text-sm">No attendance records yet</div>
          )}
        </Panel>
      </div>
    </DashboardLayout>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
