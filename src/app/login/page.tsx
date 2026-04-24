"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserRole = "caregiver" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("caregiver");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Fetch user profile to get role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, setup_completed")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile) {
          setError("User profile not found. Please contact administrator.");
          await supabase.auth.signOut();
          return;
        }

        // Validate role matches selection
        if (profile.role !== role) {
          setError(`Invalid credentials for ${role} access. Please select the correct role.`);
          await supabase.auth.signOut();
          return;
        }

        // Redirect based on role
        if (profile.role === "caregiver") {
          router.push("/dashboard/caregiver");
        } else if (profile.role === "admin") {
          router.push("/dashboard/admin");
        }
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030712',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background effects */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '500px',
          height: '500px',
          backgroundColor: 'rgba(16, 185, 129, 0.03)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '500px',
          height: '500px',
          backgroundColor: 'rgba(59, 130, 246, 0.03)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '40px',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg
              style={{ width: '32px', height: '32px', color: 'white' }}
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
          <span style={{ fontWeight: 700, color: 'white', fontSize: '24px' }}>DoseKoPo!</span>
        </Link>

        {/* Login Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
          borderRadius: '24px',
          padding: '2px'
        }}>
          <div style={{
            backgroundColor: '#0a0f1c',
            borderRadius: '22px',
            padding: '40px'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                SYSTEM ACCESS
              </h1>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Enter your credentials to continue
              </p>
            </div>

            {/* Role Selection (visual only - role is determined by profile) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <button
                type="button"
                onClick={() => setRole("caregiver")}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: role === "caregiver" ? '2px solid #10b981' : '1px solid #1e293b',
                  backgroundColor: role === "caregiver" ? 'rgba(16, 185, 129, 0.1)' : '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <svg
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 12px',
                    display: 'block',
                    color: role === "caregiver" ? '#34d399' : '#64748b'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span style={{
                  fontWeight: 600,
                  fontSize: '15px',
                  color: role === "caregiver" ? '#34d399' : '#94a3b8'
                }}>
                  Caregiver
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: role === "admin" ? '2px solid #a855f7' : '1px solid #1e293b',
                  backgroundColor: role === "admin" ? 'rgba(168, 85, 247, 0.1)' : '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <svg
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 12px',
                    display: 'block',
                    color: role === "admin" ? '#c084fc' : '#64748b'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span style={{
                  fontWeight: 600,
                  fontSize: '15px',
                  color: role === "admin" ? '#c084fc' : '#94a3b8'
                }}>
                  Admin
                </span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your email"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your password"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                />
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  color: '#f87171',
                  fontSize: '14px',
                  marginBottom: '24px'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isLoading ? '#065f46' : '#059669',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={{ opacity: 0.25 }}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        style={{ opacity: 0.75 }}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access System
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Info text */}
            <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
              Contact administration if you need access credentials
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link
            href="/"
            style={{
              color: '#64748b',
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'color 0.3s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Add keyframes for spinner animation */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
