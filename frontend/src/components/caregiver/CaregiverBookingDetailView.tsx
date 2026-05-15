"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createCareNote, getBookingById, listCareNotes, listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { CareNoteItem } from "@/types/careNote";
import type { ServiceItem } from "@/types/service";

const STATUS_CONFIG: Record<BookingItem["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  accepted: { bg: "bg-blue-50", text: "text-blue-700", label: "Accepted" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
  in_progress: { bg: "bg-purple-50", text: "text-purple-700", label: "In Progress" },
  completed: { bg: "bg-green-50", text: "text-green-700", label: "Completed" },
};

export default function CaregiverBookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [notes, setNotes] = useState<CareNoteItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingData, notesData, servicesData] = await Promise.all([
        getBookingById(bookingId),
        listCareNotes(bookingId),
        listServices(),
      ]);

      setBooking(bookingData);
      setNotes(notesData);
      setServices(servicesData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load booking detail");
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "caregiver") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadDetail();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadDetail]);

  const service = useMemo(
    () => services.find((item) => item.id === booking?.serviceId),
    [services, booking]
  );

  const canAddNote = booking ? ["accepted", "in_progress", "completed"].includes(booking.status) : false;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!noteText.trim()) {
        setError("Care note cannot be empty.");
        return;
      }

      await createCareNote(bookingId, noteText.trim());
      setNoteText("");
      setSuccess("Care note added successfully.");
      await loadDetail();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to add care note");
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
          <p className="mt-3 text-sm text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="mt-3 font-medium text-red-700">Booking not found</p>
        <p className="mt-1 text-sm text-red-600">The booking you are looking for does not exist or you do not have access to it.</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[booking.status];

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

      {/* Booking Info Card */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Booking Information</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
        </div>

        <div className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="mt-1 font-medium text-foreground">{service?.serviceName ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booking Type</p>
                <p className="mt-1 font-medium text-foreground capitalize">{booking.bookingType.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="mt-1 font-medium text-foreground">{booking.patientId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="mt-1 font-medium text-foreground">
                  {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Time</p>
                <p className="mt-1 font-medium text-foreground">
                  {new Date(booking.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="mt-1 font-medium text-foreground">
                  {new Date(booking.statusUpdatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Care Notes Section */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Care Notes</h2>
              <p className="text-sm text-muted-foreground">Document patient care and observations</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {canAddNote ? (
            <form onSubmit={onSubmit} className="mb-6">
              <label htmlFor="note" className="mb-2 block text-sm font-medium text-foreground">
                Add a New Note
              </label>
              <textarea
                id="note"
                rows={4}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Document patient condition, care provided, observations..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !noteText.trim()}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 rounded-lg bg-secondary/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Care notes can be added once you accept the booking.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Previous Notes ({notes.length})</h3>
            
            {notes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <svg className="mx-auto h-8 w-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="mt-2 text-sm text-muted-foreground">No care notes recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-foreground">{note.note}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
