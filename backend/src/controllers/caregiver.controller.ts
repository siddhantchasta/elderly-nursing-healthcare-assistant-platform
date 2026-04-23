import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import {
  createCaregiverProfile,
  isValidCaregiverStatus,
  listAvailableCaregivers,
} from "@/services/caregiver.service";

interface CreateCaregiverRequestBody {
  userId?: string;
  qualifications?: string;
  serviceAreas?: string[];
  rating?: number;
  isAvailable?: boolean;
  verificationStatus?: string;
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

  const userId = body.userId?.trim();
  const qualifications = body.qualifications?.trim();
  const serviceAreas = body.serviceAreas;
  const rating = body.rating;
  const isAvailable = body.isAvailable;
  const verificationStatus = body.verificationStatus?.trim();

  if (!userId || !qualifications || !serviceAreas) {
    return NextResponse.json(
      {
        success: false,
        message: "userId, qualifications, and serviceAreas are required",
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