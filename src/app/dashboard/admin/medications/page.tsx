"use client";

import DashboardLayout from "@/components/DashboardLayout";
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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    description: "",
    drawer_location: "",
    current_stock: 0,
    minimum_stock: 10,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Drawer form state
  const [drawerFormData, setDrawerFormData] = useState({
    drawer_id: "",
    estimated_pill_count: 0,
    minimum_pill_count: 10,
  });

  // Fetch medications
  const fetchMedications = async () => {
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .order("name");

    if (data) setMedications(data);
    if (error) console.error("Error fetching medications:", error);
    setLoading(false);
  };

  // Fetch drawers
  const fetchDrawers = async () => {
    const { data } = await supabase
      .from("drawers")
      .select("*")
      .order("label");

    if (data) setDrawers(data);
  };

  useEffect(() => {
    fetchMedications();
    fetchDrawers();
  }, []);

  // Create medication
  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    const { error } = await supabase.from("medications").insert([formData]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Medication created successfully!");
      setShowCreateModal(false);
      setFormData({ name: "", dosage: "", description: "", drawer_location: "", current_stock: 0, minimum_stock: 10 });
      fetchMedications();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  // Update medication
  const handleUpdateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedication) return;
    setFormLoading(true);
    setError("");

    const { error } = await supabase
      .from("medications")
      .update(formData)
      .eq("id", selectedMedication.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Medication updated successfully!");
      setShowEditModal(false);
      setSelectedMedication(null);
      fetchMedications();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  // Delete medication
  const handleDeleteMedication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    const { error } = await supabase.from("medications").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Medication deleted successfully!");
      fetchMedications();
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  // Assign medication to drawer
  const handleAssignDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedication) return;
    setFormLoading(true);
    setError("");

    // Update drawer with medication
    const { error } = await supabase
      .from("drawers")
      .update({
        medication_id: selectedMedication.id,
        estimated_pill_count: drawerFormData.estimated_pill_count,
        minimum_pill_count: drawerFormData.minimum_pill_count,
        status: drawerFormData.estimated_pill_count <= drawerFormData.minimum_pill_count ? "low_stock" : "idle",
      })
      .eq("id", drawerFormData.drawer_id);

    if (error) {
      setError(error.message);
    } else {
      // Update medication drawer location
      const drawer = drawers.find((d) => d.id === drawerFormData.drawer_id);
      if (drawer) {
        await supabase
          .from("medications")
          .update({ drawer_location: drawer.label })
          .eq("id", selectedMedication.id);
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

  // Open edit modal
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

  // Open drawer assignment modal
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

  // Filter medications
  const filteredMedications = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const lowStockCount = medications.filter((m) => m.current_stock <= m.minimum_stock).length;
  const totalStock = medications.reduce((sum, m) => sum + m.current_stock, 0);

  // Available drawers (not assigned or assigned to selected medication)
  const availableDrawers = drawers.filter(
    (d) => !d.medication_id || d.medication_id === selectedMedication?.id
  );

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={userName}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      <div className="space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">Medications</h1>
            <p className="text-slate-400">Manage medication inventory</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            <div className="relative flex-shrink-0 w-full sm:w-64">
              <svg
                className="absolute w-5 h-5 text-slate-400 pointer-events-none"
                style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px' }}
                className="w-full pr-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => {
                setFormData({ name: "", dosage: "", description: "", drawer_location: "", current_stock: 0, minimum_stock: 10 });
                setShowCreateModal(true);
              }}
              style={{ padding: '14px 24px' }}
              className="bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center gap-3 flex-shrink-0 whitespace-nowrap"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Medication
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">{success}</div>
        )}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">{medications.length}</p>
                <p className="text-sm text-slate-400 truncate">Total Medications</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">{totalStock}</p>
                <p className="text-sm text-slate-400 truncate">Total Pills</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">{lowStockCount}</p>
                <p className="text-sm text-slate-400 truncate">Low Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">{drawers.filter((d) => d.medication_id).length}/{drawers.length}</p>
                <p className="text-sm text-slate-400 truncate">Drawers Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMedications.map((med) => {
            const isLowStock = med.current_stock <= med.minimum_stock;
            const drawer = drawers.find((d) => d.medication_id === med.id);

            return (
              <div
                key={med.id}
                className={`bg-[#0f172a] rounded-xl border p-6 ${
                  isLowStock ? "border-red-500/30" : "border-[#1e293b]"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isLowStock ? "bg-red-500/20" : "bg-purple-500/20"
                    }`}>
                      <svg className={`w-6 h-6 ${isLowStock ? "text-red-400" : "text-purple-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{med.name}</h3>
                      <p className="text-sm text-slate-400">{med.dosage}</p>
                    </div>
                  </div>
                  {isLowStock && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg flex-shrink-0">
                      Low Stock
                    </span>
                  )}
                </div>

                {med.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{med.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Drawer</span>
                    <span className="text-white font-medium">{drawer?.label || med.drawer_location || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Stock</span>
                    <span className={`font-medium ${isLowStock ? "text-red-400" : "text-emerald-400"}`}>
                      {drawer?.estimated_pill_count || med.current_stock} pills
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Min. Stock</span>
                    <span className="text-slate-300">{drawer?.minimum_pill_count || med.minimum_stock}</span>
                  </div>
                </div>

                {/* Stock Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full ${isLowStock ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{
                      width: `${Math.min(100, ((drawer?.estimated_pill_count || med.current_stock) / (drawer?.minimum_pill_count || med.minimum_stock)) * 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDrawerModal(med)}
                    style={{ padding: '12px 16px' }}
                    className="flex-1 bg-[#1e293b] text-slate-300 rounded-lg text-sm font-medium hover:bg-[#334155] transition-colors"
                  >
                    Assign Drawer
                  </button>
                  <button
                    onClick={() => openEditModal(med)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMedication(med.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No medications found</p>
          </div>
        )}

        {/* Create Medication Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-md w-full">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Add New Medication</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateMedication} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Medication Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Aspirin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., 100mg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500 h-20 resize-none"
                    placeholder="Brief description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Initial Stock</label>
                    <input
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Min. Stock</label>
                    <input
                      type="number"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '14px 20px' }} className="flex-1 bg-[#1e293b] text-white rounded-xl font-medium hover:bg-[#334155]">
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} style={{ padding: '14px 20px' }} className="flex-1 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50">
                    {formLoading ? "Creating..." : "Add Medication"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Medication Modal */}
        {showEditModal && selectedMedication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-md w-full">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Edit Medication</h2>
                <button onClick={() => { setShowEditModal(false); setSelectedMedication(null); }} className="p-2 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateMedication} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Medication Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500 h-20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Current Stock</label>
                    <input
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Min. Stock</label>
                    <input
                      type="number"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setSelectedMedication(null); }} style={{ padding: '14px 20px' }} className="flex-1 bg-[#1e293b] text-white rounded-xl font-medium hover:bg-[#334155]">
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} style={{ padding: '14px 20px' }} className="flex-1 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50">
                    {formLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drawer Assignment Modal */}
        {showDrawerModal && selectedMedication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-md w-full">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Assign to Drawer</h2>
                  <p className="text-sm text-slate-400">{selectedMedication.name} {selectedMedication.dosage}</p>
                </div>
                <button onClick={() => { setShowDrawerModal(false); setSelectedMedication(null); }} className="p-2 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAssignDrawer} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Select Drawer</label>
                  <select
                    value={drawerFormData.drawer_id}
                    onChange={(e) => setDrawerFormData({ ...drawerFormData, drawer_id: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="">Select a drawer...</option>
                    {availableDrawers.map((d) => (
                      <option key={d.id} value={d.id}>
                        Drawer {d.label} {d.medication_id === selectedMedication.id ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Pill Count</label>
                    <input
                      type="number"
                      value={drawerFormData.estimated_pill_count}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, estimated_pill_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Min. Pills</label>
                    <input
                      type="number"
                      value={drawerFormData.minimum_pill_count}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, minimum_pill_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowDrawerModal(false); setSelectedMedication(null); }} style={{ padding: '14px 20px' }} className="flex-1 bg-[#1e293b] text-white rounded-xl font-medium hover:bg-[#334155]">
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} style={{ padding: '14px 20px' }} className="flex-1 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50">
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
