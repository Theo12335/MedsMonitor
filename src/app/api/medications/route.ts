import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Medication, MedicationLog, MedicationStatus } from "@/types";

/**
 * Medications API
 *
 * GET /api/medications - List all medications
 * POST /api/medications - Create a new medication
 *
 * TODO: Implement database integration
 * This is scaffolding with mock data
 */

// Mock medication database
const mockMedications: Medication[] = [
  {
    id: "med_1",
    name: "Aspirin",
    dosage: "100mg",
    description: "Pain reliever and blood thinner",
    drawerLocation: "A1",
    currentStock: 45,
    minimumStock: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "med_2",
    name: "Metformin",
    dosage: "500mg",
    description: "Diabetes medication",
    drawerLocation: "B3",
    currentStock: 8,
    minimumStock: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "med_3",
    name: "Lisinopril",
    dosage: "10mg",
    description: "Blood pressure medication",
    drawerLocation: "A2",
    currentStock: 32,
    minimumStock: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "med_4",
    name: "Vitamin D",
    dosage: "1000 IU",
    description: "Vitamin supplement",
    drawerLocation: "B1",
    currentStock: 50,
    minimumStock: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "med_5",
    name: "Omeprazole",
    dosage: "20mg",
    description: "Acid reducer",
    drawerLocation: "B2",
    currentStock: 18,
    minimumStock: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "med_6",
    name: "Atorvastatin",
    dosage: "20mg",
    description: "Cholesterol medication",
    drawerLocation: "A3",
    currentStock: 28,
    minimumStock: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock medication logs
const mockMedicationLogs: MedicationLog[] = [];

/**
 * GET /api/medications
 * List all medications with optional filtering
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawer = searchParams.get("drawer");
  const lowStock = searchParams.get("lowStock") === "true";

  let medications = [...mockMedications];

  // Filter by drawer location
  if (drawer) {
    medications = medications.filter((m) => m.drawerLocation === drawer);
  }

  // Filter by low stock
  if (lowStock) {
    medications = medications.filter((m) => m.currentStock < m.minimumStock);
  }

  return NextResponse.json<ApiResponse<Medication[]>>({
    success: true,
    data: medications,
  });
}

/**
 * POST /api/medications
 * Create a new medication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dosage, description, drawerLocation, currentStock, minimumStock } = body;

    if (!name || !dosage || !drawerLocation) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Name, dosage, and drawer location are required" },
        { status: 400 }
      );
    }

    const newMedication: Medication = {
      id: `med_${Date.now()}`,
      name,
      dosage,
      description: description || "",
      drawerLocation,
      currentStock: currentStock || 0,
      minimumStock: minimumStock || 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Save to database
    mockMedications.push(newMedication);

    return NextResponse.json<ApiResponse<Medication>>(
      {
        success: true,
        data: newMedication,
        message: "Medication created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create medication error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
