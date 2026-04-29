"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getAdminKpis } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { AdminKpiSummary } from "@/types/admin";

const KPI_LABELS: { key: keyof AdminKpiSummary; label: string; suffix?: string }[] = [
  { key: "registeredUsersCount", label: "Registered Users" },
  { key: "verifiedCaregiversCount", label: "Verified Caregivers" },
  { key: "bookingCompletionRate", label: "Booking Completion Rate", suffix: "%" },
  { key: "averageResponseTimeHours", label: "Avg Response Time", suffix: "hrs" },
  { key: "monthlyActiveUsers", label: "Monthly Active Users" },
  { key: "userSatisfactionScore", label: "User Satisfaction Score" },
];

export default function KpiCards() {
  const router = useRouter();
  const [kpis, setKpis] = useState<AdminKpiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKpis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminKpis();
      setKpis(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load KPI summary");
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
      void loadKpis();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadKpis]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">KPI Summary</h2>
        <button onClick={() => void loadKpis()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading KPIs...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading && kpis ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KPI_LABELS.map((item) => (
            <div key={item.key} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {kpis[item.key]}
                {item.suffix ? ` ${item.suffix}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
