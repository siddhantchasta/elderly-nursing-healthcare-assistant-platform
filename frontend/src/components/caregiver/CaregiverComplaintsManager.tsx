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
import { formatBookingOptionLabel, formatBookingReference } from "@/lib/bookings/display";
import { COMPLAINT_STATUS_STYLES, cd } from "@/lib/ui/caregiver-dashboard";
import { listServices } from "@/lib/api/endpoints";
import type { ServiceItem } from "@/types/service";

export default function CaregiverComplaintsManager() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
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
      const [bookingsData, complaintsData, servicesData] = await Promise.all([
        listBookings(),
        listComplaints(),
        listServices(),
      ]);
      setBookings(bookingsData);
      setComplaints(complaintsData);
      setServices(servicesData);

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
    const caregiver = getSessionUser();
    if (!caregiver || caregiver.role !== "caregiver") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadData]);

  const bookingMap = useMemo(() => new Map(bookings.map((b) => [b.id, b])), [bookings]);
  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);

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
        {error ? <p className={cd.error}>{error}</p> : null}
        {success ? <p className={cd.success}>{success}</p> : null}

        {!loading ? (
          <form className="mt-2 space-y-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="bookingId" className={cd.label}>
                Booking
              </label>
              <select
                id="bookingId"
                required
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                className={cd.select}
              >
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {formatBookingOptionLabel(booking, serviceMap.get(booking.serviceId) ?? null)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className={cd.label}>
                Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={cd.textarea}
              />
            </div>

            <button type="submit" disabled={submitting || bookings.length === 0} className={cd.btnPrimary}>
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          </form>
        ) : (
          <p className={cd.muted}>Loading booking options...</p>
        )}
      </DashboardSection>

      <DashboardSection
        title="My complaints"
        description="Track status and view details for each support request."
        onRefresh={() => void loadData()}
      >
        {loading ? <p className={cd.muted}>Loading complaints...</p> : null}

        {!loading && complaints.length === 0 ? <p className={cd.muted}>No complaints raised yet.</p> : null}

        {!loading && complaints.length > 0 ? (
          <div className={cd.tableWrap}>
            <table className={cd.table}>
              <thead>
                <tr>
                  <th className={cd.th}>Booking</th>
                  <th className={cd.th}>Message</th>
                  <th className={cd.th}>Status</th>
                  <th className={cd.th}>Created</th>
                  <th className={cd.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className={cd.td}>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#111111]">
                          {formatBookingReference(bookingMap.get(complaint.bookingId)?.id ?? complaint.bookingId)}
                        </p>
                        <p className="text-xs text-[#8ca09a]">
                          {bookingMap.get(complaint.bookingId)
                            ? formatBookingOptionLabel(
                                bookingMap.get(complaint.bookingId)!,
                                serviceMap.get(bookingMap.get(complaint.bookingId)!.serviceId) ?? null
                              )
                            : complaint.bookingId}
                        </p>
                      </div>
                    </td>
                    <td className={cd.td}>{complaint.message}</td>
                    <td className={cd.td}>
                      <span className={`${cd.badge} ${COMPLAINT_STATUS_STYLES[complaint.status]}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className={cd.td}>{new Date(complaint.createdAt).toLocaleString()}</td>
                    <td className={cd.td}>
                      <Link href={`/caregiver/complaints/${complaint.id}`} className={cd.linkAccent}>
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
