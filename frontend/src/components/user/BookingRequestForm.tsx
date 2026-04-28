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

const BOOKING_TYPE_OPTIONS: { value: BookingType; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "long_term", label: "Long Term" },
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
        setError("Please select patient, service, caregiver, and schedule.");
        return;
      }

      await createBooking({
        patientId,
        serviceId,
        caregiverId,
        bookingType,
        scheduledAt: new Date(scheduledAtLocal).toISOString(),
      });

      setSuccess("Booking request sent successfully.");
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

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Create Booking Request</h2>
        <button onClick={() => void loadPrerequisites()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh Data
        </button>
      </div>

      {loadingData ? <p className="mt-4 text-sm text-slate-600">Loading patients, services, and caregivers...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

      {!loadingData ? (
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="patientId" className="mb-1 block text-sm font-medium text-slate-700">Patient Profile</label>
            <select
              id="patientId"
              required
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>Age {patient.age} - {patient.medicalNeeds.slice(0, 40)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="serviceId" className="mb-1 block text-sm font-medium text-slate-700">Service</label>
            <select
              id="serviceId"
              required
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.serviceName}</option>
              ))}
            </select>
            {selectedService ? (
              <p className="mt-1 text-xs text-slate-600">{selectedService.duration} | Rs {selectedService.price}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="caregiverId" className="mb-1 block text-sm font-medium text-slate-700">Caregiver</label>
            <select
              id="caregiverId"
              required
              value={caregiverId}
              onChange={(event) => setCaregiverId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            >
              {caregivers.map((caregiver) => (
                <option key={caregiver.id} value={caregiver.id}>{caregiver.email} ({caregiver.rating.toFixed(1)})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bookingType" className="mb-1 block text-sm font-medium text-slate-700">Booking Type</label>
            <select
              id="bookingType"
              required
              value={bookingType}
              onChange={(event) => setBookingType(event.target.value as BookingType)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            >
              {BOOKING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scheduledAt" className="mb-1 block text-sm font-medium text-slate-700">Scheduled At</label>
            <input
              id="scheduledAt"
              type="datetime-local"
              required
              value={scheduledAtLocal}
              onChange={(event) => setScheduledAtLocal(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || patients.length === 0 || services.length === 0 || caregivers.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending request..." : "Send Booking Request"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
