"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/supabase/hooks";

interface Patient {
  id: string;
  name: string;
  room_number: string;
  admission_date: string;
  notes: string | null;
  created_at: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
}

interface PatientMedication {
  id: string;
  medication: Medication;
  dosage: string;
  frequency: string;
  scheduled_times: string[];
}

export default function PatientManagementPage() {
  const { profile } = useProfile();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMedsModal, setShowMedsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientMeds, setPatientMeds] = useState<PatientMedication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    room_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Medication assignment form
  const [medFormData, setMedFormData] = useState({
    medication_id: "",
    dosage: "",
    frequency: "Once daily",
    scheduled_times: ["08:00"],
  });

  // Fetch patients
  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPatients(data);
    if (error) console.error("Error fetching patients:", error);
    setLoading(false);
  };

  // Fetch medications for dropdown
  const fetchMedications = async () => {
    const { data } = await supabase
      .from("medications")
      .select("id, name, dosage")
      .order("name");
    if (data) setMedications(data);
  };

  // Fetch patient medications
  const fetchPatientMedications = async (patientId: string) => {
    const { data } = await supabase
      .from("patient_medications")
      .select(`
        id,
        dosage,
        frequency,
        scheduled_times,
        medication:medications(id, name, dosage)
      `)
      .eq("patient_id", patientId);

    if (data) {
      setPatientMeds(data as unknown as PatientMedication[]);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchMedications();
  }, []);

  // Create patient
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("patients")
      .insert([formData])
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Patient created successfully!");
      setShowCreateModal(false);
      setFormData({ name: "", room_number: "", admission_date: new Date().toISOString().split("T")[0], notes: "" });
      fetchPatients();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  // Update patient
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setFormLoading(true);
    setError("");

    const { error } = await supabase
      .from("patients")
      .update(formData)
      .eq("id", selectedPatient.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Patient updated successfully!");
      setShowEditModal(false);
      setSelectedPatient(null);
      fetchPatients();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  // Delete patient
  const handleDeletePatient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient? All associated records will be deleted.")) {
      return;
    }

    const { error } = await supabase.from("patients").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Patient deleted successfully!");
      fetchPatients();
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  // Add medication to patient
  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setFormLoading(true);
    setError("");

    const { error } = await supabase.from("patient_medications").insert([
      {
        patient_id: selectedPatient.id,
        medication_id: medFormData.medication_id,
        dosage: medFormData.dosage,
        frequency: medFormData.frequency,
        scheduled_times: medFormData.scheduled_times,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Medication assigned successfully!");
      setMedFormData({ medication_id: "", dosage: "", frequency: "Once daily", scheduled_times: ["08:00"] });
      fetchPatientMedications(selectedPatient.id);
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  // Remove medication from patient
  const handleRemoveMedication = async (medId: string) => {
    if (!confirm("Remove this medication from the patient?")) return;

    const { error } = await supabase.from("patient_medications").delete().eq("id", medId);

    if (error) {
      setError(error.message);
    } else {
      if (selectedPatient) fetchPatientMedications(selectedPatient.id);
    }
  };

  // Open edit modal
  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      room_number: patient.room_number,
      admission_date: patient.admission_date,
      notes: patient.notes || "",
    });
    setShowEditModal(true);
  };

  // Open medications modal
  const openMedsModal = async (patient: Patient) => {
    setSelectedPatient(patient);
    await fetchPatientMedications(patient.id);
    setShowMedsModal(true);
  };

  // Filter patients
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.room_number.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-white">Patient Management</h1>
            <p className="text-slate-400">Manage patients and their medications</p>
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
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px' }}
                className="w-full pr-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => {
                setFormData({ name: "", room_number: "", admission_date: new Date().toISOString().split("T")[0], notes: "" });
                setShowCreateModal(true);
              }}
              style={{ padding: '14px 24px' }}
              className="bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center gap-3 flex-shrink-0 whitespace-nowrap"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Patient
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">{patients.length}</p>
                <p className="text-sm text-slate-400 truncate">Total Patients</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">
                  {patients.filter((p) => new Date(p.admission_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
                <p className="text-sm text-slate-400 truncate">New This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">
                  {new Set(patients.map((p) => p.room_number)).size}
                </p>
                <p className="text-sm text-slate-400 truncate">Rooms Occupied</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e293b]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Admitted</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-[#1e293b]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-white font-medium">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{patient.room_number}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(patient.admission_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 truncate max-w-[200px] block">
                        {patient.notes || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openMedsModal(patient)}
                          className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                          title="Manage Medications"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(patient)}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No patients found</p>
            </div>
          )}
        </div>

        {/* Create Patient Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-md w-full">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Add New Patient</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreatePatient} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., 101A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500 h-24 resize-none"
                    placeholder="Any special notes..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '14px 20px' }} className="flex-1 bg-[#1e293b] text-white rounded-xl font-medium hover:bg-[#334155]">
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} style={{ padding: '14px 20px' }} className="flex-1 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50">
                    {formLoading ? "Creating..." : "Add Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Patient Modal */}
        {showEditModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-md w-full">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Edit Patient</h2>
                <button onClick={() => { setShowEditModal(false); setSelectedPatient(null); }} className="p-2 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdatePatient} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500 h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setSelectedPatient(null); }} style={{ padding: '14px 20px' }} className="flex-1 bg-[#1e293b] text-white rounded-xl font-medium hover:bg-[#334155]">
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

        {/* Medications Modal */}
        {showMedsModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between sticky top-0 bg-[#0f172a]">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedPatient.name}&apos;s Medications</h2>
                  <p className="text-sm text-slate-400">Room {selectedPatient.room_number}</p>
                </div>
                <button onClick={() => { setShowMedsModal(false); setSelectedPatient(null); setPatientMeds([]); }} className="p-2 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Medications */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Current Medications</h3>
                  {patientMeds.length > 0 ? (
                    <div className="space-y-3">
                      {patientMeds.map((pm) => (
                        <div key={pm.id} className="p-4 bg-[#1e293b] rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{pm.medication.name} {pm.medication.dosage}</p>
                            <p className="text-sm text-slate-400">{pm.dosage} - {pm.frequency}</p>
                            <p className="text-xs text-slate-500">Times: {pm.scheduled_times.join(", ")}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveMedication(pm.id)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No medications assigned yet</p>
                  )}
                </div>

                {/* Add Medication Form */}
                <div className="border-t border-[#1e293b] pt-6">
                  <h3 className="text-lg font-medium text-white mb-3">Add Medication</h3>
                  <form onSubmit={handleAddMedication} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Medication</label>
                      <select
                        value={medFormData.medication_id}
                        onChange={(e) => setMedFormData({ ...medFormData, medication_id: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                      >
                        <option value="">Select medication...</option>
                        {medications.map((med) => (
                          <option key={med.id} value={med.id}>{med.name} {med.dosage}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Dosage</label>
                        <input
                          type="text"
                          value={medFormData.dosage}
                          onChange={(e) => setMedFormData({ ...medFormData, dosage: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                          placeholder="e.g., 1 tablet"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Frequency</label>
                        <select
                          value={medFormData.frequency}
                          onChange={(e) => setMedFormData({ ...medFormData, frequency: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                        >
                          <option>Once daily</option>
                          <option>Twice daily</option>
                          <option>Three times daily</option>
                          <option>Four times daily</option>
                          <option>As needed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Scheduled Time</label>
                      <input
                        type="time"
                        value={medFormData.scheduled_times[0]}
                        onChange={(e) => setMedFormData({ ...medFormData, scheduled_times: [e.target.value] })}
                        className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      style={{ padding: '14px 20px' }}
                      className="w-full bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50"
                    >
                      {formLoading ? "Adding..." : "Add Medication"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
