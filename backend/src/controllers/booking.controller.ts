import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  createBookingRequest,
  isValidBookingDecision,
  isValidBookingType,
  isValidObjectId,
  listBookingHistory,
  updateBookingDecision,
} from "@/services/booking.service";

interface CreateBookingRequestBody {
  userId?: string;
  patientId?: string;
  caregiverId?: string;
  serviceId?: string;
  bookingType?: string;
  scheduledAt?: string;
}

interface UpdateBookingDecisionRequestBody {
  bookingId?: string;
  caregiverId?: string;
  decision?: string;
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

export async function updateBookingDecisionController(request: Request) {
  let body: UpdateBookingDecisionRequestBody;

  try {
    body = (await request.json()) as UpdateBookingDecisionRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const bookingId = body.bookingId?.trim();
  const caregiverId = body.caregiverId?.trim();
  const decision = body.decision?.trim();

  if (!bookingId || !caregiverId || !decision) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId, caregiverId, and decision are required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(bookingId) || !isValidObjectId(caregiverId)) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId and caregiverId must be valid ObjectId values",
      },
      { status: 400 }
    );
  }

  if (!isValidBookingDecision(decision)) {
    return NextResponse.json(
      {
        success: false,
        message: "decision must be accepted or rejected",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const updatedBooking = await updateBookingDecision({
      bookingId,
      caregiverId,
      decision,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking decision updated successfully",
        data: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BOOKING_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "BOOKING_NOT_FOUND",
          },
          { status: 404 }
        );
      }

      if (error.message === "BOOKING_CAREGIVER_MISMATCH" || error.message === "BOOKING_NOT_PENDING") {
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
        message: "Failed to update booking decision",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function listBookingHistoryController(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId")?.trim();
  const caregiverId = searchParams.get("caregiverId")?.trim();

  if (!userId && !caregiverId) {
    return NextResponse.json(
      {
        success: false,
        message: "userId or caregiverId query parameter is required",
      },
      { status: 400 }
    );
  }

  if (userId && !isValidObjectId(userId)) {
    return NextResponse.json(
      {
        success: false,
        message: "userId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  if (caregiverId && !isValidObjectId(caregiverId)) {
    return NextResponse.json(
      {
        success: false,
        message: "caregiverId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const bookings = await listBookingHistory({
      userId,
      caregiverId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking history fetched successfully",
        data: bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking history",
        error: message,
      },
      { status: 500 }
    );
  }
}