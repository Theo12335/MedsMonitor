import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, HardwareMessage, DrawerStatus, DrawerFillStatus } from "@/types";

/**
 * Hardware API Endpoints
 *
 * These endpoints handle communication with the Arduino-based smart storage unit.
 *
 * GET /api/hardware - Get current status of all drawers
 * POST /api/hardware - Send command to hardware (light LED, etc.)
 *
 * TODO: Implement actual WebSocket server for real-time communication
 * This is scaffolding - in production, use WebSocket for bidirectional communication
 *
 * Recommended backend options for Arduino integration:
 *
 * 1. WebSocket Server (Recommended for real-time):
 *    - Use a separate Node.js server with 'ws' package
 *    - Or integrate with Next.js API routes using Server-Sent Events
 *
 * 2. MQTT (Good for IoT):
 *    - Use MQTT broker like Mosquitto
 *    - Arduino publishes/subscribes to topics
 *    - Next.js subscribes to same topics
 *
 * 3. HTTP Polling (Simple but less efficient):
 *    - Arduino polls this API periodically
 *    - Commands are queued and returned on poll
 */

// Helper function to calculate fill status from percentage
function calculateFillStatus(fillPercentage: number): DrawerFillStatus {
  if (fillPercentage >= 70) return "full";
  if (fillPercentage >= 30) return "mid";
  return "empty";
}

// In-memory state (replace with database/Redis in production)
interface HardwareState {
  drawers: Map<string, {
    status: DrawerStatus;
    ledActive: boolean;
    currentWeight: number;
    pillCount: number;
    fillPercentage: number;
    fillStatus: DrawerFillStatus;
    lastUpdated: Date;
  }>;
  isConnected: boolean;
  lastHeartbeat: Date | null;
  pendingCommands: HardwareMessage[];
}

const hardwareState: HardwareState = {
  drawers: new Map([
    ["A1", { status: "idle", ledActive: false, currentWeight: 450, pillCount: 45, fillPercentage: 90, fillStatus: "full", lastUpdated: new Date() }],
    ["A2", { status: "idle", ledActive: false, currentWeight: 425, pillCount: 43, fillPercentage: 85, fillStatus: "full", lastUpdated: new Date() }],
    ["A3", { status: "idle", ledActive: false, currentWeight: 275, pillCount: 28, fillPercentage: 55, fillStatus: "mid", lastUpdated: new Date() }],
    ["B1", { status: "low_stock", ledActive: false, currentWeight: 90, pillCount: 9, fillPercentage: 18, fillStatus: "empty", lastUpdated: new Date() }],
    ["B2", { status: "idle", ledActive: false, currentWeight: 450, pillCount: 45, fillPercentage: 90, fillStatus: "full", lastUpdated: new Date() }],
    ["B3", { status: "idle", ledActive: false, currentWeight: 225, pillCount: 23, fillPercentage: 45, fillStatus: "mid", lastUpdated: new Date() }],
  ]),
  isConnected: true, // Simulated connection
  lastHeartbeat: new Date(),
  pendingCommands: [],
};

/**
 * GET /api/hardware
 * Returns current status of all drawers and hardware connection
 */
export async function GET() {
  const drawersArray = Array.from(hardwareState.drawers.entries()).map(([id, data]) => ({
    id,
    ...data,
    lastUpdated: data.lastUpdated.toISOString(),
  }));

  return NextResponse.json<ApiResponse<{
    isConnected: boolean;
    lastHeartbeat: string | null;
    drawers: typeof drawersArray;
  }>>({
    success: true,
    data: {
      isConnected: hardwareState.isConnected,
      lastHeartbeat: hardwareState.lastHeartbeat?.toISOString() || null,
      drawers: drawersArray,
    },
  });
}

/**
 * POST /api/hardware
 * Send command to hardware
 *
 * Request body:
 * {
 *   action: "LIGHT_DRAWER" | "RESET_LIGHTS" | "REQUEST_WEIGHTS",
 *   drawerId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, drawerId } = body;

    if (!action) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "LIGHT_DRAWER":
        if (!drawerId) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "drawerId is required for LIGHT_DRAWER" },
            { status: 400 }
          );
        }

        // Reset all other drawers
        hardwareState.drawers.forEach((drawer, id) => {
          if (id !== drawerId) {
            drawer.ledActive = false;
            if (drawer.status === "active") {
              drawer.status = drawer.pillCount < 20 ? "low_stock" : "idle";
            }
          }
        });

        // Activate the target drawer
        const targetDrawer = hardwareState.drawers.get(drawerId);
        if (targetDrawer) {
          targetDrawer.ledActive = true;
          targetDrawer.status = "active";
          targetDrawer.lastUpdated = new Date();

          // Queue command for Arduino (would be sent via WebSocket in production)
          hardwareState.pendingCommands.push({
            type: "LED_ON",
            drawerId,
          });
        }

        return NextResponse.json<ApiResponse<{ message: string }>>({
          success: true,
          data: { message: `LED activated for drawer ${drawerId}` },
        });

      case "RESET_LIGHTS":
        hardwareState.drawers.forEach((drawer) => {
          drawer.ledActive = false;
          if (drawer.status === "active") {
            drawer.status = drawer.pillCount < 20 ? "low_stock" : "idle";
          }
        });

        hardwareState.pendingCommands.push({ type: "LED_OFF" });

        return NextResponse.json<ApiResponse<{ message: string }>>({
          success: true,
          data: { message: "All LEDs turned off" },
        });

      case "REQUEST_WEIGHTS":
        hardwareState.pendingCommands.push({ type: "STATUS_REQUEST" });

        return NextResponse.json<ApiResponse<{ message: string }>>({
          success: true,
          data: { message: "Weight request sent" },
        });

      case "SIMULATE_DISPENSE":
        // For testing: simulate drawer open/close and medication taken
        if (!drawerId) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "drawerId is required for SIMULATE_DISPENSE" },
            { status: 400 }
          );
        }

        const drawer = hardwareState.drawers.get(drawerId);
        if (drawer) {
          // Simulate taking one pill
          drawer.pillCount = Math.max(0, drawer.pillCount - 1);
          drawer.currentWeight = drawer.pillCount * 10; // Assuming 10g per pill
          drawer.ledActive = false;
          drawer.status = drawer.pillCount < 20 ? "low_stock" : "idle";
          drawer.lastUpdated = new Date();
        }

        return NextResponse.json<ApiResponse<{ message: string; newPillCount: number }>>({
          success: true,
          data: {
            message: `Dispense simulated for drawer ${drawerId}`,
            newPillCount: drawer?.pillCount || 0,
          },
        });

      default:
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Hardware API error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Arduino Integration Notes:
 *
 * For actual Arduino communication, you have several options:
 *
 * 1. WebSocket Server (separate from Next.js):
 *    ```javascript
 *    // server.js
 *    const WebSocket = require('ws');
 *    const wss = new WebSocket.Server({ port: 8080 });
 *
 *    wss.on('connection', (ws) => {
 *      console.log('Arduino connected');
 *
 *      ws.on('message', (message) => {
 *        const data = JSON.parse(message);
 *        // Handle drawer events, weight updates, etc.
 *      });
 *    });
 *    ```
 *
 * 2. Serial Communication (USB):
 *    ```javascript
 *    const SerialPort = require('serialport');
 *    const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });
 *
 *    port.on('data', (data) => {
 *      // Parse and handle Arduino data
 *    });
 *    ```
 *
 * 3. MQTT (for IoT scalability):
 *    ```javascript
 *    const mqtt = require('mqtt');
 *    const client = mqtt.connect('mqtt://broker-address');
 *
 *    client.subscribe('smartcare/drawers/#');
 *    client.on('message', (topic, message) => {
 *      // Handle messages
 *    });
 *    ```
 */
