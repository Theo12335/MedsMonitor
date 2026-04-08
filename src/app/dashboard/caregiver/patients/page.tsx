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

export default function PatientsPage() {
  const { profile } = useProfile();
  const { patients, loading: patientsLoading } = usePatients();
  const [patientsWithMeds, setPatientsWithMeds] = useState<PatientWithMeds[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientWithMeds | null>(null);
  const supabase = createClient();

  const userName = profile?.name || "Loading...";

  useEffect(() => {
    const fetchPatientMedications = async () => {
      if (patients.length === 0) return;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const enrichedPatients: PatientWithMeds[] = await Promise.all(
        patients.map(async (patient) => {
          // Get medication count
          const { count: medCount } = await supabase
            .from("patient_medications")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patient.id);

          // Get pending logs for today
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

    fetchPatientMedications();
  }, [patients, supabase]);

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
            <p className="text-slate-400">Manage and view all patients</p>
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
              onClick={() => setSelectedPatient(patient)}
              className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 hover:border-emerald-500/50 transition-all cursor-pointer"
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

              {patient.notes && (
                <div className="mt-4 p-3 bg-[#1e293b] rounded-lg">
                  <p className="text-xs text-slate-400 line-clamp-2">{patient.notes}</p>
                </div>
              )}
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

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Patient Details</h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {selectedPatient.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold text-white truncate">{selectedPatient.name}</h3>
                    <p className="text-slate-400">Room {selectedPatient.room_number}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-[#1e293b]">
                    <span className="text-slate-400">Admission Date</span>
                    <span className="text-white">{new Date(selectedPatient.admission_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-[#1e293b]">
                    <span className="text-slate-400">Active Medications</span>
                    <span className="text-white">{selectedPatient.medicationCount}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-[#1e293b]">
                    <span className="text-slate-400">Pending Today</span>
                    <span className={selectedPatient.pendingToday > 0 ? "text-amber-400" : "text-emerald-400"}>
                      {selectedPatient.pendingToday}
                    </span>
                  </div>
                  {selectedPatient.notes && (
                    <div className="py-3">
                      <span className="text-slate-400 block mb-2">Notes</span>
                      <p className="text-white bg-[#1e293b] p-3 rounded-lg break-words">{selectedPatient.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      window.location.href = "/dashboard/caregiver/dispense";
                    }}
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Dispense Medication
                  </button>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="px-6 py-3 bg-[#1e293b] text-white rounded-xl font-medium hover:bg-[#334155] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
