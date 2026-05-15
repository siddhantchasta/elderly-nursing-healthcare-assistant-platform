"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import {
  getBookingById,
  listCaregivers,
  listCareNotes,
  listPatientProfiles,
  listServices,
  rateBooking,
} from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { CaregiverListItem } from "@/types/caregiver";
import type { CareNoteItem } from "@/types/careNote";
import type { PatientProfile } from "@/types/patient";
import type { ServiceItem } from "@/types/service";

import { BOOKING_STATUS_STYLES, ud } from "@/lib/ui/user-dashboard";

export default function BookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [notes, setNotes] = useState<CareNoteItem[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverListItem[]>([]);

  const [rating, setRating] = useState("5");
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingData, notesData, patientsData, servicesData, caregiversData] = await Promise.all([
        getBookingById(bookingId),
        listCareNotes(bookingId),
        listPatientProfiles(),
        listServices(),
        listCaregivers(),
      ]);

      setBooking(bookingData);
      setNotes(notesData);
      setPatients(patientsData);
      setServices(servicesData);
      setCaregivers(caregiversData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to fetch booking detail");
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadDetail();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadDetail]);

  async function onRateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingRating(true);
    setError(null);
    setSuccess(null);

    try {
      await rateBooking(bookingId, Number(rating));
      setSuccess("Rating submitted successfully.");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to submit rating");
      }
    } finally {
      setSubmittingRating(false);
    }
  }

  const patient = useMemo(() => patients.find((p) => p.id === booking?.patientId), [patients, booking]);
  const service = useMemo(() => services.find((s) => s.id === booking?.serviceId), [services, booking]);
  const caregiver = useMemo(() => caregivers.find((c) => c.id === booking?.caregiverId), [caregivers, booking]);

  if (loading) {
    return <p className={ud.muted}>Loading booking detail...</p>;
  }

  if (!booking) {
    return <p className={ud.error}>Booking not found.</p>;
  }

  return (
    <div className="space-y-8">
      <section className={ud.card}>
        <div className="flex items-start justify-between gap-3">
          <h2 className={ud.cardTitle}>Booking details</h2>
          <span className={`${ud.badge} ${BOOKING_STATUS_STYLES[booking.status]}`}>
            {booking.status.replace("_", " ")}
          </span>
        </div>

        {error ? <p className={`mt-4 ${ud.error}`}>{error}</p> : null}
        {success ? <p className={`mt-4 ${ud.success}`}>{success}</p> : null}

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#8ca09a]">Service</dt>
            <dd className="mt-1 font-medium text-[#111111]">{service?.serviceName ?? booking.serviceId}</dd>
          </div>
          <div>
            <dt className="text-[#8ca09a]">Caregiver</dt>
            <dd className="mt-1 font-medium text-[#111111]">{caregiver?.email ?? booking.caregiverId}</dd>
          </div>
          <div>
            <dt className="text-[#8ca09a]">Patient</dt>
            <dd className="mt-1 font-medium text-[#111111]">{patient ? `Age ${patient.age}` : booking.patientId}</dd>
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

        {booking.status === "completed" ? (
          <form className="mt-8 flex flex-wrap items-end gap-4 border-t border-[#e7e7e7] pt-6" onSubmit={onRateSubmit}>
            <div>
              <label htmlFor="rating" className={ud.label}>
                Rate this booking
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className={ud.select}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <button type="submit" disabled={submittingRating} className={ud.btnPrimary}>
              {submittingRating ? "Submitting..." : "Submit rating"}
            </button>
          </form>
        ) : null}
      </section>

      <section className={ud.card}>
        <h3 className={ud.cardTitle}>Care notes</h3>
        {notes.length === 0 ? <p className={`mt-4 ${ud.muted}`}>No care notes yet.</p> : null}
        {notes.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li key={note.id} className={ud.cardMuted}>
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
