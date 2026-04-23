#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <ArduinoJson.h>

// WIFI
const char* ssid = "PLDTHOMEFIBR5G148f8";
const char* password = "PLDTWIFI4ymw7";

// API
const char* BASE_URL = "https://meds-monitor.vercel.app/api/hardware";
const char* API_KEY  = "ae1ba4136b03970a7a9c87521a468df13f94e5011b1b82b4c65ccf9aa4bb18eb";

WiFiClientSecure client;

// SETTINGS
#define NUM_SERVOS 6   // A1–B3 = 6 drawers
#define SERVO_MIN 150
#define SERVO_MAX 600

// IR pins
int irPins[NUM_SERVOS] = {14,15,16,17,18,19};

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

// timing
unsigned long lastPoll = 0;
#define POLL_INTERVAL 5000

// ---------------- SERVO ----------------
int angleToPulse(int angle) {
  return map(angle, 0, 180, SERVO_MIN, SERVO_MAX);
}

void runServo(int ch) {
  for (int a = 0; a <= 180; a += 5) {
    pwm.setPWM(ch, 0, angleToPulse(a));
    delay(10);
  }
  for (int a = 180; a >= 0; a -= 5) {
    pwm.setPWM(ch, 0, angleToPulse(a));
    delay(10);
  }
}

// ---------------- IR ----------------
bool isDetected(int ch) {
  return digitalRead(irPins[ch]) == LOW;
}

// ---------------- DRAWER → SERVO ----------------
int mapDrawerToServo(String id) {
  if (id == "A1") return 0;
  if (id == "A2") return 1;
  if (id == "A3") return 2;
  if (id == "B1") return 3;
  if (id == "B2") return 4;
  if (id == "B3") return 5;
  return -1;
}

// ---------------- DISPENSE ----------------
bool dispenseOnce(int ch) {
  runServo(ch);

  bool detected = isDetected(ch);
  if (detected) {
    Serial.println("IR CONFIRMED");
  } else {
    Serial.println("NO OBJECT DETECTED");
  }
  return detected;
}

// ---------------- API: REPORT RESULT ----------------
void reportResult(String taskId, bool success, bool irConfirmed) {
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

  Serial.print("Report Result Code: ");
  Serial.println(code);

  if (code == 200) {
    Serial.println("Result reported successfully");
  } else {
    Serial.println("Failed to report result");
  }

  http.end();
}

// ---------------- API: GET PENDING TASKS ----------------
void checkDrawers() {
  HTTPClient http;

  String url = String(BASE_URL) + "/pending";

  http.begin(client, url);
  http.addHeader("X-Device-Key", API_KEY);

  int code = http.GET();

  Serial.print("API Code: ");
  Serial.println(code);

  if (code == 200) {
    String payload = http.getString();

    Serial.println(payload);

    DynamicJsonDocument doc(4096);

    DeserializationError error = deserializeJson(doc, payload);
    if (error) {
      Serial.println("JSON parse failed");
      http.end();
      return;
    }

    // Check if request was successful
    bool success = doc["success"];
    if (!success) {
      Serial.println("API returned error");
      http.end();
      return;
    }

    // Get tasks array from response
    JsonArray tasks = doc["data"]["tasks"];

    for (JsonObject task : tasks) {
      String taskId = task["taskId"];
      String drawerId = task["drawerId"];

      int servoIndex = mapDrawerToServo(drawerId);

      if (servoIndex == -1) {
        Serial.print("Unknown drawer: ");
        Serial.println(drawerId);
        continue;
      }

      Serial.print("Task: ");
      Serial.print(taskId);
      Serial.print(" Drawer: ");
      Serial.println(drawerId);

      // Dispense and check IR sensor
      bool irConfirmed = dispenseOnce(servoIndex);

      // Report result back to server
      reportResult(taskId, irConfirmed, irConfirmed);
    }
  } else if (code == 401) {
    Serial.println("Unauthorized - check API key");
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(code);
  }

  http.end();
}

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);

  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(50);

  for (int i = 0; i < NUM_SERVOS; i++) {
    pinMode(irPins[i], INPUT);
  }

  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected!");

  client.setInsecure(); // HTTPS fix
}

// ---------------- LOOP ----------------
void loop() {

  if (millis() - lastPoll > POLL_INTERVAL) {
    lastPoll = millis();
    checkDrawers();
  }
}