import { useEffect, useState } from "react";
import { createClient } from "./client";

const supabase = createClient();

// Types for database responses
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: "caregiver" | "admin";
  department: string | null;
  setup_completed: boolean;
}

export interface Patient {
  id: string;
  name: string;
  room_number: string;
  admission_date: string;
  notes: string | null;
  avatar_url: string | null;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  description: string | null;
  drawer_location: string;
  current_stock: number;
  minimum_stock: number;
}

export interface PatientMedication {
  id: string;
  patient_id: string;
  medication_id: string;
  dosage: string;
  frequency: string;
  scheduled_times: string[];
  start_date: string;
  end_date: string | null;
  notes: string | null;
  patient?: Patient;
  medication?: Medication;
}

export interface MedicationLog {
  id: string;
  patient_medication_id: string;
  patient_id: string;
  caregiver_id: string | null;
  scheduled_time: string;
  actual_time: string | null;
  status: "pending" | "taken" | "missed" | "skipped";
  notes: string | null;
  drawer_opened: boolean;
  verified_by_weight: boolean;
  patient?: Patient;
  caregiver?: Profile;
}

export interface Drawer {
  id: string;
  label: string;
  medication_id: string | null;
  current_weight: number;
  empty_weight: number;
  pill_weight: number;
  estimated_pill_count: number;
  minimum_pill_count: number;
  status: "idle" | "active" | "open" | "low_stock" | "empty";
  led_active: boolean;
  medication?: Medication;
}

export interface AttendanceLog {
  id: string;
  caregiver_id: string;
  date: string;
  time_in: string;
  time_out: string | null;
  notes: string | null;
}

// Hook to get current user profile
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
}

// Hook to get all patients
export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .order("name");

        if (error) throw error;
        setPatients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, loading, error, refetch: () => setLoading(true) };
}

// Hook to get all medications
export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const { data, error } = await supabase
          .from("medications")
          .select("*")
          .order("name");

        if (error) throw error;
        setMedications(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch medications");
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  return { medications, loading, error };
}

// Hook to get patient medications with related data
export function usePatientMedications(patientId?: string) {
  const [patientMedications, setPatientMedications] = useState<PatientMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientMedications = async () => {
      try {
        let query = supabase
          .from("patient_medications")
          .select(`
            *,
            patient:patients(*),
            medication:medications(*)
          `);

        if (patientId) {
          query = query.eq("patient_id", patientId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setPatientMedications(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch patient medications");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientMedications();
  }, [patientId]);

  return { patientMedications, loading, error };
}

// Hook to get drawers with medication info
export function useDrawers() {
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrawers = async () => {
      try {
        const { data, error } = await supabase
          .from("drawers")
          .select(`
            *,
            medication:medications(*)
          `)
          .order("label");

        if (error) throw error;
        setDrawers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch drawers");
      } finally {
        setLoading(false);
      }
    };

    fetchDrawers();
  }, []);

  return { drawers, loading, error };
}

// Hook to get medication logs (for dashboard stats)
export function useMedicationLogs(filters?: { date?: string; caregiverId?: string; patientId?: string }) {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        let query = supabase
          .from("medication_logs")
          .select(`
            *,
            patient:patients(*),
            caregiver:profiles(*)
          `)
          .order("scheduled_time", { ascending: true });

        if (filters?.date) {
          const startOfDay = new Date(filters.date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(filters.date);
          endOfDay.setHours(23, 59, 59, 999);

          query = query
            .gte("scheduled_time", startOfDay.toISOString())
            .lte("scheduled_time", endOfDay.toISOString());
        }

        if (filters?.caregiverId) {
          query = query.eq("caregiver_id", filters.caregiverId);
        }

        if (filters?.patientId) {
          query = query.eq("patient_id", filters.patientId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch medication logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filters?.date, filters?.caregiverId, filters?.patientId]);

  return { logs, loading, error };
}

// Hook to get today's attendance for current caregiver
export function useAttendance() {
  const [attendance, setAttendance] = useState<AttendanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("attendance_logs")
          .select("*")
          .eq("caregiver_id", user.id)
          .eq("date", today)
          .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
        setAttendance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const clockIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const { data, error } = await supabase
      .from("attendance_logs")
      .insert({
        caregiver_id: user.id,
        date: now.toISOString().split("T")[0],
        time_in: now.toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setAttendance(data);
    }
    return { data, error };
  };

  const clockOut = async () => {
    if (!attendance) return;

    const { data, error } = await supabase
      .from("attendance_logs")
      .update({ time_out: new Date().toISOString() })
      .eq("id", attendance.id)
      .select()
      .single();

    if (!error && data) {
      setAttendance(data);
    }
    return { data, error };
  };

  return { attendance, loading, error, clockIn, clockOut };
}

// Admin dashboard data — KPIs + trend series for last 7 days
export interface AdminDashboardData {
  totalPatients: number;
  totalCaregivers: number;
  dispensedToday: number;
  pendingToday: number;
  missedToday: number;
  lowStockAlerts: number;
  activeShifts: number;
  patientsDelta: number;
  adherenceRate: number; // 0..100
  onTimeRate: number; // 0..100
  dailyDispensed: number[]; // last 7 days, oldest → newest
  dailyMissed: number[]; // last 7 days, oldest → newest
  dayLabels: string[]; // "Mon", "Tue", ...
}

const EMPTY_ADMIN_DATA: AdminDashboardData = {
  totalPatients: 0,
  totalCaregivers: 0,
  dispensedToday: 0,
  pendingToday: 0,
  missedToday: 0,
  lowStockAlerts: 0,
  activeShifts: 0,
  patientsDelta: 0,
  adherenceRate: 0,
  onTimeRate: 0,
  dailyDispensed: [0, 0, 0, 0, 0, 0, 0],
  dailyMissed: [0, 0, 0, 0, 0, 0, 0],
  dayLabels: ["", "", "", "", "", "", ""],
};

export function useAdminDashboardData() {
  const [data, setData] = useState<AdminDashboardData>(EMPTY_ADMIN_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        // Window: last 7 full days including today
        const weekStart = new Date(startOfToday);
        weekStart.setDate(weekStart.getDate() - 6);

        // Week-over-week delta window
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);

        const [
          { count: patientCount },
          { count: caregiverCount },
          { count: lowStockCount },
          { count: activeShiftCount },
          { count: dispensedTodayCount },
          { count: pendingTodayCount },
          { count: missedTodayCount },
          { count: patientsCreatedThisWeek },
          { data: weekLogs },
        ] = await Promise.all([
          supabase.from("patients").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "caregiver"),
          supabase.from("drawers").select("*", { count: "exact", head: true }).in("status", ["low_stock", "empty"]),
          supabase
            .from("attendance_logs")
            .select("*", { count: "exact", head: true })
            .eq("date", startOfToday.toISOString().split("T")[0])
            .is("time_out", null),
          supabase
            .from("medication_logs")
            .select("*", { count: "exact", head: true })
            .eq("status", "taken")
            .gte("scheduled_time", startOfToday.toISOString())
            .lte("scheduled_time", endOfToday.toISOString()),
          supabase
            .from("medication_logs")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending")
            .gte("scheduled_time", startOfToday.toISOString())
            .lte("scheduled_time", endOfToday.toISOString()),
          supabase
            .from("medication_logs")
            .select("*", { count: "exact", head: true })
            .in("status", ["missed", "skipped"])
            .gte("scheduled_time", startOfToday.toISOString())
            .lte("scheduled_time", endOfToday.toISOString()),
          supabase
            .from("patients")
            .select("*", { count: "exact", head: true })
            .gte("created_at", prevWeekStart.toISOString())
            .lt("created_at", weekStart.toISOString()),
          supabase
            .from("medication_logs")
            .select("scheduled_time, actual_time, status")
            .gte("scheduled_time", weekStart.toISOString())
            .lte("scheduled_time", endOfToday.toISOString()),
        ]);

        // Build 7-day buckets
        const dayKeys: string[] = [];
        const dayLabels: string[] = [];
        const dailyDispensed = Array(7).fill(0);
        const dailyMissed = Array(7).fill(0);
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = 0; i < 7; i++) {
          const d = new Date(weekStart);
          d.setDate(weekStart.getDate() + i);
          dayKeys.push(d.toISOString().split("T")[0]);
          dayLabels.push(dayNames[d.getDay()]);
        }

        let takenWeek = 0;
        let missedWeek = 0;
        let onTimeWeek = 0;

        (weekLogs ?? []).forEach((log: { scheduled_time: string; actual_time: string | null; status: string }) => {
          const key = new Date(log.scheduled_time).toISOString().split("T")[0];
          const idx = dayKeys.indexOf(key);
          if (idx === -1) return;

          if (log.status === "taken") {
            dailyDispensed[idx] += 1;
            takenWeek += 1;
            if (log.actual_time) {
              const delta = Math.abs(new Date(log.actual_time).getTime() - new Date(log.scheduled_time).getTime());
              if (delta <= 10 * 60 * 1000) onTimeWeek += 1;
            }
          } else if (log.status === "missed" || log.status === "skipped") {
            dailyMissed[idx] += 1;
            missedWeek += 1;
          } else if (
            log.status === "pending" &&
            new Date(log.scheduled_time).getTime() < now.getTime() - 24 * 60 * 60 * 1000
          ) {
            dailyMissed[idx] += 1;
            missedWeek += 1;
          }
        });

        const adherenceDenom = takenWeek + missedWeek;
        const adherenceRate = adherenceDenom > 0 ? Math.round((takenWeek / adherenceDenom) * 100) : 0;
        const onTimeRate = takenWeek > 0 ? Math.round((onTimeWeek / takenWeek) * 100) : 0;

        setData({
          totalPatients: patientCount ?? 0,
          totalCaregivers: caregiverCount ?? 0,
          dispensedToday: dispensedTodayCount ?? 0,
          pendingToday: pendingTodayCount ?? 0,
          missedToday: missedTodayCount ?? 0,
          lowStockAlerts: lowStockCount ?? 0,
          activeShifts: activeShiftCount ?? 0,
          patientsDelta: patientsCreatedThisWeek ?? 0,
          adherenceRate,
          onTimeRate,
          dailyDispensed,
          dailyMissed,
          dayLabels,
        });
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { data, loading };
}

// Helper to get dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState({
    pendingMedications: 0,
    assignedPatients: 0,
    dispensedToday: 0,
    lowStockAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

        // Get pending medications for today
        const { count: pendingCount } = await supabase
          .from("medication_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
          .gte("scheduled_time", startOfDay)
          .lte("scheduled_time", endOfDay);

        // Get total patients
        const { count: patientCount } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true });

        // Get dispensed today
        const { count: dispensedCount } = await supabase
          .from("medication_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "taken")
          .gte("scheduled_time", startOfDay)
          .lte("scheduled_time", endOfDay);

        // Get low stock drawers
        const { count: lowStockCount } = await supabase
          .from("drawers")
          .select("*", { count: "exact", head: true })
          .in("status", ["low_stock", "empty"]);

        setStats({
          pendingMedications: pendingCount || 0,
          assignedPatients: patientCount || 0,
          dispensedToday: dispensedCount || 0,
          lowStockAlerts: lowStockCount || 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
