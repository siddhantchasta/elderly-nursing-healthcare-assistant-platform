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
  resolved: "bg-emerald-100 text-emerald-800",
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

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Raise Complaint</h2>
        <p className="mt-1 text-sm text-slate-600">Report issues for a booking.</p>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

        {!loading ? (
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="bookingId" className="mb-1 block text-sm font-medium text-slate-700">Booking</label>
              <select
                id="bookingId"
                required
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              >
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.id} ({booking.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">Complaint Message</label>
              <textarea
                id="message"
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || bookings.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-slate-600">Loading booking options...</p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">My Complaints</h2>
          <button onClick={() => void loadData()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            Refresh
          </button>
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-600">Loading complaints...</p> : null}

        {!loading && complaints.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No complaints raised yet.</p>
        ) : null}

        {!loading && complaints.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                  <th className="px-2 py-2 font-medium">Booking</th>
                  <th className="px-2 py-2 font-medium">Message</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                  <th className="px-2 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-700">
                      {bookingMap.get(complaint.bookingId)?.id ?? complaint.bookingId}
                    </td>
                    <td className="px-2 py-3 text-sm text-slate-800">{complaint.message}</td>
                    <td className="px-2 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[complaint.status]}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm text-slate-700">{new Date(complaint.createdAt).toLocaleString()}</td>
                    <td className="px-2 py-3 text-sm">
                      <Link href={`/user/complaints/${complaint.id}`} className="font-medium text-blue-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
