"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import StatTile from "@/components/dashboard/StatTile";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/supabase/hooks";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  description: string | null;
  drawer_location: string;
  current_stock: number;
  minimum_stock: number;
  created_at: string;
}

interface Drawer {
  id: string;
  label: string;
  medication_id: string | null;
  estimated_pill_count: number;
  minimum_pill_count: number;
  status: string;
}

export default function MedicationsPage() {
  const { profile } = useProfile();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    description: "",
    drawer_location: "",
    current_stock: 0,
    minimum_stock: 10,
  });
  const [formLoading, setFormLoading] = useState(false);

  const [drawerFormData, setDrawerFormData] = useState({
    drawer_id: "",
    estimated_pill_count: 0,
    minimum_pill_count: 10,
  });

  const fetchMedications = async () => {
    const { data } = await supabase.from("medications").select("*").order("name");
    if (data) setMedications(data);
    setLoading(false);
  };

  const fetchDrawers = async () => {
    const { data } = await supabase.from("drawers").select("*").order("label");
    if (data) setDrawers(data);
  };

  useEffect(() => {
    fetchMedications();
    fetchDrawers();
  }, []);

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    const { error } = await supabase.from("medications").insert([formData]);
    if (error) setError(error.message);
    else {
      setSuccess("Medication created successfully!");
      setShowCreateModal(false);
      setFormData({ name: "", dosage: "", description: "", drawer_location: "", current_stock: 0, minimum_stock: 10 });
      fetchMedications();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  const handleUpdateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedication) return;
    setFormLoading(true);
    setError("");
    const { error } = await supabase.from("medications").update(formData).eq("id", selectedMedication.id);
    if (error) setError(error.message);
    else {
      setSuccess("Medication updated successfully!");
      setShowEditModal(false);
      setSelectedMedication(null);
      fetchMedications();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;
    const { error } = await supabase.from("medications").delete().eq("id", id);
    if (error) setError(error.message);
    else {
      setSuccess("Medication deleted successfully!");
      fetchMedications();
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  const handleAssignDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedication) return;
    setFormLoading(true);
    setError("");
    const { error } = await supabase
      .from("drawers")
      .update({
        medication_id: selectedMedication.id,
        estimated_pill_count: drawerFormData.estimated_pill_count,
        minimum_pill_count: drawerFormData.minimum_pill_count,
        status: drawerFormData.estimated_pill_count <= drawerFormData.minimum_pill_count ? "low_stock" : "idle",
      })
      .eq("id", drawerFormData.drawer_id);

    if (error) setError(error.message);
    else {
      const drawer = drawers.find((d) => d.id === drawerFormData.drawer_id);
      if (drawer) {
        await supabase.from("medications").update({ drawer_location: drawer.label }).eq("id", selectedMedication.id);
      }
      setSuccess("Medication assigned to drawer successfully!");
      setShowDrawerModal(false);
      setSelectedMedication(null);
      setDrawerFormData({ drawer_id: "", estimated_pill_count: 0, minimum_pill_count: 10 });
      fetchMedications();
      fetchDrawers();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  const openEditModal = (med: Medication) => {
    setSelectedMedication(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      description: med.description || "",
      drawer_location: med.drawer_location,
      current_stock: med.current_stock,
      minimum_stock: med.minimum_stock,
    });
    setShowEditModal(true);
  };

  const openDrawerModal = (med: Medication) => {
    setSelectedMedication(med);
    const assignedDrawer = drawers.find((d) => d.medication_id === med.id);
    setDrawerFormData({
      drawer_id: assignedDrawer?.id || "",
      estimated_pill_count: assignedDrawer?.estimated_pill_count || 0,
      minimum_pill_count: assignedDrawer?.minimum_pill_count || 10,
    });
    setShowDrawerModal(true);
  };

  const filteredMedications = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = medications.filter((m) => m.current_stock <= m.minimum_stock).length;
  const totalStock = medications.reduce((sum, m) => sum + m.current_stock, 0);
  const drawersUsed = drawers.filter((d) => d.medication_id).length;

  const availableDrawers = drawers.filter(
    (d) => !d.medication_id || d.medication_id === selectedMedication?.id
  );

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={userName}>
        <div className="space-y-5">
          <div className="skeleton-shimmer h-20 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-shimmer h-56 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Medications</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">Manage medication inventory &amp; drawers</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <div className="search-wrapper">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full sm:w-56"
                />
              </div>
              <button
                onClick={() => {
                  setFormData({ name: "", dosage: "", description: "", drawer_location: "", current_stock: 0, minimum_stock: 10 });
                  setShowCreateModal(true);
                }}
                className="btn btn-primary text-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Medication
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="p-3 bg-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/30 rounded-xl text-[var(--accent-emerald)] text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 rounded-xl text-[var(--accent-rose)] text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Total Medications" value={medications.length} accent="violet" icon={<PillIcon />} />
          <StatTile label="Total Pills" value={totalStock} accent="emerald" icon={<CheckIcon />} />
          <StatTile
            label="Low Stock"
            value={lowStockCount}
            accent="rose"
            emphasize={lowStockCount > 0}
            delta={lowStockCount > 0 ? { value: "alert", direction: "down" } : undefined}
            icon={<AlertIcon />}
          />
          <StatTile label="Drawers Used" value={`${drawersUsed}/${drawers.length}`} accent="blue" icon={<DrawerIcon />} />
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMedications.map((med) => {
            const isLowStock = med.current_stock <= med.minimum_stock;
            const drawer = drawers.find((d) => d.medication_id === med.id);
            const stock = drawer?.estimated_pill_count ?? med.current_stock;
            const minStock = drawer?.minimum_pill_count ?? med.minimum_stock;
            const pct = Math.min(100, minStock > 0 ? (stock / minStock) * 100 : 100);

            return (
              <div
                key={med.id}
                className="glass-card p-5 flex flex-col"
                style={{
                  borderColor: isLowStock ? "rgba(251,113,133,0.35)" : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-4 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isLowStock
                          ? "bg-[var(--accent-rose)]/20 text-[var(--accent-rose)]"
                          : "bg-[var(--accent-violet)]/20 text-[var(--accent-violet)]"
                      }`}
                    >
                      <PillIcon />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{med.name}</h3>
                      <p className="text-xs text-[var(--text-muted)] truncate">{med.dosage}</p>
                    </div>
                  </div>
                  {isLowStock && <span className="badge badge-rose flex-shrink-0">Low</span>}
                </div>

                {med.description && (
                  <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-2">{med.description}</p>
                )}

                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between min-w-0">
                    <span className="text-[var(--text-dim)]">Drawer</span>
                    <span className="text-white font-medium truncate ml-2">
                      {drawer?.label || med.drawer_location || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-dim)]">Stock</span>
                    <span className={`font-medium ${isLowStock ? "text-[var(--accent-rose)]" : "text-[var(--accent-emerald)]"}`}>
                      {stock} pills
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-dim)]">Min. Stock</span>
                    <span className="text-[var(--text-secondary)]">{minStock}</span>
                  </div>
                </div>

                <div className="w-full bg-black/30 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isLowStock ? "bg-[var(--accent-rose)]" : "bg-[var(--accent-emerald)]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <button onClick={() => openDrawerModal(med)} className="btn btn-ghost flex-1 text-xs">
                    Assign Drawer
                  </button>
                  <button
                    onClick={() => openEditModal(med)}
                    className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMedication(med.id)}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/10 rounded-lg transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMedications.length === 0 && (
          <Panel title="No results">
            <p className="text-center text-sm text-[var(--text-dim)] py-6">No medications found</p>
          </Panel>
        )}

        {/* Create / Edit modals */}
        {showCreateModal && (
          <MedFormModal
            title="Add New Medication"
            formData={formData}
            onChange={setFormData}
            onSubmit={handleCreateMedication}
            onClose={() => setShowCreateModal(false)}
            submitLabel="Add Medication"
            submitting={formLoading}
          />
        )}
        {showEditModal && selectedMedication && (
          <MedFormModal
            title="Edit Medication"
            formData={formData}
            onChange={setFormData}
            onSubmit={handleUpdateMedication}
            onClose={() => {
              setShowEditModal(false);
              setSelectedMedication(null);
            }}
            submitLabel="Save Changes"
            submitting={formLoading}
          />
        )}

        {/* Drawer assignment */}
        {showDrawerModal && selectedMedication && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDrawerModal(false);
              setSelectedMedication(null);
            }}
          >
            <div className="glass-card max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="glass-card-header">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-white truncate">Assign to Drawer</h2>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {selectedMedication.name} {selectedMedication.dosage}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDrawerModal(false);
                    setSelectedMedication(null);
                  }}
                  className="p-1.5 text-[var(--text-dim)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAssignDrawer} className="p-5 space-y-4">
                <Field label="Select Drawer">
                  <select
                    value={drawerFormData.drawer_id}
                    onChange={(e) => setDrawerFormData({ ...drawerFormData, drawer_id: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select a drawer...</option>
                    {availableDrawers.map((d) => (
                      <option key={d.id} value={d.id}>
                        Drawer {d.label} {d.medication_id === selectedMedication.id ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pill Count">
                    <input
                      type="number"
                      value={drawerFormData.estimated_pill_count}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, estimated_pill_count: parseInt(e.target.value) || 0 })}
                      className="input"
                      min="0"
                      required
                    />
                  </Field>
                  <Field label="Min. Pills">
                    <input
                      type="number"
                      value={drawerFormData.minimum_pill_count}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, minimum_pill_count: parseInt(e.target.value) || 0 })}
                      className="input"
                      min="0"
                      required
                    />
                  </Field>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDrawerModal(false);
                      setSelectedMedication(null);
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} className="btn btn-primary flex-1 disabled:opacity-50">
                    {formLoading ? "Assigning..." : "Assign Drawer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MedFormModal({
  title,
  formData,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
  submitting,
}: {
  title: string;
  formData: { name: string; dosage: string; description: string; drawer_location: string; current_stock: number; minimum_stock: number };
  onChange: (v: { name: string; dosage: string; description: string; drawer_location: string; current_stock: number; minimum_stock: number }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitLabel: string;
  submitting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="glass-card max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="glass-card-header">
          <h2 className="text-base font-semibold text-white truncate">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-dim)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-y-auto">
          <Field label="Medication Name">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Aspirin"
              required
            />
          </Field>
          <Field label="Dosage">
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => onChange({ ...formData, dosage: e.target.value })}
              className="input"
              placeholder="e.g., 100mg"
              required
            />
          </Field>
          <Field label="Description (Optional)">
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="input h-20 resize-none"
              placeholder="Brief description..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current Stock">
              <input
                type="number"
                value={formData.current_stock}
                onChange={(e) => onChange({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
              />
            </Field>
            <Field label="Min. Stock">
              <input
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => onChange({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
              />
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1 disabled:opacity-50">
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">{label}</label>
      {children}
    </div>
  );
}

function PillIcon() {
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
function DrawerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
