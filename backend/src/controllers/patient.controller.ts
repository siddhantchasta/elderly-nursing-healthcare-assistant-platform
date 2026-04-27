import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { createPatientProfile, listPatientProfilesByUserId } from "@/services/patient.service";

interface CreatePatientRequestBody {
  age?: number;
  medicalNeeds?: string;
}

export async function createPatientController(request: Request) {
  const authResult = authenticateRequest(request, ["user"]);

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

  const userId = authResult.auth.sub;
  const medicalNeeds = body.medicalNeeds?.trim();
  const age = body.age;

  if (age === undefined || !medicalNeeds) {
    return NextResponse.json(
      {
        success: false,
        message: "age and medicalNeeds are required",
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

export async function listPatientProfilesController(request: Request) {
  const authResult = authenticateRequest(request, ["user"]);

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

  const userId = authResult.auth.sub;

  if (!Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid userId",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const patientProfiles = await listPatientProfilesByUserId(userId);

    return NextResponse.json(
      {
        success: true,
        message: "Patient profiles fetched successfully",
        data: patientProfiles,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch patient profiles",
        error: message,
      },
      { status: 500 }
    );
  }
}