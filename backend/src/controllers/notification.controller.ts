import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { listUserStatusUpdates } from "@/services/notification.service";

export async function listUserStatusUpdatesController(request: Request) {
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

  try {
    await connectToDatabase();

    const updates = await listUserStatusUpdates(authResult.auth.sub);

    return NextResponse.json(
      {
        success: true,
        message: "Status updates fetched successfully",
        data: updates,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch status updates",
        error: message,
      },
      { status: 500 }
    );
  }
}
