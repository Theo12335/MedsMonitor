"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: 'rgba(3, 7, 18, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e293b'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg
                style={{ width: '26px', height: '26px', color: 'white' }}
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, color: 'white', fontSize: '18px' }}>DoseKoPo</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Smart Dispensing System</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/"
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
            >
              Home
            </Link>
            <Link
              href="/caregiver-logs"
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                color: '#cbd5e1',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              Caregiver Logs
            </Link>
            <Link
              href="/patient-logs"
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                color: '#cbd5e1',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              Patient Logs
            </Link>
            <Link
              href="/dashboard"
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                color: '#cbd5e1',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            style={{
              padding: '10px',
              borderRadius: '8px',
              color: '#94a3b8',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              style={{ width: '28px', height: '28px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden" style={{ padding: '16px 0', borderTop: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Home
              </Link>
              <Link
                href="/caregiver-logs"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Caregiver Logs
              </Link>
              <Link
                href="/patient-logs"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Patient Logs
              </Link>
              <Link
                href="/dashboard"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
