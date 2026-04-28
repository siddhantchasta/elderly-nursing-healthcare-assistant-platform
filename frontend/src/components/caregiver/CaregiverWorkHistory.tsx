"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getCaregiverWorkHistory } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { CaregiverWorkHistoryItem, CaregiverWorkSummary } from "@/types/caregiver";

const STATUS_STYLES: Record<CaregiverWorkHistoryItem["status"], string> = {
  accepted: "bg-sky-100 text-sky-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
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
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Work Summary</h2>
            <p className="mt-1 text-sm text-slate-600">Completed bookings and earnings overview.</p>
          </div>
          <button onClick={() => void loadHistory()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            Refresh
          </button>
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-600">Loading summary...</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {!loading && !error && summary ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-500">Completed Bookings</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalCompletedBookings}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-500">Total Earnings</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Rs {summary.totalEarnings}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Work History</h3>
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-600">Loading history...</p> : null}

        {!loading && summary && summary.history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No work history yet.</p>
        ) : null}

        {!loading && summary && summary.history.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                  <th className="px-2 py-2 font-medium">Booking</th>
                  <th className="px-2 py-2 font-medium">Service</th>
                  <th className="px-2 py-2 font-medium">Scheduled</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {summary.history.map((item) => (
                  <tr key={item.bookingId} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-700">{item.bookingId}</td>
                    <td className="px-2 py-3 text-sm text-slate-800">{item.serviceName}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{new Date(item.scheduledAt).toLocaleString()}</td>
                    <td className="px-2 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm text-slate-700">Rs {item.servicePrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
