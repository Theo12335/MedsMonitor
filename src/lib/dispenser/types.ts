/**
 * ESP32 Medication Dispenser Types
 *
 * Types for the hardware API communication between the ESP32
 * and the Next.js application via HTTP polling.
 */

// =============================================================================
// Dispense Queue Types
// =============================================================================

export type DispenseStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface DispenseTask {
  id: string;
  patientMedicationId: string;
  drawerId: string;  // "D0" to "D13"
  scheduledTime: Date;
  status: DispenseStatus;
  attemptCount: number;
  maxAttempts: number;
  irConfirmed: boolean;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

// =============================================================================
// ESP32 API Request/Response Types
// =============================================================================

/**
 * Response from GET /api/hardware/pending
 * ESP32 polls this endpoint to receive pending dispense tasks
 */
export interface PendingTasksResponse {
  tasks: PendingTask[];
  serverTime: string;  // ISO 8601 timestamp for time sync
}

export interface PendingTask {
  taskId: string;
  drawerId: string;
  maxAttempts: number;
  scheduledTime: string;
}

/**
 * Request body for POST /api/hardware/result
 * ESP32 sends dispense results to this endpoint
 */
export interface DispenseResultRequest {
  taskId: string;
  success: boolean;
  irConfirmed: boolean;
  attemptCount: number;
  errorCode?: DispenseErrorCode;
  errorMessage?: string;
}

export type DispenseErrorCode =
  | 'IR_TIMEOUT'       // IR sensor didn't detect pill after max attempts
  | 'SERVO_FAULT'      // Servo motor error
  | 'DRAWER_JAMMED'    // Drawer mechanism jammed
  | 'SENSOR_ERROR'     // IR sensor malfunction
  | 'UNKNOWN';         // Unknown error

/**
 * Response from POST /api/hardware/result
 */
export interface DispenseResultResponse {
  success: boolean;
  message: string;
  nextTask?: PendingTask;  // Optional: return next task immediately
}

/**
 * Request body for POST /api/hardware/heartbeat
 * ESP32 sends periodic health status updates
 */
export interface HeartbeatRequest {
  deviceId: string;
  sensors: SensorStatus;
  firmwareVersion?: string;
  freeMemory?: number;
  uptimeSeconds?: number;
}

export interface SensorStatus {
  ir: boolean[];     // Status of 14 IR sensors (true = working)
  servos: boolean[]; // Status of 14 servos (true = working)
}

/**
 * Response from POST /api/hardware/heartbeat
 */
export interface HeartbeatResponse {
  success: boolean;
  serverTime: string;
  configUpdate?: DeviceConfig;  // Optional: push config updates
}

export interface DeviceConfig {
  pollIntervalMs: number;
  irTimeoutMs: number;
  servoDelayMs: number;
  maxRetries: number;
}

// =============================================================================
// Device State Types
// =============================================================================

export interface DeviceHeartbeat {
  id: string;
  deviceId: string;
  irSensors: boolean[];
  servoStatus: boolean[];
  firmwareVersion?: string;
  freeMemory?: number;
  uptimeSeconds?: number;
  lastSeen: Date;
  createdAt: Date;
}

export interface DeviceStatus {
  deviceId: string;
  isOnline: boolean;
  lastHeartbeat?: Date;
  sensorHealth: {
    irSensorsOk: number;
    irSensorsFailed: number;
    servosOk: number;
    servosFailed: number;
  };
}

// =============================================================================
// Database Row Types (for Supabase)
// =============================================================================

export interface DispenseQueueRow {
  id: string;
  patient_medication_id: string;
  drawer_id: string;
  scheduled_time: string;
  status: DispenseStatus;
  attempt_count: number;
  max_attempts: number;
  ir_confirmed: boolean;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface DeviceHeartbeatRow {
  id: string;
  device_id: string;
  ir_sensors: boolean[] | null;
  servo_status: boolean[] | null;
  firmware_version: string | null;
  free_memory: number | null;
  uptime_seconds: number | null;
  last_seen: string;
  created_at: string;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Convert database row to DispenseTask
 */
export function rowToDispenseTask(row: DispenseQueueRow): DispenseTask {
  return {
    id: row.id,
    patientMedicationId: row.patient_medication_id,
    drawerId: row.drawer_id,
    scheduledTime: new Date(row.scheduled_time),
    status: row.status,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    irConfirmed: row.ir_confirmed,
    errorMessage: row.error_message ?? undefined,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

/**
 * Convert database row to DeviceHeartbeat
 */
export function rowToDeviceHeartbeat(row: DeviceHeartbeatRow): DeviceHeartbeat {
  return {
    id: row.id,
    deviceId: row.device_id,
    irSensors: row.ir_sensors ?? [],
    servoStatus: row.servo_status ?? [],
    firmwareVersion: row.firmware_version ?? undefined,
    freeMemory: row.free_memory ?? undefined,
    uptimeSeconds: row.uptime_seconds ?? undefined,
    lastSeen: new Date(row.last_seen),
    createdAt: new Date(row.created_at),
  };
}

// =============================================================================
// Constants
// =============================================================================

export const DRAWER_IDS = [
  'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6',
  'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'
] as const;

export type DrawerId = typeof DRAWER_IDS[number];

export const DEFAULT_CONFIG: DeviceConfig = {
  pollIntervalMs: 5000,    // 5 seconds
  irTimeoutMs: 5000,       // 5 seconds
  servoDelayMs: 500,       // 500ms between servo operations
  maxRetries: 3,
};

// Device is considered offline if no heartbeat for this duration
export const DEVICE_OFFLINE_THRESHOLD_MS = 30000;  // 30 seconds
