import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, DrawerFillReading, DrawerFillStatus } from "@/types";

/**
 * Drawer Fill Status API
 *
 * GET /api/drawer-fill - Get current fill status for all drawers
 * POST /api/drawer-fill/reading - Record new fill reading from hardware
 *
 * TODO: Implement database integration
 * - Connect to database for persistent storage
 * - Add historical tracking of fill levels
 * - Implement predictive analytics for refill scheduling
 * - Add alerts for critical low levels
 * - Track fill rate trends (how fast medications are being used)
 * - Integrate with hardware sensors for automatic readings
 * - Add anomaly detection (sudden drops indicating malfunction)
 */

// Helper function to calculate fill status from percentage
function calculateFillStatus(fillPercentage: number): DrawerFillStatus {
  if (fillPercentage >= 70) return "full";
  if (fillPercentage >= 30) return "mid";
  return "empty";
}

// Mock data - replace with database
const mockDrawerFillData: Map<string, DrawerFillReading> = new Map([
  [
    "A1",
    {
      id: "reading_A1_latest",
      drawerId: "A1",
      fillStatus: "full",
      fillPercentage: 90,
      timestamp: new Date(),
    },
  ],
  [
    "A2",
    {
      id: "reading_A2_latest",
      drawerId: "A2",
      fillStatus: "full",
      fillPercentage: 85,
      timestamp: new Date(),
    },
  ],
  [
    "A3",
    {
      id: "reading_A3_latest",
      drawerId: "A3",
      fillStatus: "mid",
      fillPercentage: 55,
      timestamp: new Date(),
    },
  ],
  [
    "B1",
    {
      id: "reading_B1_latest",
      drawerId: "B1",
      fillStatus: "empty",
      fillPercentage: 18,
      timestamp: new Date(),
    },
  ],
  [
    "B2",
    {
      id: "reading_B2_latest",
      drawerId: "B2",
      fillStatus: "full",
      fillPercentage: 90,
      timestamp: new Date(),
    },
  ],
  [
    "B3",
    {
      id: "reading_B3_latest",
      drawerId: "B3",
      fillStatus: "mid",
      fillPercentage: 45,
      timestamp: new Date(),
    },
  ],
]);

// Historical readings for analytics
const mockHistoricalReadings: DrawerFillReading[] = [];

/**
 * GET /api/drawer-fill
 * Get current fill status for all drawers
 *
 * Query parameters:
 * - drawerId: Get status for specific drawer
 * - status: Filter by fill status (full/mid/empty)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const drawerId = searchParams.get("drawerId");
    const statusFilter = searchParams.get("status") as DrawerFillStatus | null;

    // TODO: Replace with database query
    // const readings = await prisma.drawerFillReading.findMany({
    //   where: {
    //     ...(drawerId && { drawerId }),
    //     ...(statusFilter && { fillStatus: statusFilter }),
    //     // Get only latest reading per drawer
    //     id: {
    //       in: await prisma.drawerFillReading.groupBy({
    //         by: ['drawerId'],
    //         _max: { timestamp: true },
    //       }).then(groups => groups.map(g => g.id)),
    //     },
    //   },
    //   include: {
    //     drawer: {
    //       include: { medication: true },
    //     },
    //   },
    //   orderBy: { timestamp: 'desc' },
    // });

    let readings = Array.from(mockDrawerFillData.values());

    if (drawerId) {
      const reading = mockDrawerFillData.get(drawerId);
      readings = reading ? [reading] : [];
    }

    if (statusFilter) {
      readings = readings.filter(r => r.fillStatus === statusFilter);
    }

    return NextResponse.json<ApiResponse<DrawerFillReading[]>>({
      success: true,
      data: readings,
    });
  } catch (error) {
    console.error("Error fetching drawer fill status:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch drawer fill status",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drawer-fill/reading
 * Record a new fill reading from hardware
 *
 * This endpoint would typically be called by:
 * - Arduino/hardware sensors (via WebSocket or HTTP)
 * - Manual readings from caregiver interface
 * - Automated scheduled checks
 *
 * Request body:
 * {
 *   drawerId: string;
 *   fillPercentage: number; // 0-100
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drawerId, fillPercentage } = body;

    if (!drawerId || fillPercentage === undefined) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "drawerId and fillPercentage are required",
        },
        { status: 400 }
      );
    }

    if (fillPercentage < 0 || fillPercentage > 100) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "fillPercentage must be between 0 and 100",
        },
        { status: 400 }
      );
    }

    const fillStatus = calculateFillStatus(fillPercentage);

    // TODO: Replace with database insert
    // const newReading = await prisma.drawerFillReading.create({
    //   data: {
    //     drawerId,
    //     fillPercentage,
    //     fillStatus,
    //     timestamp: new Date(),
    //   },
    //   include: {
    //     drawer: {
    //       include: { medication: true },
    //     },
    //   },
    // });

    const newReading: DrawerFillReading = {
      id: `reading_${drawerId}_${Date.now()}`,
      drawerId,
      fillPercentage,
      fillStatus,
      timestamp: new Date(),
    };

    // Update current reading
    mockDrawerFillData.set(drawerId, newReading);

    // Store in history
    mockHistoricalReadings.push(newReading);

    // TODO: Check if fill status changed and send alerts
    // if (fillStatus === "empty") {
    //   await sendLowStockAlert(drawerId);
    // }

    // TODO: Update hardware API state
    // TODO: Send WebSocket notification to connected clients

    return NextResponse.json<ApiResponse<DrawerFillReading>>(
      {
        success: true,
        data: newReading,
        message: "Fill reading recorded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording fill reading:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to record fill reading",
      },
      { status: 500 }
    );
  }
}

/**
 * Future endpoints to implement:
 *
 * GET /api/drawer-fill/history
 * - Get historical fill readings for a drawer
 * - Analyze usage patterns and trends
 * - Parameters: drawerId, startDate, endDate
 *
 * GET /api/drawer-fill/analytics
 * - Calculate average usage rate per medication
 * - Predict when refill will be needed
 * - Identify unusual consumption patterns
 *
 * GET /api/drawer-fill/alerts
 * - Get all drawers requiring attention
 * - Filter by urgency level
 * - Include estimated time until critical
 *
 * POST /api/drawer-fill/calibrate
 * - Calibrate sensors after refill
 * - Set baseline for full/empty readings
 * - Adjust for different medication types/sizes
 */
