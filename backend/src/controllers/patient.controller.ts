import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { createPatientProfile } from "@/services/patient.service";

interface CreatePatientRequestBody {
  userId?: string;
  age?: number;
  medicalNeeds?: string;
}

export async function createPatientController(request: Request) {
  let body: CreatePatientRequestBody;

  try {
    body = (await request.json()) as CreatePatientRequestBody;
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
  const medicalNeeds = body.medicalNeeds?.trim();
  const age = body.age;

  if (!userId || age === undefined || !medicalNeeds) {
    return NextResponse.json(
      {
        success: false,
        message: "userId, age, and medicalNeeds are required",
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

  if (typeof age !== "number" || age < 0 || age > 150) {
    return NextResponse.json(
      {
        success: false,
        message: "age must be a number between 0 and 150",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const createdPatient = await createPatientProfile({
      userId,
      age,
      medicalNeeds,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Patient profile created successfully",
        data: createdPatient,
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

      if (error.message === "USER_ROLE_NOT_USER") {
        return NextResponse.json(
          {
            success: false,
            message: "USER_ROLE_NOT_USER",
          },
          { status: 409 }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create patient profile",
        error: message,
      },
      { status: 500 }
    );
  }
}