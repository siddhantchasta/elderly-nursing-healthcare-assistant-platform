"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
} from "lucide-react";

import { clearSession, getSessionUser } from "@/lib/auth/session";

import AdminDashboardShell from "@/components/layout/AdminDashboardShell";

import KpiCards from "@/components/admin/KpiCards";
import OverviewReport from "@/components/admin/OverviewReport";

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getSessionUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  return (
    <AdminDashboardShell
      onLogout={() => {
        clearSession();
        router.push("/login");
      }}
    >
      {/* TOPBAR */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#ff6a3d]">
            ElderCare Platform
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Admin Dashboard
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/50">
            Monitor platform activity, oversee caregivers,
            manage complaints, and maintain operational health.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10">
            <Search className="h-5 w-5" />
          </button>

          <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </button>

          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-3 sm:block">
            <p className="text-xs text-white/40">
              Active Admin
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              Operations Team
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="mt-10">
        <KpiCards />
      </div>
    </AdminDashboardShell>
  );
}