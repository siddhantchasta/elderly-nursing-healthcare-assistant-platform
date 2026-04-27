import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import {
  isValidComplaintStatus,
  listComplaints,
  updateComplaintStatus,
} from "@/services/complaint.service";
import {
  getAdminOverviewReport,
  getAdminKpiSummary,
  isValidUserRole,
  listUsersForAdmin,
  updateUserRole,
} from "@/services/admin.service";
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

interface UpdateComplaintStatusRequestBody {
  complaintId?: string;
  status?: string;
}

interface UpdateUserRoleRequestBody {
  userId?: string;
  role?: string;
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

export async function listComplaintsController(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim();

  if (status && !isValidComplaintStatus(status)) {
    return NextResponse.json(
      {
        success: false,
        message: "status must be open, escalated, or resolved",
      },
      { status: 400 }
    );
  }

  const typedStatus = status && isValidComplaintStatus(status) ? status : undefined;

  try {
    await connectToDatabase();

    const complaints = await listComplaints(typedStatus);

    return NextResponse.json(
      {
        success: true,
        message: "Complaints fetched successfully",
        data: complaints,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch complaints",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function updateComplaintStatusController(request: Request) {
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

  let body: UpdateComplaintStatusRequestBody;

  try {
    body = (await request.json()) as UpdateComplaintStatusRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const complaintId = body.complaintId?.trim();
  const status = body.status?.trim();

  if (!complaintId || !status) {
    return NextResponse.json(
      {
        success: false,
        message: "complaintId and status are required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(complaintId)) {
    return NextResponse.json(
      {
        success: false,
        message: "complaintId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  if (!isValidComplaintStatus(status)) {
    return NextResponse.json(
      {
        success: false,
        message: "status must be open, escalated, or resolved",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const updatedComplaint = await updateComplaintStatus({
      complaintId,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Complaint status updated successfully",
        data: updatedComplaint,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "COMPLAINT_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          message: "COMPLAINT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update complaint status",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function updateUserRoleController(request: Request) {
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

  let body: UpdateUserRoleRequestBody;

  try {
    body = (await request.json()) as UpdateUserRoleRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const userId = body.userId?.trim();
  const role = body.role?.trim();

  if (!userId || !role) {
    return NextResponse.json(
      {
        success: false,
        message: "userId and role are required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(userId)) {
    return NextResponse.json(
      {
        success: false,
        message: "userId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  if (!isValidUserRole(role)) {
    return NextResponse.json(
      {
        success: false,
        message: "role must be user, caregiver, or admin",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const updatedUser = await updateUserRole({
      userId,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          message: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user role",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function getOverviewReportController(request: Request) {
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

    const report = await getAdminOverviewReport();

    return NextResponse.json(
      {
        success: true,
        message: "Overview report fetched successfully",
        data: report,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch overview report",
        error: message,
      },
      { status: 500 }
    );
  }
}