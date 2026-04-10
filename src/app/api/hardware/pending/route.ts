import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  PendingTasksResponse,
  PendingTask,
  DispenseQueueRow,
} from "@/lib/dispenser/types";
import { ApiResponse } from "@/types";

/**
 * GET /api/hardware/pending
 *
 * ESP32 polls this endpoint to receive pending dispense tasks.
 *
 * This endpoint:
 * 1. Checks patient_medications for any doses due now
 * 2. Auto-creates dispense_queue entries for due medications
 * 3. Returns pending tasks for ESP32 to process
 *
 * The ESP32 should poll this endpoint every 5-10 seconds.
 *
 * Authentication: X-Device-Key header with HARDWARE_API_KEY
 */
export async function GET(request: NextRequest) {
  // Validate API key
  const apiKey = request.headers.get("X-Device-Key");
  if (apiKey !== process.env.HARDWARE_API_KEY) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Create Supabase client with service role for full access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Step 1: Check patient_medications for doses due now (within 5 min window)
    const { data: patientMeds, error: pmError } = await supabase
      .from("patient_medications")
      .select(`
        id,
        patient_id,
        scheduled_times,
        medication:medications(id, name, drawer_location)
      `)
      .lte("start_date", todayDate)
      .or(`end_date.is.null,end_date.gte.${todayDate}`);

    if (pmError) {
      console.error("Error fetching patient medications:", pmError);
    }

    // Step 2: For each due medication, create dispense_queue entry if not exists
    for (const pm of patientMeds || []) {
      const med = Array.isArray(pm.medication) ? pm.medication[0] : pm.medication;
      if (!med?.drawer_location) continue;

      const scheduledTimes = pm.scheduled_times || [];

      for (const timeStr of scheduledTimes) {
        // Parse time string (e.g., "08:00" or "14:30")
        const [hourStr, minStr] = timeStr.split(':');
        const schedHour = parseInt(hourStr, 10);
        const schedMin = parseInt(minStr, 10);

        // Check if this time is due (current time is within 5 minutes after scheduled time)
        const schedTotalMins = schedHour * 60 + schedMin;
        const currentTotalMins = currentHour * 60 + currentMinute;
        const diffMins = currentTotalMins - schedTotalMins;

        // Only process if within 0-10 minute window after scheduled time
        if (diffMins >= 0 && diffMins <= 10) {
          const scheduledDateTime = new Date(`${todayDate}T${timeStr}:00`);

          // Check if dispense_queue entry already exists for this
          const { data: existingTask } = await supabase
            .from("dispense_queue")
            .select("id")
            .eq("patient_medication_id", pm.id)
            .gte("scheduled_time", `${todayDate}T00:00:00`)
            .lte("scheduled_time", `${todayDate}T23:59:59`)
            .eq("drawer_id", med.drawer_location)
            .maybeSingle();

          if (!existingTask) {
            // Create new dispense_queue entry
            await supabase
              .from("dispense_queue")
              .insert({
                patient_medication_id: pm.id,
                drawer_id: med.drawer_location,
                scheduled_time: scheduledDateTime.toISOString(),
                status: "pending",
                max_attempts: 3,
              });

            console.log(`Auto-queued dispense for drawer ${med.drawer_location} at ${timeStr}`);
          }
        }
      }
    }

    // Step 3: Get all pending tasks from dispense_queue
    const { data: tasks, error } = await supabase
      .from("dispense_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_time", now.toISOString())
      .order("scheduled_time", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching pending tasks:", error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    // Transform to API response format
    const pendingTasks: PendingTask[] = (tasks as DispenseQueueRow[]).map(task => ({
      taskId: task.id,
      drawerId: task.drawer_id,
      maxAttempts: task.max_attempts,
      scheduledTime: task.scheduled_time,
    }));

    // Mark fetched tasks as in_progress to prevent duplicate processing
    if (pendingTasks.length > 0) {
      const taskIds = pendingTasks.map(t => t.taskId);
      const { error: updateError } = await supabase
        .from("dispense_queue")
        .update({ status: "in_progress" })
        .in("id", taskIds);

      if (updateError) {
        console.error("Error updating task status:", updateError);
      }
    }

    const response: PendingTasksResponse = {
      tasks: pendingTasks,
      serverTime: now.toISOString(),
    };

    return NextResponse.json<ApiResponse<PendingTasksResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Hardware pending API error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
