"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

// Mock data - replace with real API calls
const patients = [
  { id: 1, name: "John Doe", room: "101A", medications: [
    { id: 1, name: "Aspirin", dosage: "100mg", drawer: "A1", time: "8:00 AM", status: "pending" },
    { id: 2, name: "Metformin", dosage: "500mg", drawer: "B3", time: "12:00 PM", status: "pending" },
  ]},
  { id: 2, name: "Jane Smith", room: "102B", medications: [
    { id: 3, name: "Lisinopril", dosage: "10mg", drawer: "A2", time: "8:00 AM", status: "pending" },
  ]},
  { id: 3, name: "Bob Wilson", room: "103C", medications: [
    { id: 4, name: "Vitamin D", dosage: "1000 IU", drawer: "B1", time: "9:00 AM", status: "pending" },
  ]},
];

const drawers = [
  { id: "A1", medicine: "Aspirin 100mg", stock: 45, status: "ok" },
  { id: "A2", medicine: "Lisinopril 10mg", stock: 32, status: "ok" },
  { id: "A3", medicine: "Atorvastatin 20mg", stock: 28, status: "ok" },
  { id: "B1", medicine: "Vitamin D 1000 IU", stock: 50, status: "ok" },
  { id: "B2", medicine: "Omeprazole 20mg", stock: 18, status: "low" },
  { id: "B3", medicine: "Metformin 500mg", stock: 8, status: "low" },
];

export default function DispensePage() {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [dispensingMed, setDispensingMed] = useState<number | null>(null);

  const handleSelectMedication = (medicationId: number, drawer: string) => {
    setActiveDrawer(drawer);
    setDispensingMed(medicationId);
    // TODO: Send WebSocket message to Arduino to light up the drawer LED
    console.log(`Lighting up drawer ${drawer} for medication ${medicationId}`);
  };

  const handleDispenseComplete = () => {
    // TODO: This would be triggered by the Arduino detecting drawer close
    // For now, we simulate it with a button click
    setActiveDrawer(null);
    setDispensingMed(null);
    // TODO: Update medication status to "taken" via API
    console.log("Medication dispensed, updating records...");
  };

  const currentPatient = patients.find((p) => p.id === selectedPatient);

  return (
    <DashboardLayout userRole="caregiver" userName="Jane Smith">
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
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedPatient === patient.id
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-[#1e293b] border-[#334155] text-white hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-slate-400">Room {patient.room}</p>
                    </div>
                    <div className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-400">
                      {patient.medications.filter((m) => m.status === "pending").length} pending
                    </div>
                  </div>
                </button>
              ))}
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
                        dispensingMed === med.id
                          ? "bg-emerald-500/20 border-emerald-500"
                          : "bg-[#1e293b] border-[#334155]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-white font-medium">{med.name}</p>
                          <p className="text-sm text-slate-400">{med.dosage}</p>
                        </div>
                        <span className="text-amber-400 text-sm">{med.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Drawer {med.drawer}</span>
                        <button
                          onClick={() => handleSelectMedication(med.id, med.drawer)}
                          disabled={dispensingMed !== null && dispensingMed !== med.id}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            dispensingMed === med.id
                              ? "bg-emerald-500 text-white"
                              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {dispensingMed === med.id ? "Active" : "Locate"}
                        </button>
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
                  {drawers.map((drawer) => (
                    <div
                      key={drawer.id}
                      className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all ${
                        activeDrawer === drawer.id
                          ? "bg-emerald-500/30 border-emerald-500 animate-pulse"
                          : drawer.status === "low"
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-[#0f172a] border-[#334155]"
                      }`}
                    >
                      <span className="text-lg font-bold text-white">{drawer.id}</span>
                      {activeDrawer === drawer.id && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
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
                    Confirm Dispense (Simulate)
                  </button>
                </div>
              )}

              {/* Drawer Legend */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Drawer Contents</p>
                {drawers.map((drawer) => (
                  <div key={drawer.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        drawer.status === "low" ? "bg-amber-500" : "bg-emerald-500"
                      }`}></span>
                      <span className="text-slate-400">{drawer.id}:</span>
                      <span className="text-white">{drawer.medicine}</span>
                    </div>
                    <span className={`text-xs ${
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
