import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Patient } from "@/types";

/**
 * Patient Management API
 *
 * GET /api/patients - List all patients (with optional filtering)
 * POST /api/patients - Create a new patient
 *
 * TODO: Implement database integration
 * - Connect to PostgreSQL/MongoDB/MySQL
 * - Add proper validation with Zod or similar
 * - Implement pagination
 * - Add search functionality (by name, room, etc.)
 * - Add filtering by caregiverId, roomNumber, admission date
 * - Add proper error handling and logging
 * - Implement authentication/authorization middleware
 */

// Mock data - replace with database queries
const mockPatients: Patient[] = [
  {
    id: "patient_1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "patient",
    roomNumber: "101A",
    admissionDate: new Date("2025-01-15"),
    assignedCaregivers: ["caregiver_1", "caregiver_2"],
    medications: [],
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "patient_2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    role: "patient",
    roomNumber: "102B",
    admissionDate: new Date("2025-01-20"),
    assignedCaregivers: ["caregiver_1"],
    medications: [],
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20"),
  },
];

/**
 * GET /api/patients
 * List all patients with optional filtering
 *
 * Query parameters:
 * - caregiverId: Filter by assigned caregiver
 * - roomNumber: Filter by room number
 * - page: Page number (default 1)
 * - limit: Items per page (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const caregiverId = searchParams.get("caregiverId");
    const roomNumber = searchParams.get("roomNumber");

    // TODO: Replace with actual database query
    // Example with Prisma:
    // const patients = await prisma.patient.findMany({
    //   where: {
    //     ...(caregiverId && { assignedCaregivers: { has: caregiverId } }),
    //     ...(roomNumber && { roomNumber }),
    //   },
    //   include: {
    //     medications: true,
    //     assignedCaregivers: true,
    //   },
    // });

    let filteredPatients = [...mockPatients];

    if (caregiverId) {
      filteredPatients = filteredPatients.filter(p =>
        p.assignedCaregivers.includes(caregiverId)
      );
    }

    if (roomNumber) {
      filteredPatients = filteredPatients.filter(p =>
        p.roomNumber === roomNumber
      );
    }

    return NextResponse.json<ApiResponse<Patient[]>>({
      success: true,
      data: filteredPatients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch patients",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * Create a new patient
 *
 * Request body:
 * {
 *   name: string;
 *   email: string;
 *   roomNumber: string;
 *   assignedCaregivers: string[];
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, roomNumber, assignedCaregivers } = body;

    // TODO: Add validation with Zod
    // const patientSchema = z.object({
    //   name: z.string().min(1),
    //   email: z.string().email(),
    //   roomNumber: z.string().min(1),
    //   assignedCaregivers: z.array(z.string()),
    // });

    if (!name || !email || !roomNumber) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Name, email, and roomNumber are required",
        },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database insert
    // const newPatient = await prisma.patient.create({
    //   data: {
    //     name,
    //     email,
    //     roomNumber,
    //     role: "patient",
    //     admissionDate: new Date(),
    //     assignedCaregivers: assignedCaregivers || [],
    //   },
    // });

    const newPatient: Patient = {
      id: `patient_${Date.now()}`,
      name,
      email,
      role: "patient",
      roomNumber,
      admissionDate: new Date(),
      assignedCaregivers: assignedCaregivers || [],
      medications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPatients.push(newPatient);

    return NextResponse.json<ApiResponse<Patient>>(
      {
        success: true,
        data: newPatient,
        message: "Patient created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to create patient",
      },
      { status: 500 }
    );
  }
}
