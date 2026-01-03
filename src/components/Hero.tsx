"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '80px',
      padding: '80px 24px 48px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background gradient effects */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '384px',
          height: '384px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          filter: 'blur(64px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '25%',
          width: '384px',
          height: '384px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(64px)'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Status badge */}
        <div className="reveal" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 20px',
          borderRadius: '9999px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          marginBottom: '32px'
        }}>
          <span style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
          <span style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            System Operational
          </span>
        </div>

        {/* Main heading */}
        <h1 className="reveal delay-100" style={{ marginBottom: '28px' }}>
          <span style={{
            display: 'block',
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>ADVANCED</span>
          <span style={{
            display: 'block',
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>MONITORING</span>
          <span style={{
            display: 'block',
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>ECOSYSTEM</span>
        </h1>

        {/* Description */}
        <p className="reveal delay-200" style={{
          fontSize: '18px',
          color: '#94a3b8',
          maxWidth: '640px',
          margin: '0 auto 40px',
          lineHeight: 1.7
        }}>
          Real-time healthcare data management system for tracking caregiver
          attendance and patient medication schedules with absolute precision.
        </p>

        {/* CTA Buttons */}
        <div className="reveal delay-300" style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              backgroundColor: '#059669',
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            Initialize Dashboard
            <svg
              style={{ width: '20px', height: '20px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              backgroundColor: 'transparent',
              border: '1px solid #475569',
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#475569';
            }}
          >
            Access Logs
            <svg
              style={{ width: '20px', height: '20px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
