"use client";

import DashboardLayout from "@/components/DashboardLayout";
import StatTile from "@/components/dashboard/StatTile";
import { useState, useEffect } from "react";
import { useProfile } from "@/lib/supabase/hooks";

interface User {
  id: string;
  email: string;
  name: string;
  role: "caregiver" | "admin";
  department: string | null;
  setup_completed: boolean;
  created_at: string;
}

export default function StaffManagementPage() {
  const { profile } = useProfile();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<"all" | "caregiver" | "admin">("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const userName = profile?.name || "Loading...";

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "caregiver" as "caregiver" | "admin",
    department: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create user");
        return;
      }

      setSuccess("User created successfully! They will receive a verification email.");
      setShowCreateModal(false);
      setFormData({ email: "", password: "", name: "", role: "caregiver", department: "" });
      fetchUsers();

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("An error occurred while creating user");
    } finally {
      setFormLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          department: formData.department || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update user");
        return;
      }

      setSuccess("User updated successfully!");
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("An error occurred while updating user");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete user");
        return;
      }

      setSuccess("User deleted successfully!");
      fetchUsers();

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("An error occurred while deleting user");
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      name: user.name,
      role: user.role,
      department: user.department || "",
    });
    setShowEditModal(true);
  };

  // Filter and search users
  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === "all" || u.role === filter;
    const matchesSearch = searchQuery === "" ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const totalCaregivers = users.filter((u) => u.role === "caregiver").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const pendingSetup = users.filter((u) => !u.setup_completed).length;
  const activeUsers = users.filter((u) => u.setup_completed).length;

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName={userName}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton-shimmer h-8 w-56 rounded-lg"></div>
              <div className="skeleton-shimmer h-4 w-72 rounded-lg"></div>
            </div>
            <div className="skeleton-shimmer h-12 w-40 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-shimmer h-28 rounded-2xl"></div>
            ))}
          </div>
          <div className="skeleton-shimmer h-96 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Staff Management</h1>
              <p className="text-sm text-[var(--text-muted)] truncate">Manage caregivers and administrator accounts</p>
            </div>
            <button
              onClick={() => {
                setFormData({ email: "", password: "", name: "", role: "caregiver", department: "" });
                setShowCreateModal(true);
              }}
              className="btn btn-primary text-sm whitespace-nowrap flex-shrink-0 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New User
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/30 rounded-xl text-[var(--accent-emerald)] flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 bg-[var(--accent-emerald)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {success}
          </div>
        )}
        {error && (
          <div className="p-4 bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 rounded-xl text-[var(--accent-rose)] flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 bg-[var(--accent-rose)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Total Users"
            value={users.length}
            accent="violet"
            delta={users.length > 0 ? { value: `+${Math.min(users.length, 2)}`, direction: "up" } : undefined}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatTile
            label="Caregivers"
            value={totalCaregivers}
            accent="emerald"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatTile
            label="Admins"
            value={totalAdmins}
            accent="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
          <StatTile
            label="Pending Setup"
            value={pendingSetup}
            accent="amber"
            emphasize={pendingSetup > 0}
            delta={activeUsers > 0 ? { value: `${activeUsers} active`, direction: "neutral" } : undefined}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="search-wrapper flex-1">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--glass-border)]">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-[var(--accent-violet)] text-white shadow-lg"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)]"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilter("caregiver")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "caregiver"
                  ? "bg-[var(--accent-emerald)] text-white shadow-lg"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)]"
              }`}
            >
              Caregivers ({totalCaregivers})
            </button>
            <button
              onClick={() => setFilter("admin")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "admin"
                  ? "bg-[var(--accent-blue)] text-white shadow-lg"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)]"
              }`}
            >
              Admins ({totalAdmins})
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="glass-card p-5 hover:border-[var(--accent-violet)]/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                      user.role === "admin"
                        ? "bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-rose)]"
                        : "bg-gradient-to-br from-[var(--accent-emerald)] to-[var(--accent-cyan)]"
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-sm text-[var(--text-dim)] truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    user.role === "admin" ? "badge-violet" : "badge-emerald"
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-dim)]">Department</span>
                    <span className="text-[var(--text-secondary)]">{user.department || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-dim)]">Status</span>
                    <span className={`flex items-center gap-1.5 ${
                      user.setup_completed ? "text-[var(--accent-emerald)]" : "text-[var(--accent-amber)]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.setup_completed ? "bg-[var(--accent-emerald)]" : "bg-[var(--accent-amber)]"
                      }`}></span>
                      {user.setup_completed ? "Active" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-dim)]">Joined</span>
                    <span className="text-[var(--text-secondary)]">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-[var(--glass-border)]">
                  <button
                    onClick={() => openEditModal(user)}
                    className="btn btn-ghost flex-1 text-xs"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  {user.id !== profile?.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2.5 bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] rounded-xl hover:bg-[var(--accent-rose)]/20 transition-colors"
                      aria-label="Delete user"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--bg-elevated)] rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-dim)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">No users found</p>
            <p className="text-sm text-[var(--text-dim)]">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <div
              className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Create New User</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">Add a new staff member to the system</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-[var(--text-dim)] hover:text-white hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-5 space-y-5 max-h-[calc(90vh-80px)] overflow-y-auto">
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-violet)]/50 transition-colors"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-violet)]/50 transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Temporary Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-violet)]/50 transition-colors"
                    placeholder="Enter temporary password"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-[var(--text-dim)] mt-2">User will change this on first login</p>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "caregiver" })}
                      className={`p-4 rounded-xl border text-center font-medium transition-all ${
                        formData.role === "caregiver"
                          ? "bg-[var(--accent-emerald)]/15 border-[var(--accent-emerald)]/50 text-[var(--accent-emerald)]"
                          : "bg-[var(--bg-elevated)] border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--glass-border-hover)]"
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Caregiver
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "admin" })}
                      className={`p-4 rounded-xl border text-center font-medium transition-all ${
                        formData.role === "admin"
                          ? "bg-[var(--accent-violet)]/15 border-[var(--accent-violet)]/50 text-[var(--accent-violet)]"
                          : "bg-[var(--bg-elevated)] border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--glass-border-hover)]"
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Department (Optional)</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-violet)]/50 transition-colors"
                    placeholder="e.g., Floor 2, Night Shift"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 rounded-xl text-[var(--accent-rose)] text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn btn-primary flex-1"
                  >
                    {formLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowEditModal(false); setSelectedUser(null); }}>
            <div
              className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit User</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">Update user information</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 text-[var(--text-dim)] hover:text-white hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-5 space-y-5 max-h-[calc(90vh-80px)] overflow-y-auto">
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-xl text-[var(--text-dim)] cursor-not-allowed"
                  />
                  <p className="text-xs text-[var(--text-dim)] mt-2">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-violet)]/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "caregiver" })}
                      className={`p-4 rounded-xl border text-center font-medium transition-all ${
                        formData.role === "caregiver"
                          ? "bg-[var(--accent-emerald)]/15 border-[var(--accent-emerald)]/50 text-[var(--accent-emerald)]"
                          : "bg-[var(--bg-elevated)] border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--glass-border-hover)]"
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Caregiver
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "admin" })}
                      className={`p-4 rounded-xl border text-center font-medium transition-all ${
                        formData.role === "admin"
                          ? "bg-[var(--accent-violet)]/15 border-[var(--accent-violet)]/50 text-[var(--accent-violet)]"
                          : "bg-[var(--bg-elevated)] border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--glass-border-hover)]"
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-dim)] mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-violet)]/50 transition-colors"
                    placeholder="e.g., Floor 2, Night Shift"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 rounded-xl text-[var(--accent-rose)] text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn btn-primary flex-1"
                  >
                    {formLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
