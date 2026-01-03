"use client";

import DashboardLayout from "@/components/DashboardLayout";

// Mock data - replace with real API calls
const todayMedications = [
  { id: 1, medicine: "Aspirin", dosage: "100mg", time: "8:00 AM", status: "taken", takenAt: "7:58 AM" },
  { id: 2, medicine: "Metformin", dosage: "500mg", time: "12:00 PM", status: "pending", takenAt: null },
  { id: 3, medicine: "Lisinopril", dosage: "10mg", time: "6:00 PM", status: "pending", takenAt: null },
  { id: 4, medicine: "Vitamin D", dosage: "1000 IU", time: "8:00 PM", status: "pending", takenAt: null },
];

const medicationHistory = [
  { date: "Dec 29", taken: 4, missed: 0, total: 4 },
  { date: "Dec 28", taken: 3, missed: 1, total: 4 },
  { date: "Dec 27", taken: 4, missed: 0, total: 4 },
  { date: "Dec 26", taken: 4, missed: 0, total: 4 },
  { date: "Dec 25", taken: 4, missed: 0, total: 4 },
];

export default function PatientDashboard() {
  const takenCount = todayMedications.filter((m) => m.status === "taken").length;
  const pendingCount = todayMedications.filter((m) => m.status === "pending").length;

  return (
    <DashboardLayout userRole="patient" userName="John Doe">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Good Morning, John</h1>
            <p className="text-slate-400">Room 101A • Your medication overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Today&apos;s Progress</p>
              <p className="text-lg font-bold text-emerald-400">
                {takenCount}/{todayMedications.length} taken
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#1e293b"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#10b981"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(takenCount / todayMedications.length) * 176} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {Math.round((takenCount / todayMedications.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{takenCount}</p>
                <p className="text-sm text-slate-400">Medications Taken</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                <p className="text-sm text-slate-400">Remaining Today</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">98%</p>
                <p className="text-sm text-slate-400">Weekly Adherence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Medications */}
          <div className="lg:col-span-2 bg-[#0f172a] rounded-xl border border-[#1e293b]">
            <div className="p-4 border-b border-[#1e293b]">
              <h2 className="text-lg font-semibold text-white">Today&apos;s Medications</h2>
              <p className="text-sm text-slate-400">Your scheduled medications for today</p>
            </div>
            <div className="p-4 space-y-4">
              {todayMedications.map((med) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-xl border ${
                    med.status === "taken"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-[#1e293b] border-[#334155]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          med.status === "taken"
                            ? "bg-emerald-500/20"
                            : "bg-[#0f172a]"
                        }`}
                      >
                        {med.status === "taken" ? (
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{med.medicine}</p>
                        <p className="text-sm text-slate-400">{med.dosage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          med.status === "taken" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {med.time}
                      </p>
                      {med.status === "taken" && (
                        <p className="text-xs text-slate-500">Taken at {med.takenAt}</p>
                      )}
                      {med.status === "pending" && (
                        <p className="text-xs text-slate-500">Pending</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Medication */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-emerald-500/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-white font-semibold">Next Medication</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">Metformin</p>
              <p className="text-slate-400 mb-4">500mg • 12:00 PM</p>
              <div className="text-sm text-emerald-400">
                In approximately 4 hours
              </div>
            </div>

            {/* Weekly History */}
            <div className="bg-[#0f172a] rounded-xl border border-[#1e293b]">
              <div className="p-4 border-b border-[#1e293b]">
                <h3 className="text-white font-semibold">Weekly History</h3>
              </div>
              <div className="p-4 space-y-3">
                {medicationHistory.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{day.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: day.total }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < day.taken ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {day.taken}/{day.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caregiver Contact */}
            <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-4">
              <h3 className="text-white font-semibold mb-3">Your Caregiver</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div>
                  <p className="text-white font-medium">Jane Smith</p>
                  <p className="text-sm text-slate-400">On duty until 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
