"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import PatientAvatar from "@/components/dashboard/PatientAvatar";
import StatTile from "@/components/dashboard/StatTile";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/supabase/hooks";

interface Patient {
  id: string;
  name: string;
  room_number: string;
  admission_date: string;
  notes: string | null;
  avatar_url: string | null;
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

  const [formData, setFormData] = useState({
    name: "",
    room_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const [medFormData, setMedFormData] = useState({
    medication_id: "",
    dosage: "",
    frequency: "Once daily",
    scheduled_times: ["08:00"],
  });

  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
    if (data) setPatients(data);
    setLoading(false);
  };

  const fetchMedications = async () => {
    const { data } = await supabase.from("medications").select("id, name, dosage").order("name");
    if (data) setMedications(data);
  };

  const fetchPatientMedications = async (patientId: string) => {
    const { data } = await supabase
      .from("patient_medications")
      .select(`id, dosage, frequency, scheduled_times, medication:medications(id, name, dosage)`)
      .eq("patient_id", patientId);
    if (data) setPatientMeds(data as unknown as PatientMedication[]);
  };

  useEffect(() => {
    fetchPatients();
    fetchMedications();
  }, []);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    const { error } = await supabase.from("patients").insert([formData]);
    if (error) setError(error.message);
    else {
      setSuccess("Patient created successfully!");
      setShowCreateModal(false);
      setFormData({ name: "", room_number: "", admission_date: new Date().toISOString().split("T")[0], notes: "" });
      fetchPatients();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setFormLoading(true);
    setError("");
    const { error } = await supabase.from("patients").update(formData).eq("id", selectedPatient.id);
    if (error) setError(error.message);
    else {
      setSuccess("Patient updated successfully!");
      setShowEditModal(false);
      setSelectedPatient(null);
      fetchPatients();
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient? All associated records will be deleted.")) return;
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) setError(error.message);
    else {
      setSuccess("Patient deleted successfully!");
      fetchPatients();
      setTimeout(() => setSuccess(""), 5000);
    }
  };

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
    if (error) setError(error.message);
    else {
      setSuccess("Medication assigned successfully!");
      setMedFormData({ medication_id: "", dosage: "", frequency: "Once daily", scheduled_times: ["08:00"] });
      fetchPatientMedications(selectedPatient.id);
      setTimeout(() => setSuccess(""), 5000);
    }
    setFormLoading(false);
  };

  const handleRemoveMedication = async (medId: string) => {
    if (!confirm("Remove this medication from the patient?")) return;
    const { error } = await supabase.from("patient_medications").delete().eq("id", medId);
    if (error) setError(error.message);
    else if (selectedPatient) fetchPatientMedications(selectedPatient.id);
  };

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

  const openMedsModal = async (patient: Patient) => {
    setSelectedPatient(patient);
    await fetchPatientMedications(patient.id);
    setShowMedsModal(true);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = patients.filter((p) => new Date(p.admission_date) >= oneWeekAgo).length;
  const roomsOccupied = new Set(patients.map((p) => p.room_number)).size;

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={userName}>
        <div className="space-y-5">
          <div className="skeleton-shimmer h-20 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton-shimmer h-96 rounded-2xl" />
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
              <h1 className="text-xl font-bold text-white truncate">Patient Management</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">Manage patients and their medications</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <div className="search-wrapper">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full sm:w-56"
                />
              </div>
              <button
                onClick={() => {
                  setFormData({ name: "", room_number: "", admission_date: new Date().toISOString().split("T")[0], notes: "" });
                  setShowCreateModal(true);
                }}
                className="btn btn-primary text-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Patient
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Total Patients" value={patients.length} accent="blue" icon={<UsersIcon />} />
          <StatTile label="New This Week" value={newThisWeek} accent="emerald" icon={<CalendarIcon />} />
          <StatTile label="Rooms Occupied" value={roomsOccupied} accent="violet" icon={<BuildingIcon />} />
        </div>

        {/* Patients Table */}
        <Panel title="All Patients" action={<span className="text-xs text-[var(--text-dim)]">{filteredPatients.length} shown</span>} bodyPadding="0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <Th>Patient</Th>
                  <Th>Room</Th>
                  <Th>Admitted</Th>
                  <Th>Notes</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <PatientAvatar
                          patient={patient}
                          size={40}
                          editable
                          onChanged={(url) => {
                            setPatients((prev) =>
                              prev.map((p) => (p.id === patient.id ? { ...p, avatar_url: url } : p))
                            );
                          }}
                          onError={(msg) => setError(msg)}
                        />
                        <span className="text-sm text-white font-medium truncate">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white whitespace-nowrap">{patient.room_number}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(patient.admission_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 max-w-[240px]">
                      <span className="text-sm text-[var(--text-muted)] truncate block">{patient.notes || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <IconButton onClick={() => openMedsModal(patient)} title="Manage Medications" tone="violet">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </IconButton>
                        <IconButton onClick={() => openEditModal(patient)} title="Edit" tone="default">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </IconButton>
                        <IconButton onClick={() => handleDeletePatient(patient.id)} title="Delete" tone="rose">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="text-center py-10 text-[var(--text-dim)] text-sm">No patients found</div>
          )}
        </Panel>

        {showCreateModal && (
          <PatientFormModal
            title="Add New Patient"
            formData={formData}
            onChange={setFormData}
            onSubmit={handleCreatePatient}
            onClose={() => setShowCreateModal(false)}
            submitLabel="Add Patient"
            submitting={formLoading}
          />
        )}

        {showEditModal && selectedPatient && (
          <PatientFormModal
            title="Edit Patient"
            formData={formData}
            onChange={setFormData}
            onSubmit={handleUpdatePatient}
            onClose={() => {
              setShowEditModal(false);
              setSelectedPatient(null);
            }}
            submitLabel="Save Changes"
            submitting={formLoading}
          />
        )}

        {showMedsModal && selectedPatient && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowMedsModal(false);
              setSelectedPatient(null);
              setPatientMeds([]);
            }}
          >
            <div
              className="glass-card max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-card-header">
                <div className="flex items-center gap-3 min-w-0">
                  <PatientAvatar
                    patient={selectedPatient}
                    size={40}
                    editable
                    onChanged={(url) => {
                      setSelectedPatient((prev) => (prev ? { ...prev, avatar_url: url } : prev));
                      setPatients((prev) =>
                        prev.map((p) => (p.id === selectedPatient.id ? { ...p, avatar_url: url } : p))
                      );
                    }}
                    onError={(msg) => setError(msg)}
                  />
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-white truncate">{selectedPatient.name}&apos;s Medications</h2>
                    <p className="text-xs text-[var(--text-muted)]">Room {selectedPatient.room_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMedsModal(false);
                    setSelectedPatient(null);
                    setPatientMeds([]);
                  }}
                  className="p-1.5 text-[var(--text-dim)] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-5 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Current Medications</h3>
                  {patientMeds.length > 0 ? (
                    <div className="space-y-2">
                      {patientMeds.map((pm) => (
                        <div key={pm.id} className="p-3 bg-white/5 border border-[var(--glass-border)] rounded-xl flex items-center justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-medium truncate">
                              {pm.medication.name} {pm.medication.dosage}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate">
                              {pm.dosage} • {pm.frequency}
                            </p>
                            <p className="text-[11px] text-[var(--text-dim)] truncate">Times: {pm.scheduled_times.join(", ")}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveMedication(pm.id)}
                            className="p-2 text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/10 rounded-lg transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-dim)]">No medications assigned yet</p>
                  )}
                </div>

                <div className="border-t border-[var(--glass-border)] pt-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Add Medication</h3>
                  <form onSubmit={handleAddMedication} className="space-y-3">
                    <Field label="Medication">
                      <select
                        value={medFormData.medication_id}
                        onChange={(e) => setMedFormData({ ...medFormData, medication_id: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">Select medication...</option>
                        {medications.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} {med.dosage}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Dosage">
                        <input
                          type="text"
                          value={medFormData.dosage}
                          onChange={(e) => setMedFormData({ ...medFormData, dosage: e.target.value })}
                          className="input"
                          placeholder="e.g., 1 tablet"
                          required
                        />
                      </Field>
                      <Field label="Frequency">
                        <select
                          value={medFormData.frequency}
                          onChange={(e) => setMedFormData({ ...medFormData, frequency: e.target.value })}
                          className="input"
                        >
                          <option>Once daily</option>
                          <option>Twice daily</option>
                          <option>Three times daily</option>
                          <option>Four times daily</option>
                          <option>As needed</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Scheduled Time">
                      <input
                        type="time"
                        value={medFormData.scheduled_times[0]}
                        onChange={(e) => setMedFormData({ ...medFormData, scheduled_times: [e.target.value] })}
                        className="input"
                      />
                    </Field>
                    <button type="submit" disabled={formLoading} className="btn btn-primary w-full">
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

function PatientFormModal({
  title,
  formData,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
  submitting,
}: {
  title: string;
  formData: { name: string; room_number: string; admission_date: string; notes: string };
  onChange: (v: { name: string; room_number: string; admission_date: string; notes: string }) => void;
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
          <Field label="Full Name">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </Field>
          <Field label="Room Number">
            <input
              type="text"
              value={formData.room_number}
              onChange={(e) => onChange({ ...formData, room_number: e.target.value })}
              className="input"
              placeholder="e.g., 101A"
              required
            />
          </Field>
          <Field label="Admission Date">
            <input
              type="date"
              value={formData.admission_date}
              onChange={(e) => onChange({ ...formData, admission_date: e.target.value })}
              className="input"
              required
            />
          </Field>
          <Field label="Notes (Optional)">
            <textarea
              value={formData.notes}
              onChange={(e) => onChange({ ...formData, notes: e.target.value })}
              className="input h-24 resize-none"
              placeholder="Any special notes..."
            />
          </Field>
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}

function IconButton({
  onClick,
  title,
  tone,
  children,
}: {
  onClick: () => void;
  title: string;
  tone: "default" | "violet" | "rose";
  children: React.ReactNode;
}) {
  const toneClasses =
    tone === "violet"
      ? "text-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/10"
      : tone === "rose"
      ? "text-[var(--text-muted)] hover:text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/10"
      : "text-[var(--text-muted)] hover:text-white hover:bg-white/10";
  return (
    <button onClick={onClick} title={title} className={`p-2 rounded-lg transition-colors ${toneClasses}`}>
      {children}
    </button>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
