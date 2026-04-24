import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { isValidObjectId } from "@/services/booking.service";
import { createComplaint } from "@/services/complaint.service";

interface CreateComplaintRequestBody {
  bookingId?: string;
  message?: string;
}

export async function createComplaintController(request: Request) {
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

  let body: CreateComplaintRequestBody;

  try {
    body = (await request.json()) as CreateComplaintRequestBody;
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
  const message = body.message?.trim();

  if (!bookingId || !message) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId and message are required",
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

  try {
    await connectToDatabase();

    const raisedByRole = authResult.auth.role;

    if (raisedByRole !== "user" && raisedByRole !== "caregiver") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role for complaint submission",
        },
        { status: 403 }
      );
    }

    const createdComplaint = await createComplaint({
      bookingId,
      raisedByUserId: authResult.auth.sub,
      raisedByRole,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Complaint created successfully",
        data: createdComplaint,
      },
      { status: 201 }
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

      if (error.message === "BOOKING_ACCESS_DENIED") {
        return NextResponse.json(
          {
            success: false,
            message: "BOOKING_ACCESS_DENIED",
          },
          { status: 403 }
        );
      }
    }

    const messageText = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create complaint",
        error: messageText,
      },
      { status: 500 }
    );
  }
}