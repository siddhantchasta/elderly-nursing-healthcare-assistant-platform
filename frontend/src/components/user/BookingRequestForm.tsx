"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createBooking, listCaregivers, listPatientProfiles, listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingType } from "@/types/booking";
import type { CaregiverListItem } from "@/types/caregiver";
import type { PatientProfile } from "@/types/patient";
import type { ServiceItem } from "@/types/service";

const BOOKING_TYPE_OPTIONS: { value: BookingType; label: string; description: string }[] = [
  { value: "hourly", label: "Hourly", description: "Pay by the hour for flexible care" },
  { value: "daily", label: "Daily", description: "Full day care coverage" },
  { value: "long_term", label: "Long Term", description: "Extended care arrangements" },
];

export default function BookingRequestForm() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverListItem[]>([]);

  const [patientId, setPatientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [caregiverId, setCaregiverId] = useState("");
  const [bookingType, setBookingType] = useState<BookingType>("hourly");
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedService = useMemo(() => services.find((item) => item.id === serviceId), [serviceId, services]);
  const selectedCaregiver = useMemo(() => caregivers.find((item) => item.id === caregiverId), [caregiverId, caregivers]);

  const loadPrerequisites = useCallback(async () => {
    setLoadingData(true);
    setError(null);

    try {
      const [patientsData, servicesData, caregiversData] = await Promise.all([
        listPatientProfiles(),
        listServices(),
        listCaregivers(),
      ]);

      setPatients(patientsData);
      setServices(servicesData);
      setCaregivers(caregiversData);

      if (patientsData.length > 0) setPatientId((prev) => prev || patientsData[0].id);
      if (servicesData.length > 0) setServiceId((prev) => prev || servicesData[0].id);
      if (caregiversData.length > 0) setCaregiverId((prev) => prev || caregiversData[0].id);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load booking prerequisites");
      }
    } finally {
      setLoadingData(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadPrerequisites();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadPrerequisites]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!patientId || !serviceId || !caregiverId || !scheduledAtLocal) {
        setError("Please complete all required fields.");
        return;
      }

      await createBooking({
        patientId,
        serviceId,
        caregiverId,
        bookingType,
        scheduledAt: new Date(scheduledAtLocal).toISOString(),
      });

      setSuccess("Your booking request has been submitted successfully.");
      setScheduledAtLocal("");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to create booking");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingData) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading booking options...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground">Create a Patient Profile First</h3>
        <p className="mt-1 text-sm text-muted-foreground">You need to add a patient profile before booking care services.</p>
        <a
          href="/user/patients"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add Patient Profile
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Book Care Service</h2>
        <p className="mt-1 text-sm text-muted-foreground">Complete the form below to request a care appointment.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <form className="space-y-6" onSubmit={onSubmit}>
        {/* Patient selection */}
        <div>
          <label htmlFor="patientId" className="mb-1.5 block text-sm font-medium text-foreground">
            Select Patient
          </label>
          <select
            id="patientId"
            required
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                Age {patient.age} - {patient.medicalNeeds.slice(0, 40)}
              </option>
            ))}
          </select>
        </div>

        {/* Service selection */}
        <div>
          <label htmlFor="serviceId" className="mb-1.5 block text-sm font-medium text-foreground">
            Care Service
          </label>
          <select
            id="serviceId"
            required
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.serviceName}
              </option>
            ))}
          </select>
          {selectedService && (
            <div className="mt-2 rounded-lg bg-secondary/50 p-3">
              <p className="text-sm text-foreground">{selectedService.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Duration: {selectedService.duration} | Price: Rs {selectedService.price}
              </p>
            </div>
          )}
        </div>

        {/* Caregiver selection */}
        <div>
          <label htmlFor="caregiverId" className="mb-1.5 block text-sm font-medium text-foreground">
            Preferred Caregiver
          </label>
          <select
            id="caregiverId"
            required
            value={caregiverId}
            onChange={(event) => setCaregiverId(event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
          >
            {caregivers.map((caregiver) => (
              <option key={caregiver.id} value={caregiver.id}>
                {caregiver.email} ({caregiver.rating.toFixed(1)} rating)
              </option>
            ))}
          </select>
          {selectedCaregiver && (
            <div className="mt-2 rounded-lg bg-secondary/50 p-3">
              <p className="text-sm text-foreground">{selectedCaregiver.qualifications}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Areas: {selectedCaregiver.serviceAreas.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Booking type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Booking Type</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {BOOKING_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBookingType(option.value)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  bookingType === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label htmlFor="scheduledAt" className="mb-1.5 block text-sm font-medium text-foreground">
            Preferred Date & Time
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            required
            value={scheduledAtLocal}
            onChange={(event) => setScheduledAtLocal(event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || patients.length === 0 || services.length === 0 || caregivers.length === 0}
          className="w-full rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting Request..." : "Request Booking"}
        </button>
      </form>
    </div>
  );
}
