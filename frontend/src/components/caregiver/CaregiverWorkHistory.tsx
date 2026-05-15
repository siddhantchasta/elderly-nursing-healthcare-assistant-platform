"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getCaregiverWorkHistory } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import DashboardSection from "@/components/ui/DashboardSection";
import { BOOKING_STATUS_STYLES, cd } from "@/lib/ui/caregiver-dashboard";
import type { CaregiverWorkHistoryItem, CaregiverWorkSummary } from "@/types/caregiver";

const WORK_STATUS_STYLES: Record<CaregiverWorkHistoryItem["status"], string> = {
  accepted: BOOKING_STATUS_STYLES.accepted,
  in_progress: BOOKING_STATUS_STYLES.in_progress,
  completed: BOOKING_STATUS_STYLES.completed,
};

export default function CaregiverWorkHistory() {
  const router = useRouter();
  const [summary, setSummary] = useState<CaregiverWorkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCaregiverWorkHistory();
      setSummary(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }

        if (err.status === 404 && err.message === "CAREGIVER_PROFILE_NOT_FOUND") {
          setError("Please complete your caregiver profile before viewing work history.");
          return;
        }

        setError(err.message);
      } else {
        setError("Failed to load work history");
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
      void loadHistory();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadHistory]);

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Work summary"
        description="Completed bookings and earnings overview."
        onRefresh={() => void loadHistory()}
      >
        {loading ? <p className={cd.muted}>Loading summary...</p> : null}
        {error ? <p className={cd.error}>{error}</p> : null}

        {!loading && !error && summary ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={cd.kpiCard}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ca09a]">Completed bookings</p>
              <p className="mt-2 text-[32px] font-black tracking-tight text-[#111111]">{summary.totalCompletedBookings}</p>
            </div>
            <div className={cd.kpiCard}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ca09a]">Total earnings</p>
              <p className="mt-2 text-[32px] font-black tracking-tight text-[#111111]">Rs {summary.totalEarnings}</p>
            </div>
          </div>
        ) : null}
      </DashboardSection>

      <DashboardSection title="Visit history" description="Past accepted and completed care visits.">
        {loading ? <p className={cd.muted}>Loading history...</p> : null}

        {!loading && summary && summary.history.length === 0 ? (
          <p className={cd.muted}>No work history yet.</p>
        ) : null}

        {!loading && summary && summary.history.length > 0 ? (
          <div className={cd.tableWrap}>
            <table className={cd.table}>
              <thead>
                <tr>
                  <th className={cd.th}>Booking</th>
                  <th className={cd.th}>Service</th>
                  <th className={cd.th}>Scheduled</th>
                  <th className={cd.th}>Status</th>
                  <th className={cd.th}>Price</th>
                </tr>
              </thead>
              <tbody>
                {summary.history.map((item) => (
                  <tr key={item.bookingId}>
                    <td className={cd.td}>{item.bookingId}</td>
                    <td className={cd.tdStrong}>{item.serviceName}</td>
                    <td className={cd.td}>{new Date(item.scheduledAt).toLocaleString()}</td>
                    <td className={cd.td}>
                      <span className={`${cd.badge} ${WORK_STATUS_STYLES[item.status]}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className={cd.td}>Rs {item.servicePrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </DashboardSection>
    </div>
  );
}
