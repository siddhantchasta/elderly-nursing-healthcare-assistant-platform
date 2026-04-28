"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listUserNotifications } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { startNotificationsStream } from "@/lib/notifications/stream";
import type { BookingStatusUpdateItem, ComplaintStatusUpdateItem } from "@/types/notification";

const BOOKING_STATUS_STYLES: Record<BookingStatusUpdateItem["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-sky-100 text-sky-800",
  rejected: "bg-rose-100 text-rose-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
};

const COMPLAINT_STATUS_STYLES: Record<ComplaintStatusUpdateItem["status"], string> = {
  open: "bg-amber-100 text-amber-800",
  escalated: "bg-rose-100 text-rose-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

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
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Live Notifications</h2>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${liveConnected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
              {liveConnected ? "Live connected" : "Snapshot mode"}
            </span>
            <button onClick={() => void loadSnapshot()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              Refresh
            </button>
          </div>
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-600">Loading notifications...</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && hasNoUpdates ? <p className="mt-4 text-sm text-slate-600">No notifications yet.</p> : null}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Booking Updates</h3>
        {bookingUpdates.length === 0 ? <p className="mt-3 text-sm text-slate-600">No booking updates.</p> : null}
        {bookingUpdates.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {bookingUpdates.map((item) => (
              <li key={item.bookingId} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-800">Booking: {item.bookingId}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${BOOKING_STATUS_STYLES[item.status]}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Scheduled: {new Date(item.scheduledAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Complaint Updates</h3>
        {complaintUpdates.length === 0 ? <p className="mt-3 text-sm text-slate-600">No complaint updates.</p> : null}
        {complaintUpdates.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {complaintUpdates.map((item) => (
              <li key={item.complaintId} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-800">Complaint: {item.complaintId}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${COMPLAINT_STATUS_STYLES[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
