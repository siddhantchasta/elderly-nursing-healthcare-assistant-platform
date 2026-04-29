"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getAdminOverviewReport } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { AdminOverviewReport } from "@/types/admin";

const BOOKING_LABELS: Record<keyof AdminOverviewReport["bookingCountsByStatus"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
};

const COMPLAINT_LABELS: Record<keyof AdminOverviewReport["complaintCountsByStatus"], string> = {
  open: "Open",
  escalated: "Escalated",
  resolved: "Resolved",
};

export default function OverviewReport() {
  const router = useRouter();
  const [report, setReport] = useState<AdminOverviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminOverviewReport();
      setReport(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load overview report");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadReport();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadReport]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Overview Report</h2>
        <button onClick={() => void loadReport()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading overview...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading && report ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Bookings</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(report.bookingCountsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span className="text-slate-700">{BOOKING_LABELS[status as keyof AdminOverviewReport["bookingCountsByStatus"]]}</span>
                  <span className="font-medium text-slate-900">{count}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">Total bookings: {report.totalBookings}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Complaints</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(report.complaintCountsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span className="text-slate-700">{COMPLAINT_LABELS[status as keyof AdminOverviewReport["complaintCountsByStatus"]]}</span>
                  <span className="font-medium text-slate-900">{count}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">Total complaints: {report.totalComplaints}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
