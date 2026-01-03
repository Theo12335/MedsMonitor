# Smart Care Monitor - Project Documentation

## Project Overview

**Smart Care Monitor** is an integrated healthcare monitoring and smart dispensing system designed to streamline caregiver workflows, automate medication logging, and ensure accurate patient care in healthcare facilities.

The project consists of two main components:
1. **Central Monitoring Website** - Control interface for administration and daily operations
2. **Smart Storage Unit (Hardware)** - Physical furniture with LED indicators and weight sensors

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMART CARE MONITOR                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Frontend   │     │   Backend    │     │   Hardware   │   │
│  │   (Next.js)  │◄───►│   (API)      │◄───►│  (Arduino)   │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│         │                    │                    │            │
│         ▼                    ▼                    ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │  - Landing   │     │  - Auth API  │     │  - ESP32     │   │
│  │  - Login     │     │  - Patient   │     │  - LEDs      │   │
│  │  - Dashboard │     │  - Caregiver │     │  - HX711     │   │
│  │  - Dispense  │     │  - Hardware  │     │  - Sensors   │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API

### Backend (To Be Implemented)
- **API**: Next.js API Routes
- **Database**: PostgreSQL/MongoDB (recommended)
- **ORM**: Prisma (recommended)
- **Authentication**: NextAuth.js (recommended)

### Hardware
- **Microcontroller**: ESP32 or Arduino with WiFi module
- **Weight Sensors**: HX711 Load Cells
- **Indicators**: LED strips/individual LEDs
- **Detection**: Reed switches for drawer open/close

---

## Project Structure

```
MedsMonitor/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/login/route.ts   # Authentication endpoint
│   │   │   ├── hardware/route.ts     # Arduino communication
│   │   │   └── medications/route.ts  # Medication CRUD
│   │   ├── dashboard/
│   │   │   ├── caregiver/
│   │   │   │   ├── page.tsx          # Caregiver dashboard
│   │   │   │   └── dispense/page.tsx # Medication dispense workflow
│   │   │   └── patient/
│   │   │       └── page.tsx          # Patient dashboard
│   │   ├── login/page.tsx            # Login page
│   │   ├── caregiver-logs/page.tsx   # Public caregiver logs
│   │   ├── patient-logs/page.tsx     # Public patient logs
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── Navbar.tsx                # Navigation bar
│   │   ├── Hero.tsx                  # Hero section
│   │   ├── Marquee.tsx               # Scrolling status bar
│   │   ├── CoreModules.tsx           # Module cards
│   │   ├── FacilityManifest.tsx      # Facility info
│   │   ├── SystemCapabilities.tsx    # Features section
│   │   ├── CTASection.tsx            # Call to action
│   │   ├── Footer.tsx                # Footer
│   │   ├── DashboardLayout.tsx       # Dashboard wrapper
│   │   └── ScrollRevealWrapper.tsx   # Scroll animations
│   ├── context/
│   │   └── AuthContext.tsx           # Authentication context
│   ├── hooks/
│   │   └── useScrollReveal.ts        # Scroll reveal hook
│   ├── lib/
│   │   └── arduino.ts                # Arduino communication client
│   └── types/
│       └── index.ts                  # TypeScript definitions
├── public/                           # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## User Roles & Access

### 1. Caregiver
- View all patients
- Dispense medications
- Track attendance (time in/out)
- Monitor inventory levels
- Receive low stock alerts
- Control smart storage LEDs

### 2. Patient
- View personal medication schedule
- Track medication history
- See adherence statistics
- View assigned caregiver

### 3. Admin (Future)
- Manage users
- Configure system settings
- Generate reports
- Manage inventory

---

## Core Features

### Implemented (Frontend)

| Feature | Location | Status |
|---------|----------|--------|
| Landing Page with scroll animations | `/` | Complete |
| Responsive navigation | All pages | Complete |
| Role-based login UI | `/login` | Complete |
| Caregiver dashboard | `/dashboard/caregiver` | Complete |
| Patient dashboard | `/dashboard/patient` | Complete |
| Medication dispense workflow | `/dashboard/caregiver/dispense` | Complete |
| Smart storage visualization | Dashboard pages | Complete |
| Public logs view | `/caregiver-logs`, `/patient-logs` | Complete |

### Scaffolding (Needs Backend)

| Feature | File | What's Needed |
|---------|------|---------------|
| User authentication | `api/auth/login` | Database, password hashing, JWT |
| Patient CRUD | `api/patients/` | Database integration |
| Medication management | `api/medications/` | Database integration |
| Attendance logging | `api/caregivers/` | Database integration |
| Hardware communication | `api/hardware/` | WebSocket server |

---

## Implementation Roadmap

### Phase 1: Database Setup (Priority: High)

**Option A: Prisma + PostgreSQL (Recommended)**

1. Install dependencies:
```bash
npm install prisma @prisma/client
npm install -D prisma
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Create schema in `prisma/schema.prisma`:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  patient   Patient?
  caregiver Caregiver?
}

enum Role {
  PATIENT
  CAREGIVER
  ADMIN
}

model Patient {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  roomNumber      String
  admissionDate   DateTime
  medications     PatientMedication[]
  medicationLogs  MedicationLog[]
}

model Caregiver {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  department      String
  attendanceLogs  AttendanceLog[]
  medicationLogs  MedicationLog[]
}

model Medication {
  id             String   @id @default(cuid())
  name           String
  dosage         String
  description    String?
  drawerLocation String
  currentStock   Int
  minimumStock   Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  patientMedications PatientMedication[]
  drawer            Drawer?
}

model PatientMedication {
  id            String   @id @default(cuid())
  patientId     String
  medicationId  String
  dosage        String
  frequency     String
  scheduledTimes String[] // Array of times like ["08:00", "20:00"]
  startDate     DateTime
  endDate       DateTime?

  patient       Patient    @relation(fields: [patientId], references: [id])
  medication    Medication @relation(fields: [medicationId], references: [id])
  logs          MedicationLog[]
}

model MedicationLog {
  id                   String   @id @default(cuid())
  patientMedicationId  String
  patientId            String
  caregiverId          String?
  scheduledTime        DateTime
  actualTime           DateTime?
  status               MedicationStatus
  notes                String?
  drawerOpened         Boolean  @default(false)
  verifiedByWeight     Boolean  @default(false)
  createdAt            DateTime @default(now())

  patientMedication    PatientMedication @relation(fields: [patientMedicationId], references: [id])
  patient              Patient           @relation(fields: [patientId], references: [id])
  caregiver            Caregiver?        @relation(fields: [caregiverId], references: [id])
}

enum MedicationStatus {
  PENDING
  TAKEN
  MISSED
  SKIPPED
}

model AttendanceLog {
  id          String    @id @default(cuid())
  caregiverId String
  date        DateTime
  timeIn      DateTime
  timeOut     DateTime?
  notes       String?
  createdAt   DateTime  @default(now())

  caregiver   Caregiver @relation(fields: [caregiverId], references: [id])
}

model Drawer {
  id              String   @id @default(cuid())
  label           String   @unique // "A1", "A2", etc.
  medicationId    String?  @unique
  currentWeight   Float
  emptyWeight     Float
  pillWeight      Float
  status          DrawerStatus @default(IDLE)
  ledActive       Boolean  @default(false)
  lastUpdated     DateTime @default(now())

  medication      Medication? @relation(fields: [medicationId], references: [id])
}

enum DrawerStatus {
  IDLE
  ACTIVE
  OPEN
  LOW_STOCK
  EMPTY
}
```

4. Run migration:
```bash
npx prisma migrate dev --name init
```

---

### Phase 2: Authentication (Priority: High)

**Using NextAuth.js**

1. Install dependencies:
```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

2. Create auth configuration at `src/lib/auth.ts`:
```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};
```

3. Create API route at `src/app/api/auth/[...nextauth]/route.ts`

---

### Phase 3: Arduino Integration (Priority: Medium)

**Option 1: WebSocket Server (Recommended)**

Create a separate WebSocket server or use a hybrid approach:

1. Install dependencies:
```bash
npm install ws
npm install -D @types/ws
```

2. Create WebSocket server (run separately or integrate):
```javascript
// ws-server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let arduinoConnection = null;
let webClients = new Set();

wss.on('connection', (ws, req) => {
  const clientType = req.url === '/arduino' ? 'arduino' : 'web';

  if (clientType === 'arduino') {
    arduinoConnection = ws;
    console.log('Arduino connected');
  } else {
    webClients.add(ws);
  }

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (clientType === 'arduino') {
      // Forward to web clients
      webClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else {
      // Forward to Arduino
      if (arduinoConnection?.readyState === WebSocket.OPEN) {
        arduinoConnection.send(message);
      }
    }
  });

  ws.on('close', () => {
    if (clientType === 'arduino') {
      arduinoConnection = null;
    } else {
      webClients.delete(ws);
    }
  });
});
```

**Option 2: MQTT (Best for IoT)**

1. Set up Mosquitto MQTT broker
2. Install MQTT client:
```bash
npm install mqtt
```

3. Topics structure:
```
smartcare/drawers/{drawerId}/led      # LED control
smartcare/drawers/{drawerId}/weight   # Weight readings
smartcare/drawers/{drawerId}/status   # Drawer status
smartcare/system/heartbeat            # Connection check
```

---

### Phase 4: Arduino Sketch

**ESP32 Code Example:**

```cpp
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "HX711.h"

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server settings
const char* wsHost = "192.168.1.100";  // Your server IP
const int wsPort = 8080;

WebSocketsClient webSocket;

// Pin definitions
const int NUM_DRAWERS = 6;
const int LED_PINS[NUM_DRAWERS] = {2, 4, 5, 18, 19, 21};
const int REED_PINS[NUM_DRAWERS] = {34, 35, 36, 39, 32, 33};
const char* DRAWER_IDS[NUM_DRAWERS] = {"A1", "A2", "A3", "B1", "B2", "B3"};

// HX711 setup (one per drawer)
HX711 scales[NUM_DRAWERS];
const int HX711_DOUT_PINS[NUM_DRAWERS] = {25, 26, 27, 14, 12, 13};
const int HX711_SCK_PIN = 15;  // Shared clock

// State tracking
bool drawerStates[NUM_DRAWERS] = {false};
float lastWeights[NUM_DRAWERS] = {0};

void setup() {
  Serial.begin(115200);

  // Initialize pins
  for (int i = 0; i < NUM_DRAWERS; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
    pinMode(REED_PINS[i], INPUT_PULLUP);

    // Initialize HX711
    scales[i].begin(HX711_DOUT_PINS[i], HX711_SCK_PIN);
    scales[i].set_scale(2280.f);  // Calibration factor
    scales[i].tare();
  }

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // Connect to WebSocket server
  webSocket.begin(wsHost, wsPort, "/arduino");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  checkDrawers();
  checkWeights();
  sendHeartbeat();
  delay(100);
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("WebSocket connected");
      break;

    case WStype_TEXT: {
      StaticJsonDocument<256> doc;
      deserializeJson(doc, payload);

      const char* command = doc["command"];
      const char* drawerId = doc["drawerId"];

      if (strcmp(command, "LIGHT_DRAWER") == 0) {
        lightDrawer(drawerId);
      } else if (strcmp(command, "RESET_LIGHTS") == 0) {
        resetAllLights();
      }
      break;
    }

    case WStype_DISCONNECTED:
      Serial.println("WebSocket disconnected");
      break;
  }
}

void lightDrawer(const char* drawerId) {
  resetAllLights();

  for (int i = 0; i < NUM_DRAWERS; i++) {
    if (strcmp(DRAWER_IDS[i], drawerId) == 0) {
      digitalWrite(LED_PINS[i], HIGH);
      Serial.printf("LED ON: %s\n", drawerId);
      break;
    }
  }
}

void resetAllLights() {
  for (int i = 0; i < NUM_DRAWERS; i++) {
    digitalWrite(LED_PINS[i], LOW);
  }
}

void checkDrawers() {
  for (int i = 0; i < NUM_DRAWERS; i++) {
    bool isOpen = digitalRead(REED_PINS[i]) == HIGH;

    if (isOpen != drawerStates[i]) {
      drawerStates[i] = isOpen;
      sendDrawerEvent(DRAWER_IDS[i], isOpen ? "DRAWER_OPENED" : "DRAWER_CLOSED");

      if (!isOpen) {
        // Drawer closed - turn off LED
        digitalWrite(LED_PINS[i], LOW);
      }
    }
  }
}

void checkWeights() {
  static unsigned long lastWeightCheck = 0;
  if (millis() - lastWeightCheck < 1000) return;
  lastWeightCheck = millis();

  for (int i = 0; i < NUM_DRAWERS; i++) {
    if (scales[i].is_ready()) {
      float weight = scales[i].get_units(5);

      if (abs(weight - lastWeights[i]) > 5) {  // 5g threshold
        lastWeights[i] = weight;
        sendWeightUpdate(DRAWER_IDS[i], weight);
      }
    }
  }
}

void sendDrawerEvent(const char* drawerId, const char* eventType) {
  StaticJsonDocument<128> doc;
  doc["type"] = eventType;
  doc["drawerId"] = drawerId;
  doc["timestamp"] = millis();

  String json;
  serializeJson(doc, json);
  webSocket.sendTXT(json);
}

void sendWeightUpdate(const char* drawerId, float weight) {
  StaticJsonDocument<128> doc;
  doc["type"] = "WEIGHT_UPDATE";
  doc["drawerId"] = drawerId;
  doc["payload"]["weight"] = weight;
  doc["payload"]["pillCount"] = (int)(weight / 10);  // Assuming 10g per pill

  String json;
  serializeJson(doc, json);
  webSocket.sendTXT(json);
}

void sendHeartbeat() {
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat < 5000) return;
  lastHeartbeat = millis();

  StaticJsonDocument<64> doc;
  doc["type"] = "HEARTBEAT";

  String json;
  serializeJson(doc, json);
  webSocket.sendTXT(json);
}
```

---

### Phase 5: Additional Features (Priority: Low)

1. **Reports & Analytics**
   - Medication adherence reports
   - Caregiver performance metrics
   - Inventory usage trends

2. **Notifications**
   - Email alerts for low stock
   - Push notifications for missed medications
   - SMS reminders

3. **Admin Panel**
   - User management
   - System configuration
   - Audit logs

4. **Mobile App**
   - React Native companion app
   - Patient medication reminders
   - Caregiver mobile dashboard

---

## Hardware Shopping List

| Component | Quantity | Purpose | Est. Cost |
|-----------|----------|---------|-----------|
| ESP32 Dev Board | 1 | Main controller | $8-15 |
| HX711 Load Cell Amp | 6 | Weight sensing | $2-3 each |
| 5kg Load Cells | 6 | Weight measurement | $3-5 each |
| WS2812B LED Strip | 1m | Drawer indicators | $10-15 |
| Reed Switches | 6 | Drawer open detection | $1-2 each |
| 5V Power Supply | 1 | Power LEDs | $5-10 |
| Jumper Wires | 1 pack | Connections | $5-8 |
| Breadboard/PCB | 1 | Prototyping | $5-10 |

**Total Estimated Cost: $60-100**

---

## Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smartcare"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Arduino/Hardware
ARDUINO_WS_PORT=8080
ARDUINO_WS_HOST="localhost"

# MQTT (if using)
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
```

---

## Running the Project

### Development

```bash
# Install dependencies
npm install

# Run database migrations (after setting up Prisma)
npx prisma migrate dev

# Start development server
npm run dev

# Start WebSocket server (in separate terminal)
node ws-server.js
```

### Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List all patients |
| GET | `/api/patients/:id` | Get patient details |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medications` | List all medications |
| GET | `/api/medications?lowStock=true` | Get low stock items |
| POST | `/api/medications` | Create medication |
| PUT | `/api/medications/:id` | Update medication |

### Hardware
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hardware` | Get drawer status |
| POST | `/api/hardware` | Send command to Arduino |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance logs |
| POST | `/api/attendance/clock-in` | Clock in |
| POST | `/api/attendance/clock-out` | Clock out |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

This project is for educational purposes. Modify the license as needed for your use case.

---

## Contact

For questions or support regarding this project, please open an issue in the repository.
