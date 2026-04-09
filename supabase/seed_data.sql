-- DoseKoPo Seed Data for Testing
-- Run this AFTER running schema.sql
-- This will populate your database with realistic test data

-- Clear existing data (optional - uncomment if you want to start fresh)
-- TRUNCATE public.medication_logs, public.patient_medications, public.patients, public.medications CASCADE;

-- ============================================
-- MEDICATIONS (common medications)
-- ============================================
INSERT INTO public.medications (name, dosage, description, drawer_location, current_stock, minimum_stock) VALUES
  ('Aspirin', '100mg', 'Pain reliever and blood thinner', 'A1', 45, 20),
  ('Metformin', '500mg', 'Type 2 diabetes medication', 'A2', 32, 15),
  ('Lisinopril', '10mg', 'ACE inhibitor for blood pressure', 'A3', 28, 15),
  ('Atorvastatin', '20mg', 'Cholesterol-lowering statin', 'A4', 50, 20),
  ('Omeprazole', '20mg', 'Proton pump inhibitor for acid reflux', 'B1', 18, 20),
  ('Amlodipine', '5mg', 'Calcium channel blocker for hypertension', 'B2', 35, 15),
  ('Vitamin D', '1000 IU', 'Vitamin D supplement', 'B3', 60, 25),
  ('Gabapentin', '300mg', 'Nerve pain medication', 'B4', 8, 15)
ON CONFLICT DO NOTHING;

-- ============================================
-- UPDATE DRAWERS with medication assignments
-- ============================================
UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'A1' LIMIT 1),
  estimated_pill_count = 45,
  minimum_pill_count = 20,
  status = 'idle'
WHERE label = 'A1';

UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'A2' LIMIT 1),
  estimated_pill_count = 32,
  minimum_pill_count = 15,
  status = 'idle'
WHERE label = 'A2';

UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'A3' LIMIT 1),
  estimated_pill_count = 28,
  minimum_pill_count = 15,
  status = 'idle'
WHERE label = 'A3';

UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'A4' LIMIT 1),
  estimated_pill_count = 50,
  minimum_pill_count = 20,
  status = 'idle'
WHERE label = 'A4';

UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'B1' LIMIT 1),
  estimated_pill_count = 18,
  minimum_pill_count = 20,
  status = 'low_stock'
WHERE label = 'B1';

UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'B2' LIMIT 1),
  estimated_pill_count = 35,
  minimum_pill_count = 15,
  status = 'idle'
WHERE label = 'B2';

UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'B3' LIMIT 1),
  estimated_pill_count = 60,
  minimum_pill_count = 25,
  status = 'idle'
WHERE label = 'B3';

UPDATE public.drawers SET
  medication_id = (SELECT id FROM public.medications WHERE drawer_location = 'B4' LIMIT 1),
  estimated_pill_count = 8,
  minimum_pill_count = 15,
  status = 'low_stock'
WHERE label = 'B4';

-- ============================================
-- PATIENTS
-- ============================================
INSERT INTO public.patients (name, room_number, admission_date, notes) VALUES
  ('John Doe', '101A', CURRENT_DATE - INTERVAL '5 days', 'Diabetic, requires regular glucose monitoring'),
  ('Jane Smith', '102B', CURRENT_DATE - INTERVAL '3 days', 'Hypertension patient, salt-restricted diet'),
  ('Robert Wilson', '103C', CURRENT_DATE - INTERVAL '7 days', 'Post-surgery recovery, pain management'),
  ('Maria Garcia', '104A', CURRENT_DATE - INTERVAL '2 days', 'Cardiac patient, monitor vitals closely'),
  ('James Brown', '105B', CURRENT_DATE - INTERVAL '10 days', 'Elderly patient, fall risk'),
  ('Emily Davis', '106C', CURRENT_DATE - INTERVAL '1 day', 'New admission, initial assessment pending')
ON CONFLICT DO NOTHING;

-- ============================================
-- PATIENT MEDICATIONS (prescriptions)
-- ============================================
DO $$
DECLARE
  -- Patient IDs
  john_id UUID;
  jane_id UUID;
  robert_id UUID;
  maria_id UUID;
  james_id UUID;
  emily_id UUID;
  -- Medication IDs
  aspirin_id UUID;
  metformin_id UUID;
  lisinopril_id UUID;
  atorvastatin_id UUID;
  omeprazole_id UUID;
  amlodipine_id UUID;
  vitamind_id UUID;
  gabapentin_id UUID;
BEGIN
  -- Get patient IDs
  SELECT id INTO john_id FROM public.patients WHERE name = 'John Doe' LIMIT 1;
  SELECT id INTO jane_id FROM public.patients WHERE name = 'Jane Smith' LIMIT 1;
  SELECT id INTO robert_id FROM public.patients WHERE name = 'Robert Wilson' LIMIT 1;
  SELECT id INTO maria_id FROM public.patients WHERE name = 'Maria Garcia' LIMIT 1;
  SELECT id INTO james_id FROM public.patients WHERE name = 'James Brown' LIMIT 1;
  SELECT id INTO emily_id FROM public.patients WHERE name = 'Emily Davis' LIMIT 1;

  -- Get medication IDs
  SELECT id INTO aspirin_id FROM public.medications WHERE name = 'Aspirin' LIMIT 1;
  SELECT id INTO metformin_id FROM public.medications WHERE name = 'Metformin' LIMIT 1;
  SELECT id INTO lisinopril_id FROM public.medications WHERE name = 'Lisinopril' LIMIT 1;
  SELECT id INTO atorvastatin_id FROM public.medications WHERE name = 'Atorvastatin' LIMIT 1;
  SELECT id INTO omeprazole_id FROM public.medications WHERE name = 'Omeprazole' LIMIT 1;
  SELECT id INTO amlodipine_id FROM public.medications WHERE name = 'Amlodipine' LIMIT 1;
  SELECT id INTO vitamind_id FROM public.medications WHERE name = 'Vitamin D' LIMIT 1;
  SELECT id INTO gabapentin_id FROM public.medications WHERE name = 'Gabapentin' LIMIT 1;

  -- John Doe's medications (diabetic)
  INSERT INTO public.patient_medications (patient_id, medication_id, dosage, frequency, scheduled_times, start_date, notes)
  VALUES
    (john_id, metformin_id, '500mg', 'twice daily', ARRAY['08:00', '20:00'], CURRENT_DATE - INTERVAL '5 days', 'Take with meals'),
    (john_id, aspirin_id, '100mg', 'once daily', ARRAY['08:00'], CURRENT_DATE - INTERVAL '5 days', 'Morning dose');

  -- Jane Smith's medications (hypertension)
  INSERT INTO public.patient_medications (patient_id, medication_id, dosage, frequency, scheduled_times, start_date, notes)
  VALUES
    (jane_id, lisinopril_id, '10mg', 'once daily', ARRAY['09:00'], CURRENT_DATE - INTERVAL '3 days', 'Monitor blood pressure'),
    (jane_id, amlodipine_id, '5mg', 'once daily', ARRAY['21:00'], CURRENT_DATE - INTERVAL '3 days', 'Evening dose');

  -- Robert Wilson's medications (pain management)
  INSERT INTO public.patient_medications (patient_id, medication_id, dosage, frequency, scheduled_times, start_date, notes)
  VALUES
    (robert_id, gabapentin_id, '300mg', 'three times daily', ARRAY['08:00', '14:00', '20:00'], CURRENT_DATE - INTERVAL '7 days', 'Pain management'),
    (robert_id, omeprazole_id, '20mg', 'once daily', ARRAY['07:00'], CURRENT_DATE - INTERVAL '7 days', 'Before breakfast');

  -- Maria Garcia's medications (cardiac)
  INSERT INTO public.patient_medications (patient_id, medication_id, dosage, frequency, scheduled_times, start_date, notes)
  VALUES
    (maria_id, atorvastatin_id, '20mg', 'once daily', ARRAY['20:00'], CURRENT_DATE - INTERVAL '2 days', 'Evening with dinner'),
    (maria_id, lisinopril_id, '10mg', 'once daily', ARRAY['08:00'], CURRENT_DATE - INTERVAL '2 days', 'Morning dose'),
    (maria_id, aspirin_id, '100mg', 'once daily', ARRAY['08:00'], CURRENT_DATE - INTERVAL '2 days', 'Blood thinner');

  -- James Brown's medications (elderly)
  INSERT INTO public.patient_medications (patient_id, medication_id, dosage, frequency, scheduled_times, start_date, notes)
  VALUES
    (james_id, vitamind_id, '1000 IU', 'once daily', ARRAY['09:00'], CURRENT_DATE - INTERVAL '10 days', 'With breakfast'),
    (james_id, omeprazole_id, '20mg', 'once daily', ARRAY['07:00'], CURRENT_DATE - INTERVAL '10 days', 'Before breakfast');

  -- Emily Davis's medications (new admission)
  INSERT INTO public.patient_medications (patient_id, medication_id, dosage, frequency, scheduled_times, start_date, notes)
  VALUES
    (emily_id, aspirin_id, '100mg', 'twice daily', ARRAY['08:00', '20:00'], CURRENT_DATE - INTERVAL '1 day', 'New prescription');

END $$;

-- ============================================
-- MEDICATION LOGS (today's schedule)
-- ============================================
DO $$
DECLARE
  pm RECORD;
  sched_time TEXT;
  log_time TIMESTAMP WITH TIME ZONE;
  current_hour INT := EXTRACT(HOUR FROM NOW());
  log_status TEXT;
BEGIN
  -- Loop through all active patient medications
  FOR pm IN SELECT * FROM public.patient_medications WHERE end_date IS NULL OR end_date >= CURRENT_DATE
  LOOP
    -- Loop through scheduled times
    FOREACH sched_time IN ARRAY pm.scheduled_times
    LOOP
      -- Create timestamp for today at scheduled time
      log_time := (CURRENT_DATE || ' ' || sched_time || ':00')::TIMESTAMP WITH TIME ZONE;

      -- Determine status based on time
      IF EXTRACT(HOUR FROM log_time) < current_hour - 1 THEN
        -- Past medications - randomly mark some as taken, some as missed
        IF RANDOM() > 0.15 THEN
          log_status := 'taken';
        ELSE
          log_status := 'missed';
        END IF;
      ELSE
        log_status := 'pending';
      END IF;

      -- Insert log entry (skip if already exists)
      INSERT INTO public.medication_logs (
        patient_medication_id,
        patient_id,
        scheduled_time,
        actual_time,
        status,
        drawer_opened,
        verified_by_weight
      )
      SELECT
        pm.id,
        pm.patient_id,
        log_time,
        CASE WHEN log_status = 'taken' THEN log_time + (RANDOM() * INTERVAL '15 minutes') ELSE NULL END,
        log_status,
        log_status = 'taken',
        log_status = 'taken'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.medication_logs
        WHERE patient_medication_id = pm.id
          AND scheduled_time = log_time
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- VERIFY DATA WAS INSERTED
-- ============================================
SELECT 'Medications: ' || COUNT(*)::text FROM public.medications
UNION ALL
SELECT 'Patients: ' || COUNT(*)::text FROM public.patients
UNION ALL
SELECT 'Prescriptions: ' || COUNT(*)::text FROM public.patient_medications
UNION ALL
SELECT 'Medication Logs: ' || COUNT(*)::text FROM public.medication_logs
UNION ALL
SELECT 'Drawers with meds: ' || COUNT(*)::text FROM public.drawers WHERE medication_id IS NOT NULL;
