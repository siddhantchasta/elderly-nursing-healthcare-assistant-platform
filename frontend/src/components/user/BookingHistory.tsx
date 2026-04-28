"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listBookings, listCaregivers, listPatientProfiles, listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { CaregiverListItem } from "@/types/caregiver";
import type { PatientProfile } from "@/types/patient";
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

export default function BookingHistory() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingsData, patientsData, servicesData, caregiversData] = await Promise.all([
        listBookings(),
        listPatientProfiles(),
        listServices(),
        listCaregivers(),
      ]);

      setBookings(bookingsData);
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
        setError("Failed to fetch booking history");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadData]);

  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const serviceMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const caregiverMap = useMemo(() => new Map(caregivers.map((c) => [c.id, c])), [caregivers]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Booking History</h2>
        <button onClick={() => void loadData()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading bookings...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && bookings.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No booking history found.</p>
      ) : null}

      {!loading && !error && bookings.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-2 py-2 font-medium">Service</th>
                <th className="px-2 py-2 font-medium">Caregiver</th>
                <th className="px-2 py-2 font-medium">Patient</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 font-medium">Scheduled At</th>
                <th className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const serviceName = serviceMap.get(booking.serviceId)?.serviceName ?? booking.serviceId;
                const caregiverEmail = caregiverMap.get(booking.caregiverId)?.email ?? booking.caregiverId;
                const patient = patientMap.get(booking.patientId);

                return (
                  <tr key={booking.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-900">{serviceName}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{caregiverEmail}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">
                      {patient ? `Age ${patient.age}` : booking.patientId}
                    </td>
                    <td className="px-2 py-3 text-sm text-slate-700">{BOOKING_TYPE_LABELS[booking.bookingType]}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{new Date(booking.scheduledAt).toLocaleString()}</td>
                    <td className="px-2 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
                        {booking.status.replace("_", " ")}
                      </span>
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
