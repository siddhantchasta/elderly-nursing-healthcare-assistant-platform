"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  RefreshCw,
  CalendarCheck2,
  FileWarning,
} from "lucide-react";

import { ApiClientError } from "@/lib/api/client";

import { getAdminOverviewReport } from "@/lib/api/endpoints";

import { getSessionUser } from "@/lib/auth/session";

import type { AdminOverviewReport } from "@/types/admin";

const BOOKING_LABELS: Record<
  keyof AdminOverviewReport["bookingCountsByStatus"],
  string
> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
  completed: "Completed",
};

const COMPLAINT_LABELS: Record<
  keyof AdminOverviewReport["complaintCountsByStatus"],
  string
> = {
  open: "Open",
  escalated: "Escalated",
  resolved: "Resolved",
};

export default function OverviewReport() {
  const router = useRouter();

  const [report, setReport] =
    useState<AdminOverviewReport | null>(null);

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
    <section className="rounded-[36px] border border-white/10 bg-white/4 p-7 backdrop-blur-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#ff6a3d]">
            Operations
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
            Overview Report
          </h2>
        </div>

        <button
          onClick={() => void loadReport()}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />

          Refresh
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-[300px] animate-pulse rounded-[28px] bg-white/5" />
          <div className="h-[300px] animate-pulse rounded-[28px] bg-white/5" />
        </div>
      ) : null}

      {/* ERROR */}
      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {/* CONTENT */}
      {!loading && report ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* BOOKINGS */}
          <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CalendarCheck2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Bookings
                </h3>

                <p className="text-sm text-white/40">
                  Platform booking activity
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {Object.entries(report.bookingCountsByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/3 px-5 py-4"
                  >
                    <span className="text-sm font-medium text-white/60">
                      {
                        BOOKING_LABELS[
                          status as keyof AdminOverviewReport["bookingCountsByStatus"]
                        ]
                      }
                    </span>

                    <span className="text-lg font-bold text-white">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/5 bg-white/3 px-5 py-4">
              <p className="text-sm text-white/40">
                Total Bookings
              </p>

              <h4 className="mt-2 text-3xl font-black text-white">
                {report.totalBookings}
              </h4>
            </div>
          </div>

          {/* COMPLAINTS */}
          <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <FileWarning className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Complaints
                </h3>

                <p className="text-sm text-white/40">
                  User issue monitoring
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {Object.entries(report.complaintCountsByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/3 px-5 py-4"
                  >
                    <span className="text-sm font-medium text-white/60">
                      {
                        COMPLAINT_LABELS[
                          status as keyof AdminOverviewReport["complaintCountsByStatus"]
                        ]
                      }
                    </span>

                    <span className="text-lg font-bold text-white">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/5 bg-white/3 px-5 py-4">
              <p className="text-sm text-white/40">
                Total Complaints
              </p>

              <h4 className="mt-2 text-3xl font-black text-white">
                {report.totalComplaints}
              </h4>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}