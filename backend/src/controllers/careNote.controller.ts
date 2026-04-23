import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import Booking from "@/models/Booking";
import Caregiver from "@/models/Caregiver";
import { isValidObjectId } from "@/services/booking.service";
import { createCareNote, listCareNotesByBooking } from "@/services/careNote.service";

interface CreateCareNoteRequestBody {
  bookingId?: string;
  note?: string;
}

export async function createCareNoteController(request: Request) {
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

  let body: CreateCareNoteRequestBody;

  try {
    body = (await request.json()) as CreateCareNoteRequestBody;
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
  const note = body.note?.trim();

  if (!bookingId || !note) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId and note are required",
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

    const createdNote = await createCareNote({
      bookingId,
      caregiverId: caregiverProfile._id.toString(),
      note,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Care note added successfully",
        data: createdNote,
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

      if (error.message === "BOOKING_CAREGIVER_MISMATCH" || error.message === "CARE_NOTE_NOT_ALLOWED_FOR_STATUS") {
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
        message: "Failed to add care note",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function listCareNotesController(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId")?.trim();

  if (!bookingId) {
    return NextResponse.json(
      {
        success: false,
        message: "bookingId query parameter is required",
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

    const booking = await Booking.findById(bookingId).lean();

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "BOOKING_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (authResult.auth.role === "user" && booking.userId.toString() !== authResult.auth.sub) {
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

      if (booking.caregiverId.toString() !== caregiverProfile._id.toString()) {
        return NextResponse.json(
          {
            success: false,
            message: "BOOKING_ACCESS_DENIED",
          },
          { status: 403 }
        );
      }
    }

    const notes = await listCareNotesByBooking(bookingId);

    return NextResponse.json(
      {
        success: true,
        message: "Care notes fetched successfully",
        data: notes,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch care notes",
        error: message,
      },
      { status: 500 }
    );
  }
}