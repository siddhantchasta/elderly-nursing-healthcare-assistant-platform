"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listBookings, listServices, updateBookingDecision, updateBookingStatus } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { ServiceItem } from "@/types/service";

const STATUS_CONFIG: Record<BookingItem["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  accepted: { bg: "bg-blue-50", text: "text-blue-700", label: "Accepted" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
  in_progress: { bg: "bg-purple-50", text: "text-purple-700", label: "In Progress" },
  completed: { bg: "bg-green-50", text: "text-green-700", label: "Completed" },
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

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) => ["accepted", "in_progress"].includes(b.status));
  const pastBookings = bookings.filter((b) => ["completed", "rejected"].includes(b.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-sm text-muted-foreground">Loading bookings...</p>
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

      {/* Pending Requests */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <svg className="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Pending Requests</h2>
              <p className="text-sm text-muted-foreground">{pendingBookings.length} awaiting your response</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {pendingBookings.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No pending requests at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => {
                const serviceName = serviceMap.get(booking.serviceId)?.serviceName ?? "Service";
                const isBusy = actionId === booking.id;

                return (
                  <div key={booking.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{serviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {BOOKING_TYPE_LABELS[booking.bookingType]} booking
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Scheduled: {new Date(booking.scheduledAt).toLocaleDateString()} at {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/caregiver/bookings/${booking.id}`}
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => void handleDecision(booking.id, "accepted")}
                          disabled={isBusy}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => void handleDecision(booking.id, "rejected")}
                          disabled={isBusy}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Active Bookings */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Active Bookings</h2>
              <p className="text-sm text-muted-foreground">{activeBookings.length} ongoing jobs</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeBookings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No active bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => {
                const serviceName = serviceMap.get(booking.serviceId)?.serviceName ?? "Service";
                const statusConfig = STATUS_CONFIG[booking.status];
                const isBusy = actionId === booking.id;

                return (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{serviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/caregiver/bookings/${booking.id}`}
                          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          View
                        </Link>
                        {booking.status === "accepted" && (
                          <button
                            onClick={() => void handleStatusUpdate(booking.id, "in_progress")}
                            disabled={isBusy}
                            className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                          >
                            Start Job
                          </button>
                        )}
                        {booking.status === "in_progress" && (
                          <button
                            onClick={() => void handleStatusUpdate(booking.id, "completed")}
                            disabled={isBusy}
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Past Bookings */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Past Bookings</h2>
              <p className="text-sm text-muted-foreground">{pastBookings.length} completed or declined</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {pastBookings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No past bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pastBookings.slice(0, 10).map((booking) => {
                    const serviceName = serviceMap.get(booking.serviceId)?.serviceName ?? "Service";
                    const statusConfig = STATUS_CONFIG[booking.status];

                    return (
                      <tr key={booking.id}>
                        <td className="py-3 text-sm font-medium text-foreground">{serviceName}</td>
                        <td className="py-3 text-sm text-muted-foreground">{BOOKING_TYPE_LABELS[booking.bookingType]}</td>
                        <td className="py-3 text-sm text-muted-foreground">{new Date(booking.scheduledAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/caregiver/bookings/${booking.id}`} className="text-sm font-medium text-primary hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
