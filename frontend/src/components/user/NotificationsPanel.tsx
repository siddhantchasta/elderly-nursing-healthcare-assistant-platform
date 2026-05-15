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
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-green-100 text-green-800",
};

const COMPLAINT_STATUS_STYLES: Record<ComplaintStatusUpdateItem["status"], string> = {
  open: "bg-amber-100 text-amber-800",
  escalated: "bg-rose-100 text-rose-800",
  resolved: "bg-green-100 text-green-800",
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

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${liveConnected ? "bg-green-500" : "bg-amber-500"}`} />
          <span className="text-sm font-medium text-foreground">
            {liveConnected ? "Live updates active" : "Viewing snapshot"}
          </span>
        </div>
        <button
          onClick={() => void loadSnapshot()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {hasNoUpdates && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground">No notifications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">You&apos;ll see updates here when there&apos;s activity on your bookings.</p>
        </div>
      )}

      {/* Booking updates */}
      {bookingUpdates.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Booking Updates</h2>
          <p className="mt-1 text-sm text-muted-foreground">Status changes for your care appointments.</p>

          <div className="mt-4 space-y-3">
            {bookingUpdates.map((item) => (
              <div key={item.bookingId} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Booking: {item.bookingId.slice(0, 8)}...</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Scheduled: {new Date(item.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${BOOKING_STATUS_STYLES[item.status]}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complaint updates */}
      {complaintUpdates.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Support Updates</h2>
          <p className="mt-1 text-sm text-muted-foreground">Status changes for your reported concerns.</p>

          <div className="mt-4 space-y-3">
            {complaintUpdates.map((item) => (
              <div key={item.complaintId} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Issue: {item.complaintId.slice(0, 8)}...</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.message}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${COMPLAINT_STATUS_STYLES[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Updated: {new Date(item.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
