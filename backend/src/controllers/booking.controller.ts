import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  createBookingRequest,
  isValidBookingType,
  isValidObjectId,
} from "@/services/booking.service";

interface CreateBookingRequestBody {
  userId?: string;
  patientId?: string;
  caregiverId?: string;
  serviceId?: string;
  bookingType?: string;
  scheduledAt?: string;
}

export async function createBookingController(request: Request) {
  let body: CreateBookingRequestBody;

  try {
    body = (await request.json()) as CreateBookingRequestBody;
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
  const patientId = body.patientId?.trim();
  const caregiverId = body.caregiverId?.trim();
  const serviceId = body.serviceId?.trim();
  const bookingType = body.bookingType?.trim();
  const scheduledAt = body.scheduledAt?.trim();

  if (!userId || !patientId || !caregiverId || !serviceId || !bookingType || !scheduledAt) {
    return NextResponse.json(
      {
        success: false,
        message:
          "userId, patientId, caregiverId, serviceId, bookingType, and scheduledAt are required",
      },
      { status: 400 }
    );
  }

  if (
    !isValidObjectId(userId) ||
    !isValidObjectId(patientId) ||
    !isValidObjectId(caregiverId) ||
    !isValidObjectId(serviceId)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "One or more IDs are invalid",
      },
      { status: 400 }
    );
  }

  if (!isValidBookingType(bookingType)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid bookingType. Allowed values: hourly, daily, long_term",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const createdBooking = await createBookingRequest({
      userId,
      patientId,
      caregiverId,
      serviceId,
      bookingType,
      scheduledAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking request created successfully",
        data: createdBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "USER_NOT_FOUND" ||
        error.message === "PATIENT_NOT_FOUND" ||
        error.message === "CAREGIVER_NOT_FOUND" ||
        error.message === "SERVICE_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 404 }
        );
      }

      if (error.message === "PATIENT_ACCESS_DENIED" || error.message === "CAREGIVER_NOT_AVAILABLE") {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 409 }
        );
      }

      if (error.message === "INVALID_SCHEDULED_AT") {
        return NextResponse.json(
          {
            success: false,
            message: "scheduledAt must be a valid ISO date string",
          },
          { status: 400 }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking request",
        error: message,
      },
      { status: 500 }
    );
  }
}