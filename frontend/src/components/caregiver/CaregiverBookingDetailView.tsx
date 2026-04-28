"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createCareNote, getBookingById, listCareNotes, listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { CareNoteItem } from "@/types/careNote";
import type { ServiceItem } from "@/types/service";

const STATUS_STYLES: Record<BookingItem["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-sky-100 text-sky-800",
  rejected: "bg-rose-100 text-rose-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
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
      setSuccess("Care note added.");
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
    return <p className="text-sm text-slate-600">Loading booking detail...</p>;
  }

  if (!booking) {
    return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Booking not found.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Booking Details</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
            {booking.status.replace("_", " ")}
          </span>
        </div>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

        <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <p><span className="font-medium">Service:</span> {service?.serviceName ?? booking.serviceId}</p>
          <p><span className="font-medium">Patient:</span> {booking.patientId}</p>
          <p><span className="font-medium">Booking Type:</span> {booking.bookingType.replace("_", " ")}</p>
          <p><span className="font-medium">Scheduled At:</span> {new Date(booking.scheduledAt).toLocaleString()}</p>
          <p><span className="font-medium">Status Updated At:</span> {new Date(booking.statusUpdatedAt).toLocaleString()}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Care Notes</h3>

        {canAddNote ? (
          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <div>
              <label htmlFor="note" className="mb-1 block text-sm font-medium text-slate-700">Add Note</label>
              <textarea
                id="note"
                rows={4}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add Care Note"}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Care notes are available after acceptance.</p>
        )}

        {notes.length === 0 ? <p className="mt-4 text-sm text-slate-600">No care notes yet.</p> : null}
        {notes.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-800">{note.note}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
