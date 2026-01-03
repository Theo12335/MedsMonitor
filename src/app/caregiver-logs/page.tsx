"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

// Mock attendance data
const attendanceLogs = [
  { id: 1, name: "Jane Smith", date: "2024-12-30", timeIn: "7:00 AM", timeOut: "-", status: "active" },
  { id: 2, name: "Mike Johnson", date: "2024-12-30", timeIn: "7:15 AM", timeOut: "-", status: "active" },
  { id: 3, name: "Sarah Williams", date: "2024-12-29", timeIn: "7:00 AM", timeOut: "3:00 PM", status: "completed" },
  { id: 4, name: "Jane Smith", date: "2024-12-29", timeIn: "3:00 PM", timeOut: "11:00 PM", status: "completed" },
  { id: 5, name: "Tom Brown", date: "2024-12-28", timeIn: "11:00 PM", timeOut: "7:00 AM", status: "completed" },
];

const stats = [
  {
    value: "2",
    label: "Active On Shift",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    icon: (
      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "8",
    label: "Total Staff",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.15)",
    icon: (
      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: "156",
    label: "Hours This Week",
    color: "#a855f7",
    bgColor: "rgba(168, 85, 247, 0.15)",
    icon: (
      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function CaregiverLogsPage() {
  return (
    <main className="min-h-screen bg-[#030712]">
      <Navbar />
      <section style={{ padding: '96px 24px', backgroundColor: '#0a0f1c' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>
                CAREGIVER LOGS
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                STAFF ATTENDANCE & SHIFT MANAGEMENT
              </p>
              <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>MODULE_CARE_01</p>
            </div>
          </div>

          {/* Login Prompt Card */}
          <div style={{
            padding: '48px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
            borderRadius: '16px',
            border: '1px solid #1e293b',
            marginBottom: '48px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <svg style={{ width: '40px', height: '40px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
              Authentication Required
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Please log in as a caregiver to access full attendance management features.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 600,
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s',
                fontSize: '15px'
              }}
            >
              Login as Caregiver
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
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

          {/* Recent Attendance Table */}
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
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>Recent Attendance</h2>
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
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time In</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Out</th>
                    <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: index < attendanceLogs.length - 1 ? '1px solid #1e293b' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'white', fontWeight: 500 }}>{log.name}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace' }}>{log.date}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#34d399', fontWeight: 500 }}>{log.timeIn}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8' }}>{log.timeOut}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: log.status === "active" ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: log.status === "active" ? '#34d399' : '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em'
                        }}>
                          {log.status}
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
