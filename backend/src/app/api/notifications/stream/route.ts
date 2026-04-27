import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

// Poll interval in milliseconds — short enough for near-real-time feel
const POLL_INTERVAL_MS = 5_000;
// Keep-alive heartbeat to prevent proxies from closing idle connections
const HEARTBEAT_INTERVAL_MS = 25_000;

export async function GET(request: Request) {
  const authResult = authenticateRequest(request, ["user"]);

  if (authResult.response) {
    return authResult.response;
  }

  if (!authResult.auth) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
    });
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

      // Send initial snapshot immediately
      try {
        const bookings = await Booking.find({ userId })
          .sort({ statusUpdatedAt: -1 })
          .lean();

        const payload = bookings.map((b) => ({
          bookingId: b._id.toString(),
          patientId: b.patientId.toString(),
          caregiverId: b.caregiverId.toString(),
          serviceId: b.serviceId.toString(),
          status: b.status,
          scheduledAt: b.scheduledAt,
          statusUpdatedAt: b.statusUpdatedAt,
        }));

        controller.enqueue(sseMessage("status_updates", payload));
      } catch {
        controller.enqueue(sseMessage("error", { message: "Failed to fetch status updates" }));
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

      // Polling loop — push only when data changes
      let lastSnapshot = "";

      const pollTimer = setInterval(async () => {
        if (closed) {
          clearInterval(pollTimer);
          clearInterval(heartbeatTimer);
          return;
        }

        try {
          const bookings = await Booking.find({ userId })
            .sort({ statusUpdatedAt: -1 })
            .lean();

          const payload = bookings.map((b) => ({
            bookingId: b._id.toString(),
            patientId: b.patientId.toString(),
            caregiverId: b.caregiverId.toString(),
            serviceId: b.serviceId.toString(),
            status: b.status,
            scheduledAt: b.scheduledAt,
            statusUpdatedAt: b.statusUpdatedAt,
          }));

          const snapshot = JSON.stringify(payload);

          // Emit only when something changed — avoids redundant events
          if (snapshot !== lastSnapshot) {
            lastSnapshot = snapshot;
            controller.enqueue(sseMessage("status_updates", payload));
          }
        } catch {
          // Non-fatal, will retry on next tick
        }
      }, POLL_INTERVAL_MS);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering
    },
  });
}
