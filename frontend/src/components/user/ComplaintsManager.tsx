"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createComplaint, listBookings, listComplaints } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { ComplaintItem } from "@/types/complaint";

const STATUS_STYLES: Record<ComplaintItem["status"], string> = {
  open: "bg-amber-100 text-amber-800",
  escalated: "bg-rose-100 text-rose-800",
  resolved: "bg-green-100 text-green-800",
};

export default function ComplaintsManager() {
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
    if (!user || user.role !== "user") {
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
        setError("Please select a booking and describe your concern.");
        return;
      }

      await createComplaint({ bookingId, message: message.trim() });
      setMessage("");
      setSuccess("Your concern has been submitted. Our team will review it shortly.");
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
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading support center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Submit new complaint */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Report a Concern</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Have an issue with a booking or care service? Let us know and we&apos;ll help resolve it.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="mt-4 rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">You need an active booking to submit a concern.</p>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="bookingId" className="mb-1.5 block text-sm font-medium text-foreground">
                Related Booking
              </label>
              <select
                id="bookingId"
                required
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
              >
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.id.slice(0, 8)}... ({booking.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                Describe Your Concern
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={message}
                placeholder="Please provide details about your concern..."
                onChange={(event) => setMessage(event.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || bookings.length === 0}
              className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Concern"}
            </button>
          </form>
        )}
      </div>

      {/* Existing complaints */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">My Submitted Issues</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track the status of your reported concerns.</p>
          </div>
          <button
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        {complaints.length === 0 ? (
          <div className="mt-4 rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t submitted any concerns yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-lg border border-border p-4 transition-all hover:border-primary/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-foreground line-clamp-2">{complaint.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Booking: {bookingMap.get(complaint.bookingId)?.id.slice(0, 8) ?? complaint.bookingId.slice(0, 8)}...
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[complaint.status]}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                  <Link
                    href={`/user/complaints/${complaint.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
