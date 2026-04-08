"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, useAttendance } from "@/lib/supabase/hooks";

interface AttendanceRecord {
  id: string;
  date: string;
  time_in: string;
  time_out: string | null;
  notes: string | null;
  caregiver?: {
    name: string;
  };
}

export default function AttendancePage() {
  const { profile } = useProfile();
  const { attendance, clockIn, clockOut } = useAttendance();
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance logs
  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("attendance_logs")
        .select(`
          *,
          caregiver:profiles(name)
        `)
        .eq("caregiver_id", user.id)
        .order("date", { ascending: false })
        .order("time_in", { ascending: false })
        .limit(30);

      if (data) {
        setAttendanceLogs(data);
      }
      setLoading(false);
    };

    fetchAttendanceLogs();
  }, [supabase, attendance]);

  const handleClockIn = async () => {
    await clockIn();
  };

  const handleClockOut = async () => {
    await clockOut();
  };

  // Calculate total hours this week
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

  // Calculate current shift duration
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver" userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Log</h1>
          <p className="text-slate-400">Track your work hours and shifts</p>
        </div>

        {/* Current Status Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 text-sm mb-1">Current Time</p>
                <p className="text-3xl font-bold text-white font-mono">
                  {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
                <p className="text-slate-400 text-sm mt-1 truncate">
                  {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {attendance && !attendance.time_out ? (
                <div className="text-right mr-4">
                  <p className="text-slate-400 text-sm">Shift Duration</p>
                  <p className="text-2xl font-bold text-emerald-400">{calculateShiftDuration()}</p>
                </div>
              ) : null}

              {attendance && !attendance.time_out ? (
                <button
                  onClick={handleClockOut}
                  className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Clock Out
                </button>
              ) : (
                <button
                  onClick={handleClockIn}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Clock In
                </button>
              )}
            </div>
          </div>

          {attendance && !attendance.time_out && (
            <div className="mt-4 pt-4 border-t border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">
                  Clocked in at {new Date(attendance.time_in).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{attendanceLogs.length}</p>
                <p className="text-sm text-slate-400">Total Shifts</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{calculateWeeklyHours()}</p>
                <p className="text-sm text-slate-400">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {attendance && !attendance.time_out ? "Active" : "Off Duty"}
                </p>
                <p className="text-sm text-slate-400">Current Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
          <div className="p-4 border-b border-[#1e293b]">
            <h2 className="text-lg font-semibold text-white">Attendance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e293b]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {attendanceLogs.map((log) => {
                  const timeIn = new Date(log.time_in);
                  const timeOut = log.time_out ? new Date(log.time_out) : null;
                  const duration = timeOut
                    ? Math.round((timeOut.getTime() - timeIn.getTime()) / 60000)
                    : null;
                  const durationStr = duration
                    ? `${Math.floor(duration / 60)}h ${duration % 60}m`
                    : "-";

                  return (
                    <tr key={log.id} className="hover:bg-[#1e293b]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">
                        {timeIn.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {timeOut
                          ? timeOut.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {durationStr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          log.time_out
                            ? "bg-slate-500/20 text-slate-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}>
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
            <div className="text-center py-12 text-slate-500">
              <p>No attendance records yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
