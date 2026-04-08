# Smart Care Monitor - Research Methodology Supplement

This document provides technical specifications, system architecture details, and relevant information for inclusion in research methodology papers related to the Smart Care Monitor project.

---

## 1. System Overview for Methodology Sections

### 1.1 System Description

The Smart Care Monitor is an Internet of Things (IoT)-based healthcare monitoring and medication dispensing system. The system integrates a web-based central monitoring interface with embedded hardware components to automate medication tracking, verify dispensing accuracy through weight-based validation, and provide real-time feedback to caregivers.

**Suggested Citation Format:**
> The medication monitoring system consists of a web-based dashboard developed using Next.js 16 with TypeScript, interfaced with an ESP32 microcontroller-based smart storage unit equipped with HX711 load cell amplifiers for weight sensing and WS2812B LED indicators for visual guidance.

### 1.2 System Classification

| Attribute | Classification |
|-----------|----------------|
| System Type | IoT Healthcare Monitoring System |
| Architecture | Client-Server with Embedded Hardware |
| Communication Protocol | WebSocket / MQTT |
| Data Flow | Bidirectional Real-time |
| User Interface | Web-based Responsive Dashboard |

---

## 2. Hardware Specifications

### 2.1 Microcontroller Unit

| Specification | Details |
|---------------|---------|
| Model | ESP32-WROOM-32 Development Board |
| Processor | Dual-core Xtensa LX6, 240 MHz |
| RAM | 520 KB SRAM |
| Flash Memory | 4 MB |
| Wireless | Wi-Fi 802.11 b/g/n, Bluetooth 4.2 |
| GPIO Pins | 34 programmable |
| ADC | 12-bit SAR ADC, up to 18 channels |
| Operating Voltage | 3.3V (5V input via USB) |

### 2.2 Weight Sensing Module

| Specification | Details |
|---------------|---------|
| Load Cell Amplifier | HX711 24-bit ADC |
| Load Cell Type | Strain Gauge (Half-bridge/Full-bridge) |
| Load Cell Capacity | 5 kg per drawer |
| Resolution | 24-bit (16,777,216 levels) |
| Sensitivity | Configurable via calibration factor |
| Sample Rate | 10 Hz or 80 Hz selectable |
| Weight Detection Threshold | 5 grams (configurable) |

### 2.3 Indicator System

| Specification | Details |
|---------------|---------|
| LED Type | WS2812B Addressable RGB LED Strip |
| LED Density | 60 LEDs/meter |
| Color Depth | 24-bit (16.7 million colors) |
| Control Protocol | Single-wire serial (800 kHz) |
| Operating Voltage | 5V DC |
| Current Draw | ~60mA per LED (full white) |

### 2.4 Drawer Detection

| Specification | Details |
|---------------|---------|
| Sensor Type | Reed Switch (Magnetic) |
| Contact Type | Normally Open (NO) |
| Activation | Magnet proximity-based |
| Debounce | Software-implemented (50ms) |
| Detection States | Open / Closed |

---

## 3. Software Architecture

### 3.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend Framework | Next.js | 16.x | Server-side rendering, routing |
| Programming Language | TypeScript | 5.x | Type-safe development |
| Styling | Tailwind CSS | 3.x | Responsive UI design |
| State Management | React Context API | 18.x | Client-side state |
| Database (Recommended) | PostgreSQL | 15.x | Persistent data storage |
| ORM | Prisma | 5.x | Database abstraction |
| Authentication | NextAuth.js | 4.x | Session management |
| Real-time Communication | WebSocket | - | Hardware-software bridge |
| Firmware | Arduino/C++ | - | ESP32 programming |

### 3.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    HTTP/REST    ┌──────────┐    WebSocket    ┌──────────┐│
│  │  User    │ ◄─────────────► │  Web     │ ◄─────────────► │  ESP32   ││
│  │ Browser  │                 │  Server  │                 │  MCU     ││
│  └──────────┘                 └──────────┘                 └──────────┘│
│       │                            │                            │       │
│       │                            │                            │       │
│       ▼                            ▼                            ▼       │
│  ┌──────────┐                ┌──────────┐                ┌──────────┐  │
│  │ Dashboard│                │ Database │                │ Sensors  │  │
│  │    UI    │                │PostgreSQL│                │ & LEDs   │  │
│  └──────────┘                └──────────┘                └──────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Communication Protocol

**WebSocket Message Structure:**

```json
{
  "type": "EVENT_TYPE",
  "drawerId": "A1",
  "payload": {
    "weight": 150.5,
    "pillCount": 15,
    "timestamp": 1704067200000
  }
}
```

**Event Types:**
| Event | Direction | Description |
|-------|-----------|-------------|
| `LIGHT_DRAWER` | Server → Hardware | Activate LED indicator |
| `RESET_LIGHTS` | Server → Hardware | Deactivate all LEDs |
| `DRAWER_OPENED` | Hardware → Server | Drawer open detection |
| `DRAWER_CLOSED` | Hardware → Server | Drawer close detection |
| `WEIGHT_UPDATE` | Hardware → Server | Weight change detected |
| `HEARTBEAT` | Hardware → Server | Connection health check |

---

## 4. Data Collection & Logging

### 4.1 Collected Data Points

| Data Type | Source | Frequency | Purpose |
|-----------|--------|-----------|---------|
| Medication Dispense Events | Web Interface | Per interaction | Track medication administration |
| Drawer Open/Close Events | Reed Switches | Real-time | Verify physical access |
| Weight Measurements | HX711 Load Cells | 1 Hz | Inventory tracking, verification |
| Caregiver Authentication | Login System | Per session | Access control, audit trail |
| Timestamp Data | System Clock | Per event | Temporal analysis |

### 4.2 Database Schema (Key Entities)

```
MedicationLog
├── id (UUID)
├── patientMedicationId (FK)
├── caregiverId (FK)
├── scheduledTime (DateTime)
├── actualTime (DateTime)
├── status (PENDING | TAKEN | MISSED | SKIPPED)
├── drawerOpened (Boolean)
├── verifiedByWeight (Boolean)
└── createdAt (DateTime)

Drawer
├── id (UUID)
├── label (String: "A1", "A2", etc.)
├── currentWeight (Float)
├── emptyWeight (Float)
├── pillWeight (Float)
├── status (IDLE | ACTIVE | OPEN | LOW_STOCK | EMPTY)
└── lastUpdated (DateTime)
```

---

## 5. System Accuracy & Calibration

### 5.1 Weight Sensor Calibration

The HX711 load cell amplifier requires calibration using known weights:

1. **Tare Calibration**: Empty drawer weight recorded as baseline
2. **Scale Factor**: Determined using known reference weights
3. **Pill Weight Registration**: Individual medication weight recorded during setup

**Calibration Formula:**
```
Actual Weight = (Raw ADC Value - Tare Offset) / Scale Factor
Pill Count = (Current Weight - Empty Weight) / Individual Pill Weight
```

### 5.2 System Tolerances

| Parameter | Tolerance | Notes |
|-----------|-----------|-------|
| Weight Measurement | ± 2 grams | Dependent on load cell quality |
| Pill Count Accuracy | ± 1 pill | For pills > 5g each |
| Event Detection Latency | < 100 ms | WebSocket round-trip |
| LED Response Time | < 50 ms | From command to illumination |

---

## 6. Security Considerations

### 6.1 Implemented Security Measures

| Measure | Implementation | Purpose |
|---------|----------------|---------|
| Authentication | JWT-based sessions | User identity verification |
| Password Storage | bcrypt hashing | Credential protection |
| Role-Based Access | CAREGIVER, PATIENT, ADMIN | Permission control |
| HTTPS | TLS 1.3 (production) | Data encryption in transit |
| Input Validation | Server-side sanitization | Injection prevention |

### 6.2 HIPAA Compliance Considerations

For healthcare research applications, consider:
- Patient data anonymization for research datasets
- Audit logging for all data access
- Data retention policies
- Encrypted storage for Protected Health Information (PHI)

---

## 7. Experimental Setup Guidelines

### 7.1 Hardware Assembly

1. Mount load cells beneath each drawer compartment
2. Connect HX711 amplifiers to ESP32 GPIO pins
3. Install reed switches on drawer frames with corresponding magnets
4. Route LED strip along drawer fronts
5. Ensure stable 5V power supply for LEDs

### 7.2 Software Deployment

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Initialize database
npx prisma migrate dev

# Start development server
npm run dev

# Start WebSocket server (separate terminal)
node ws-server.js
```

### 7.3 Calibration Procedure

1. Power on system and allow 5-minute warm-up
2. Execute tare calibration with empty drawers
3. Place known weight (100g recommended) for scale factor calibration
4. Register individual pill weights for each medication
5. Verify accuracy with test dispensing cycles

---

## 8. Research Applications

### 8.1 Potential Research Areas

| Research Domain | Application |
|-----------------|-------------|
| Healthcare Informatics | Medication adherence tracking systems |
| IoT in Healthcare | Real-time monitoring implementation |
| Human-Computer Interaction | Caregiver workflow optimization |
| Embedded Systems | Sensor integration methodologies |
| Data Analytics | Dispensing pattern analysis |
| Patient Safety | Medication error prevention |

### 8.2 Measurable Outcomes

- **Medication Adherence Rate**: Percentage of scheduled doses administered on time
- **Dispensing Accuracy**: Weight-verified correct medication selection
- **Caregiver Efficiency**: Time reduction in medication rounds
- **Error Prevention**: Near-miss and error event logging
- **System Reliability**: Uptime and connection stability metrics

---

## 9. Limitations & Constraints

### 9.1 Technical Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Wi-Fi Dependency | System offline if network fails | Local caching, offline mode (future) |
| Single Microcontroller | Single point of failure | Watchdog timer, auto-restart |
| Load Cell Drift | Accuracy degradation over time | Periodic recalibration |
| Concurrent Users | Performance under high load | Load balancing (production) |

### 9.2 Scope Limitations

- System designed for controlled healthcare facility environments
- Requires stable power supply and network connectivity
- Not intended for patient self-administration without supervision
- Weight-based verification less accurate for very light medications (< 5g)

---

## 10. Ethical Considerations

### 10.1 Research Ethics

When conducting research with this system:

1. **Informed Consent**: Obtain consent from all participants (caregivers, patients)
2. **Data Privacy**: Anonymize all identifiable information in research datasets
3. **IRB Approval**: Seek Institutional Review Board approval for human subjects research
4. **Data Security**: Implement appropriate safeguards for healthcare data
5. **Transparency**: Clearly communicate system capabilities and limitations

### 10.2 Patient Safety

- System serves as an assistive tool, not a replacement for clinical judgment
- Critical medication decisions should involve healthcare professionals
- System alerts should be treated as advisory, not definitive

---

## 11. References & Standards

### 11.1 Relevant Standards

| Standard | Description |
|----------|-------------|
| IEEE 11073 | Health informatics - Personal health device communication |
| HL7 FHIR | Healthcare data interoperability |
| IEC 62443 | Industrial communication network security |
| ISO 27001 | Information security management |
| HIPAA | Health Insurance Portability and Accountability Act |

### 11.2 Component Datasheets

- ESP32-WROOM-32 Technical Reference Manual (Espressif)
- HX711 24-Bit Analog-to-Digital Converter Datasheet (Avia Semiconductor)
- WS2812B Intelligent Control LED Datasheet (WorldSemi)

---

## 12. Suggested Methodology Section Template

Below is a template researchers can adapt for their methodology sections:

---

### Materials and Methods

#### System Architecture

The medication monitoring system employed in this study consists of two primary components: (1) a web-based central monitoring dashboard and (2) an IoT-enabled smart storage unit. The web application was developed using Next.js 16 with TypeScript, providing a responsive interface for caregiver interactions and real-time medication tracking.

#### Hardware Implementation

The smart storage unit utilized an ESP32-WROOM-32 microcontroller (Espressif Systems) as the central processing unit. Weight sensing was achieved through HX711 load cell amplifiers connected to 5kg strain gauge load cells, providing 24-bit resolution for accurate medication inventory tracking. Drawer state detection employed normally-open reed switches triggered by magnetic proximity. Visual guidance for caregivers was implemented using WS2812B addressable RGB LED strips.

#### Communication Protocol

Real-time bidirectional communication between the web server and hardware unit was established via WebSocket protocol. The system transmitted drawer events (open/close), weight measurements, and LED control commands with an average latency of <100ms.

#### Data Collection

The system logged medication dispensing events including: scheduled administration time, actual administration time, drawer access events, weight-verified inventory changes, and caregiver identification. All timestamps were recorded in UTC format with millisecond precision.

#### Calibration

Prior to data collection, load cells were calibrated using the two-point calibration method with known reference weights. Individual medication pill weights were registered to enable pill count estimation from weight measurements.

---

## 13. Contact & Repository Information

**Repository**: https://github.com/Theo12335/MedsMonitor

**Web Interface URL**: (https://meds-monitor.vercel.app/)

**Hardware Communication Port**: WebSocket (default: 8080)

---

*This document is intended to supplement research methodology sections. Researchers should verify all specifications against actual implementation and adapt content to their specific study requirements.*
