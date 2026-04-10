"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, usePatients } from "@/lib/supabase/hooks";

interface PatientWithMeds {
  id: string;
  name: string;
  room_number: string;
  admission_date: string;
  notes: string | null;
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

  // Medication form state
  const [medFormData, setMedFormData] = useState({
    medication_id: "",
    dosage: "",
    frequency: "Once daily",
    scheduled_times: ["08:00"],
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  // Fetch all available medications
  const fetchMedications = async () => {
    const { data } = await supabase
      .from("medications")
      .select("id, name, dosage, drawer_location")
      .order("name");
    if (data) setMedications(data);
  };

  // Fetch patient's current medications
  const fetchPatientMedications = async (patientId: string) => {
    const { data } = await supabase
      .from("patient_medications")
      .select(`
        id,
        dosage,
        frequency,
        scheduled_times,
        start_date,
        end_date,
        medication:medications(id, name, dosage, drawer_location)
      `)
      .eq("patient_id", patientId);

    if (data) {
      setPatientMeds(data as unknown as PatientMedication[]);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    const fetchPatientMedicationsData = async () => {
      if (patients.length === 0) return;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const enrichedPatients: PatientWithMeds[] = await Promise.all(
        patients.map(async (patient) => {
          const { count: medCount } = await supabase
            .from("patient_medications")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patient.id);

          const { count: pendingCount } = await supabase
            .from("medication_logs")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patient.id)
            .eq("status", "pending")
            .gte("scheduled_time", startOfDay)
            .lte("scheduled_time", endOfDay);

          return {
            ...patient,
            medicationCount: medCount || 0,
            pendingToday: pendingCount || 0,
          };
        })
      );

      setPatientsWithMeds(enrichedPatients);
    };

    fetchPatientMedicationsData();
  }, [patients, supabase]);

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
        start_date: medFormData.start_date,
        end_date: medFormData.end_date || null,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Medication schedule added!");
      setMedFormData({
        medication_id: "",
        dosage: "",
        frequency: "Once daily",
        scheduled_times: ["08:00"],
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
      fetchPatientMedications(selectedPatient.id);
      // Update medication count in list
      setPatientsWithMeds(prev => prev.map(p =>
        p.id === selectedPatient.id ? { ...p, medicationCount: p.medicationCount + 1 } : p
      ));
      setTimeout(() => setSuccess(""), 3000);
    }
    setFormLoading(false);
  };

  // Remove medication from patient
  const handleRemoveMedication = async (medId: string) => {
    if (!confirm("Remove this medication schedule?")) return;

    const { error } = await supabase.from("patient_medications").delete().eq("id", medId);

    if (error) {
      setError(error.message);
    } else {
      if (selectedPatient) {
        fetchPatientMedications(selectedPatient.id);
        setPatientsWithMeds(prev => prev.map(p =>
          p.id === selectedPatient.id ? { ...p, medicationCount: Math.max(0, p.medicationCount - 1) } : p
        ));
      }
    }
  };

  // Open medications modal
  const openMedsModal = async (patient: PatientWithMeds) => {
    setSelectedPatient(patient);
    await fetchPatientMedications(patient.id);
    setShowMedsModal(true);
  };

  // Add scheduled time
  const addScheduledTime = () => {
    setMedFormData({
      ...medFormData,
      scheduled_times: [...medFormData.scheduled_times, "12:00"],
    });
  };

  // Remove scheduled time
  const removeScheduledTime = (index: number) => {
    if (medFormData.scheduled_times.length > 1) {
      setMedFormData({
        ...medFormData,
        scheduled_times: medFormData.scheduled_times.filter((_, i) => i !== index),
      });
    }
  };

  // Update scheduled time
  const updateScheduledTime = (index: number, value: string) => {
    const newTimes = [...medFormData.scheduled_times];
    newTimes[index] = value;
    setMedFormData({ ...medFormData, scheduled_times: newTimes });
  };

  const filteredPatients = patientsWithMeds.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (patientsLoading) {
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
            <h1 className="text-2xl font-bold text-white">Patient List</h1>
            <p className="text-slate-400">Manage patients and medication schedules</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
                className="pl-10 pr-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{patientsWithMeds.length}</p>
                <p className="text-sm text-slate-400">Total Patients</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {patientsWithMeds.reduce((sum, p) => sum + p.pendingToday, 0)}
                </p>
                <p className="text-sm text-slate-400">Pending Medications</p>
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
                <p className="text-2xl font-bold text-white">
                  {patientsWithMeds.filter((p) => p.pendingToday === 0).length}
                </p>
                <p className="text-sm text-slate-400">All Meds Given</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  {patient.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{patient.name}</h3>
                  <p className="text-sm text-slate-400">Room {patient.room_number}</p>
                </div>
                {patient.pendingToday > 0 && (
                  <div className="px-2 py-1 bg-amber-500/20 rounded-lg flex-shrink-0">
                    <span className="text-xs font-medium text-amber-400 whitespace-nowrap">{patient.pendingToday} pending</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#1e293b]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Medications</span>
                  <span className="text-white font-medium">{patient.medicationCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Admitted</span>
                  <span className="text-white font-medium">
                    {new Date(patient.admission_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-[#1e293b] flex gap-2">
                <button
                  onClick={() => openMedsModal(patient)}
                  className="flex-1 py-2 px-3 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule
                </button>
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/caregiver/dispense?patient=${patient.id}`;
                  }}
                  className="flex-1 py-2 px-3 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Dispense
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No patients found</p>
          </div>
        )}

        {/* Medications Schedule Modal */}
        {showMedsModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between sticky top-0 bg-[#0f172a] z-10">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedPatient.name}</h2>
                  <p className="text-sm text-slate-400">Medication Schedule - Room {selectedPatient.room_number}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMedsModal(false);
                    setSelectedPatient(null);
                    setPatientMeds([]);
                    setError("");
                  }}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Error/Success Messages */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
                )}

                {/* Current Medications */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Current Medications</h3>
                  {patientMeds.length > 0 ? (
                    <div className="space-y-3">
                      {patientMeds.map((pm) => (
                        <div key={pm.id} className="p-4 bg-[#1e293b] rounded-xl">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">{pm.medication.name}</p>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                                  Drawer {pm.medication.drawer_location}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400 mt-1">{pm.dosage} - {pm.frequency}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {pm.scheduled_times.map((time, i) => (
                                  <span key={i} className="px-2 py-1 bg-[#0f172a] rounded text-xs text-slate-300">
                                    {time}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                From: {new Date(pm.start_date).toLocaleDateString()}
                                {pm.end_date && ` to ${new Date(pm.end_date).toLocaleDateString()}`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveMedication(pm.id)}
                              className="p-2 text-red-400 hover:text-red-300 flex-shrink-0"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm py-4 text-center bg-[#1e293b] rounded-xl">No medications scheduled</p>
                  )}
                </div>

                {/* Add Medication Form */}
                <div className="border-t border-[#1e293b] pt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Add New Schedule</h3>
                  <form onSubmit={handleAddMedication} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Medication</label>
                      <select
                        value={medFormData.medication_id}
                        onChange={(e) => setMedFormData({ ...medFormData, medication_id: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        required
                      >
                        <option value="">Select medication...</option>
                        {medications.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} {med.dosage} (Drawer {med.drawer_location})
                          </option>
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
                          className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                          placeholder="e.g., 1 tablet"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Frequency</label>
                        <select
                          value={medFormData.frequency}
                          onChange={(e) => setMedFormData({ ...medFormData, frequency: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-emerald-500"
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
                      <label className="block text-sm font-medium text-slate-400 mb-2">Scheduled Times</label>
                      <div className="space-y-2">
                        {medFormData.scheduled_times.map((time, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => updateScheduledTime(index, e.target.value)}
                              className="flex-1 px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            />
                            {medFormData.scheduled_times.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeScheduledTime(index)}
                                className="p-3 text-red-400 hover:text-red-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addScheduledTime}
                          className="w-full py-2 border border-dashed border-[#334155] rounded-xl text-slate-400 hover:text-white hover:border-emerald-500 transition-colors text-sm"
                        >
                          + Add Another Time
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={medFormData.start_date}
                          onChange={(e) => setMedFormData({ ...medFormData, start_date: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">End Date (Optional)</label>
                        <input
                          type="date"
                          value={medFormData.end_date}
                          onChange={(e) => setMedFormData({ ...medFormData, end_date: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                      {formLoading ? "Adding..." : "Add Medication Schedule"}
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
