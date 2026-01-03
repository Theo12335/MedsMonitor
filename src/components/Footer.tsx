"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ width: '100%', backgroundColor: '#0a0f1a', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 32px' }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '48px',
          marginBottom: '64px'
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', textDecoration: 'none', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg
                  style={{ width: '24px', height: '24px', color: 'white' }}
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
              <span style={{ fontWeight: 700, color: 'white', fontSize: '20px' }}>Smart Care Monitor</span>
            </Link>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginTop: '24px' }}>
              Advanced Patient & Caregiver Monitoring System for modern healthcare facilities.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: '18px', marginBottom: '24px' }}>Contact Information</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', color: '#94a3b8', marginBottom: '20px' }}>
                <svg
                  style={{ width: '24px', height: '24px', color: '#34d399', flexShrink: 0, marginTop: '2px' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span style={{ fontSize: '15px', lineHeight: 1.6 }}>
                  123 Healthcare Avenue<br />
                  Medical District, MD 12345
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', marginBottom: '20px' }}>
                <svg
                  style={{ width: '24px', height: '24px', color: '#34d399', flexShrink: 0 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span style={{ fontSize: '15px' }}>(555) 123-4567</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8' }}>
                <svg
                  style={{ width: '24px', height: '24px', color: '#34d399', flexShrink: 0 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span style={{ fontSize: '15px' }}>contact@smartcaremonitor.com</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: '18px', marginBottom: '24px' }}>Operating Hours</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                <span style={{ color: '#34d399', fontWeight: 500, fontSize: '15px' }}>24/7 Patient Care</span>
              </li>
              <li style={{ color: '#64748b', fontSize: '15px', marginBottom: '8px' }}>Administrative Hours:</li>
              <li style={{ color: '#94a3b8', fontSize: '15px' }}>Monday - Friday: 8:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            &copy; 2025 Smart Care Monitor. All rights reserved.
          </p>
          <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
            Healthcare Data Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
