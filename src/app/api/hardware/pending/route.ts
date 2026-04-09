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
 * Returns tasks that are:
 * - status = 'pending'
 * - scheduled_time <= current time
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

    // Get pending tasks that are due
    const now = new Date().toISOString();
    const { data: tasks, error } = await supabase
      .from("dispense_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_time", now)
      .order("scheduled_time", { ascending: true })
      .limit(10);  // Limit to prevent overwhelming the ESP32

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
        // Continue anyway - ESP32 can handle duplicates
      }
    }

    const response: PendingTasksResponse = {
      tasks: pendingTasks,
      serverTime: now,
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
