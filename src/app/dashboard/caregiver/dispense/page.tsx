"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Panel from "@/components/dashboard/Panel";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  return (
    <Suspense
      fallback={
        <DashboardLayout userRole="caregiver" userName="Loading...">
          <div className="space-y-5">
            <div className="skeleton-shimmer h-20 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="skeleton-shimmer h-80 rounded-2xl" />
              <div className="skeleton-shimmer h-80 rounded-2xl" />
              <div className="skeleton-shimmer h-80 rounded-2xl" />
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <DispensePageContent />
    </Suspense>
  );
}

function DispensePageContent() {
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patient");

  const [selectedPatient, setSelectedPatient] = useState<string | null>(initialPatientId);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [dispensingMed, setDispensingMed] = useState<string | null>(null);
  const [patientsWithMeds, setPatientsWithMeds] = useState<PatientWithMeds[]>([]);
  const [loading, setLoading] = useState(true);

  const { profile } = useProfile();
  const { patients } = usePatients();
  const { drawers } = useDrawers();
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  useEffect(() => {
    const fetchPatientsWithMedications = async () => {
      if (patients.length === 0) return;

      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const patientMedsMap: PatientWithMeds[] = [];

      for (const patient of patients) {
        const { data: patientMeds } = await supabase
          .from("patient_medications")
          .select(
            `id, dosage, scheduled_times, start_date, end_date, medication:medications(id, name, drawer_location)`
          )
          .eq("patient_id", patient.id);

        const { data: existingLogs } = await supabase
          .from("medication_logs")
          .select("id, scheduled_time, status, patient_medication_id")
          .eq("patient_id", patient.id)
          .gte("scheduled_time", startOfDay)
          .lte("scheduled_time", endOfDay);

        const medications: PatientMedication[] = [];

        for (const pm of patientMeds || []) {
          const scheduledTimes = pm.scheduled_times || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const med: any = Array.isArray(pm.medication) ? pm.medication[0] : pm.medication;

          const startDate = pm.start_date ? new Date(pm.start_date) : null;
          const endDate = pm.end_date ? new Date(pm.end_date) : null;
          const todayObj = new Date(todayDate);

          if (startDate && startDate > todayObj) continue;
          if (endDate && endDate < todayObj) continue;

          for (const timeStr of scheduledTimes) {
            const scheduledDateTime = new Date(`${todayDate}T${timeStr}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingLog = (existingLogs || []).find((log: any) => {
              const logTime = new Date(log.scheduled_time);
              return (
                log.patient_medication_id === pm.id &&
                logTime.getHours() === scheduledDateTime.getHours() &&
                logTime.getMinutes() === scheduledDateTime.getMinutes()
              );
            });

            if (existingLog) {
              medications.push({
                id: pm.id,
                name: med?.name || "Unknown",
                dosage: pm.dosage || "N/A",
                drawer: med?.drawer_location || "N/A",
                time: scheduledDateTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
                status: existingLog.status,
                logId: existingLog.id,
              });
            } else {
              const { data: newLog } = await supabase
                .from("medication_logs")
                .insert({
                  patient_id: patient.id,
                  patient_medication_id: pm.id,
                  scheduled_time: scheduledDateTime.toISOString(),
                  status: "pending",
                })
                .select("id")
                .single();

              medications.push({
                id: pm.id,
                name: med?.name || "Unknown",
                dosage: pm.dosage || "N/A",
                drawer: med?.drawer_location || "N/A",
                time: scheduledDateTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
                status: "pending",
                logId: newLog?.id,
              });
            }
          }
        }

        medications.sort((a, b) => {
          const parseTime = (timeStr: string) => {
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return 0;
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const isPM = match[3].toUpperCase() === "PM";
            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          return parseTime(a.time) - parseTime(b.time);
        });

        patientMedsMap.push({
          id: patient.id,
          name: patient.name,
          room: patient.room_number,
          medications,
        });
      }

      setPatientsWithMeds(patientMedsMap);
      setLoading(false);
    };

    fetchPatientsWithMedications();
  }, [patients, supabase]);

  const handleSelectMedication = async (medicationId: string, drawer: string, patientMedicationId: string) => {
    setActiveDrawer(drawer);
    setDispensingMed(medicationId);

    await supabase.from("drawers").update({ led_active: true, status: "active" }).eq("label", drawer);

    await supabase.from("dispense_queue").insert({
      patient_medication_id: patientMedicationId,
      drawer_id: drawer,
      scheduled_time: new Date().toISOString(),
      status: "pending",
      max_attempts: 3,
    });
  };

  const handleDispenseComplete = async () => {
    if (!dispensingMed || !activeDrawer) return;

    const currentPatient = patientsWithMeds.find((p) => p.id === selectedPatient);
    const medication = currentPatient?.medications.find((m) => m.id === dispensingMed);

    if (medication?.logId) {
      await supabase
        .from("medication_logs")
        .update({
          status: "taken",
          actual_time: new Date().toISOString(),
          caregiver_id: profile?.id,
          drawer_opened: true,
        })
        .eq("id", medication.logId);

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

    await supabase.from("drawers").update({ led_active: false, status: "idle" }).eq("label", activeDrawer);

    setActiveDrawer(null);
    setDispensingMed(null);
  };

  const currentPatient = patientsWithMeds.find((p) => p.id === selectedPatient);

  const drawerDisplay = drawers.map((d) => ({
    id: d.label,
    medicine: d.medication ? `${d.medication.name} ${d.medication.dosage}` : "Empty",
    stock: d.estimated_pill_count,
    status: d.status === "low_stock" || d.status === "empty" ? "low" : "ok",
  }));

  if (loading) {
    return (
      <DashboardLayout userRole="caregiver" userName={userName}>
        <div className="space-y-5">
          <div className="skeleton-shimmer h-20 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="skeleton-shimmer h-80 rounded-2xl" />
            <div className="skeleton-shimmer h-80 rounded-2xl" />
            <div className="skeleton-shimmer h-80 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver" userName={userName}>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Medication Dispense</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">Select a patient and medication to dispense</p>
            </div>
          </div>
        </div>

        {/* 3-column workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Patient Selection */}
          <Panel
            title="Select Patient"
            action={<span className="text-xs text-[var(--text-dim)]">{patientsWithMeds.length}</span>}
            bodyPadding="1rem"
          >
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {patientsWithMeds.length > 0 ? (
                patientsWithMeds.map((patient) => {
                  const pending = patient.medications.filter((m) => m.status === "pending").length;
                  const selected = selectedPatient === patient.id;
                  return (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all min-w-0 ${
                        selected
                          ? "bg-[var(--accent-emerald)]/15 border-[var(--accent-emerald)]/50"
                          : "bg-white/5 border-[var(--glass-border)] hover:border-[var(--accent-blue)]/30 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{patient.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">Room {patient.room}</p>
                        </div>
                        <span className={`badge ${pending > 0 ? "badge-amber" : "badge-emerald"} flex-shrink-0`}>
                          {pending > 0 ? `${pending} pending` : "done"}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-[var(--text-dim)] text-sm">
                  No patients with scheduled medications
                </div>
              )}
            </div>
          </Panel>

          {/* Medication List */}
          <Panel title={currentPatient ? `${currentPatient.name}'s Medications` : "Medications"}>
            {currentPatient ? (
              <div className="space-y-3">
                {currentPatient.medications.length > 0 ? (
                  currentPatient.medications.map((med) => (
                    <div
                      key={med.id}
                      className={`p-4 rounded-xl border transition-all min-w-0 ${
                        med.status === "taken"
                          ? "bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30 opacity-70"
                          : dispensingMed === med.id
                          ? "bg-[var(--accent-emerald)]/15 border-[var(--accent-emerald)]/50"
                          : "bg-white/5 border-[var(--glass-border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3 min-w-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{med.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{med.dosage}</p>
                        </div>
                        <span
                          className={`text-sm flex-shrink-0 whitespace-nowrap ${
                            med.status === "taken" ? "text-[var(--accent-emerald)]" : "text-[var(--accent-amber)]"
                          }`}
                        >
                          {med.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--text-dim)] truncate">Drawer {med.drawer}</span>
                        {med.status === "taken" ? (
                          <span className="badge badge-emerald flex-shrink-0">Dispensed</span>
                        ) : (
                          <button
                            onClick={() => handleSelectMedication(med.id, med.drawer, med.id)}
                            disabled={dispensingMed !== null && dispensingMed !== med.id}
                            className="btn btn-primary text-xs flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {dispensingMed === med.id ? "Dispensing..." : "Dispense"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[var(--text-dim)] text-sm">No scheduled medications today</div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--text-dim)]">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">Select a patient to view medications</p>
              </div>
            )}
          </Panel>

          {/* Smart Storage */}
          <Panel
            title="Smart Storage"
            action={
              <span className="badge badge-emerald flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[var(--accent-emerald)] rounded-full animate-pulse-slow" />
                Connected
              </span>
            }
          >
            <div className="bg-black/25 rounded-xl p-3 mb-4">
              <div className="grid grid-cols-3 gap-3">
                {drawerDisplay.map((drawer) => (
                  <div
                    key={drawer.id}
                    className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center p-2 transition-all min-w-0 ${
                      activeDrawer === drawer.id
                        ? "bg-[var(--accent-emerald)]/30 border-[var(--accent-emerald)] animate-pulse"
                        : drawer.status === "low"
                        ? "bg-[var(--accent-amber)]/10 border-[var(--accent-amber)]/40"
                        : "bg-white/5 border-[var(--glass-border)]"
                    }`}
                  >
                    <span className="text-base font-bold text-white truncate">{drawer.id}</span>
                    {activeDrawer === drawer.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-4 h-4 bg-[var(--accent-emerald)] rounded-full animate-ping" />
                      </div>
                    )}
                    <span
                      className={`text-xs mt-1 ${
                        drawer.status === "low" ? "text-[var(--accent-amber)]" : "text-[var(--text-dim)]"
                      }`}
                    >
                      {drawer.stock} pills
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {activeDrawer && (
              <div className="bg-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3 min-w-0">
                  <div className="w-8 h-8 bg-[var(--accent-emerald)] rounded-lg flex items-center justify-center animate-pulse flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--accent-emerald)] font-semibold truncate">Drawer {activeDrawer} Active</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">LED is illuminated</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Open drawer {activeDrawer}, retrieve medication, and close drawer to confirm.
                </p>
                <button onClick={handleDispenseComplete} className="btn btn-primary w-full text-sm">
                  Confirm Dispense
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mb-2">Drawer Contents</p>
              {drawerDisplay.map((drawer) => (
                <div key={drawer.id} className="flex items-center justify-between gap-2 text-xs min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        drawer.status === "low" ? "bg-[var(--accent-amber)]" : "bg-[var(--accent-emerald)]"
                      }`}
                    />
                    <span className="text-[var(--text-muted)] flex-shrink-0">{drawer.id}:</span>
                    <span className="text-white truncate">{drawer.medicine}</span>
                  </div>
                  <span
                    className={`flex-shrink-0 ${
                      drawer.status === "low" ? "text-[var(--accent-amber)]" : "text-[var(--text-dim)]"
                    }`}
                  >
                    {drawer.stock}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Instructions */}
        <Panel title="Dispense Workflow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Select Patient", desc: "Choose a patient from the list" },
              { step: 2, title: "Click Medication", desc: "Select the medication to dispense" },
              { step: 3, title: "Locate Drawer", desc: "LED lights up on the correct drawer" },
              { step: 4, title: "Dispense & Close", desc: "System auto-logs when drawer closes" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 bg-[var(--accent-emerald)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--accent-emerald)] font-bold text-sm">{item.step}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardLayout>
  );
}
