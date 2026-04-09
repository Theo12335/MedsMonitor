import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  HeartbeatRequest,
  HeartbeatResponse,
  DEFAULT_CONFIG,
} from "@/lib/dispenser/types";
import { ApiResponse } from "@/types";

/**
 * POST /api/hardware/heartbeat
 *
 * ESP32 sends periodic health status updates to this endpoint.
 * Tracks device status and sensor health for monitoring.
 *
 * Request body:
 * {
 *   deviceId: string;
 *   sensors: {
 *     ir: boolean[];     // Status of 14 IR sensors
 *     servos: boolean[]; // Status of 14 servos
 *   };
 *   firmwareVersion?: string;
 *   freeMemory?: number;
 *   uptimeSeconds?: number;
 * }
 *
 * Authentication: X-Device-Key header with HARDWARE_API_KEY
 */
export async function POST(request: NextRequest) {
  // Validate API key
  const apiKey = request.headers.get("X-Device-Key");
  if (apiKey !== process.env.HARDWARE_API_KEY) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body: HeartbeatRequest = await request.json();
    const { deviceId, sensors, firmwareVersion, freeMemory, uptimeSeconds } = body;

    // Validate required fields
    if (!deviceId || !sensors) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "deviceId and sensors are required" },
        { status: 400 }
      );
    }

    // Validate sensor arrays
    if (!Array.isArray(sensors.ir) || !Array.isArray(sensors.servos)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "sensors.ir and sensors.servos must be arrays" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date().toISOString();

    // Insert heartbeat record
    const { error: insertError } = await supabase
      .from("device_heartbeats")
      .insert({
        device_id: deviceId,
        ir_sensors: sensors.ir,
        servo_status: sensors.servos,
        firmware_version: firmwareVersion,
        free_memory: freeMemory,
        uptime_seconds: uptimeSeconds,
        last_seen: now,
      });

    if (insertError) {
      console.error("Error inserting heartbeat:", insertError);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Failed to record heartbeat" },
        { status: 500 }
      );
    }

    // Check for sensor issues and log alerts
    const irFailures = sensors.ir.filter(s => !s).length;
    const servoFailures = sensors.servos.filter(s => !s).length;

    if (irFailures > 0 || servoFailures > 0) {
      console.warn(
        `Device ${deviceId} sensor issues: ${irFailures} IR failures, ${servoFailures} servo failures`
      );
      // TODO: Send alert to admin dashboard or notification system
    }

    // Clean up old heartbeat records (keep last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("device_heartbeats")
      .delete()
      .eq("device_id", deviceId)
      .lt("created_at", oneDayAgo);

    const response: HeartbeatResponse = {
      success: true,
      serverTime: now,
      // Optionally push config updates to the device
      configUpdate: DEFAULT_CONFIG,
    };

    return NextResponse.json<ApiResponse<HeartbeatResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Hardware heartbeat API error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hardware/heartbeat
 *
 * Get the latest heartbeat status for a device.
 * Useful for the admin dashboard to monitor device health.
 */
export async function GET(request: NextRequest) {
  // This endpoint can be accessed by authenticated users (not just the device)
  const deviceId = request.nextUrl.searchParams.get("deviceId");

  if (!deviceId) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "deviceId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the latest heartbeat for the device
    const { data: heartbeat, error } = await supabase
      .from("device_heartbeats")
      .select("*")
      .eq("device_id", deviceId)
      .order("last_seen", { ascending: false })
      .limit(1)
      .single();

    if (error || !heartbeat) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Device not found or no heartbeat recorded" },
        { status: 404 }
      );
    }

    // Check if device is online (heartbeat within last 30 seconds)
    const lastSeen = new Date(heartbeat.last_seen);
    const isOnline = Date.now() - lastSeen.getTime() < 30000;

    // Calculate sensor health
    const irSensors = heartbeat.ir_sensors || [];
    const servoStatus = heartbeat.servo_status || [];

    const deviceStatus = {
      deviceId: heartbeat.device_id,
      isOnline,
      lastHeartbeat: heartbeat.last_seen,
      firmwareVersion: heartbeat.firmware_version,
      freeMemory: heartbeat.free_memory,
      uptimeSeconds: heartbeat.uptime_seconds,
      sensorHealth: {
        irSensorsOk: irSensors.filter((s: boolean) => s).length,
        irSensorsFailed: irSensors.filter((s: boolean) => !s).length,
        servosOk: servoStatus.filter((s: boolean) => s).length,
        servosFailed: servoStatus.filter((s: boolean) => !s).length,
      },
    };

    return NextResponse.json<ApiResponse<typeof deviceStatus>>({
      success: true,
      data: deviceStatus,
    });
  } catch (error) {
    console.error("Hardware heartbeat GET error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
