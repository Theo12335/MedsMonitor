# ESP32 Hardware Test for MedsMonitor

This folder contains test firmware for the ESP32 to verify the hardware API is working correctly with real hardware.

## Hardware Requirements

- **ESP32 DevKit** (any variant with WiFi)
- **Servo Motor** (SG90 or similar)
- **Jumper wires**
- **(Optional)** IR break-beam sensor for pill detection

## Wiring

```
ESP32          Servo
------         ------
GPIO 13  --->  Signal (Orange/Yellow)
GND      --->  Ground (Brown)
5V       --->  Power (Red)

ESP32          IR Sensor (Optional)
------         ------
GPIO 14  --->  Signal
GND      --->  Ground
3.3V     --->  VCC
```

## Software Setup

### 1. Install Arduino IDE

Download from: https://www.arduino.cc/en/software

### 2. Add ESP32 Board Support

1. Open Arduino IDE
2. Go to **File > Preferences**
3. In "Additional Boards Manager URLs" add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools > Board > Boards Manager**
5. Search for "ESP32" and install **esp32 by Espressif Systems**

### 3. Install Required Libraries

Go to **Sketch > Include Library > Manage Libraries** and install:

- **ESP32Servo** by Kevin Harrington
- **ArduinoJson** by Benoit Blanchon (version 7.x)

### 4. Configure the Sketch

Open `MedsMonitorTest/MedsMonitorTest.ino` and update these values:

```cpp
// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server URL (see below for options)
const char* SERVER_URL = "http://YOUR_SERVER_IP:3000";

// API key (must match HARDWARE_API_KEY in your .env)
const char* API_KEY = "your-hardware-api-key";
```

### 5. Set Up the Server

Make sure you have `HARDWARE_API_KEY` set in your `.env` file:

```env
HARDWARE_API_KEY=your-hardware-api-key
```

**For local testing**, you need to expose your Next.js server to the ESP32:

**Option A: Use your computer's local IP**
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Set `SERVER_URL` to `http://YOUR_IP:3000`
3. Make sure ESP32 and computer are on the same WiFi network

**Option B: Use ngrok for remote access**
1. Install ngrok: https://ngrok.com
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL and set it as `SERVER_URL`

### 6. Upload to ESP32

1. Connect ESP32 via USB
2. Select board: **Tools > Board > ESP32 Dev Module**
3. Select port: **Tools > Port > COMX** (your ESP32 port)
4. Click **Upload**

## Testing

### Start the Server

```bash
cd MedsMonitor
npm run dev
```

### Monitor Serial Output

Open **Tools > Serial Monitor** (115200 baud) to see:

```
=================================
MedsMonitor ESP32 Hardware Test
=================================

[WIFI] Connecting to MyWiFi
.....
[WIFI] Connected!
[WIFI] IP address: 192.168.1.50
[SERVO] Initialized at closed position
[IR] Sensor: Not connected (will simulate)
[HEARTBEAT] Sending health status...
[HEARTBEAT] Sent successfully

[READY] Waiting for dispense tasks...

.....
```

### Manual Testing Commands

Type in Serial Monitor:
- `open` or `o` - Open the servo
- `close` or `c` - Close the servo
- `test` or `t` - Run a test dispense cycle
- `status` or `s` - Show current status
- `help` or `h` - Show available commands

### Create a Test Task

To trigger the ESP32, you need to add a task to the `dispense_queue` table in Supabase. You can do this via the Supabase dashboard or SQL:

```sql
INSERT INTO dispense_queue (
  patient_medication_id,
  drawer_id,
  scheduled_time,
  status,
  max_attempts
) VALUES (
  'some-uuid-here',  -- A valid patient_medication_id
  'D0',              -- Drawer ID
  NOW(),             -- Scheduled for now
  'pending',
  3
);
```

The ESP32 will pick up this task on its next poll and execute the dispense.

## Troubleshooting

### "Unauthorized" error
- Check that `API_KEY` in the sketch matches `HARDWARE_API_KEY` in `.env`
- Make sure you restarted the Next.js server after adding the env variable

### "Connection failed" error
- Verify WiFi credentials are correct
- Check that server is running and accessible
- Try pinging the server from another device on the same network

### Servo not moving
- Check wiring (signal wire to GPIO 13)
- Try a different GPIO pin and update `SERVO_PIN`
- Make sure servo has adequate power (some servos need external 5V supply)

### No tasks being picked up
- Verify tasks exist in `dispense_queue` with `status = 'pending'`
- Check `scheduled_time` is <= current time
- Look at server logs for errors

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hardware/pending` | GET | Poll for pending dispense tasks |
| `/api/hardware/result` | POST | Report dispense result |
| `/api/hardware/heartbeat` | POST | Send device health status |

All endpoints require `X-Device-Key` header with the API key.
