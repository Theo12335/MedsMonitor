// User Types
export type UserRole = "caregiver" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Caregiver extends User {
  role: "caregiver";
  department: string;
  shiftStart?: Date;
  shiftEnd?: Date;
  assignedPatients: string[]; // Patient IDs
}

export interface Patient {
  id: string;
  email: string;
  name: string;
  role: "patient"; // Note: "patient" is not a valid login role, but kept for data structure
  roomNumber: string;
  admissionDate: Date;
  assignedCaregivers: string[]; // Caregiver IDs
  medications: PatientMedication[];
  createdAt: Date;
  updatedAt: Date;
}

// Medication Types
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  description?: string;
  drawerLocation: string; // e.g., "A1", "B2"
  currentStock: number;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientMedication {
  id: string;
  patientId: string;
  medicationId: string;
  medication?: Medication;
  dosage: string;
  frequency: string; // e.g., "daily", "twice daily", "every 8 hours"
  scheduledTimes: string[]; // e.g., ["08:00", "20:00"]
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

// Medication Log Types
export type MedicationStatus = "pending" | "taken" | "missed" | "skipped";

// Hardware Fill Status Types (for prototype drawer system)
export type DrawerFillStatus = "full" | "mid" | "empty";

export interface DrawerFillReading {
  id: string;
  drawerId: string;
  fillStatus: DrawerFillStatus;
  fillPercentage: number; // 0-100
  timestamp: Date;
}

export interface MedicationLog {
  id: string;
  patientMedicationId: string;
  patientId: string;
  caregiverId?: string;
  scheduledTime: Date;
  actualTime?: Date;
  status: MedicationStatus;
  notes?: string;
  drawerOpened: boolean;
  verifiedByWeight: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Caregiver Attendance Types
export interface AttendanceLog {
  id: string;
  caregiverId: string;
  caregiver?: Caregiver;
  date: Date;
  timeIn: Date;
  timeOut?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Smart Storage / Hardware Types
export type DrawerStatus = "idle" | "active" | "open" | "low_stock" | "empty";

export interface Drawer {
  id: string;
  label: string; // e.g., "A1", "B2"
  medicationId?: string;
  medication?: Medication;
  currentWeight: number; // in grams
  emptyWeight: number; // weight when empty (tare)
  pillWeight: number; // estimated weight per pill
  estimatedPillCount: number;
  minimumPillCount: number;
  status: DrawerStatus;
  ledActive: boolean;
  lastUpdated: Date;
}

export interface StorageUnit {
  id: string;
  name: string;
  location: string;
  drawers: Drawer[];
  isConnected: boolean;
  lastHeartbeat: Date;
}

// WebSocket Message Types for Arduino Communication
export type HardwareMessageType =
  | "LED_ON"
  | "LED_OFF"
  | "DRAWER_OPENED"
  | "DRAWER_CLOSED"
  | "WEIGHT_UPDATE"
  | "STATUS_REQUEST"
  | "HEARTBEAT"
  | "LOW_STOCK_ALERT";

export interface HardwareMessage {
  type: HardwareMessageType;
  drawerId?: string;
  payload?: {
    weight?: number;
    pillCount?: number;
    status?: DrawerStatus;
    timestamp?: number;
  };
}

// Commands to send to Arduino
export interface ArduinoCommand {
  command: "LIGHT_DRAWER" | "RESET_LIGHTS" | "REQUEST_WEIGHTS" | "CALIBRATE";
  drawerId?: string;
  params?: Record<string, unknown>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Dashboard Stats Types
export interface CaregiverDashboardStats {
  pendingMedications: number;
  assignedPatients: number;
  dispensedToday: number;
  lowStockAlerts: number;
}

export interface PatientDashboardStats {
  medicationsTakenToday: number;
  medicationsRemainingToday: number;
  weeklyAdherence: number;
  nextMedication?: {
    name: string;
    dosage: string;
    time: string;
  };
}

// Inventory Types
export interface InventoryItem {
  medicationId: string;
  medication: Medication;
  drawer: Drawer;
  currentStock: number;
  minimumStock: number;
  lastRestocked: Date;
  needsRestock: boolean;
}

export interface RestockLog {
  id: string;
  drawerId: string;
  medicationId: string;
  previousCount: number;
  newCount: number;
  restockedBy: string; // Caregiver ID
  createdAt: Date;
}
