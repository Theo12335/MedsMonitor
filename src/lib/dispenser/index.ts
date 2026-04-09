/**
 * ESP32 Medication Dispenser Module
 *
 * This module provides types and utilities for the ESP32-based
 * automated medication dispensing system.
 *
 * Architecture:
 * - ESP32 polls /api/hardware/pending every 5-10 seconds
 * - Receives pending dispense tasks
 * - Activates servos and monitors IR sensors
 * - Reports results to /api/hardware/result
 * - Sends health data to /api/hardware/heartbeat
 */

// Types
export * from './types';

// Scheduler utilities
export * from './scheduler';
