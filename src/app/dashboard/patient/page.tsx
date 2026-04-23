"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";

// Mock data - replace with real API calls
const todayMedications = [
  { id: 1, medicine: "Aspirin", dosage: "100mg", time: "8:00 AM", status: "taken", takenAt: "7:58 AM" },
  { id: 2, medicine: "Metformin", dosage: "500mg", time: "12:00 PM", status: "pending", takenAt: null },
  { id: 3, medicine: "Lisinopril", dosage: "10mg", time: "6:00 PM", status: "pending", takenAt: null },
  { id: 4, medicine: "Vitamin D", dosage: "1000 IU", time: "8:00 PM", status: "pending", takenAt: null },
];

const medicationHistory = [
  { date: "Mon", taken: 4, total: 4 },
  { date: "Tue", taken: 3, total: 4 },
  { date: "Wed", taken: 4, total: 4 },
  { date: "Thu", taken: 4, total: 4 },
  { date: "Fri", taken: 4, total: 4 },
  { date: "Sat", taken: 4, total: 4 },
  { date: "Sun", taken: 4, total: 4 },
];

// Circular Progress
function CircularProgress({ value, max, size = 120 }: { value: number; max: number; size?: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#patientGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <defs>
          <linearGradient id="patientGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
        <span className="text-xs text-[var(--text-dim)]">Complete</span>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const takenCount = todayMedications.filter((m) => m.status === "taken").length;
  const pendingCount = todayMedications.filter((m) => m.status === "pending").length;

  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const nextMedication = todayMedications.find((m) => m.status === "pending");

  useEffect(() => {
    if (!nextMedication) return;

    const updateCountdown = () => {
      const now = new Date();
      const [time, period] = nextMedication.time.split(" ");
      const [hourStr, minuteStr] = time.split(":");
      let hours = parseInt(hourStr, 10);
      const minutes = parseInt(minuteStr, 10);

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours: h, minutes: m, seconds: s });
      } else {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextMedication]);

  const weeklyAdherence = Math.round(
    (medicationHistory.reduce((sum, day) => sum + day.taken, 0) /
      medicationHistory.reduce((sum, day) => sum + day.total, 0)) *
      100
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardLayout userRole="patient" userName="John Doe">
      <div className="space-y-6 max-w-full">
        {/* Header with Progress */}
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-[var(--accent-blue)] font-medium mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl font-bold text-white mb-1">{getGreeting()}, John</h1>
              <p className="text-sm text-[var(--text-muted)]">Room 101A • Your daily medication overview</p>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div>
                  <span className="text-2xl font-bold text-[var(--accent-emerald)]">{takenCount}</span>
                  <span className="text-xs text-[var(--text-dim)] ml-1">Taken</span>
                </div>
                <div className="w-px h-8 bg-[var(--glass-border)]" />
                <div>
                  <span className="text-2xl font-bold text-[var(--accent-amber)]">{pendingCount}</span>
                  <span className="text-xs text-[var(--text-dim)] ml-1">Remaining</span>
                </div>
                <div className="w-px h-8 bg-[var(--glass-border)]" />
                <div>
                  <span className="text-2xl font-bold text-[var(--accent-blue)]">{weeklyAdherence}%</span>
                  <span className="text-xs text-[var(--text-dim)] ml-1">Weekly</span>
                </div>
              </div>
            </div>

            <CircularProgress value={takenCount} max={todayMedications.length} />
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Left - Medications List */}
          <div className="space-y-6">
            <div className="glass-card">
              <div className="glass-card-header">
                <h2 className="text-title text-white">Today&apos;s Medications</h2>
                <span className="badge badge-cyan">{todayMedications.length} scheduled</span>
              </div>
              <div className="divide-y divide-[var(--glass-border)]">
                {todayMedications.map((med, index) => (
                  <div
                    key={med.id}
                    className={`p-4 flex items-center gap-4 ${
                      med.status === "taken" ? "bg-[var(--accent-emerald-glow)]" :
                      index === takenCount ? "bg-[var(--accent-blue-glow)]" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      med.status === "taken" ? "bg-[var(--accent-emerald)]/20" :
                      index === takenCount ? "bg-[var(--accent-blue)]/20" : "bg-[var(--bg-elevated)]"
                    }`}>
                      {med.status === "taken" ? (
                        <svg className="w-5 h-5 text-[var(--accent-emerald)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${index === takenCount ? "text-[var(--accent-blue)]" : "text-[var(--text-dim)]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{med.medicine}</p>
                        {index === takenCount && med.status === "pending" && (
                          <span className="badge badge-cyan">Next</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{med.dosage}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-medium ${
                        med.status === "taken" ? "text-[var(--accent-emerald)]" :
                        index === takenCount ? "text-[var(--accent-blue)]" : "text-[var(--text-secondary)]"
                      }`}>{med.time}</p>
                      {med.status === "taken" && (
                        <p className="text-xs text-[var(--text-dim)]">at {med.takenAt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Next Medication Countdown */}
            {nextMedication && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[var(--accent-blue-glow)] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-title text-white">Next Medication</h3>
                </div>
                <p className="text-lg font-semibold text-white mb-1">{nextMedication.medicine}</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">{nextMedication.dosage} at {nextMedication.time}</p>

                {/* Countdown */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
                    <div className="text-xl font-bold text-white font-mono">{String(countdown.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-[var(--text-dim)]">Hours</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
                    <div className="text-xl font-bold text-white font-mono">{String(countdown.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-[var(--text-dim)]">Minutes</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
                    <div className="text-xl font-bold text-[var(--accent-blue)] font-mono">{String(countdown.seconds).padStart(2, '0')}</div>
                    <div className="text-xs text-[var(--text-dim)]">Seconds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Adherence */}
            <div className="glass-card">
              <div className="glass-card-header">
                <h3 className="text-title text-white">Weekly History</h3>
                <span className="text-sm font-semibold text-[var(--accent-emerald)]">{weeklyAdherence}%</span>
              </div>
              <div className="p-4">
                <div className="flex items-end justify-between gap-2 h-20">
                  {medicationHistory.map((day, i) => {
                    const rate = (day.taken / day.total) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t transition-all ${
                            rate === 100 ? "bg-[var(--accent-emerald)]" :
                            rate >= 75 ? "bg-[var(--accent-amber)]" : "bg-[var(--accent-rose)]"
                          }`}
                          style={{ height: `${rate}%`, minHeight: rate > 0 ? 4 : 0 }}
                        />
                        <span className="text-xs text-[var(--text-dim)]">{day.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Caregiver */}
            <div className="glass-card p-5">
              <h3 className="text-title text-white mb-4">Your Caregiver</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-emerald)] rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  J
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Jane Smith</p>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot status-dot-online" />
                    <span className="text-xs text-[var(--accent-emerald)]">On duty</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost w-full text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
