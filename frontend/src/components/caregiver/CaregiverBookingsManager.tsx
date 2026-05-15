"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listBookings, listServices, updateBookingDecision, updateBookingStatus } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import DashboardSection from "@/components/ui/DashboardSection";
import { BOOKING_STATUS_STYLES, cd } from "@/lib/ui/caregiver-dashboard";
import type { BookingItem } from "@/types/booking";
import type { ServiceItem } from "@/types/service";

const BOOKING_TYPE_LABELS: Record<BookingItem["bookingType"], string> = {
  hourly: "Hourly",
  daily: "Daily",
  long_term: "Long Term",
};

export default function CaregiverBookingsManager() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingData, serviceData] = await Promise.all([listBookings(), listServices()]);
      setBookings(bookingData);
      setServices(serviceData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }

        if (err.status === 404 && err.message === "CAREGIVER_PROFILE_NOT_FOUND") {
          setError("Please complete your caregiver profile before managing bookings.");
          return;
        }

        setError(err.message);
      } else {
        setError("Failed to load caregiver bookings");
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

  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);

  async function handleDecision(bookingId: string, decision: "accepted" | "rejected") {
    setActionId(bookingId);
    setError(null);
    setSuccess(null);

    try {
      await updateBookingDecision(bookingId, decision);
      setSuccess(`Booking ${decision}.`);
      await loadData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update booking decision");
      }
    } finally {
      setActionId(null);
    }
  }

  async function handleStatusUpdate(bookingId: string, status: "in_progress" | "completed") {
    setActionId(bookingId);
    setError(null);
    setSuccess(null);

    try {
      await updateBookingStatus(bookingId, status);
      setSuccess(`Booking marked as ${status.replace("_", " ")}.`);
      await loadData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update booking status");
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <DashboardSection
      title="Booking requests & history"
      description="Review incoming requests and update job status."
      onRefresh={() => void loadData()}
    >
      {loading ? <p className={cd.muted}>Loading bookings...</p> : null}
      {error ? <p className={cd.error}>{error}</p> : null}
      {success ? <p className={cd.success}>{success}</p> : null}

      {!loading && bookings.length === 0 ? (
        <p className={cd.muted}>No bookings assigned yet.</p>
      ) : null}

      {!loading && bookings.length > 0 ? (
        <div className={cd.tableWrap}>
          <table className={cd.table}>
            <thead>
              <tr>
                <th className={cd.th}>Booking</th>
                <th className={cd.th}>Service</th>
                <th className={cd.th}>Type</th>
                <th className={cd.th}>Scheduled</th>
                <th className={cd.th}>Status</th>
                <th className={cd.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const serviceName = serviceMap.get(booking.serviceId)?.serviceName ?? booking.serviceId;
                const isBusy = actionId === booking.id;

                return (
                  <tr key={booking.id}>
                    <td className={cd.td}>{booking.id}</td>
                    <td className={cd.tdStrong}>{serviceName}</td>
                    <td className={cd.td}>{BOOKING_TYPE_LABELS[booking.bookingType]}</td>
                    <td className={cd.td}>{new Date(booking.scheduledAt).toLocaleString()}</td>
                    <td className={cd.td}>
                      <span className={`${cd.badge} ${BOOKING_STATUS_STYLES[booking.status]}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className={cd.td}>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/caregiver/bookings/${booking.id}`} className={cd.btnGhost}>
                          View
                        </Link>
                        <Link href="/caregiver/complaints" className={cd.btnDanger}>
                          Report
                        </Link>
                        {booking.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleDecision(booking.id, "accepted")}
                              disabled={isBusy}
                              className={cd.btnSuccess}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDecision(booking.id, "rejected")}
                              disabled={isBusy}
                              className={cd.btnDanger}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        {booking.status === "accepted" ? (
                          <button
                            type="button"
                            onClick={() => void handleStatusUpdate(booking.id, "in_progress")}
                            disabled={isBusy}
                            className={cd.btnPrimary}
                          >
                            Start
                          </button>
                        ) : null}
                        {booking.status === "in_progress" ? (
                          <button
                            type="button"
                            onClick={() => void handleStatusUpdate(booking.id, "completed")}
                            disabled={isBusy}
                            className={cd.btnSuccess}
                          >
                            Complete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardSection>
  );
}
