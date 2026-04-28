import { getToken } from "@/lib/auth/session";
import type { BookingStatusUpdateItem, ComplaintStatusUpdateItem } from "@/types/notification";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface StreamCallbacks {
  onBookingUpdates: (updates: BookingStatusUpdateItem[]) => void;
  onComplaintUpdates: (updates: ComplaintStatusUpdateItem[]) => void;
  onError?: (message: string) => void;
}

export async function startNotificationsStream(callbacks: StreamCallbacks) {
  const token = getToken();
  if (!token) {
    callbacks.onError?.("Please login to continue");
    return () => {};
  }

  const controller = new AbortController();

  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/stream`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok || !response.body) {
      callbacks.onError?.("Unable to establish live notifications stream");
      return () => controller.abort();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const processChunk = (chunk: string) => {
      buffer += chunk;

      const messages = buffer.split("\n\n");
      buffer = messages.pop() ?? "";

      for (const message of messages) {
        const lines = message.split("\n");
        const eventLine = lines.find((line) => line.startsWith("event:"));
        const dataLine = lines.find((line) => line.startsWith("data:"));

        if (!eventLine || !dataLine) continue;

        const event = eventLine.replace("event:", "").trim();
        const dataRaw = dataLine.replace("data:", "").trim();

        try {
          const data = JSON.parse(dataRaw) as unknown;

          if (event === "booking_updates") {
            callbacks.onBookingUpdates(data as BookingStatusUpdateItem[]);
          }

          if (event === "complaint_updates") {
            callbacks.onComplaintUpdates(data as ComplaintStatusUpdateItem[]);
          }
        } catch {
          // Ignore malformed event payloads
        }
      }
    };

    void (async () => {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        processChunk(decoder.decode(value, { stream: true }));
      }
    })();
  } catch {
    callbacks.onError?.("Live notifications stream disconnected");
  }

  return () => controller.abort();
}
