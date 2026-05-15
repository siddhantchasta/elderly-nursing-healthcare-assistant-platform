"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createComplaint, listBookings, listComplaints } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { ComplaintItem } from "@/types/complaint";
import DashboardSection from "@/components/ui/DashboardSection";
import { COMPLAINT_STATUS_STYLES, ud } from "@/lib/ui/user-dashboard";

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
    <div className="space-y-8">
      <DashboardSection title="Raise a complaint" description="Report issues related to a specific booking.">
        {error ? <p className={ud.error}>{error}</p> : null}
        {success ? <p className={ud.success}>{success}</p> : null}

        {!loading ? (
          <form className="mt-2 space-y-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="bookingId" className={ud.label}>
                Booking
              </label>
              <select
                id="bookingId"
                required
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                className={ud.select}
              >
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.id} ({booking.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className={ud.label}>
                Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={ud.textarea}
              />
            </div>

            <button type="submit" disabled={submitting || bookings.length === 0} className={ud.btnPrimary}>
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          </form>
        ) : (
          <p className={ud.muted}>Loading booking options...</p>
        )}
      </DashboardSection>

      <DashboardSection
        title="My complaints"
        description="Track status and view details for each support request."
        onRefresh={() => void loadData()}
      >
        {loading ? <p className={ud.muted}>Loading complaints...</p> : null}

        {!loading && complaints.length === 0 ? <p className={ud.muted}>No complaints raised yet.</p> : null}

        {!loading && complaints.length > 0 ? (
          <div className={ud.tableWrap}>
            <table className={ud.table}>
              <thead>
                <tr>
                  <th className={ud.th}>Booking</th>
                  <th className={ud.th}>Message</th>
                  <th className={ud.th}>Status</th>
                  <th className={ud.th}>Created</th>
                  <th className={ud.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className={ud.td}>{bookingMap.get(complaint.bookingId)?.id ?? complaint.bookingId}</td>
                    <td className={ud.td}>{complaint.message}</td>
                    <td className={ud.td}>
                      <span className={`${ud.badge} ${COMPLAINT_STATUS_STYLES[complaint.status]}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className={ud.td}>{new Date(complaint.createdAt).toLocaleString()}</td>
                    <td className={ud.td}>
                      <Link href={`/user/complaints/${complaint.id}`} className={ud.linkAccent}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </DashboardSection>
    </div>
  );
}
