"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createComplaint, listBookings, listComplaints } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { ComplaintItem } from "@/types/complaint";

const STATUS_CONFIG: Record<ComplaintItem["status"], { bg: string; text: string; label: string }> = {
  open: { bg: "bg-amber-50", text: "text-amber-700", label: "Open" },
  escalated: { bg: "bg-red-50", text: "text-red-700", label: "Escalated" },
  resolved: { bg: "bg-green-50", text: "text-green-700", label: "Resolved" },
};

export default function CaregiverComplaintsManager() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);

  const [bookingId, setBookingId] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingsData, complaintsData] = await Promise.all([listBookings(), listComplaints()]);
      setBookings(bookingsData);
      setComplaints(complaintsData);

      if (bookingsData.length > 0) {
        setBookingId((prev) => prev || bookingsData[0].id);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to fetch complaints data");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "caregiver") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadData]);

  const bookingMap = useMemo(() => new Map(bookings.map((b) => [b.id, b])), [bookings]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!bookingId || !message.trim()) {
        setError("Booking and complaint message are required.");
        return;
      }

      await createComplaint({ bookingId, message: message.trim() });
      setMessage("");
      setSuccess("Complaint submitted successfully.");
      await loadData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to submit complaint");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-sm text-muted-foreground">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Submit Complaint Form */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <svg className="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Report an Issue</h2>
              <p className="text-sm text-muted-foreground">File a complaint for any booking-related issues</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="bookingId" className="mb-2 block text-sm font-medium text-foreground">
                Select Booking
              </label>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings available to report issues.</p>
              ) : (
                <select
                  id="bookingId"
                  required
                  value={bookingId}
                  onChange={(event) => setBookingId(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      Booking {booking.id.slice(0, 8)}... - {booking.status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                Describe the Issue
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Please provide details about the issue you encountered..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || bookings.length === 0}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Complaints List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">My Complaints</h2>
              <p className="text-sm text-muted-foreground">{complaints.length} total complaints</p>
            </div>
          </div>
          <button
            onClick={() => void loadData()}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="p-6">
          {complaints.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-3 font-medium text-foreground">No complaints filed</p>
              <p className="mt-1 text-sm text-muted-foreground">You have not reported any issues yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => {
                const statusConfig = STATUS_CONFIG[complaint.status];

                return (
                  <div key={complaint.id} className="rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            Booking: {bookingMap.get(complaint.bookingId)?.id.slice(0, 8) ?? complaint.bookingId.slice(0, 8)}...
                          </p>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{complaint.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Filed on {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={`/caregiver/complaints/${complaint.id}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
