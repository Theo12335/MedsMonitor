"use client";

import DashboardLayout from "@/components/DashboardLayout";
import PatientAvatar from "@/components/dashboard/PatientAvatar";
import StatTile from "@/components/dashboard/StatTile";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, usePatients } from "@/lib/supabase/hooks";

interface PatientWithMeds {
  id: string;
  name: string;
  room_number: string;
  admission_date: string;
  notes: string | null;
  avatar_url: string | null;
  medicationCount: number;
  pendingToday: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  drawer_location: string;
}

interface PatientMedication {
  id: string;
  medication: Medication;
  dosage: string;
  frequency: string;
  scheduled_times: string[];
  start_date: string;
  end_date: string | null;
}

export default function PatientsPage() {
  const { profile } = useProfile();
  const { patients, loading: patientsLoading } = usePatients();
  const [patientsWithMeds, setPatientsWithMeds] = useState<PatientWithMeds[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientWithMeds | null>(null);
  const [showMedsModal, setShowMedsModal] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patientMeds, setPatientMeds] = useState<PatientMedication[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  const [medFormData, setMedFormData] = useState({
    medication_id: "",
    dosage: "",
    frequency: "Once daily",
    scheduled_times: ["08:00"],
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  const fetchMedications = async () => {
    const { data } = await supabase.from("medications").select("id, name, dosage, drawer_location").order("name");
    if (data) setMedications(data);
  };

  const fetchPatientMedications = async (patientId: string) => {
    const { data } = await supabase
      .from("patient_medications")
      .select(`id, dosage, frequency, scheduled_times, start_date, end_date, medication:medications(id, name, dosage, drawer_location)`)
      .eq("patient_id", patientId);
    if (data) setPatientMeds(data as unknown as PatientMedication[]);
  };

  useEffect(() => { fetchMedications(); }, []);

  useEffect(() => {
    const fetchPatientMedicationsData = async () => {
      if (patients.length === 0) return;
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const enrichedPatients: PatientWithMeds[] = await Promise.all(
        patients.map(async (patient) => {
          const { count: medCount } = await supabase.from("patient_medications").select("*", { count: "exact", head: true }).eq("patient_id", patient.id);
          const { count: pendingCount } = await supabase.from("medication_logs").select("*", { count: "exact", head: true }).eq("patient_id", patient.id).eq("status", "pending").gte("scheduled_time", startOfDay).lte("scheduled_time", endOfDay);
          return { ...patient, medicationCount: medCount || 0, pendingToday: pendingCount || 0 };
        })
      );
      setPatientsWithMeds(enrichedPatients);
    };
    fetchPatientMedicationsData();
  }, [patients, supabase]);

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setFormLoading(true);
    setError("");

    const { error } = await supabase.from("patient_medications").insert([{
      patient_id: selectedPatient.id,
      medication_id: medFormData.medication_id,
      dosage: medFormData.dosage,
      frequency: medFormData.frequency,
      scheduled_times: medFormData.scheduled_times,
      start_date: medFormData.start_date,
      end_date: medFormData.end_date || null,
    }]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Medication schedule added!");
      setMedFormData({ medication_id: "", dosage: "", frequency: "Once daily", scheduled_times: ["08:00"], start_date: new Date().toISOString().split("T")[0], end_date: "" });
      fetchPatientMedications(selectedPatient.id);
      setPatientsWithMeds(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, medicationCount: p.medicationCount + 1 } : p));
      setTimeout(() => setSuccess(""), 3000);
    }
    setFormLoading(false);
  };

  const handleRemoveMedication = async (medId: string) => {
    if (!confirm("Remove this medication schedule?")) return;
    const { error } = await supabase.from("patient_medications").delete().eq("id", medId);
    if (error) {
      setError(error.message);
    } else {
      if (selectedPatient) {
        fetchPatientMedications(selectedPatient.id);
        setPatientsWithMeds(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, medicationCount: Math.max(0, p.medicationCount - 1) } : p));
      }
    }
  };

  const openMedsModal = async (patient: PatientWithMeds) => {
    setSelectedPatient(patient);
    await fetchPatientMedications(patient.id);
    setShowMedsModal(true);
  };

  const formatTimeDisplay = (time24: string) => {
    const [hourStr, minStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minStr || '00'} ${ampm}`;
  };

  const filteredPatients = patientsWithMeds.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalPatients = patientsWithMeds.length;
  const totalPending = patientsWithMeds.reduce((sum, p) => sum + p.pendingToday, 0);
  const allDone = patientsWithMeds.filter(p => p.pendingToday === 0).length;

  if (patientsLoading) {
    return (
      <DashboardLayout userRole="caregiver" userName={userName}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton-shimmer h-8 w-56 rounded-lg"></div>
              <div className="skeleton-shimmer h-4 w-72 rounded-lg"></div>
            </div>
            <div className="skeleton-shimmer h-12 w-64 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-shimmer h-28 rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-shimmer h-56 rounded-2xl"></div>)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver" userName={userName}>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Patient Management</h1>
            <p className="text-[var(--text-muted)] mt-1">{totalPatients} patients under your care</p>
          </div>
          <div className="search-wrapper w-full lg:w-80">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search patients by name or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="p-4 bg-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/30 rounded-xl text-[var(--accent-emerald)] flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 bg-[var(--accent-emerald)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {success}
          </div>
        )}
        {error && (
          <div className="p-4 bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 rounded-xl text-[var(--accent-rose)] flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 bg-[var(--accent-rose)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile
            label="Total Patients"
            value={totalPatients}
            accent="cyan"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatTile
            label="Pending Today"
            value={totalPending}
            accent="amber"
            emphasize={totalPending > 0}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatTile
            label="Completed All Meds"
            value={allDone}
            accent="emerald"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Patient Grid */}
        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPatients.map((patient) => {
              return (
                <div key={patient.id} className="glass-card hover:border-[var(--accent-cyan)]/30 transition-all">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <PatientAvatar
                        patient={patient}
                        size={48}
                        editable
                        onChanged={(url) => {
                          setPatientsWithMeds((prev) =>
                            prev.map((p) => (p.id === patient.id ? { ...p, avatar_url: url } : p))
                          );
                        }}
                        onError={(msg) => setError(msg)}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white truncate">{patient.name}</h3>
                        <p className="text-sm text-[var(--text-muted)]">Room {patient.room_number}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {patient.pendingToday > 0 ? (
                            <span className="badge badge-amber">{patient.pendingToday} pending</span>
                          ) : (
                            <span className="badge badge-emerald">All done</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 space-y-2.5 border-t border-[var(--glass-border)]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-dim)]">Medications</span>
                        <span className="text-white font-medium">{patient.medicationCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-dim)]">Admitted</span>
                        <span className="text-[var(--text-secondary)]">{new Date(patient.admission_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--glass-border)]">
                      <button
                        onClick={() => openMedsModal(patient)}
                        className="btn btn-ghost flex-1 text-xs"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Schedule
                      </button>
                      <button
                        onClick={() => window.location.href = `/dashboard/caregiver/dispense?patient=${patient.id}`}
                        className="btn btn-primary flex-1 text-xs"
                      >
                        Dispense
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--bg-elevated)] rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-dim)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">No patients found</p>
            <p className="text-sm text-[var(--text-dim)]">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Medication Modal */}
        {showMedsModal && selectedPatient && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMedsModal(false)}
          >
            <div
              className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <PatientAvatar
                    patient={selectedPatient}
                    size={40}
                    editable
                    onChanged={(url) => {
                      setSelectedPatient((prev) => (prev ? { ...prev, avatar_url: url } : prev));
                      setPatientsWithMeds((prev) =>
                        prev.map((p) => (p.id === selectedPatient.id ? { ...p, avatar_url: url } : p))
                      );
                    }}
                    onError={(msg) => setError(msg)}
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedPatient.name}</h2>
                    <p className="text-sm text-[var(--text-muted)]">Room {selectedPatient.room_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowMedsModal(false); setSelectedPatient(null); setPatientMeds([]); setError(""); }}
                  className="p-2 text-[var(--text-dim)] hover:text-white hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-6 max-h-[calc(85vh-80px)] overflow-y-auto">
                {error && (
                  <div className="p-3 bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 rounded-xl text-[var(--accent-rose)] text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Current Medications */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Current Medications</h3>
                  {patientMeds.length > 0 ? (
                    <div className="space-y-3">
                      {patientMeds.map((pm) => (
                        <div key={pm.id} className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--glass-border)]">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white">{pm.medication.name}</span>
                                <span className="badge badge-cyan">Drawer {pm.medication.drawer_location}</span>
                              </div>
                              <p className="text-xs text-[var(--text-muted)] mt-1">{pm.dosage} • {pm.frequency}</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {pm.scheduled_times.map((time, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-[var(--bg-card)] rounded-md text-xs text-[var(--text-secondary)]">
                                    {formatTimeDisplay(time)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMedication(pm.id)}
                              className="p-2 text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/10 rounded-lg transition-colors flex-shrink-0"
                              aria-label="Remove medication"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-[var(--bg-elevated)] rounded-xl text-center">
                      <p className="text-sm text-[var(--text-dim)]">No medications scheduled</p>
                    </div>
                  )}
                </div>

                {/* Add Medication Form */}
                <div className="border-t border-[var(--glass-border)] pt-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Add New Medication</h3>
                  <form onSubmit={handleAddMedication} className="space-y-4">
                    <div>
                      <label className="block text-xs text-[var(--text-dim)] mb-2">Medication</label>
                      <select
                        value={medFormData.medication_id}
                        onChange={e => setMedFormData({ ...medFormData, medication_id: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-cyan)]/50 transition-colors"
                        required
                      >
                        <option value="">Select medication...</option>
                        {medications.map(m => (
                          <option key={m.id} value={m.id}>{m.name} {m.dosage} (Drawer {m.drawer_location})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--text-dim)] mb-2">Dosage</label>
                        <input
                          type="text"
                          value={medFormData.dosage}
                          onChange={e => setMedFormData({ ...medFormData, dosage: e.target.value })}
                          className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-cyan)]/50 transition-colors"
                          placeholder="e.g., 1 tablet"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-dim)] mb-2">Frequency</label>
                        <select
                          value={medFormData.frequency}
                          onChange={e => setMedFormData({ ...medFormData, frequency: e.target.value })}
                          className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-cyan)]/50 transition-colors"
                        >
                          <option>Once daily</option>
                          <option>Twice daily</option>
                          <option>Three times daily</option>
                          <option>Four times daily</option>
                          <option>As needed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--text-dim)] mb-2">Start Date</label>
                        <input
                          type="date"
                          value={medFormData.start_date}
                          onChange={e => setMedFormData({ ...medFormData, start_date: e.target.value })}
                          className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-cyan)]/50 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-dim)] mb-2">End Date (Optional)</label>
                        <input
                          type="date"
                          value={medFormData.end_date}
                          onChange={e => setMedFormData({ ...medFormData, end_date: e.target.value })}
                          className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-cyan)]/50 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="btn btn-primary w-full mt-2"
                    >
                      {formLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : "Add Medication"}
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
