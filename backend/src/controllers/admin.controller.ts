import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { getAdminKpiSummary, listUsersForAdmin } from "@/services/admin.service";
import {
  isValidCaregiverStatus,
  listCaregiversByVerificationStatus,
  updateCaregiverVerificationStatus,
} from "@/services/caregiver.service";
import { isValidObjectId } from "@/services/booking.service";

interface UpdateCaregiverVerificationRequestBody {
  caregiverId?: string;
  verificationStatus?: string;
}

export async function updateCaregiverVerificationController(request: Request) {
  const authResult = authenticateRequest(request, ["admin"]);

  if (authResult.response) {
    return authResult.response;
  }

  if (!authResult.auth) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  let body: UpdateCaregiverVerificationRequestBody;

  try {
    body = (await request.json()) as UpdateCaregiverVerificationRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const caregiverId = body.caregiverId?.trim();
  const verificationStatus = body.verificationStatus?.trim();

  if (!caregiverId || !verificationStatus) {
    return NextResponse.json(
      {
        success: false,
        message: "caregiverId and verificationStatus are required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(caregiverId)) {
    return NextResponse.json(
      {
        success: false,
        message: "caregiverId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  if (!isValidCaregiverStatus(verificationStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: "verificationStatus must be pending, verified, or rejected",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const updatedCaregiver = await updateCaregiverVerificationStatus({
      caregiverId,
      verificationStatus,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Caregiver verification updated successfully",
        data: updatedCaregiver,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "CAREGIVER_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          message: "CAREGIVER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update caregiver verification",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function listPendingCaregiversController(request: Request) {
  const authResult = authenticateRequest(request, ["admin"]);

  if (authResult.response) {
    return authResult.response;
  }

  if (!authResult.auth) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    const pendingCaregivers = await listCaregiversByVerificationStatus("pending");

    return NextResponse.json(
      {
        success: true,
        message: "Pending caregivers fetched successfully",
        data: pendingCaregivers,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pending caregivers",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function listUsersController(request: Request) {
  const authResult = authenticateRequest(request, ["admin"]);

  if (authResult.response) {
    return authResult.response;
  }

  if (!authResult.auth) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    const users = await listUsersForAdmin();

    return NextResponse.json(
      {
        success: true,
        message: "Users fetched successfully",
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function getKpiSummaryController(request: Request) {
  const authResult = authenticateRequest(request, ["admin"]);

  if (authResult.response) {
    return authResult.response;
  }

  if (!authResult.auth) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    const kpis = await getAdminKpiSummary();

    return NextResponse.json(
      {
        success: true,
        message: "KPI summary fetched successfully",
        data: kpis,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch KPI summary",
        error: message,
      },
      { status: 500 }
    );
  }
}