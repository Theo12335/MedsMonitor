"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

// Mock data - replace with real API calls
const pendingMedications = [
  { id: 1, patient: "John Doe", room: "101A", medicine: "Aspirin", dosage: "100mg", time: "8:00 AM", status: "pending" },
  { id: 2, patient: "Jane Smith", room: "102B", medicine: "Metformin", dosage: "500mg", time: "8:30 AM", status: "pending" },
  { id: 3, patient: "Bob Wilson", room: "103C", medicine: "Lisinopril", dosage: "10mg", time: "9:00 AM", status: "pending" },
];

const recentActivity = [
  { id: 1, action: "Medication dispensed", patient: "Mary Johnson", time: "7:45 AM" },
  { id: 2, action: "Patient check-in", patient: "Tom Brown", time: "7:30 AM" },
  { id: 3, action: "Inventory alert", detail: "Aspirin low stock", time: "7:15 AM" },
];

const lowStockItems = [
  { name: "Aspirin 100mg", drawer: "A1", current: 12, threshold: 20 },
  { name: "Metformin 500mg", drawer: "B3", current: 8, threshold: 15 },
];

export default function CaregiverDashboard() {
  return (
    <DashboardLayout userRole="caregiver" userName="Jane Smith">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, Jane</h1>
            <p className="text-slate-400">Here&apos;s your shift overview for today</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30">
              Shift Active
            </span>
            <span className="text-slate-400 text-sm">Started: 7:00 AM</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Pending Medications</span>
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{pendingMedications.length}</p>
            <p className="text-sm text-amber-400">Requires attention</p>
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Patients Assigned</span>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">12</p>
            <p className="text-sm text-slate-500">Active patients</p>
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Dispensed Today</span>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">24</p>
            <p className="text-sm text-emerald-400">All on schedule</p>
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Low Stock Alerts</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{lowStockItems.length}</p>
            <p className="text-sm text-red-400">Needs restocking</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Medications Table */}
          <div className="lg:col-span-2 bg-[#0f172a] rounded-xl border border-[#1e293b]">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Pending Medications</h2>
              <Link
                href="/dashboard/caregiver/dispense"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1e293b]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Medicine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {pendingMedications.map((med) => (
                    <tr key={med.id} className="hover:bg-[#1e293b]/50">
                      <td className="px-4 py-3 text-sm text-white">{med.patient}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{med.room}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-white">{med.medicine}</span>
                        <span className="text-slate-500 ml-2">{med.dosage}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-amber-400">{med.time}</td>
                      <td className="px-4 py-3">
                        <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors border border-emerald-500/30">
                          Dispense
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-[#0f172a] rounded-xl border border-[#1e293b]">
              <div className="p-4 border-b border-[#1e293b]">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="p-4 space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-white">{activity.action}</p>
                      <p className="text-xs text-slate-400">
                        {activity.patient || activity.detail} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-[#0f172a] rounded-xl border border-red-500/30">
              <div className="p-4 border-b border-[#1e293b] flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Low Stock Alert</h2>
              </div>
              <div className="p-4 space-y-3">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div>
                      <p className="text-sm text-white">{item.name}</p>
                      <p className="text-xs text-slate-400">Drawer {item.drawer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-400 font-medium">{item.current} left</p>
                      <p className="text-xs text-slate-500">Min: {item.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Storage Status */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Smart Storage Unit Status</h2>
              <p className="text-sm text-slate-400">Real-time drawer monitoring</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Connected
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["A1", "A2", "A3", "B1", "B2", "B3"].map((drawer, index) => (
              <div
                key={drawer}
                className={`p-4 rounded-xl border text-center ${
                  index === 0 || index === 3
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-[#1e293b] border-[#334155]"
                }`}
              >
                <p className="text-sm font-medium text-white mb-1">Drawer {drawer}</p>
                <p className={`text-xs ${index === 0 || index === 3 ? "text-amber-400" : "text-emerald-400"}`}>
                  {index === 0 || index === 3 ? "Low Stock" : "OK"}
                </p>
                <div className="mt-2 w-full bg-[#030712] rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      index === 0 || index === 3 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: index === 0 || index === 3 ? "25%" : "80%" }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
