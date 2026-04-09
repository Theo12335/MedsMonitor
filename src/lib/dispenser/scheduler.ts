/**
 * Schedule Matching Logic for Medication Dispenser
 *
 * Helper functions for determining when medications should be dispensed
 * based on patient_medications.scheduled_times.
 *
 * Note: The primary scheduling is done by Supabase pg_cron.
 * These functions are utilities for manual scheduling and testing.
 */

import { DispenseTask, DispenseQueueRow, rowToDispenseTask } from './types';

/**
 * Check if a scheduled time matches the current time within a tolerance window
 *
 * @param scheduledTime - Time string in "HH:MM" format
 * @param currentTime - Current time (defaults to now)
 * @param toleranceMinutes - Minutes of tolerance (default: 1)
 * @returns true if the scheduled time is within the tolerance window
 */
export function isTimeToDispense(
  scheduledTime: string,
  currentTime: Date = new Date(),
  toleranceMinutes: number = 1
): boolean {
  const [hours, minutes] = scheduledTime.split(':').map(Number);

  const scheduledDate = new Date(currentTime);
  scheduledDate.setHours(hours, minutes, 0, 0);

  const diffMs = Math.abs(currentTime.getTime() - scheduledDate.getTime());
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= toleranceMinutes;
}

/**
 * Get all scheduled times that are due now
 *
 * @param scheduledTimes - Array of time strings in "HH:MM" format
 * @param currentTime - Current time (defaults to now)
 * @param toleranceMinutes - Minutes of tolerance
 * @returns Array of scheduled times that are due
 */
export function getDueScheduledTimes(
  scheduledTimes: string[],
  currentTime: Date = new Date(),
  toleranceMinutes: number = 1
): string[] {
  return scheduledTimes.filter(time =>
    isTimeToDispense(time, currentTime, toleranceMinutes)
  );
}

/**
 * Parse a time string into hours and minutes
 *
 * @param timeString - Time in "HH:MM" format
 * @returns Object with hours and minutes
 */
export function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Create a full timestamp from a date and time string
 *
 * @param date - The date part
 * @param timeString - Time in "HH:MM" format
 * @returns Full Date object
 */
export function createScheduledTimestamp(date: Date, timeString: string): Date {
  const { hours, minutes } = parseTimeString(timeString);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Check if a dispense task already exists for a given medication and scheduled time
 *
 * @param existingTasks - Array of existing dispense tasks
 * @param patientMedicationId - The patient medication ID
 * @param scheduledTime - The scheduled time to check
 * @returns true if a task already exists
 */
export function taskExists(
  existingTasks: DispenseTask[],
  patientMedicationId: string,
  scheduledTime: Date
): boolean {
  return existingTasks.some(task =>
    task.patientMedicationId === patientMedicationId &&
    task.scheduledTime.getTime() === scheduledTime.getTime()
  );
}

/**
 * Filter tasks to get only pending ones that are ready to dispatch
 *
 * @param tasks - Array of dispense tasks
 * @returns Array of pending tasks ready for dispatch
 */
export function getPendingTasks(tasks: DispenseTask[]): DispenseTask[] {
  const now = new Date();
  return tasks.filter(task =>
    task.status === 'pending' &&
    task.scheduledTime <= now
  );
}

/**
 * Calculate the next scheduled time for a medication
 *
 * @param scheduledTimes - Array of daily scheduled times in "HH:MM" format
 * @param currentTime - Current time (defaults to now)
 * @returns The next scheduled time, or undefined if none
 */
export function getNextScheduledTime(
  scheduledTimes: string[],
  currentTime: Date = new Date()
): Date | undefined {
  if (scheduledTimes.length === 0) return undefined;

  const today = new Date(currentTime);
  const tomorrow = new Date(currentTime);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Sort times chronologically
  const sortedTimes = [...scheduledTimes].sort();

  // Check today's remaining times
  for (const timeString of sortedTimes) {
    const scheduledDate = createScheduledTimestamp(today, timeString);
    if (scheduledDate > currentTime) {
      return scheduledDate;
    }
  }

  // If no times left today, return first time tomorrow
  return createScheduledTimestamp(tomorrow, sortedTimes[0]);
}

/**
 * Format a duration in milliseconds to a human-readable string
 *
 * @param ms - Duration in milliseconds
 * @returns Human-readable string (e.g., "2h 30m", "45m", "30s")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
}

/**
 * Calculate time until next dispense
 *
 * @param scheduledTimes - Array of daily scheduled times
 * @param currentTime - Current time
 * @returns Object with next time and duration until then
 */
export function getTimeUntilNextDispense(
  scheduledTimes: string[],
  currentTime: Date = new Date()
): { nextTime: Date; durationMs: number; formatted: string } | undefined {
  const nextTime = getNextScheduledTime(scheduledTimes, currentTime);
  if (!nextTime) return undefined;

  const durationMs = nextTime.getTime() - currentTime.getTime();
  return {
    nextTime,
    durationMs,
    formatted: formatDuration(durationMs),
  };
}

/**
 * Batch convert database rows to DispenseTask objects
 */
export function rowsToDispenseTasks(rows: DispenseQueueRow[]): DispenseTask[] {
  return rows.map(rowToDispenseTask);
}
