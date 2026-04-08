import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, InventoryItem, RestockLog } from "@/types";

/**
 * Inventory Management API
 *
 * GET /api/inventory - List inventory items
 * POST /api/inventory/restock - Record restock action
 *
 * TODO: Implement database integration
 * - Connect to database
 * - Add pagination
 * - Implement low stock alerts and notifications
 * - Add automatic reorder suggestions
 * - Track restock history
 * - Integrate with hardware API for real-time stock levels
 * - Add expiration date tracking
 * - Implement batch and lot number tracking
 */

// Mock data - replace with database
const mockInventory: InventoryItem[] = [
  {
    medicationId: "med_1",
    medication: {
      id: "med_1",
      name: "Aspirin",
      dosage: "100mg",
      drawerLocation: "A1",
      currentStock: 45,
      minimumStock: 20,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-02-05"),
    },
    drawer: {
      id: "drawer_A1",
      label: "A1",
      medicationId: "med_1",
      currentWeight: 450,
      emptyWeight: 50,
      pillWeight: 10,
      estimatedPillCount: 45,
      minimumPillCount: 20,
      status: "idle",
      ledActive: false,
      lastUpdated: new Date("2025-02-05"),
    },
    currentStock: 45,
    minimumStock: 20,
    lastRestocked: new Date("2025-02-01"),
    needsRestock: false,
  },
  {
    medicationId: "med_2",
    medication: {
      id: "med_2",
      name: "Metformin",
      dosage: "500mg",
      drawerLocation: "B1",
      currentStock: 8,
      minimumStock: 15,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-02-05"),
    },
    drawer: {
      id: "drawer_B1",
      label: "B1",
      medicationId: "med_2",
      currentWeight: 80,
      emptyWeight: 50,
      pillWeight: 10,
      estimatedPillCount: 8,
      minimumPillCount: 15,
      status: "low_stock",
      ledActive: false,
      lastUpdated: new Date("2025-02-05"),
    },
    currentStock: 8,
    minimumStock: 15,
    lastRestocked: new Date("2025-01-20"),
    needsRestock: true,
  },
];

const mockRestockLogs: RestockLog[] = [
  {
    id: "restock_1",
    drawerId: "drawer_A1",
    medicationId: "med_1",
    previousCount: 25,
    newCount: 50,
    restockedBy: "caregiver_1",
    createdAt: new Date("2025-02-01"),
  },
];

/**
 * GET /api/inventory
 * List inventory items with filtering
 *
 * Query parameters:
 * - lowStock: Filter items needing restock (true/false)
 * - drawerId: Filter by drawer
 * - medicationId: Filter by medication
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lowStock = searchParams.get("lowStock");
    const drawerId = searchParams.get("drawerId");
    const medicationId = searchParams.get("medicationId");

    // TODO: Replace with database query
    // const inventory = await prisma.medication.findMany({
    //   where: {
    //     ...(lowStock === 'true' && { currentStock: { lt: prisma.medication.fields.minimumStock } }),
    //     ...(medicationId && { id: medicationId }),
    //     drawer: {
    //       ...(drawerId && { id: drawerId }),
    //     },
    //   },
    //   include: {
    //     drawer: true,
    //   },
    // });

    let filteredInventory = [...mockInventory];

    if (lowStock === "true") {
      filteredInventory = filteredInventory.filter(item => item.needsRestock);
    }

    if (drawerId) {
      filteredInventory = filteredInventory.filter(
        item => item.drawer.id === drawerId
      );
    }

    if (medicationId) {
      filteredInventory = filteredInventory.filter(
        item => item.medicationId === medicationId
      );
    }

    return NextResponse.json<ApiResponse<InventoryItem[]>>({
      success: true,
      data: filteredInventory,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch inventory",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/restock
 * Record a restock action
 *
 * Request body:
 * {
 *   drawerId: string;
 *   medicationId: string;
 *   newCount: number;
 *   restockedBy: string; // caregiverId
 *   notes?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drawerId, medicationId, newCount, restockedBy, notes } = body;

    if (!drawerId || !medicationId || !newCount || !restockedBy) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "drawerId, medicationId, newCount, and restockedBy are required",
        },
        { status: 400 }
      );
    }

    // TODO: Validate that newCount is reasonable
    if (newCount < 0 || newCount > 100) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid count value",
        },
        { status: 400 }
      );
    }

    // TODO: Find current inventory item
    const inventoryItem = mockInventory.find(
      item => item.drawer.id === drawerId && item.medicationId === medicationId
    );

    if (!inventoryItem) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Inventory item not found",
        },
        { status: 404 }
      );
    }

    const previousCount = inventoryItem.currentStock;

    // TODO: Replace with database transaction
    // await prisma.$transaction([
    //   prisma.medication.update({
    //     where: { id: medicationId },
    //     data: { currentStock: newCount },
    //   }),
    //   prisma.drawer.update({
    //     where: { id: drawerId },
    //     data: {
    //       estimatedPillCount: newCount,
    //       currentWeight: newCount * pillWeight + emptyWeight,
    //       status: newCount < minimumPillCount ? 'low_stock' : 'idle',
    //     },
    //   }),
    //   prisma.restockLog.create({
    //     data: {
    //       drawerId,
    //       medicationId,
    //       previousCount,
    //       newCount,
    //       restockedBy,
    //       notes,
    //     },
    //   }),
    // ]);

    // Update mock data
    inventoryItem.currentStock = newCount;
    inventoryItem.drawer.estimatedPillCount = newCount;
    inventoryItem.lastRestocked = new Date();
    inventoryItem.needsRestock = newCount < inventoryItem.minimumStock;

    const restockLog: RestockLog = {
      id: `restock_${Date.now()}`,
      drawerId,
      medicationId,
      previousCount,
      newCount,
      restockedBy,
      createdAt: new Date(),
    };

    mockRestockLogs.push(restockLog);

    // TODO: Send notification to relevant caregivers
    // TODO: Update hardware system with new weight expectations

    return NextResponse.json<ApiResponse<RestockLog>>(
      {
        success: true,
        data: restockLog,
        message: "Inventory restocked successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error restocking inventory:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to restock inventory",
      },
      { status: 500 }
    );
  }
}

/**
 * Future endpoints to implement:
 *
 * GET /api/inventory/alerts
 * - Get all items needing attention (low stock, expiring soon)
 * - Send automated alerts to caregivers/admin
 *
 * GET /api/inventory/history
 * - View restock history for specific medication or drawer
 * - Analyze usage patterns for better stock management
 *
 * POST /api/inventory/adjust
 * - Manual inventory adjustment (for corrections)
 * - Requires admin authorization
 *
 * GET /api/inventory/expiration
 * - Track medications approaching expiration
 * - Alert caregivers to use or remove expiring stock
 */
