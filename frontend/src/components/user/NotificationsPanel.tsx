"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listUserNotifications } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { startNotificationsStream } from "@/lib/notifications/stream";
import type { BookingStatusUpdateItem, ComplaintStatusUpdateItem } from "@/types/notification";
import DashboardSection from "@/components/ui/DashboardSection";
import { BOOKING_STATUS_STYLES, COMPLAINT_STATUS_STYLES, ud } from "@/lib/ui/user-dashboard";

export default function NotificationsPanel() {
  const router = useRouter();
  const [bookingUpdates, setBookingUpdates] = useState<BookingStatusUpdateItem[]>([]);
  const [complaintUpdates, setComplaintUpdates] = useState<ComplaintStatusUpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listUserNotifications();
      setBookingUpdates(data.bookingUpdates);
      setComplaintUpdates(data.complaintUpdates);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadSnapshot();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadSnapshot]);

  useEffect(() => {
    let stop: (() => void) | null = null;

    void (async () => {
      stop = await startNotificationsStream({
        onBookingUpdates: (updates) => {
          setLiveConnected(true);
          setBookingUpdates(updates);
        },
        onComplaintUpdates: (updates) => {
          setLiveConnected(true);
          setComplaintUpdates(updates);
        },
        onError: (message) => {
          setLiveConnected(false);
          setError((prev) => prev ?? message);
        },
      });
    })();

    return () => {
      if (stop) stop();
    };
  }, []);

  const hasNoUpdates = useMemo(
    () => bookingUpdates.length === 0 && complaintUpdates.length === 0,
    [bookingUpdates.length, complaintUpdates.length]
  );

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Live notifications"
        description="Real-time booking and complaint status updates."
        onRefresh={() => void loadSnapshot()}
      >
        <span
          className={`${ud.badge} ${
            liveConnected ? "bg-[#e8f0ec] text-[#3d6b55]" : "bg-[#f0f0ee] text-[#6d7b76]"
          }`}
        >
          {liveConnected ? "Live connected" : "Snapshot mode"}
        </span>

        {loading ? <p className={`mt-4 ${ud.muted}`}>Loading notifications...</p> : null}
        {error ? <p className={`mt-4 ${ud.error}`}>{error}</p> : null}
        {!loading && !error && hasNoUpdates ? (
          <p className={`mt-4 ${ud.muted}`}>No notifications yet. Updates will appear here when booking status changes.</p>
        ) : null}
      </DashboardSection>

      <DashboardSection title="Booking updates">
        {bookingUpdates.length === 0 ? <p className={ud.muted}>No booking updates.</p> : null}
        {bookingUpdates.length > 0 ? (
          <ul className="space-y-3">
            {bookingUpdates.map((item) => (
              <li key={item.bookingId} className={ud.cardMuted}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#111111]">Booking {item.bookingId}</p>
                  <span className={`${ud.badge} ${BOOKING_STATUS_STYLES[item.status]}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#8ca09a]">Scheduled: {new Date(item.scheduledAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardSection>

      <DashboardSection title="Complaint updates">
        {complaintUpdates.length === 0 ? <p className={ud.muted}>No complaint updates.</p> : null}
        {complaintUpdates.length > 0 ? (
          <ul className="space-y-3">
            {complaintUpdates.map((item) => (
              <li key={item.complaintId} className={ud.cardMuted}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#111111]">Complaint {item.complaintId}</p>
                  <span className={`${ud.badge} ${COMPLAINT_STATUS_STYLES[item.status]}`}>{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-[#4b4b4b]">{item.message}</p>
                <p className="mt-2 text-xs text-[#8ca09a]">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardSection>
    </div>
  );
}
