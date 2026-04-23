"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import StatTile from "@/components/dashboard/StatTile";
import { useState } from "react";
import { useProfile, useDrawers, useMedications } from "@/lib/supabase/hooks";

type FilterOption = "all" | "low" | "ok";

function DrawerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function MedIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function InventoryPage() {
  const { profile } = useProfile();
  const { drawers, loading: drawersLoading } = useDrawers();
  const { medications, loading: medsLoading } = useMedications();
  const [filter, setFilter] = useState<FilterOption>("all");

  const userName = profile?.name || "Loading...";
  const loading = drawersLoading || medsLoading;

  const filteredDrawers = drawers.filter((d) => {
    if (filter === "all") return true;
    if (filter === "low") return d.status === "low_stock" || d.status === "empty";
    return d.status === "idle" && d.estimated_pill_count >= d.minimum_pill_count;
  });

  const lowStockCount = drawers.filter((d) => d.status === "low_stock" || d.status === "empty").length;
  const totalMedications = medications.length;
  const totalPills = drawers.reduce((sum, d) => sum + d.estimated_pill_count, 0);

  if (loading) {
    return (
      <DashboardLayout userRole="caregiver" userName={userName}>
        <div className="space-y-5">
          <div className="skeleton-shimmer h-20 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton-shimmer h-80 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver" userName={userName}>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Inventory Management</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">Monitor medication stock levels</p>
            </div>
            <FilterButtons filter={filter} onChange={setFilter} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Total Drawers" value={drawers.length} icon={<DrawerIcon />} accent="blue" />
          <StatTile label="Medications" value={totalMedications} icon={<MedIcon />} accent="violet" />
          <StatTile label="Total Pills" value={totalPills} icon={<CheckIcon />} accent="emerald" />
          <StatTile
            label="Low Stock Alerts"
            value={lowStockCount}
            icon={<AlertIcon />}
            accent="rose"
            emphasize={lowStockCount > 0}
            delta={lowStockCount > 0 ? { value: "action", direction: "down" } : undefined}
          />
        </div>

        {/* Drawer Visualization */}
        <Panel title="Storage Unit Overview" action={<span className="text-xs text-[var(--text-dim)]">{drawers.length} drawers</span>}>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {drawers.map((drawer) => {
              const fillPercentage =
                drawer.minimum_pill_count > 0
                  ? Math.min(100, (drawer.estimated_pill_count / drawer.minimum_pill_count) * 100)
                  : 100;
              const isLow = drawer.status === "low_stock" || drawer.status === "empty";

              return (
                <div
                  key={drawer.id}
                  className={`aspect-square rounded-xl border p-3 flex flex-col items-center justify-center transition-all min-w-0 ${
                    isLow
                      ? "bg-[var(--accent-rose)]/10 border-[var(--accent-rose)]/40"
                      : "bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/40"
                  }`}
                >
                  <span className="text-base font-bold text-white truncate">{drawer.label}</span>
                  <div className="w-full mt-2 bg-black/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isLow ? "bg-[var(--accent-rose)]" : "bg-[var(--accent-emerald)]"}`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  <span className={`text-xs mt-1 ${isLow ? "text-[var(--accent-rose)]" : "text-[var(--accent-emerald)]"}`}>
                    {drawer.estimated_pill_count}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Inventory Table */}
        <Panel title="Inventory Details" bodyPadding="0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <Th>Drawer</Th>
                  <Th>Medication</Th>
                  <Th>Current Stock</Th>
                  <Th>Minimum</Th>
                  <Th>Status</Th>
                  <Th>Fill Level</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {filteredDrawers.map((drawer) => {
                  const fillPercentage =
                    drawer.minimum_pill_count > 0
                      ? Math.min(100, (drawer.estimated_pill_count / drawer.minimum_pill_count) * 100)
                      : 100;
                  const isLow = drawer.status === "low_stock" || drawer.status === "empty";

                  return (
                    <tr key={drawer.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-bold">{drawer.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] min-w-0">
                          <p className="text-white font-medium truncate">{drawer.medication?.name || "Empty"}</p>
                          {drawer.medication && (
                            <p className="text-xs text-[var(--text-muted)] truncate">{drawer.medication.dosage}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${isLow ? "text-[var(--accent-rose)]" : "text-[var(--accent-emerald)]"}`}>
                          {drawer.estimated_pill_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                        {drawer.minimum_pill_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${isLow ? "badge-rose" : "badge-emerald"}`}>
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-black/30 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLow ? "bg-[var(--accent-rose)]" : "bg-[var(--accent-emerald)]"}`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-[var(--text-muted)]">{Math.round(fillPercentage)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredDrawers.length === 0 && (
            <div className="text-center py-10 text-[var(--text-dim)] text-sm">No items match the current filter</div>
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

function FilterButtons({ filter, onChange }: { filter: FilterOption; onChange: (v: FilterOption) => void }) {
  const options: { value: FilterOption; label: string; accent: "blue" | "rose" | "emerald" }[] = [
    { value: "all", label: "All", accent: "blue" },
    { value: "low", label: "Low Stock", accent: "rose" },
    { value: "ok", label: "In Stock", accent: "emerald" },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map((o) => {
        const active = filter === o.value;
        const activeBg =
          o.accent === "blue"
            ? "bg-[var(--accent-blue)]/20 border-[var(--accent-blue)]/40 text-[var(--accent-blue)]"
            : o.accent === "rose"
            ? "bg-[var(--accent-rose)]/20 border-[var(--accent-rose)]/40 text-[var(--accent-rose)]"
            : "bg-[var(--accent-emerald)]/20 border-[var(--accent-emerald)]/40 text-[var(--accent-emerald)]";
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
              active ? activeBg : "bg-white/5 border-[var(--glass-border)] text-[var(--text-muted)] hover:text-white hover:bg-white/10"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
