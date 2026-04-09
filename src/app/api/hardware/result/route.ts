import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DispenseResultRequest,
  DispenseResultResponse,
  DispenseQueueRow,
} from "@/lib/dispenser/types";
import { ApiResponse } from "@/types";

/**
 * POST /api/hardware/result
 *
 * ESP32 reports the result of a dispense attempt to this endpoint.
 * Updates the dispense_queue entry and creates a medication_log entry.
 *
 * Request body:
 * {
 *   taskId: string;
 *   success: boolean;
 *   irConfirmed: boolean;
 *   attemptCount: number;
 *   errorCode?: string;
 *   errorMessage?: string;
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
    const body: DispenseResultRequest = await request.json();
    const { taskId, success, irConfirmed, attemptCount, errorCode, errorMessage } = body;

    // Validate required fields
    if (!taskId || success === undefined || irConfirmed === undefined) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "taskId, success, and irConfirmed are required" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the task to verify it exists and get patient_medication_id
    const { data: task, error: taskError } = await supabase
      .from("dispense_queue")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const dispenseTask = task as DispenseQueueRow;

    // Determine final status
    const finalStatus = success ? "completed" : "failed";
    const completedAt = new Date().toISOString();

    // Build error message
    let finalErrorMessage = errorMessage;
    if (!success && errorCode && !errorMessage) {
      const errorMessages: Record<string, string> = {
        IR_TIMEOUT: "IR sensor did not detect pill dispensed",
        SERVO_FAULT: "Servo motor error",
        DRAWER_JAMMED: "Drawer mechanism jammed",
        SENSOR_ERROR: "IR sensor malfunction",
        UNKNOWN: "Unknown error occurred",
      };
      finalErrorMessage = errorMessages[errorCode] || errorCode;
    }

    // Update dispense_queue entry
    const { error: updateError } = await supabase
      .from("dispense_queue")
      .update({
        status: finalStatus,
        ir_confirmed: irConfirmed,
        attempt_count: attemptCount,
        error_message: finalErrorMessage,
        completed_at: completedAt,
      })
      .eq("id", taskId);

    if (updateError) {
      console.error("Error updating dispense task:", updateError);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Failed to update task" },
        { status: 500 }
      );
    }

    // Get patient medication details for the log
    const { data: patientMed, error: pmError } = await supabase
      .from("patient_medications")
      .select("patient_id")
      .eq("id", dispenseTask.patient_medication_id)
      .single();

    // Create medication log entry
    if (!pmError && patientMed) {
      const logEntry = {
        patient_medication_id: dispenseTask.patient_medication_id,
        patient_id: patientMed.patient_id,
        scheduled_time: dispenseTask.scheduled_time,
        actual_time: completedAt,
        status: success ? "taken" : "missed",
        notes: success
          ? `Automated dispense - IR confirmed: ${irConfirmed}`
          : `Automated dispense failed - ${finalErrorMessage || "Unknown error"}`,
        drawer_opened: true,
        verified_by_weight: irConfirmed,
      };

      const { error: logError } = await supabase
        .from("medication_logs")
        .insert(logEntry);

      if (logError) {
        console.error("Error creating medication log:", logError);
        // Don't fail the whole request, just log the error
      }
    }

    const response: DispenseResultResponse = {
      success: true,
      message: success
        ? "Dispense completed successfully"
        : `Dispense failed: ${finalErrorMessage}`,
    };

    return NextResponse.json<ApiResponse<DispenseResultResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Hardware result API error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
