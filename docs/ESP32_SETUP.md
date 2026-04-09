# ESP32 Medication Dispenser Setup Guide

This guide covers the remaining setup steps for the ESP32 hardware API integration.

## Prerequisites

- [x] API endpoints created (`/api/hardware/pending`, `/api/hardware/result`, `/api/hardware/heartbeat`)
- [x] Database migration file created (`supabase/migrations/002_dispense_queue.sql`)
- [x] TypeScript types defined (`src/lib/dispenser/`)
- [ ] Steps below need to be completed

---

## Step 1: Get Supabase Service Role Key

The hardware API needs the service role key to bypass RLS policies.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the `service_role` key (under "Project API keys")
5. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

> ⚠️ **Security**: Never expose the service role key to the client. It's only used in server-side API routes.

---

## Step 2: Generate Hardware API Key

Generate a secure random key for ESP32 authentication.

**Option A: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local`:
```env
HARDWARE_API_KEY=your-generated-key-here
```

---

## Step 3: Run Database Migration

Run the migration to create the `dispense_queue` and `device_heartbeats` tables.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `supabase/migrations/002_dispense_queue.sql`
5. Paste and click **Run**

**Verify tables were created:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('dispense_queue', 'device_heartbeats');
```

---

## Step 4: Enable pg_cron Extension

pg_cron is required for automatic medication scheduling.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Database** → **Extensions**
3. Search for `pg_cron`
4. Click **Enable**

---

## Step 5: Schedule the Medication Check Job

This cron job runs every minute to check for medications that need to be dispensed.

1. Go to **SQL Editor** in Supabase Dashboard
2. Run the following SQL:

```sql
SELECT cron.schedule(
  'check-medication-schedules',
  '* * * * *',
  $$
    INSERT INTO dispense_queue (patient_medication_id, drawer_id, scheduled_time)
    SELECT pm.id, m.drawer_location, (CURRENT_DATE + st::time)
    FROM patient_medications pm
    JOIN medications m ON pm.medication_id = m.id
    CROSS JOIN unnest(pm.scheduled_times) AS st
    WHERE pm.start_date <= CURRENT_DATE
      AND (pm.end_date IS NULL OR pm.end_date >= CURRENT_DATE)
      AND st::time BETWEEN (CURRENT_TIME - INTERVAL '1 minute') AND CURRENT_TIME
      AND NOT EXISTS (
        SELECT 1 FROM dispense_queue dq
        WHERE dq.patient_medication_id = pm.id
          AND dq.scheduled_time::date = CURRENT_DATE
          AND dq.scheduled_time::time = st::time
      );
  $$
);
```

**Verify the job is scheduled:**
```sql
SELECT * FROM cron.job;
```

**To unschedule (if needed):**
```sql
SELECT cron.unschedule('check-medication-schedules');
```

---

## Step 6: Test the API Endpoints

Start the development server:
```bash
npm run dev
```

### Test Pending Tasks Endpoint
```bash
curl -H "X-Device-Key: YOUR_API_KEY" \
  http://localhost:3000/api/hardware/pending
```

Expected response:
```json
{
  "success": true,
  "data": {
    "tasks": [],
    "serverTime": "2026-04-08T12:00:00.000Z"
  }
}
```

### Test Heartbeat Endpoint
```bash
curl -X POST \
  -H "X-Device-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "esp32_001",
    "sensors": {
      "ir": [true,true,true,true,true,true,true,true,true,true,true,true,true,true],
      "servos": [true,true,true,true,true,true,true,true,true,true,true,true,true,true]
    },
    "firmwareVersion": "1.0.0",
    "freeMemory": 50000,
    "uptimeSeconds": 3600
  }' \
  http://localhost:3000/api/hardware/heartbeat
```

### Test Result Endpoint
```bash
# First, manually insert a test task
# Then report a result:
curl -X POST \
  -H "X-Device-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "your-task-uuid",
    "success": true,
    "irConfirmed": true,
    "attemptCount": 1
  }' \
  http://localhost:3000/api/hardware/result
```

### Test Unauthorized Access
```bash
curl http://localhost:3000/api/hardware/pending
# Should return: {"success":false,"error":"Unauthorized"}
```

---

## Step 7: ESP32 Configuration

Configure the ESP32 with these values:

```cpp
// WiFi credentials
const char* WIFI_SSID = "your-wifi-ssid";
const char* WIFI_PASSWORD = "your-wifi-password";

// API Configuration
const char* API_BASE_URL = "https://your-domain.com/api/hardware";
const char* API_KEY = "your-hardware-api-key";

// Polling interval (milliseconds)
const int POLL_INTERVAL = 5000;  // 5 seconds

// IR sensor timeout (milliseconds)
const int IR_TIMEOUT = 5000;  // 5 seconds

// Max retry attempts
const int MAX_RETRIES = 3;
```

---

## Architecture Reference

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │     │    Supabase     │     │     ESP32       │
│                 │     │                 │     │                 │
│  /api/hardware/ │◄───►│ dispense_queue  │     │  Polls every    │
│    pending      │     │ medication_logs │◄────│  5-10 seconds   │
│    result       │     │                 │     │                 │
│    heartbeat    │     │  pg_cron runs   │     │  14 servos      │
│                 │     │  every minute   │     │  14 IR sensors  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Troubleshooting

### API returns 401 Unauthorized
- Verify `HARDWARE_API_KEY` in `.env.local` matches the key sent in `X-Device-Key` header
- Restart the dev server after changing `.env.local`

### Database errors in API
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that tables exist in Supabase

### Tasks not appearing in queue
- Verify pg_cron extension is enabled
- Check that the cron job is scheduled: `SELECT * FROM cron.job;`
- Verify `patient_medications` has entries with valid `scheduled_times`
- Check medications have `drawer_location` set (e.g., "D0", "D1")

### Cron job not inserting tasks
- Verify the foreign key relationship: `patient_medications` must reference valid `medications`
- Check time zones match between your data and database

---

## Files Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/002_dispense_queue.sql` | Database schema |
| `src/lib/dispenser/types.ts` | TypeScript types |
| `src/lib/dispenser/scheduler.ts` | Schedule utilities |
| `src/app/api/hardware/pending/route.ts` | GET pending tasks |
| `src/app/api/hardware/result/route.ts` | POST dispense results |
| `src/app/api/hardware/heartbeat/route.ts` | POST/GET device health |
| `.env.example` | Environment template |
