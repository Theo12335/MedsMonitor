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
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
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

        if (profile.role !== role) {
          setError(`Invalid credentials for ${role} access. Please select the correct role.`);
          await supabase.auth.signOut();
          return;
        }

        if (profile.role === "caregiver") router.push("/dashboard/caregiver");
        else if (profile.role === "admin") router.push("/dashboard/admin");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ top: "15%", left: "10%", background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)" }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ bottom: "15%", right: "10%", background: "radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[440px] animate-fadeIn">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10 group focus-ring rounded-lg p-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] shadow-[0_12px_32px_-8px_rgba(59,130,246,0.55)] transition-transform duration-200 group-hover:scale-105">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-bold text-white text-2xl">DoseKoPo!</span>
        </Link>

        {/* Login Card */}
        <div className="glass-card">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                SYSTEM ACCESS
              </h1>
              <p className="text-[var(--text-muted)] text-sm">
                Enter your credentials to continue
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setRole("caregiver")}
                className={`group p-5 rounded-xl transition-all duration-200 focus-ring ${
                  role === "caregiver"
                    ? "bg-[var(--accent-cyan)]/10 border-2 border-[var(--accent-cyan)] shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)]"
                    : "bg-[var(--bg-card)] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] hover:-translate-y-0.5"
                }`}
              >
                <svg
                  className={`w-8 h-8 mx-auto mb-3 transition-transform duration-200 group-hover:scale-110 ${
                    role === "caregiver" ? "text-[var(--accent-cyan)]" : "text-[var(--text-muted)]"
                  }`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className={`font-semibold text-sm ${role === "caregiver" ? "text-[var(--accent-cyan)]" : "text-[var(--text-secondary)]"}`}>
                  Caregiver
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`group p-5 rounded-xl transition-all duration-200 focus-ring ${
                  role === "admin"
                    ? "bg-[var(--accent-violet)]/10 border-2 border-[var(--accent-violet)] shadow-[0_0_20px_-5px_rgba(167,139,250,0.4)]"
                    : "bg-[var(--bg-card)] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] hover:-translate-y-0.5"
                }`}
              >
                <svg
                  className={`w-8 h-8 mx-auto mb-3 transition-transform duration-200 group-hover:scale-110 ${
                    role === "admin" ? "text-[var(--accent-violet)]" : "text-[var(--text-muted)]"
                  }`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`font-semibold text-sm ${role === "admin" ? "text-[var(--accent-violet)]" : "text-[var(--text-secondary)]"}`}>
                  Admin
                </span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="p-3 bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 rounded-xl text-[var(--accent-rose)] text-sm animate-fadeIn">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group btn-shine w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-[15px] text-white bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 focus-ring"
                style={{ boxShadow: "0 10px 30px -8px rgba(59,130,246,0.55)" }}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access System
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="text-[var(--text-dim)] text-xs text-center mt-6">
              Contact administration if you need access credentials
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="link-underline inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
