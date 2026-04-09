-- Migration: Create dispense_queue table for ESP32 medication dispenser
-- This table acts as a queue for pending dispense tasks

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the dispense_queue table
CREATE TABLE IF NOT EXISTS public.dispense_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_medication_id UUID NOT NULL,
  drawer_id VARCHAR(10) NOT NULL,  -- "D0" to "D13" for 14 drawers
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  ir_confirmed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Add foreign key constraint if patient_medications table exists
  CONSTRAINT fk_patient_medication
    FOREIGN KEY (patient_medication_id)
    REFERENCES patient_medications(id)
    ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_dispense_queue_status ON public.dispense_queue(status);
CREATE INDEX IF NOT EXISTS idx_dispense_queue_scheduled_time ON public.dispense_queue(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_dispense_queue_patient_medication ON public.dispense_queue(patient_medication_id);

-- Create a composite index for the ESP32 polling query
CREATE INDEX IF NOT EXISTS idx_dispense_queue_pending_tasks
  ON public.dispense_queue(status, scheduled_time)
  WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE public.dispense_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for API routes)
CREATE POLICY "Service role has full access to dispense_queue"
  ON public.dispense_queue
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to read
CREATE POLICY "Authenticated users can read dispense_queue"
  ON public.dispense_queue
  FOR SELECT
  TO authenticated
  USING (true);

-- Create device_heartbeats table for ESP32 health monitoring
CREATE TABLE IF NOT EXISTS public.device_heartbeats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR(50) NOT NULL,
  ir_sensors JSONB,  -- Array of 14 boolean values
  servo_status JSONB,  -- Array of 14 boolean values
  firmware_version VARCHAR(20),
  free_memory INTEGER,
  uptime_seconds BIGINT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for device lookups
CREATE INDEX IF NOT EXISTS idx_device_heartbeats_device_id
  ON public.device_heartbeats(device_id, last_seen DESC);

-- Enable RLS on device_heartbeats
ALTER TABLE public.device_heartbeats ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access to device_heartbeats"
  ON public.device_heartbeats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to read
CREATE POLICY "Authenticated users can read device_heartbeats"
  ON public.device_heartbeats
  FOR SELECT
  TO authenticated
  USING (true);

-- Comment on tables
COMMENT ON TABLE public.dispense_queue IS 'Queue for pending medication dispense tasks for ESP32 hardware';
COMMENT ON TABLE public.device_heartbeats IS 'Health status tracking for ESP32 devices';

-- Comment on columns
COMMENT ON COLUMN public.dispense_queue.drawer_id IS 'Drawer identifier (D0-D13 for 14 servos)';
COMMENT ON COLUMN public.dispense_queue.ir_confirmed IS 'Whether IR sensor confirmed pill was dispensed';
COMMENT ON COLUMN public.dispense_queue.attempt_count IS 'Number of dispense attempts made';
COMMENT ON COLUMN public.dispense_queue.max_attempts IS 'Maximum retry attempts before marking as failed';

-- =============================================================================
-- pg_cron Setup (Run in Supabase Dashboard > SQL Editor after enabling pg_cron)
-- =============================================================================
--
-- First, enable pg_cron extension in Supabase Dashboard > Database > Extensions
--
-- Then run this to schedule the medication check job:
--
-- SELECT cron.schedule(
--   'check-medication-schedules',
--   '* * * * *',  -- Every minute
--   $$
--     INSERT INTO dispense_queue (patient_medication_id, drawer_id, scheduled_time)
--     SELECT pm.id, m.drawer_location, (CURRENT_DATE + st::time)
--     FROM patient_medications pm
--     JOIN medications m ON pm.medication_id = m.id
--     CROSS JOIN unnest(pm.scheduled_times) AS st
--     WHERE pm.start_date <= CURRENT_DATE
--       AND (pm.end_date IS NULL OR pm.end_date >= CURRENT_DATE)
--       AND st::time BETWEEN (CURRENT_TIME - INTERVAL '1 minute') AND CURRENT_TIME
--       AND NOT EXISTS (
--         SELECT 1 FROM dispense_queue dq
--         WHERE dq.patient_medication_id = pm.id
--           AND dq.scheduled_time::date = CURRENT_DATE
--           AND dq.scheduled_time::time = st::time
--       );
--   $$
-- );
--
-- To view scheduled jobs:
-- SELECT * FROM cron.job;
--
-- To unschedule:
-- SELECT cron.unschedule('check-medication-schedules');
