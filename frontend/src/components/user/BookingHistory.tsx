"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listBookings, listCaregivers, listPatientProfiles, listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { BookingItem } from "@/types/booking";
import type { CaregiverListItem } from "@/types/caregiver";
import type { PatientProfile } from "@/types/patient";
import type { ServiceItem } from "@/types/service";
import DashboardSection from "@/components/ui/DashboardSection";
import {
  formatBookingContext,
  formatBookingReference,
  formatCaregiverSummary,
  formatPatientSummary,
} from "@/lib/bookings/display";
import { BOOKING_STATUS_STYLES, ud } from "@/lib/ui/user-dashboard";

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
    <DashboardSection
      title="Booking history"
      description="All scheduled and completed visits for your household."
      onRefresh={() => void loadData()}
    >
      {loading ? <p className={ud.muted}>Loading bookings...</p> : null}
      {error ? <p className={ud.error}>{error}</p> : null}

      {!loading && !error && bookings.length === 0 ? (
        <p className={ud.muted}>No bookings yet. Book care from the dashboard to get started.</p>
      ) : null}

      {!loading && !error && bookings.length > 0 ? (
        <div className={ud.tableWrap}>
          <table className={ud.table}>
            <thead>
              <tr>
                <th className={ud.th}>Service</th>
                <th className={ud.th}>Caregiver</th>
                <th className={ud.th}>Patient</th>
                <th className={ud.th}>Type</th>
                <th className={ud.th}>Scheduled</th>
                <th className={ud.th}>Status</th>
                <th className={ud.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const serviceName = serviceMap.get(booking.serviceId)?.serviceName ?? booking.serviceId;
                const caregiver = caregiverMap.get(booking.caregiverId);
                const patient = patientMap.get(booking.patientId);
                const bookingReference = formatBookingReference(booking.id);
                const bookingContext = formatBookingContext(booking, serviceName);
                const caregiverSummary = formatCaregiverSummary(caregiver) ?? booking.caregiverId;
                const patientSummary = formatPatientSummary(patient) ?? booking.patientId;

                return (
                  <tr key={booking.id}>
                    <td className={ud.tdStrong}>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#111111]">{bookingReference}</p>
                        <p className="text-xs text-[#8ca09a]">{bookingContext}</p>
                      </div>
                    </td>
                    <td className={ud.td}>{caregiverSummary}</td>
                    <td className={ud.td}>{patientSummary}</td>
                    <td className={ud.td}>{BOOKING_TYPE_LABELS[booking.bookingType]}</td>
                    <td className={ud.td}>{new Date(booking.scheduledAt).toLocaleString()}</td>
                    <td className={ud.td}>
                      <span className={`${ud.badge} ${BOOKING_STATUS_STYLES[booking.status]}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className={ud.td}>
                      <Link href={`/user/bookings/${booking.id}`} className={ud.linkAccent}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardSection>
  );
}
