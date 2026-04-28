import { connectToDatabase } from "@/lib/mongodb";
import { handleCorsOptions, withCors } from "@/lib/cors";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { listUserNotifications } from "@/services/notification.service";

export const runtime = "nodejs";

// Poll interval in milliseconds — short enough for near-real-time feel
const POLL_INTERVAL_MS = 5_000;
// Keep-alive heartbeat to prevent proxies from closing idle connections
const HEARTBEAT_INTERVAL_MS = 25_000;

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request) {
  const authResult = authenticateRequest(request, ["user"]);

  if (authResult.response) {
    return withCors(authResult.response, request);
  }

  if (!authResult.auth) {
    return withCors(
      new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401,
      }),
      request
    );
  }

  const userId = authResult.auth.sub;

  await connectToDatabase();

  const encoder = new TextEncoder();

  // Helper to format an SSE message
  function sseMessage(event: string, data: unknown): Uint8Array {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      // Detect client disconnect
      request.signal.addEventListener("abort", () => {
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      });

      // Send initial snapshot immediately — both booking + complaint updates
      try {
        const notifications = await listUserNotifications(userId);
        controller.enqueue(sseMessage("booking_updates", notifications.bookingUpdates));
        controller.enqueue(sseMessage("complaint_updates", notifications.complaintUpdates));
      } catch {
        controller.enqueue(sseMessage("error", { message: "Failed to fetch notifications" }));
      }

      // Heartbeat timer — prevents proxy/load-balancer idle timeouts
      const heartbeatTimer = setInterval(() => {
        if (closed) {
          clearInterval(heartbeatTimer);
          return;
        }
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          closed = true;
          clearInterval(heartbeatTimer);
        }
      }, HEARTBEAT_INTERVAL_MS);

      // Polling loop — push only when data changes (booking or complaint)
      let lastBookingSnapshot = "";
      let lastComplaintSnapshot = "";

      const pollTimer = setInterval(async () => {
        if (closed) {
          clearInterval(pollTimer);
          clearInterval(heartbeatTimer);
          return;
        }

        try {
          const notifications = await listUserNotifications(userId);

          const bookingSnapshot = JSON.stringify(notifications.bookingUpdates);
          const complaintSnapshot = JSON.stringify(notifications.complaintUpdates);

          // Emit only the channels that actually changed — avoids redundant events
          if (bookingSnapshot !== lastBookingSnapshot) {
            lastBookingSnapshot = bookingSnapshot;
            controller.enqueue(sseMessage("booking_updates", notifications.bookingUpdates));
          }

          if (complaintSnapshot !== lastComplaintSnapshot) {
            lastComplaintSnapshot = complaintSnapshot;
            controller.enqueue(sseMessage("complaint_updates", notifications.complaintUpdates));
          }
        } catch {
          // Non-fatal, will retry on next tick
        }
      }, POLL_INTERVAL_MS);
    },
  });

  return withCors(
    new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable Nginx buffering
      },
    }),
    request
  );
}
