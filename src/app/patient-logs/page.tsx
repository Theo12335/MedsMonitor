"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

// Mock patient medication data
const patientMedications = [
  { id: 1, patient: "John Doe", room: "101A", medicine: "Aspirin 100mg", time: "8:00 AM", status: "taken" },
  { id: 2, patient: "John Doe", room: "101A", medicine: "Metformin 500mg", time: "12:00 PM", status: "pending" },
  { id: 3, patient: "Jane Smith", room: "102B", medicine: "Lisinopril 10mg", time: "8:00 AM", status: "taken" },
  { id: 4, patient: "Bob Wilson", room: "103C", medicine: "Vitamin D 1000 IU", time: "9:00 AM", status: "pending" },
  { id: 5, patient: "Mary Johnson", room: "104D", medicine: "Omeprazole 20mg", time: "7:00 AM", status: "taken" },
];

const stats = [
  {
    value: "3",
    label: "Medications Taken Today",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    icon: (
      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "2",
    label: "Pending Today",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
    icon: (
      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "12",
    label: "Active Patients",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.15)",
    icon: (
      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function PatientLogsPage() {
  return (
    <main className="min-h-screen bg-[#030712]">
      <Navbar />
      <section style={{ padding: '96px 24px', backgroundColor: '#0a0f1c' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>
                PATIENT LOGS
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                MEDICATION ADMINISTRATION RECORDS
              </p>
              <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>MODULE_LOGS_02</p>
            </div>
          </div>

          {/* Login Prompt Card */}
          <div style={{
            padding: '48px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
            borderRadius: '16px',
            border: '1px solid #1e293b',
            marginBottom: '48px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <svg style={{ width: '40px', height: '40px', color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
              View Your Records
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Log in to view your personal medication schedule and history.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  backgroundColor: '#059669',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontSize: '15px'
                }}
              >
                Login as Patient
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #475569',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontSize: '15px'
                }}
              >
                Login as Caregiver
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: '28px',
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  border: '1px solid #1e293b',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: stat.bgColor,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '32px', fontWeight: 700, color: 'white', lineHeight: 1 }}>{stat.value}</p>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Today's Schedule Table */}
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #1e293b',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>Today&apos;s Medication Schedule</h2>
              <span style={{
                fontSize: '12px',
                color: '#64748b',
                padding: '6px 12px',
                backgroundColor: '#1e293b',
                borderRadius: '6px',
                fontFamily: 'monospace'
              }}>
                PUBLIC VIEW
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e293b' }}>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medication</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scheduled</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientMedications.map((med, index) => (
                    <tr
                      key={med.id}
                      style={{
                        borderBottom: index < patientMedications.length - 1 ? '1px solid #1e293b' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'white', fontWeight: 500 }}>{med.patient}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace' }}>{med.room}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'white' }}>{med.medicine}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8' }}>{med.time}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: med.status === "taken" ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: med.status === "taken" ? '#34d399' : '#fbbf24',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em'
                        }}>
                          {med.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
