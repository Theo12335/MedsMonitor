"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile, usePatients, useDrawers } from "@/lib/supabase/hooks";

interface PatientMedication {
  id: string;
  name: string;
  dosage: string;
  drawer: string;
  time: string;
  status: string;
  logId?: string;
}

interface PatientWithMeds {
  id: string;
  name: string;
  room: string;
  medications: PatientMedication[];
}

export default function DispensePage() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [dispensingMed, setDispensingMed] = useState<string | null>(null);
  const [patientsWithMeds, setPatientsWithMeds] = useState<PatientWithMeds[]>([]);
  const [loading, setLoading] = useState(true);

  const { profile } = useProfile();
  const { patients } = usePatients();
  const { drawers } = useDrawers();
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  // Fetch patients with their pending medications
  useEffect(() => {
    const fetchPatientsWithMedications = async () => {
      if (patients.length === 0) return;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const patientMedsMap: PatientWithMeds[] = [];

      for (const patient of patients) {
        // Get medication logs for this patient today
        const { data: logs } = await supabase
          .from("medication_logs")
          .select(`
            id,
            scheduled_time,
            status,
            patient_medication:patient_medications(
              id,
              dosage,
              medication:medications(name, drawer_location)
            )
          `)
          .eq("patient_id", patient.id)
          .gte("scheduled_time", startOfDay)
          .lte("scheduled_time", endOfDay)
          .order("scheduled_time");

        const medications: PatientMedication[] = (logs || []).map((log: any) => ({
          id: log.patient_medication?.id || log.id,
          name: log.patient_medication?.medication?.name || "Unknown",
          dosage: log.patient_medication?.dosage || "N/A",
          drawer: log.patient_medication?.medication?.drawer_location || "N/A",
          time: new Date(log.scheduled_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          status: log.status,
          logId: log.id,
        }));

        if (medications.length > 0) {
          patientMedsMap.push({
            id: patient.id,
            name: patient.name,
            room: patient.room_number,
            medications,
          });
        }
      }

      setPatientsWithMeds(patientMedsMap);
      setLoading(false);
    };

    fetchPatientsWithMedications();
  }, [patients, supabase]);

  const handleSelectMedication = async (medicationId: string, drawer: string, patientMedicationId: string) => {
    setActiveDrawer(drawer);
    setDispensingMed(medicationId);

    // Update drawer LED status in database
    await supabase
      .from("drawers")
      .update({ led_active: true, status: "active" })
      .eq("label", drawer);

    // Add task to dispense_queue for ESP32 to pick up
    const { error } = await supabase
      .from("dispense_queue")
      .insert({
        patient_medication_id: patientMedicationId,
        drawer_id: drawer,
        scheduled_time: new Date().toISOString(),
        status: "pending",
        max_attempts: 3,
      });

    if (error) {
      console.error("Failed to queue dispense task:", error);
    } else {
      console.log(`Dispense task queued for drawer ${drawer}`);
    }
  };

  const handleDispenseComplete = async () => {
    if (!dispensingMed || !activeDrawer) return;

    const currentPatient = patientsWithMeds.find((p) => p.id === selectedPatient);
    const medication = currentPatient?.medications.find((m) => m.id === dispensingMed);

    if (medication?.logId) {
      // Update medication log to "taken"
      await supabase
        .from("medication_logs")
        .update({
          status: "taken",
          actual_time: new Date().toISOString(),
          caregiver_id: profile?.id,
          drawer_opened: true,
        })
        .eq("id", medication.logId);

      // Update local state
      setPatientsWithMeds((prev) =>
        prev.map((p) =>
          p.id === selectedPatient
            ? {
                ...p,
                medications: p.medications.map((m) =>
                  m.id === dispensingMed ? { ...m, status: "taken" } : m
                ),
              }
            : p
        )
      );
    }

    // Turn off drawer LED
    await supabase
      .from("drawers")
      .update({ led_active: false, status: "idle" })
      .eq("label", activeDrawer);

    setActiveDrawer(null);
    setDispensingMed(null);
  };

  const currentPatient = patientsWithMeds.find((p) => p.id === selectedPatient);

  // Map drawers for visualization
  const drawerDisplay = drawers.map((d) => ({
    id: d.label,
    medicine: d.medication ? `${d.medication.name} ${d.medication.dosage}` : "Empty",
    stock: d.estimated_pill_count,
    status: d.status === "low_stock" || d.status === "empty" ? "low" : "ok",
  }));

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
        <div>
          <h1 className="text-2xl font-bold text-white">Medication Dispense</h1>
          <p className="text-slate-400">Select a patient and medication to dispense</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selection */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b]">
            <div className="p-4 border-b border-[#1e293b]">
              <h2 className="text-lg font-semibold text-white">Select Patient</h2>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {patientsWithMeds.length > 0 ? (
                patientsWithMeds.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedPatient === patient.id
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-[#1e293b] border-[#334155] text-white hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{patient.name}</p>
                        <p className="text-sm text-slate-400">Room {patient.room}</p>
                      </div>
                      <div className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-400 flex-shrink-0">
                        {patient.medications.filter((m) => m.status === "pending").length} pending
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No patients with pending medications</p>
                </div>
              )}
            </div>
          </div>

          {/* Medication List */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b]">
            <div className="p-4 border-b border-[#1e293b]">
              <h2 className="text-lg font-semibold text-white">
                {currentPatient ? `${currentPatient.name}'s Medications` : "Medications"}
              </h2>
            </div>
            <div className="p-4">
              {currentPatient ? (
                <div className="space-y-3">
                  {currentPatient.medications.map((med) => (
                    <div
                      key={med.id}
                      className={`p-4 rounded-xl border transition-all ${
                        med.status === "taken"
                          ? "bg-emerald-500/10 border-emerald-500/30 opacity-60"
                          : dispensingMed === med.id
                          ? "bg-emerald-500/20 border-emerald-500"
                          : "bg-[#1e293b] border-[#334155]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{med.name}</p>
                          <p className="text-sm text-slate-400">{med.dosage}</p>
                        </div>
                        <span className={`text-sm flex-shrink-0 ${med.status === "taken" ? "text-emerald-400" : "text-amber-400"}`}>
                          {med.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Drawer {med.drawer}</span>
                        {med.status === "taken" ? (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
                            Dispensed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSelectMedication(med.id, med.drawer, med.id)}
                            disabled={dispensingMed !== null && dispensingMed !== med.id}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              dispensingMed === med.id
                                ? "bg-emerald-500 text-white"
                                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {dispensingMed === med.id ? "Dispensing..." : "Dispense"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Select a patient to view medications</p>
                </div>
              )}
            </div>
          </div>

          {/* Smart Storage Visualization */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b]">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Smart Storage</h2>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>
            <div className="p-4">
              {/* Storage Unit Visualization */}
              <div className="bg-[#1e293b] rounded-xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-3">
                  {drawerDisplay.map((drawer) => (
                    <div
                      key={drawer.id}
                      className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all ${
                        activeDrawer === drawer.id
                          ? "bg-emerald-500/30 border-emerald-500 animate-pulse"
                          : drawer.status === "low"
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-[#0f172a] border-[#334155]"
                      }`}
                    >
                      <span className="text-lg font-bold text-white">{drawer.id}</span>
                      {activeDrawer === drawer.id && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                      <span className={`text-xs mt-1 ${
                        drawer.status === "low" ? "text-amber-400" : "text-slate-500"
                      }`}>
                        {drawer.stock} pills
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Dispense Info */}
              {activeDrawer && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-emerald-400 font-semibold">Drawer {activeDrawer} Active</p>
                      <p className="text-sm text-slate-400">LED is illuminated</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Open drawer {activeDrawer}, retrieve medication, and close drawer to confirm.
                  </p>
                  <button
                    onClick={handleDispenseComplete}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirm Dispense
                  </button>
                </div>
              )}

              {/* Drawer Legend */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Drawer Contents</p>
                {drawerDisplay.map((drawer) => (
                  <div key={drawer.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        drawer.status === "low" ? "bg-amber-500" : "bg-emerald-500"
                      }`}></span>
                      <span className="text-slate-400 flex-shrink-0">{drawer.id}:</span>
                      <span className="text-white truncate">{drawer.medicine}</span>
                    </div>
                    <span className={`text-xs flex-shrink-0 ${
                      drawer.status === "low" ? "text-amber-400" : "text-slate-500"
                    }`}>
                      {drawer.stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Dispense Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Select Patient", desc: "Choose a patient from the list" },
              { step: 2, title: "Click Medication", desc: "Select the medication to dispense" },
              { step: 3, title: "Locate Drawer", desc: "LED lights up on the correct drawer" },
              { step: 4, title: "Dispense & Close", desc: "System auto-logs when drawer closes" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-bold">{item.step}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
