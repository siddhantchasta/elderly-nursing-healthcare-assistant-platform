"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createCareNote, getBookingById, listCareNotes, listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { CareNoteItem } from "@/types/careNote";
import type { ServiceItem } from "@/types/service";
import { BOOKING_STATUS_STYLES, cd } from "@/lib/ui/caregiver-dashboard";

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
    return <p className={cd.muted}>Loading booking detail...</p>;
  }

  if (!booking) {
    return <p className={cd.error}>Booking not found.</p>;
  }

  return (
    <div className="space-y-8">
      <section className={cd.card}>
        <div className="flex items-start justify-between gap-3">
          <h2 className={cd.cardTitle}>Booking details</h2>
          <span className={`${cd.badge} ${BOOKING_STATUS_STYLES[booking.status]}`}>
            {booking.status.replace("_", " ")}
          </span>
        </div>

        {error ? <p className={`mt-4 ${cd.error}`}>{error}</p> : null}
        {success ? <p className={`mt-4 ${cd.success}`}>{success}</p> : null}

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#8ca09a]">Service</dt>
            <dd className="mt-1 font-medium text-[#111111]">{service?.serviceName ?? booking.serviceId}</dd>
          </div>
          <div>
            <dt className="text-[#8ca09a]">Patient</dt>
            <dd className="mt-1 font-medium text-[#111111]">{booking.patientId}</dd>
          </div>
          <div>
            <dt className="text-[#8ca09a]">Booking type</dt>
            <dd className="mt-1 font-medium text-[#111111]">{booking.bookingType.replace("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-[#8ca09a]">Scheduled at</dt>
            <dd className="mt-1 font-medium text-[#111111]">{new Date(booking.scheduledAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[#8ca09a]">Status updated</dt>
            <dd className="mt-1 font-medium text-[#111111]">{new Date(booking.statusUpdatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section className={cd.card}>
        <h3 className={cd.cardTitle}>Care notes</h3>

        {canAddNote ? (
          <form className="mt-6 space-y-4 border-t border-[#e7e7e7] pt-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="note" className={cd.label}>
                Add note
              </label>
              <textarea
                id="note"
                rows={4}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                className={cd.textarea}
              />
            </div>
            <button type="submit" disabled={submitting} className={cd.btnPrimary}>
              {submitting ? "Saving..." : "Add care note"}
            </button>
          </form>
        ) : (
          <p className={`mt-4 ${cd.muted}`}>Care notes are available after acceptance.</p>
        )}

        {notes.length === 0 ? <p className={`mt-4 ${cd.muted}`}>No care notes yet.</p> : null}
        {notes.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li key={note.id} className={cd.cardMuted}>
                <p className="text-sm text-[#4b4b4b]">{note.note}</p>
                <p className="mt-2 text-xs text-[#8ca09a]">{new Date(note.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
