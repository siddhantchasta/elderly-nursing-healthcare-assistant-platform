"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listBookings, listServices, updateBookingDecision, updateBookingStatus } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { ServiceItem } from "@/types/service";

const STATUS_STYLES: Record<BookingItem["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-sky-100 text-sky-800",
  rejected: "bg-rose-100 text-rose-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
};

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
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Booking Requests & History</h2>
          <p className="mt-1 text-sm text-slate-600">Review incoming requests and update job status.</p>
        </div>
        <button onClick={() => void loadData()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading bookings...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

      {!loading && bookings.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No bookings assigned yet.</p>
      ) : null}

      {!loading && bookings.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-2 py-2 font-medium">Booking</th>
                <th className="px-2 py-2 font-medium">Service</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 font-medium">Scheduled</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const serviceName = serviceMap.get(booking.serviceId)?.serviceName ?? booking.serviceId;
                const isBusy = actionId === booking.id;

                return (
                  <tr key={booking.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-700">{booking.id}</td>
                    <td className="px-2 py-3 text-sm text-slate-800">{serviceName}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{BOOKING_TYPE_LABELS[booking.bookingType]}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{new Date(booking.scheduledAt).toLocaleString()}</td>
                    <td className="px-2 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {booking.status === "pending" ? (
                          <>
                            <button
                              onClick={() => void handleDecision(booking.id, "accepted")}
                              disabled={isBusy}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => void handleDecision(booking.id, "rejected")}
                              disabled={isBusy}
                              className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        ) : null}

                        {booking.status === "accepted" ? (
                          <button
                            onClick={() => void handleStatusUpdate(booking.id, "in_progress")}
                            disabled={isBusy}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                          >
                            Start
                          </button>
                        ) : null}

                        {booking.status === "in_progress" ? (
                          <button
                            onClick={() => void handleStatusUpdate(booking.id, "completed")}
                            disabled={isBusy}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
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
    </section>
  );
}
