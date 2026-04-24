"use client";

import Link from "next/link";

const modules = [
  {
    title: "Caregiver Logs",
    description:
      "Digital attendance tracking. Monitor staff patterns, time-in/out metrics, and staff allocation in real-time.",
    href: "/caregiver-logs",
    icon: (
      <svg
        style={{ width: '28px', height: '28px' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    code: "MODULE_CARE_01",
  },
  {
    title: "Patient Logs",
    description:
      "Medication administration records. Track dosage, timing, and adherence with visual status indicators.",
    href: "/patient-logs",
    icon: (
      <svg
        style={{ width: '28px', height: '28px' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    code: "MODULE_LOGS_02",
  },
  {
    title: "Master Dashboard",
    description:
      "Unified command center. High-density data visualization combining staff and patient metrics.",
    href: "/dashboard",
    icon: (
      <svg
        style={{ width: '28px', height: '28px' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    code: "ADMIN_HUB",
  },
];

export default function CoreModules() {
  return (
    <section style={{
      padding: '96px 24px',
      backgroundColor: '#0a0f1c'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section Header */}
        <div className="reveal" style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>
              CORE MODULES
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>
              SELECT INTERFACE TO PROCEED
            </p>
            <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>VOL_DEL 3.8.2</p>
          </div>
        </div>

        {/* Module Navigation Bar */}
        <div className="reveal delay-100" style={{
          marginBottom: '48px',
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg
                style={{ width: '22px', height: '22px', color: 'white' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>DoseKoPo!</p>
              <p style={{ color: '#94a3b8', fontSize: '12px' }}>Advanced Healthcare Dashboard</p>
            </div>
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {["Home", "Caregiver", "Patient Logs", "Dashboard"].map((item, i) => (
              <span
                key={i}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: i === 0 ? '#2563eb' : 'transparent',
                  color: i === 0 ? 'white' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Module Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {modules.map((module, index) => (
            <Link
              key={module.title}
              href={module.href}
              className={`reveal delay-${(index + 1) * 100}`}
              style={{
                padding: '28px',
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                border: '1px solid #1e293b',
                textDecoration: 'none',
                transition: 'all 0.3s',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e293b';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '14px',
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#34d399'
                }}>
                  {module.icon}
                </div>
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'white',
                marginBottom: '12px'
              }}>
                {module.title}
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '15px',
                marginBottom: '20px',
                lineHeight: 1.6
              }}>
                {module.description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontFamily: 'monospace'
                }}>
                  {module.code}
                </span>
                <span style={{
                  color: '#34d399',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  Access
                  <svg
                    style={{ width: '16px', height: '16px' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
