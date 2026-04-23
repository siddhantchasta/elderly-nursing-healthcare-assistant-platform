import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import {
  createCaregiverProfile,
  getCaregiverWorkSummary,
  isValidCaregiverStatus,
  listAvailableCaregivers,
  updateCaregiverProfile,
} from "@/services/caregiver.service";
import Caregiver from "@/models/Caregiver";

interface CreateCaregiverRequestBody {
  qualifications?: string;
  serviceAreas?: string[];
  rating?: number;
  isAvailable?: boolean;
  verificationStatus?: string;
}

interface UpdateCaregiverProfileRequestBody {
  isAvailable?: boolean;
  serviceAreas?: string[];
}

export async function listCaregiversController() {
  try {
    await connectToDatabase();

    const caregivers = await listAvailableCaregivers();

    return NextResponse.json(
      {
        success: true,
        message: "Caregivers fetched successfully",
        data: caregivers,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch caregivers",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function createCaregiverController(request: Request) {
  const authResult = authenticateRequest(request, ["caregiver"]);

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

  let body: CreateCaregiverRequestBody;

  try {
    body = (await request.json()) as CreateCaregiverRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const userId = authResult.auth.sub;
  const qualifications = body.qualifications?.trim();
  const serviceAreas = body.serviceAreas;
  const rating = body.rating;
  const isAvailable = body.isAvailable;
  const verificationStatus = body.verificationStatus?.trim();

  if (!qualifications || !serviceAreas) {
    return NextResponse.json(
      {
        success: false,
        message: "qualifications and serviceAreas are required",
      },
      { status: 400 }
    );
  }

  if (!Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid userId",
      },
      { status: 400 }
    );
  }

  if (!Array.isArray(serviceAreas) || serviceAreas.length === 0 || serviceAreas.some((area) => !area?.trim())) {
    return NextResponse.json(
      {
        success: false,
        message: "serviceAreas must be a non-empty array of strings",
      },
      { status: 400 }
    );
  }

  if (rating !== undefined && (typeof rating !== "number" || rating < 0 || rating > 5)) {
    return NextResponse.json(
      {
        success: false,
        message: "rating must be a number between 0 and 5",
      },
      { status: 400 }
    );
  }

  if (verificationStatus && !isValidCaregiverStatus(verificationStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid verificationStatus. Allowed values: pending, verified, rejected",
      },
      { status: 400 }
    );
  }

  const typedVerificationStatus = verificationStatus && isValidCaregiverStatus(verificationStatus)
    ? verificationStatus
    : undefined;

  try {
    await connectToDatabase();

    const createdCaregiver = await createCaregiverProfile({
      userId,
      qualifications,
      serviceAreas: serviceAreas.map((area) => area.trim()),
      rating,
      isAvailable,
      verificationStatus: typedVerificationStatus,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Caregiver profile created successfully",
        data: createdCaregiver,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "USER_NOT_FOUND",
          },
          { status: 404 }
        );
      }

      if (error.message === "USER_ROLE_NOT_CAREGIVER" || error.message === "CAREGIVER_PROFILE_ALREADY_EXISTS") {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 409 }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create caregiver profile",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function updateCaregiverProfileController(request: Request) {
  const authResult = authenticateRequest(request, ["caregiver"]);

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

  let body: UpdateCaregiverProfileRequestBody;

  try {
    body = (await request.json()) as UpdateCaregiverProfileRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const isAvailable = body.isAvailable;
  const serviceAreas = body.serviceAreas;

  if (isAvailable === undefined && serviceAreas === undefined) {
    return NextResponse.json(
      {
        success: false,
        message: "At least one field is required: isAvailable or serviceAreas",
      },
      { status: 400 }
    );
  }

  if (serviceAreas !== undefined) {
    if (!Array.isArray(serviceAreas) || serviceAreas.length === 0 || serviceAreas.some((area) => !area?.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "serviceAreas must be a non-empty array of strings",
        },
        { status: 400 }
      );
    }
  }

  try {
    await connectToDatabase();

    const updatedCaregiver = await updateCaregiverProfile({
      userId: authResult.auth.sub,
      isAvailable,
      serviceAreas: serviceAreas?.map((area) => area.trim()),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Caregiver profile updated successfully",
        data: updatedCaregiver,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "CAREGIVER_PROFILE_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          message: "CAREGIVER_PROFILE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update caregiver profile",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function getCaregiverWorkHistoryController(request: Request) {
  const authResult = authenticateRequest(request, ["caregiver"]);

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

    const caregiverProfile = await Caregiver.findOne({ userId: authResult.auth.sub }).lean();

    if (!caregiverProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "CAREGIVER_PROFILE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const workSummary = await getCaregiverWorkSummary(caregiverProfile._id.toString());

    return NextResponse.json(
      {
        success: true,
        message: "Caregiver work history fetched successfully",
        data: workSummary,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch caregiver work history",
        error: message,
      },
      { status: 500 }
    );
  }
}