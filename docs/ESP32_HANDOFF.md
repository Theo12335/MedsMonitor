# ESP32 Hardware Integration Handoff

This document contains everything needed to integrate the ESP32 medication dispenser with the MedsMonitor backend API.

---

## Authentication

All API requests must include the device key in the header:

| Header | Value |
|--------|-------|
| `X-Device-Key` | `ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb` |

---

## API Endpoints

Base URL: `http://192.168.1.7:3000/api/hardware` (local dev)

### 1. GET /pending

Fetch pending dispense tasks for the device.

**Request:**
```bash
curl -H "X-Device-Key: ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb" \
  http://192.168.1.7:3000/api/hardware/pending
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "drawerId": "D0",
        "scheduledTime": "2026-04-09T08:00:00.000Z",
        "patientMedicationId": "uuid"
      }
    ],
    "serverTime": "2026-04-09T05:47:43.778Z"
  }
}
```

---

### 2. POST /result

Report the result of a dispense operation.

**Request:**
```bash
curl -X POST \
  -H "X-Device-Key: ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "uuid-from-pending",
    "success": true,
    "irConfirmed": true,
    "attemptCount": 1
  }' \
  http://192.168.1.7:3000/api/hardware/result
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `taskId` | string | UUID from the pending task |
| `success` | boolean | Whether dispense was successful |
| `irConfirmed` | boolean | Whether IR sensor confirmed pill drop |
| `attemptCount` | number | Number of attempts made |

---

### 3. POST /heartbeat

Send device health status. Call this every 30-60 seconds.

**Request:**
```bash
curl -X POST \
  -H "X-Device-Key: ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb" \
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
  http://192.168.1.7:3000/api/hardware/heartbeat
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "serverTime": "2026-04-09T05:47:54.955Z",
    "configUpdate": {
      "pollIntervalMs": 5000,
      "irTimeoutMs": 5000,
      "servoDelayMs": 500,
      "maxRetries": 3
    }
  }
}
```

---

## ESP32 Configuration Template

```cpp
// WiFi credentials
const char* WIFI_SSID = "your-wifi-ssid";
const char* WIFI_PASSWORD = "your-wifi-password";

// API Configuration
const char* API_BASE_URL = "http://192.168.1.7:3000/api/hardware";
const char* API_KEY = "ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb";

// Timing
const int POLL_INTERVAL = 5000;      // Poll for tasks every 5 seconds
const int HEARTBEAT_INTERVAL = 30000; // Send heartbeat every 30 seconds
const int IR_TIMEOUT = 5000;          // Wait 5 seconds for IR confirmation
const int MAX_RETRIES = 3;            // Retry failed dispenses 3 times
```

---

## Hardware Specifications

| Component | Count | Purpose |
|-----------|-------|---------|
| Servo motors | 14 | Open medication drawers (D0-D13) |
| IR sensors | 14 | Confirm pill was dispensed |

### Drawer IDs
Drawers are labeled `D0` through `D13`. The `drawerId` field in pending tasks corresponds to these labels.

---

## Typical Flow

```
1. ESP32 boots → connects to WiFi
2. Send heartbeat to register device
3. Poll /pending every 5 seconds
4. When task received:
   a. Activate servo for specified drawer
   b. Wait for IR sensor confirmation (timeout: 5s)
   c. POST result to /result
5. Continue polling
6. Send heartbeat every 30 seconds
```

---

## Error Handling

- If `/pending` returns empty tasks array, continue polling
- If dispense fails (IR not confirmed), retry up to 3 times
- If all retries fail, report `success: false` with `attemptCount: 3`
- If API returns 401, check the API key header

---

## Testing

The API has been tested and is working. Test commands:

```bash
# Test authentication
curl -H "X-Device-Key: ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb" \
  http://192.168.1.7:3000/api/hardware/pending

# Should return: {"success":true,"data":{"tasks":[],...}}

# Test unauthorized (should fail)
curl http://192.168.1.7:3000/api/hardware/pending

# Should return: {"success":false,"error":"Unauthorized"}
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `docs/ESP32_SETUP.md` | Full setup guide |
| `src/lib/dispenser/types.ts` | TypeScript type definitions |
| `src/app/api/hardware/pending/route.ts` | Pending tasks endpoint |
| `src/app/api/hardware/result/route.ts` | Result reporting endpoint |
| `src/app/api/hardware/heartbeat/route.ts` | Heartbeat endpoint |

---

## Contact

For API issues or questions, contact the backend team.
