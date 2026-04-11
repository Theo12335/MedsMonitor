import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ApiResponse } from "@/types";

interface PendingTask {
  taskId: string;
  drawerId: string;
  maxAttempts: number;
  scheduledTime: string;
}

interface PendingTasksResponse {
  tasks: PendingTask[];
  serverTime: string;
}

/**
 * GET /api/hardware/pending
 *
 * ESP32 polls this endpoint to receive pending dispense tasks.
 * Auto-creates dispense_queue entries for due medications.
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use Philippines timezone (UTC+8)
    const now = new Date();
    const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for PH
    const todayDate = phTime.toISOString().split('T')[0];
    const currentHour = phTime.getUTCHours();
    const currentMinute = phTime.getUTCMinutes();

    console.log(`[PENDING] Server time: ${now.toISOString()}, PH time: ${phTime.toISOString()}, Hour: ${currentHour}, Min: ${currentMinute}`);

    // Step 1: Get all active patient medications
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
      console.error("[PENDING] Error fetching patient medications:", pmError);
    }

    // Step 2: Check each medication for due times
    for (const pm of patientMeds || []) {
      try {
        const med = Array.isArray(pm.medication) ? pm.medication[0] : pm.medication;
        if (!med?.drawer_location) continue;

        const scheduledTimes = pm.scheduled_times || [];

        for (const timeStr of scheduledTimes) {
          const [hourStr, minStr] = timeStr.split(':');
          const schedHour = parseInt(hourStr, 10);
          const schedMin = parseInt(minStr || '0', 10);

          const schedTotalMins = schedHour * 60 + schedMin;
          const currentTotalMins = currentHour * 60 + currentMinute;
          const diffMins = currentTotalMins - schedTotalMins;

          console.log(`[PENDING] Checking ${med.drawer_location} @ ${timeStr}: sched=${schedTotalMins}, current=${currentTotalMins}, diff=${diffMins}`);

          // Trigger if within 0-15 minute window after scheduled time
          if (diffMins >= 0 && diffMins <= 15) {
            // Check if already queued today
            const { data: existingTask } = await supabase
              .from("dispense_queue")
              .select("id, status")
              .eq("patient_medication_id", pm.id)
              .gte("scheduled_time", `${todayDate}T00:00:00`)
              .lte("scheduled_time", `${todayDate}T23:59:59`)
              .maybeSingle();

            if (!existingTask) {
              const scheduledDateTime = `${todayDate}T${timeStr}:00.000Z`;

              const { error: insertError } = await supabase
                .from("dispense_queue")
                .insert({
                  patient_medication_id: pm.id,
                  drawer_id: med.drawer_location,
                  scheduled_time: scheduledDateTime,
                  status: "pending",
                  max_attempts: 3,
                });

              if (insertError) {
                console.error("[PENDING] Insert error:", insertError);
              } else {
                console.log(`[PENDING] Queued dispense for ${med.drawer_location} at ${timeStr}`);
              }
            }
          }
        }
      } catch (err) {
        console.error("[PENDING] Error processing medication:", err);
      }
    }

    // Step 3: Get pending tasks from queue
    const { data: tasks, error } = await supabase
      .from("dispense_queue")
      .select("*")
      .eq("status", "pending")
      .order("scheduled_time", { ascending: true })
      .limit(10);

    if (error) {
      console.error("[PENDING] Error fetching queue:", error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    const pendingTasks: PendingTask[] = (tasks || []).map((task: any) => ({
      taskId: task.id,
      drawerId: task.drawer_id,
      maxAttempts: task.max_attempts || 3,
      scheduledTime: task.scheduled_time,
    }));

    // Mark as in_progress
    if (pendingTasks.length > 0) {
      const taskIds = pendingTasks.map(t => t.taskId);
      await supabase
        .from("dispense_queue")
        .update({ status: "in_progress" })
        .in("id", taskIds);

      console.log(`[PENDING] Returning ${pendingTasks.length} tasks`);
    }

    return NextResponse.json<ApiResponse<PendingTasksResponse>>({
      success: true,
      data: {
        tasks: pendingTasks,
        serverTime: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("[PENDING] Fatal error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
