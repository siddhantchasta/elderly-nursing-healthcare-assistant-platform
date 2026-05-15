"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Activity,
  Star,
  RefreshCw,
} from "lucide-react";

import { ApiClientError } from "@/lib/api/client";
import { getAdminKpis } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";

import type { AdminKpiSummary } from "@/types/admin";

const KPI_ITEMS: {
  key: keyof AdminKpiSummary;
  label: string;
  suffix?: string;
  icon: any;
  accent: string;
}[] = [
  {
    key: "registeredUsersCount",
    label: "Registered Users",
    icon: Users,
    accent: "from-blue-500/20 to-blue-500/5",
  },
  {
    key: "verifiedCaregiversCount",
    label: "Verified Caregivers",
    icon: ShieldCheck,
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    key: "bookingCompletionRate",
    label: "Booking Completion",
    suffix: "%",
    icon: CheckCircle2,
    accent: "from-orange-500/20 to-orange-500/5",
  },
  {
    key: "averageResponseTimeHours",
    label: "Avg Response Time",
    suffix: "hrs",
    icon: Clock3,
    accent: "from-violet-500/20 to-violet-500/5",
  },
  {
    key: "monthlyActiveUsers",
    label: "Monthly Active Users",
    icon: Activity,
    accent: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    key: "userSatisfactionScore",
    label: "Satisfaction Score",
    icon: Star,
    accent: "from-pink-500/20 to-pink-500/5",
  },
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
    <section className="rounded-[36px] border border-white/10 bg-white/4 p-7 backdrop-blur-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#ff6a3d]">
            Analytics
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
            KPI Summary
          </h2>
        </div>

        <button
          onClick={() => void loadKpis()}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />

          Refresh
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-[170px] animate-pulse rounded-[28px] bg-white/5"
            />
          ))}
        </div>
      ) : null}

      {/* ERROR */}
      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {/* KPI GRID */}
      {!loading && kpis ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {KPI_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className={`group relative overflow-hidden rounded-[30px] border border-white/10 bg-linear-to-br ${item.accent} p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
              >
                {/* GLOW */}
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

                {/* TOP */}
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/50">
                      {item.label}
                    </p>

                    <h3 className="mt-5 text-4xl font-black tracking-tight text-white">
                      {kpis[item.key]}
                      {item.suffix ? item.suffix : ""}
                    </h3>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/80">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                {/* FOOTER */}
                <div className="relative mt-8 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/30">
                    Live Platform Data
                  </span>

                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.8)]" />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}