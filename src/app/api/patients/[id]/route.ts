import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Patient } from "@/types";

/**
 * Patient Detail API
 *
 * GET /api/patients/[id] - Get patient by ID
 * PUT /api/patients/[id] - Update patient
 * DELETE /api/patients/[id] - Delete patient
 *
 * TODO: Implement database integration
 * - Connect to database
 * - Add proper validation
 * - Implement authentication/authorization
 * - Add audit logging for updates/deletes
 * - Implement soft delete vs hard delete
 */

// Mock data - in production, this would be in a database
const mockPatients: Map<string, Patient> = new Map([
  [
    "patient_1",
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
  ],
]);

/**
 * GET /api/patients/[id]
 * Get a specific patient by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with database query
    // const patient = await prisma.patient.findUnique({
    //   where: { id },
    //   include: {
    //     medications: true,
    //     assignedCaregivers: true,
    //     medicationLogs: {
    //       orderBy: { scheduledTime: 'desc' },
    //       take: 10,
    //     },
    //   },
    // });

    const patient = mockPatients.get(id);

    if (!patient) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Patient>>({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to fetch patient",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patients/[id]
 * Update a patient
 *
 * Request body:
 * {
 *   name?: string;
 *   email?: string;
 *   roomNumber?: string;
 *   assignedCaregivers?: string[];
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Add validation
    // TODO: Check authorization - only admin or assigned caregiver should update

    const patient = mockPatients.get(id);

    if (!patient) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 }
      );
    }

    // TODO: Replace with database update
    // const updatedPatient = await prisma.patient.update({
    //   where: { id },
    //   data: {
    //     ...body,
    //     updatedAt: new Date(),
    //   },
    // });

    const updatedPatient: Patient = {
      ...patient,
      ...body,
      updatedAt: new Date(),
    };

    mockPatients.set(id, updatedPatient);

    return NextResponse.json<ApiResponse<Patient>>({
      success: true,
      data: updatedPatient,
      message: "Patient updated successfully",
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to update patient",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/[id]
 * Delete a patient
 *
 * TODO: Consider implementing soft delete instead
 * TODO: Add check for existing medication schedules
 * TODO: Implement proper authorization (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const patient = mockPatients.get(id);

    if (!patient) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 }
      );
    }

    // TODO: Replace with database delete (or soft delete)
    // await prisma.patient.update({
    //   where: { id },
    //   data: { deletedAt: new Date() }, // Soft delete
    // });
    // OR
    // await prisma.patient.delete({
    //   where: { id },
    // });

    mockPatients.delete(id);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Failed to delete patient",
      },
      { status: 500 }
    );
  }
}
