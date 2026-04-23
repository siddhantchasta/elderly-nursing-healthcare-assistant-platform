import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Caregiver from "@/models/Caregiver";
import { authenticateRequest } from "@/middleware/auth.middleware";
import {
  createBookingRequest,
  getBookingById,
  isValidBookingDecision,
  isValidBookingTrackingStatus,
  isValidBookingType,
  isValidObjectId,
  listBookingHistory,
  updateBookingDecision,
  updateBookingStatus,
} from "@/services/booking.service";

interface CreateBookingRequestBody {
  patientId?: string;
  caregiverId?: string;
  serviceId?: string;
  bookingType?: string;
  scheduledAt?: string;
}

interface UpdateBookingDecisionRequestBody {
  bookingId?: string;
  decision?: string;
}

interface UpdateBookingStatusRequestBody {
  bookingId?: string;
  status?: string;
}

export async function createBookingController(request: Request) {
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

  const userId = authResult.auth.sub;
  const patientId = body.patientId?.trim();
  const caregiverId = body.caregiverId?.trim();
  const serviceId = body.serviceId?.trim();
  const bookingType = body.bookingType?.trim();
  const scheduledAt = body.scheduledAt?.trim();

  if (!patientId || !caregiverId || !serviceId || !bookingType || !scheduledAt) {
    return NextResponse.json(
      {
        success: false,
        message: "patientId, caregiverId, serviceId, bookingType, and scheduledAt are required",
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
  const decision = body.decision?.trim();

  if (!bookingId || !decision) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId and decision are required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(bookingId)) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId must be a valid ObjectId value",
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

    const updatedBooking = await updateBookingDecision({
      bookingId,
      caregiverId: caregiverProfile._id.toString(),
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
  const authResult = authenticateRequest(request, ["user", "caregiver"]);

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

    let userId: string | undefined;
    let caregiverId: string | undefined;

    if (authResult.auth.role === "user") {
      userId = authResult.auth.sub;
    }

    if (authResult.auth.role === "caregiver") {
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

      caregiverId = caregiverProfile._id.toString();
    }

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

export async function updateBookingStatusController(request: Request) {
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

  let body: UpdateBookingStatusRequestBody;

  try {
    body = (await request.json()) as UpdateBookingStatusRequestBody;
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
  const status = body.status?.trim();

  if (!bookingId || !status) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId and status are required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(bookingId)) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  if (!isValidBookingTrackingStatus(status)) {
    return NextResponse.json(
      {
        success: false,
        message: "status must be in_progress or completed",
      },
      { status: 400 }
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

    const updatedBooking = await updateBookingStatus({
      bookingId,
      caregiverId: caregiverProfile._id.toString(),
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking status updated successfully",
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

      if (error.message === "BOOKING_CAREGIVER_MISMATCH" || error.message === "INVALID_STATUS_TRANSITION") {
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
        message: "Failed to update booking status",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function getBookingByIdController(request: Request, bookingId: string) {
  const authResult = authenticateRequest(request, ["user", "caregiver"]);

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

  if (!isValidObjectId(bookingId)) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const booking = await getBookingById(bookingId);

    if (authResult.auth.role === "user" && booking.userId !== authResult.auth.sub) {
      return NextResponse.json(
        {
          success: false,
          message: "BOOKING_ACCESS_DENIED",
        },
        { status: 403 }
      );
    }

    if (authResult.auth.role === "caregiver") {
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

      if (booking.caregiverId !== caregiverProfile._id.toString()) {
        return NextResponse.json(
          {
            success: false,
            message: "BOOKING_ACCESS_DENIED",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking fetched successfully",
        data: booking,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "BOOKING_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          message: "BOOKING_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking",
        error: message,
      },
      { status: 500 }
    );
  }
}