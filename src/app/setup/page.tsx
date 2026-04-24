"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("setup_completed, name")
        .eq("id", user.id)
        .single();

      if (profile?.setup_completed) {
        router.push("/dashboard/caregiver");
      } else if (profile?.name) {
        setName(profile.name);
      }
    };
    getUser();
  }, [router, supabase]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    setStep(2);
    setIsLoading(false);
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired. Please login again.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        department: department.trim() || null,
        setup_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") router.push("/dashboard/admin");
    else router.push("/dashboard/caregiver");
    router.refresh();
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
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] shadow-[0_12px_32px_-8px_rgba(59,130,246,0.55)]">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-bold text-white text-2xl">DoseKoPo!</span>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-3 mb-8" aria-label={`Step ${step} of 2`}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step >= 1
                ? "bg-[var(--accent-blue)] text-white shadow-[0_0_14px_-2px_var(--accent-blue)]"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--glass-border)]"
            }`}>
              {step > 1 ? "✓" : "1"}
            </div>
            <span className={`text-xs font-medium transition-colors ${step >= 1 ? "text-white" : "text-[var(--text-muted)]"}`}>
              Password
            </span>
          </div>
          <div className={`h-px w-10 transition-colors ${step >= 2 ? "bg-[var(--accent-blue)]" : "bg-[var(--glass-border)]"}`} />
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step >= 2
                ? "bg-[var(--accent-blue)] text-white shadow-[0_0_14px_-2px_var(--accent-blue)]"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--glass-border)]"
            }`}>
              2
            </div>
            <span className={`text-xs font-medium transition-colors ${step >= 2 ? "text-white" : "text-[var(--text-muted)]"}`}>
              Profile
            </span>
          </div>
        </div>

        {/* Setup Card */}
        <div className="glass-card">
          <div className="p-8 sm:p-10">
            {step === 1 ? (
              <div className="animate-fadeIn">
                {/* Step 1: Change Password */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/30">
                    <svg className="w-8 h-8 text-[var(--accent-amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">
                    Change Your Password
                  </h1>
                  <p className="text-[var(--text-muted)] text-sm mb-1">
                    For security, please set a new password
                  </p>
                  <p className="text-[var(--text-secondary)] text-xs">
                    Logged in as: <span className="text-[var(--accent-cyan)]">{userEmail}</span>
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input"
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="Re-enter your password"
                      required
                      autoComplete="new-password"
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
                    {isLoading ? "Updating..." : "Continue"}
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-fadeIn">
                {/* Step 2: Profile Setup */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/30">
                    <svg className="w-8 h-8 text-[var(--accent-emerald)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">
                    Complete Your Profile
                  </h1>
                  <p className="text-[var(--text-muted)] text-sm">
                    Tell us a bit about yourself
                  </p>
                </div>

                <form onSubmit={handleProfileSetup} className="space-y-5">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">
                      Department (Optional)
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="input"
                      placeholder="e.g., General Care, ICU, Pediatrics"
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
                    className="group btn-shine w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-[15px] text-white bg-gradient-to-br from-[var(--accent-emerald)] to-[var(--accent-cyan)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 focus-ring"
                    style={{ boxShadow: "0 10px 30px -8px rgba(52,211,153,0.55)" }}
                  >
                    {isLoading ? "Saving..." : "Complete Setup"}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
