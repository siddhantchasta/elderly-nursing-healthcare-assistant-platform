import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { listUserNotifications } from "@/services/notification.service";

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

    const notifications = await listUserNotifications(authResult.auth.sub);

    return NextResponse.json(
      {
        success: true,
        message: "Notifications fetched successfully",
        data: notifications,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
        error: message,
      },
      { status: 500 }
    );
  }
}
