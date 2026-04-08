"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useProfile, useDrawers, useMedications } from "@/lib/supabase/hooks";

export default function InventoryPage() {
  const { profile } = useProfile();
  const { drawers, loading: drawersLoading } = useDrawers();
  const { medications, loading: medsLoading } = useMedications();
  const [filter, setFilter] = useState<"all" | "low" | "ok">("all");

  const userName = profile?.name || "Loading...";

  const loading = drawersLoading || medsLoading;

  // Filter drawers based on status
  const filteredDrawers = drawers.filter((d) => {
    if (filter === "all") return true;
    if (filter === "low") return d.status === "low_stock" || d.status === "empty";
    return d.status === "idle" && d.estimated_pill_count >= d.minimum_pill_count;
  });

  // Calculate stats
  const lowStockCount = drawers.filter((d) => d.status === "low_stock" || d.status === "empty").length;
  const totalMedications = medications.length;
  const totalPills = drawers.reduce((sum, d) => sum + d.estimated_pill_count, 0);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
            <p className="text-slate-400">Monitor medication stock levels</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "low"
                  ? "bg-red-500 text-white"
                  : "bg-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilter("ok")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "ok"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              In Stock
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{drawers.length}</p>
                <p className="text-sm text-slate-400">Total Drawers</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalMedications}</p>
                <p className="text-sm text-slate-400">Medications</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalPills}</p>
                <p className="text-sm text-slate-400">Total Pills</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{lowStockCount}</p>
                <p className="text-sm text-slate-400">Low Stock Alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Visualization */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Storage Unit Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {drawers.map((drawer) => {
              const fillPercentage = drawer.minimum_pill_count > 0
                ? Math.min(100, (drawer.estimated_pill_count / drawer.minimum_pill_count) * 100)
                : 100;
              const isLow = drawer.status === "low_stock" || drawer.status === "empty";

              return (
                <div
                  key={drawer.id}
                  className={`aspect-square rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all ${
                    isLow
                      ? "bg-red-500/10 border-red-500/50"
                      : "bg-emerald-500/10 border-emerald-500/50"
                  }`}
                >
                  <span className="text-lg font-bold text-white">{drawer.label}</span>
                  <div className="w-full mt-2 bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isLow ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs mt-1 ${isLow ? "text-red-400" : "text-emerald-400"}`}>
                    {drawer.estimated_pill_count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
          <div className="p-4 border-b border-[#1e293b]">
            <h2 className="text-lg font-semibold text-white">Inventory Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e293b]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Drawer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Medication</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Minimum</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Fill Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {filteredDrawers.map((drawer) => {
                  const fillPercentage = drawer.minimum_pill_count > 0
                    ? Math.min(100, (drawer.estimated_pill_count / drawer.minimum_pill_count) * 100)
                    : 100;
                  const isLow = drawer.status === "low_stock" || drawer.status === "empty";

                  return (
                    <tr key={drawer.id} className="hover:bg-[#1e293b]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-bold">{drawer.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px]">
                          <p className="text-white font-medium truncate">
                            {drawer.medication?.name || "Empty"}
                          </p>
                          {drawer.medication && (
                            <p className="text-sm text-slate-400 truncate">{drawer.medication.dosage}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${isLow ? "text-red-400" : "text-emerald-400"}`}>
                          {drawer.estimated_pill_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {drawer.minimum_pill_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          isLow
                            ? "bg-red-500/20 text-red-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${isLow ? "bg-red-500" : "bg-emerald-500"}`}
                              style={{ width: `${fillPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-400">{Math.round(fillPercentage)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredDrawers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No items match the current filter</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
