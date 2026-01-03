"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section style={{ padding: '96px 24px', backgroundColor: '#030712', position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          borderRadius: '50%',
          filter: 'blur(48px)'
        }}></div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
            READY TO MONITOR?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '40px', maxWidth: '640px' }}>
            Initialize the dashboard to begin tracking caregiver attendance and
            patient medication schedules.
          </p>
          <Link
            href="/login"
            className="glow-green-hover group"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              backgroundColor: '#059669',
              color: 'white',
              fontWeight: 600,
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
          >
            Launch System
            <svg
              style={{ width: '20px', height: '20px', transition: 'transform 0.3s' }}
              className="group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
