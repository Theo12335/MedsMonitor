#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

// =============================================================================
// CONFIGURATION
// =============================================================================

// WIFI
const char* ssid = "Wassup2.4G";
const char* password = "Bascon12335";

// API
const char* BASE_URL = "https://meds-monitor.vercel.app/api/hardware";
const char* API_KEY  = "ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb";

WiFiClientSecure client;

// =============================================================================
// HARDWARE PINS - DIRECTLY ON ESP32
// =============================================================================

#define SERVO_PIN 13      // Servo signal wire
#define IR_PIN 14         // IR sensor (optional)
#define LED_PIN 2         // Built-in LED

Servo servo;

// Servo angles
#define SERVO_OPEN 90
#define SERVO_CLOSE 0

// timing
unsigned long lastPoll = 0;
#define POLL_INTERVAL 5000

// =============================================================================
// SERVO FUNCTIONS
// =============================================================================

void runServo() {
  Serial.println("[SERVO] Opening...");
  servo.write(SERVO_OPEN);
  delay(500);

  Serial.println("[SERVO] Closing...");
  servo.write(SERVO_CLOSE);
  delay(500);
}

// =============================================================================
// IR SENSOR
// =============================================================================

bool isDetected() {
  return digitalRead(IR_PIN) == LOW;
}

// =============================================================================
// DRAWER TO SERVO MAPPING
// =============================================================================

bool isValidDrawer(String id) {
  // For 1 servo test, accept A1 only
  // Change this to accept more drawers when scaling up
  return (id == "A1");
}

// =============================================================================
// DISPENSE
// =============================================================================

bool dispenseOnce() {
  runServo();

  bool detected = isDetected();
  if (detected) {
    Serial.println("[IR] CONFIRMED - pill detected");
  } else {
    Serial.println("[IR] NO OBJECT DETECTED (or no sensor)");
  }
  return detected;
}

// =============================================================================
// API: REPORT RESULT
// =============================================================================

void reportResult(String taskId, bool success, bool irConfirmed) {
  Serial.println("[REPORT] Sending result to server...");

  HTTPClient http;

  String url = String(BASE_URL) + "/result";

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", API_KEY);

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["taskId"] = taskId;
  doc["success"] = success;
  doc["irConfirmed"] = irConfirmed;
  doc["attemptCount"] = 1;

  if (!success) {
    doc["errorCode"] = irConfirmed ? "UNKNOWN" : "IR_TIMEOUT";
  }

  String payload;
  serializeJson(doc, payload);

  int code = http.POST(payload);

  Serial.print("[REPORT] Response code: ");
  Serial.println(code);

  if (code == 200) {
    Serial.println("[REPORT] Result reported successfully");
  } else {
    Serial.println("[REPORT] Failed to report result");
  }

  http.end();
}

// =============================================================================
// API: GET PENDING TASKS
// =============================================================================

void checkDrawers() {
  HTTPClient http;

  String url = String(BASE_URL) + "/pending";

  http.begin(client, url);
  http.addHeader("X-Device-Key", API_KEY);

  int code = http.GET();

  Serial.print("[POLL] API Code: ");
  Serial.println(code);

  if (code == 200) {
    String payload = http.getString();

    Serial.println(payload);

    DynamicJsonDocument doc(4096);

    DeserializationError error = deserializeJson(doc, payload);
    if (error) {
      Serial.println("[ERROR] JSON parse failed");
      http.end();
      return;
    }

    // Check if request was successful
    bool success = doc["success"];
    if (!success) {
      Serial.println("[ERROR] API returned error");
      http.end();
      return;
    }

    // Get tasks array from response
    JsonArray tasks = doc["data"]["tasks"];
    int taskCount = tasks.size();

    if (taskCount == 0) {
      Serial.print(".");  // Show we're polling
      http.end();
      return;
    }

    Serial.print("[POLL] Found ");
    Serial.print(taskCount);
    Serial.println(" task(s)");

    for (JsonObject task : tasks) {
      String taskId = task["taskId"];
      String drawerId = task["drawerId"];

      Serial.println("\n----------------------------------");
      Serial.print("[TASK] ID: ");
      Serial.println(taskId);
      Serial.print("[TASK] Drawer: ");
      Serial.println(drawerId);

      // For single servo test, only process A1
      if (!isValidDrawer(drawerId)) {
        Serial.print("[SKIP] Drawer ");
        Serial.print(drawerId);
        Serial.println(" not configured for this test");
        // Still report as failed so it doesn't keep retrying
        reportResult(taskId, false, false);
        continue;
      }

      // Dispense and check IR sensor
      bool irConfirmed = dispenseOnce();

      // Report result back to server
      reportResult(taskId, irConfirmed, irConfirmed);

      Serial.println("----------------------------------\n");
    }
  } else if (code == 401) {
    Serial.println("[ERROR] Unauthorized - check API key");
  } else if (code < 0) {
    Serial.print("[ERROR] Connection failed: ");
    Serial.println(http.errorToString(code));
    Serial.println("[HINT] Check WiFi, or server may be down");
  } else {
    Serial.print("[ERROR] HTTP Error: ");
    Serial.println(code);
  }

  http.end();
}

// =============================================================================
// MANUAL TEST FUNCTIONS
// =============================================================================

void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "open" || cmd == "o") {
      Serial.println("[MANUAL] Opening servo...");
      servo.write(SERVO_OPEN);
    }
    else if (cmd == "close" || cmd == "c") {
      Serial.println("[MANUAL] Closing servo...");
      servo.write(SERVO_CLOSE);
    }
    else if (cmd == "test" || cmd == "t") {
      Serial.println("[MANUAL] Testing servo...");
      dispenseOnce();
    }
    else if (cmd == "ir") {
      Serial.print("[MANUAL] IR sensor: ");
      Serial.println(isDetected() ? "DETECTED" : "CLEAR");
    }
    else if (cmd == "poll" || cmd == "p") {
      Serial.println("[MANUAL] Polling server...");
      checkDrawers();
    }
    else if (cmd == "status" || cmd == "s") {
      Serial.println("\n=== STATUS ===");
      Serial.print("WiFi: ");
      Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
      Serial.print("Servo pin: GPIO ");
      Serial.println(SERVO_PIN);
      Serial.print("IR pin: GPIO ");
      Serial.println(IR_PIN);
      Serial.print("Free Memory: ");
      Serial.println(ESP.getFreeHeap());
      Serial.println("===============\n");
    }
    else if (cmd == "help" || cmd == "h") {
      Serial.println("\n=== COMMANDS ===");
      Serial.println("open (o)   - Open servo");
      Serial.println("close (c)  - Close servo");
      Serial.println("test (t)   - Full dispense cycle");
      Serial.println("ir         - Check IR sensor");
      Serial.println("poll (p)   - Poll server now");
      Serial.println("status (s) - Show status");
      Serial.println("help (h)   - Show this help");
      Serial.println("================\n");
    }
  }
}

// =============================================================================
// SETUP
// =============================================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("MedsMonitor ESP32 Test");
  Serial.println("Single Servo (Direct GPIO)");
  Serial.println("=================================\n");

  // LED
  pinMode(LED_PIN, OUTPUT);

  // Servo on GPIO
  ESP32PWM::allocateTimer(0);
  servo.setPeriodHertz(50);
  servo.attach(SERVO_PIN, 500, 2400);
  servo.write(SERVO_CLOSE);
  Serial.print("[SERVO] Attached to GPIO ");
  Serial.println(SERVO_PIN);

  // IR sensor
  pinMode(IR_PIN, INPUT);
  Serial.print("[IR] Sensor on GPIO ");
  Serial.println(IR_PIN);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("[WIFI] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
  Serial.println("\n[WIFI] Connected!");
  Serial.print("[WIFI] IP: ");
  Serial.println(WiFi.localIP());
  digitalWrite(LED_PIN, HIGH);

  // HTTPS
  client.setInsecure();

  Serial.println("\n[READY] Type 'help' for commands");
  Serial.println("[INFO] Will accept drawer 'A1' only\n");
}

// =============================================================================
// LOOP
// =============================================================================

void loop() {
  if (millis() - lastPoll > POLL_INTERVAL) {
    lastPoll = millis();
    checkDrawers();
  }

  handleSerialCommands();
  delay(100);
}
