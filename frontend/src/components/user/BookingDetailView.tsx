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

const STATUS_STYLES: Record<BookingItem["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-sky-100 text-sky-800",
  rejected: "bg-rose-100 text-rose-800",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-green-100 text-green-800",
};

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
      setSuccess("Thank you for your feedback!");
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
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="font-medium text-destructive">Booking not found</p>
        <p className="mt-1 text-sm text-muted-foreground">This booking may have been removed or you may not have access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main booking info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{service?.serviceName ?? "Care Service"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Booking ID: {bookingId.slice(0, 8)}...</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_STYLES[booking.status]}`}>
            {booking.status.replace("_", " ")}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patient</p>
            <p className="mt-1 font-medium text-foreground">{patient ? `Age ${patient.age}` : "Patient profile"}</p>
            {patient && <p className="mt-0.5 text-sm text-muted-foreground">{patient.medicalNeeds.slice(0, 50)}...</p>}
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Caregiver</p>
            <p className="mt-1 font-medium text-foreground">{caregiver?.email ?? "Assigned caregiver"}</p>
            {caregiver && <p className="mt-0.5 text-sm text-muted-foreground">Rating: {caregiver.rating.toFixed(1)}/5</p>}
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Booking Type</p>
            <p className="mt-1 font-medium capitalize text-foreground">{booking.bookingType.replace("_", " ")}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scheduled</p>
            <p className="mt-1 font-medium text-foreground">{new Date(booking.scheduledAt).toLocaleString()}</p>
          </div>
        </div>

        {booking.status === "completed" && (
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-semibold text-foreground">Rate This Care Session</h3>
            <p className="mt-1 text-sm text-muted-foreground">Your feedback helps us maintain quality care.</p>
            <form className="mt-4 flex flex-wrap items-end gap-4" onSubmit={onRateSubmit}>
              <div>
                <label htmlFor="rating" className="mb-1.5 block text-sm font-medium text-foreground">
                  Your Rating
                </label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className="rounded-lg border border-border bg-card px-4 py-2.5 text-foreground outline-none focus:border-primary"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submittingRating}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Care notes */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">Care Notes</h3>
        <p className="mt-1 text-sm text-muted-foreground">Notes and updates from the caregiver.</p>

        {notes.length === 0 ? (
          <div className="mt-4 rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">No care notes have been added yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border p-4">
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
  );
}
