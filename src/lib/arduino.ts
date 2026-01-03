/**
 * Arduino Communication Module
 *
 * This module provides utilities for communicating with the Arduino-based
 * Smart Storage unit. It supports both WebSocket and Serial communication.
 *
 * For the hardware setup, you'll need:
 * - ESP32 or Arduino with WiFi module (ESP8266)
 * - Load cells (HX711) for weight sensing
 * - LED strips or individual LEDs for drawer indicators
 * - Reed switches or limit switches for drawer open/close detection
 *
 * Communication Protocol:
 * - JSON-based messages over WebSocket
 * - Arduino connects as a WebSocket client to this server
 *
 * TODO: Implement actual WebSocket server
 * This is scaffolding - actual implementation depends on your network setup
 */

import { ArduinoCommand, HardwareMessage, DrawerStatus } from "@/types";

// Configuration
const ARDUINO_CONFIG = {
  // WebSocket settings
  wsPort: 8080,
  wsPath: "/arduino",

  // Serial settings (for USB connection)
  serialBaudRate: 115200,

  // Heartbeat interval in ms
  heartbeatInterval: 5000,

  // Timeout before marking device as disconnected
  connectionTimeout: 15000,
};

// Event callbacks
type DrawerEventCallback = (drawerId: string, status: DrawerStatus) => void;
type WeightUpdateCallback = (drawerId: string, weight: number, pillCount: number) => void;
type ConnectionCallback = (connected: boolean) => void;

interface ArduinoClientState {
  isConnected: boolean;
  lastHeartbeat: Date | null;
  drawerStates: Map<string, DrawerStatus>;
  activeDrawer: string | null;
}

/**
 * Arduino Communication Client
 *
 * Usage:
 * ```typescript
 * const arduino = new ArduinoClient();
 *
 * arduino.onDrawerEvent((drawerId, status) => {
 *   if (status === 'open') {
 *     console.log(`Drawer ${drawerId} was opened`);
 *   }
 * });
 *
 * arduino.onWeightUpdate((drawerId, weight, pillCount) => {
 *   console.log(`Drawer ${drawerId}: ${pillCount} pills remaining`);
 * });
 *
 * // Light up a drawer
 * arduino.lightDrawer('A1');
 *
 * // Turn off all LEDs
 * arduino.resetLights();
 * ```
 */
class ArduinoClient {
  private state: ArduinoClientState = {
    isConnected: false,
    lastHeartbeat: null,
    drawerStates: new Map(),
    activeDrawer: null,
  };

  private drawerCallbacks: DrawerEventCallback[] = [];
  private weightCallbacks: WeightUpdateCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];

  // WebSocket connection (to be implemented)
  private ws: WebSocket | null = null;

  constructor() {
    // Initialize drawer states
    const drawerIds = ["A1", "A2", "A3", "B1", "B2", "B3"];
    drawerIds.forEach((id) => {
      this.state.drawerStates.set(id, "idle");
    });
  }

  /**
   * Connect to the Arduino device
   * TODO: Implement actual WebSocket connection
   */
  async connect(): Promise<boolean> {
    console.log("ArduinoClient: Attempting to connect...");

    // Scaffolding - simulate connection
    // In production, this would establish a WebSocket connection

    try {
      // TODO: Implement WebSocket connection
      // this.ws = new WebSocket(`ws://arduino-ip:${ARDUINO_CONFIG.wsPort}${ARDUINO_CONFIG.wsPath}`);

      // For now, simulate successful connection
      this.state.isConnected = true;
      this.state.lastHeartbeat = new Date();

      this.connectionCallbacks.forEach((cb) => cb(true));

      // Start heartbeat check
      this.startHeartbeatCheck();

      return true;
    } catch (error) {
      console.error("ArduinoClient: Connection failed", error);
      return false;
    }
  }

  /**
   * Disconnect from the Arduino device
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state.isConnected = false;
    this.connectionCallbacks.forEach((cb) => cb(false));
  }

  /**
   * Send a command to light up a specific drawer LED
   */
  lightDrawer(drawerId: string): void {
    const command: ArduinoCommand = {
      command: "LIGHT_DRAWER",
      drawerId,
    };

    this.sendCommand(command);
    this.state.activeDrawer = drawerId;
    this.state.drawerStates.set(drawerId, "active");

    // Notify callbacks
    this.drawerCallbacks.forEach((cb) => cb(drawerId, "active"));
  }

  /**
   * Turn off all drawer LEDs
   */
  resetLights(): void {
    const command: ArduinoCommand = {
      command: "RESET_LIGHTS",
    };

    this.sendCommand(command);
    this.state.activeDrawer = null;

    // Reset all drawer states to idle
    this.state.drawerStates.forEach((_, key) => {
      this.state.drawerStates.set(key, "idle");
    });
  }

  /**
   * Request weight readings from all drawers
   */
  requestWeights(): void {
    const command: ArduinoCommand = {
      command: "REQUEST_WEIGHTS",
    };

    this.sendCommand(command);
  }

  /**
   * Calibrate a specific drawer's weight sensor
   */
  calibrateDrawer(drawerId: string, emptyWeight: number, pillWeight: number): void {
    const command: ArduinoCommand = {
      command: "CALIBRATE",
      drawerId,
      params: { emptyWeight, pillWeight },
    };

    this.sendCommand(command);
  }

  /**
   * Register callback for drawer events (open/close)
   */
  onDrawerEvent(callback: DrawerEventCallback): void {
    this.drawerCallbacks.push(callback);
  }

  /**
   * Register callback for weight updates
   */
  onWeightUpdate(callback: WeightUpdateCallback): void {
    this.weightCallbacks.push(callback);
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): void {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Get current connection status
   */
  isConnected(): boolean {
    return this.state.isConnected;
  }

  /**
   * Get the currently active (lit) drawer
   */
  getActiveDrawer(): string | null {
    return this.state.activeDrawer;
  }

  /**
   * Get drawer status
   */
  getDrawerStatus(drawerId: string): DrawerStatus {
    return this.state.drawerStates.get(drawerId) || "idle";
  }

  /**
   * Handle incoming message from Arduino
   */
  private handleMessage(message: HardwareMessage): void {
    switch (message.type) {
      case "DRAWER_OPENED":
        if (message.drawerId) {
          this.state.drawerStates.set(message.drawerId, "open");
          this.drawerCallbacks.forEach((cb) => cb(message.drawerId!, "open"));
        }
        break;

      case "DRAWER_CLOSED":
        if (message.drawerId) {
          // If this was the active drawer, turn off the LED
          if (this.state.activeDrawer === message.drawerId) {
            this.state.activeDrawer = null;
          }
          this.state.drawerStates.set(message.drawerId, "idle");
          this.drawerCallbacks.forEach((cb) => cb(message.drawerId!, "idle"));
        }
        break;

      case "WEIGHT_UPDATE":
        if (message.drawerId && message.payload) {
          const { weight = 0, pillCount = 0 } = message.payload;
          this.weightCallbacks.forEach((cb) =>
            cb(message.drawerId!, weight, pillCount)
          );
        }
        break;

      case "LOW_STOCK_ALERT":
        if (message.drawerId) {
          this.state.drawerStates.set(message.drawerId, "low_stock");
          this.drawerCallbacks.forEach((cb) => cb(message.drawerId!, "low_stock"));
        }
        break;

      case "HEARTBEAT":
        this.state.lastHeartbeat = new Date();
        break;
    }
  }

  /**
   * Send command to Arduino
   */
  private sendCommand(command: ArduinoCommand): void {
    if (!this.state.isConnected) {
      console.warn("ArduinoClient: Not connected, command not sent");
      return;
    }

    const message = JSON.stringify(command);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Scaffolding: Log command for development
      console.log("ArduinoClient: Would send command:", command);
    }
  }

  /**
   * Start heartbeat checking
   */
  private startHeartbeatCheck(): void {
    setInterval(() => {
      if (this.state.lastHeartbeat) {
        const timeSinceLastHeartbeat = Date.now() - this.state.lastHeartbeat.getTime();
        if (timeSinceLastHeartbeat > ARDUINO_CONFIG.connectionTimeout) {
          this.state.isConnected = false;
          this.connectionCallbacks.forEach((cb) => cb(false));
        }
      }
    }, ARDUINO_CONFIG.heartbeatInterval);
  }
}

// Singleton instance
export const arduinoClient = new ArduinoClient();

// Export configuration for reference
export { ARDUINO_CONFIG };

/**
 * Arduino Code Reference
 *
 * Here's a basic Arduino sketch structure for the ESP32:
 *
 * ```cpp
 * #include <WiFi.h>
 * #include <WebSocketsClient.h>
 * #include <ArduinoJson.h>
 * #include "HX711.h"
 *
 * // WiFi credentials
 * const char* ssid = "YOUR_SSID";
 * const char* password = "YOUR_PASSWORD";
 *
 * // Server address
 * const char* serverAddress = "192.168.1.100";
 * const int serverPort = 8080;
 *
 * WebSocketsClient webSocket;
 *
 * // LED pins for each drawer
 * const int LED_PINS[] = {2, 4, 5, 18, 19, 21};
 * const int NUM_DRAWERS = 6;
 *
 * // HX711 pins (weight sensors)
 * const int HX711_DOUT_PINS[] = {32, 33, 25, 26, 27, 14};
 * const int HX711_SCK_PINS[] = {15, 15, 15, 15, 15, 15};
 *
 * // Reed switch pins (drawer open detection)
 * const int REED_PINS[] = {34, 35, 36, 39, 22, 23};
 *
 * void setup() {
 *   Serial.begin(115200);
 *
 *   // Initialize LEDs
 *   for (int i = 0; i < NUM_DRAWERS; i++) {
 *     pinMode(LED_PINS[i], OUTPUT);
 *     digitalWrite(LED_PINS[i], LOW);
 *   }
 *
 *   // Initialize reed switches
 *   for (int i = 0; i < NUM_DRAWERS; i++) {
 *     pinMode(REED_PINS[i], INPUT_PULLUP);
 *   }
 *
 *   // Connect to WiFi
 *   WiFi.begin(ssid, password);
 *   while (WiFi.status() != WL_CONNECTED) {
 *     delay(500);
 *   }
 *
 *   // Connect to WebSocket server
 *   webSocket.begin(serverAddress, serverPort, "/arduino");
 *   webSocket.onEvent(webSocketEvent);
 * }
 *
 * void loop() {
 *   webSocket.loop();
 *   checkDrawerStates();
 *   sendHeartbeat();
 * }
 * ```
 */
