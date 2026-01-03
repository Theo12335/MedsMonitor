"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useState } from "react";

// Mock data - replace with real API calls
const pendingMedications = [
  { id: 1, patient: "John Doe", room: "101A", medicine: "Aspirin", dosage: "100mg", time: "8:00 AM", status: "pending", priority: "high" },
  { id: 2, patient: "Jane Smith", room: "102B", medicine: "Metformin", dosage: "500mg", time: "8:30 AM", status: "pending", priority: "medium" },
  { id: 3, patient: "Bob Wilson", room: "103C", medicine: "Lisinopril", dosage: "10mg", time: "9:00 AM", status: "pending", priority: "normal" },
  { id: 4, patient: "Alice Brown", room: "104D", medicine: "Omeprazole", dosage: "20mg", time: "9:30 AM", status: "pending", priority: "normal" },
];

const recentActivity = [
  { id: 1, action: "Medication dispensed", patient: "Mary Johnson", time: "7:45 AM", type: "success" },
  { id: 2, action: "Patient check-in", patient: "Tom Brown", time: "7:30 AM", type: "info" },
  { id: 3, action: "Inventory alert", detail: "Aspirin low stock", time: "7:15 AM", type: "warning" },
  { id: 4, action: "Schedule updated", patient: "Sarah Davis", time: "7:00 AM", type: "info" },
];

const lowStockItems = [
  { name: "Aspirin 100mg", drawer: "A1", current: 12, threshold: 20 },
  { name: "Metformin 500mg", drawer: "B3", current: 8, threshold: 15 },
];

const drawerData = [
  { id: "A1", status: "low", fill: 25, medication: "Aspirin 100mg" },
  { id: "A2", status: "ok", fill: 85, medication: "Ibuprofen 200mg" },
  { id: "A3", status: "ok", fill: 72, medication: "Paracetamol 500mg" },
  { id: "B1", status: "low", fill: 18, medication: "Metformin 500mg" },
  { id: "B2", status: "ok", fill: 90, medication: "Lisinopril 10mg" },
  { id: "B3", status: "ok", fill: 65, medication: "Omeprazole 20mg" },
];

export default function CaregiverDashboard() {
  const [hoveredDrawer, setHoveredDrawer] = useState<string | null>(null);

  return (
    <DashboardLayout userRole="caregiver" userName="Jane Smith">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Jane</span>
            </h1>
            <p className="text-slate-400 mt-1">Here&apos;s your shift overview for today</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium text-sm">Shift Active</span>
            </div>
            <span className="text-slate-500 text-sm hidden sm:block">Started: 7:00 AM</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Medications */}
          <div className="group relative bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">Pending Meds</span>
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{pendingMedications.length}</p>
              <p className="text-sm text-amber-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
                Requires attention
              </p>
            </div>
          </div>

          {/* Patients Assigned */}
          <div className="group relative bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-2xl border border-blue-500/20 p-5 hover:border-blue-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">Patients</span>
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">12</p>
              <p className="text-sm text-slate-500">Active patients</p>
            </div>
          </div>

          {/* Dispensed Today */}
          <div className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">Dispensed</span>
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">24</p>
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All on schedule
              </p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="group relative bg-gradient-to-br from-red-500/10 to-rose-500/5 rounded-2xl border border-red-500/20 p-5 hover:border-red-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">Low Stock</span>
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{lowStockItems.length}</p>
              <p className="text-sm text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Needs restocking
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pending Medications Table */}
          <div className="xl:col-span-2 bg-[#0a0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Pending Medications</h2>
                <p className="text-sm text-slate-500 mt-0.5">Upcoming doses requiring dispensing</p>
              </div>
              <Link
                href="/dashboard/caregiver/dispense"
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                View All
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Room</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicine</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingMedications.map((med, index) => (
                    <tr
                      key={med.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-medium">
                            {med.patient.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-white">{med.patient}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-400 font-mono">{med.room}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm text-white">{med.medicine}</span>
                          <span className="text-xs text-slate-500 ml-2 px-1.5 py-0.5 bg-slate-800 rounded">{med.dosage}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-medium ${
                          med.priority === 'high' ? 'text-red-400' :
                          med.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {med.time}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-all duration-200 border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 group-hover:scale-105">
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
            <div className="bg-[#0a0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <p className="text-sm text-slate-500 mt-0.5">Latest updates from your shift</p>
              </div>
              <div className="p-4 space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                      activity.type === 'success' ? 'bg-emerald-500' :
                      activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{activity.action}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {activity.patient || activity.detail}
                      </p>
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl border border-red-500/20 overflow-hidden">
              <div className="p-5 border-b border-red-500/10 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Low Stock Alert</h2>
                  <p className="text-sm text-slate-500">Items below threshold</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {lowStockItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{item.name}</span>
                      <span className="text-sm text-red-400 font-bold">{item.current} left</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Drawer {item.drawer}</span>
                      <span>Min: {item.threshold}</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-400"
                        style={{ width: `${(item.current / item.threshold) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Storage Status */}
        <div className="bg-[#0a0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Smart Storage Unit Status</h2>
              <p className="text-sm text-slate-500 mt-0.5">Real-time drawer monitoring</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium text-sm">Connected</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {drawerData.map((drawer) => (
              <div
                key={drawer.id}
                className={`relative p-4 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  drawer.status === "low"
                    ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30 hover:border-amber-400/50"
                    : "bg-white/[0.02] border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                }`}
                onMouseEnter={() => setHoveredDrawer(drawer.id)}
                onMouseLeave={() => setHoveredDrawer(null)}
              >
                {hoveredDrawer === drawer.id && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-white whitespace-nowrap z-10 border border-slate-700">
                    {drawer.medication}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
                  </div>
                )}
                <p className="text-sm font-semibold text-white mb-1">Drawer {drawer.id}</p>
                <p className={`text-xs font-medium ${drawer.status === "low" ? "text-amber-400" : "text-emerald-400"}`}>
                  {drawer.status === "low" ? "Low Stock" : "OK"}
                </p>
                <div className="mt-3 w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      drawer.status === "low"
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    }`}
                    style={{ width: `${drawer.fill}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{drawer.fill}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
