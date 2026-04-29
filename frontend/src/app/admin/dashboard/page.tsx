"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, getSessionUser } from "@/lib/auth/session";
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
    <main className="min-h-screen bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Monitor platform activity and manage operations.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/caregivers/pending" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              Verify Caregivers
            </Link>
            <Link href="/admin/complaints" className="rounded-lg border border-rose-600 px-4 py-2 text-sm font-medium text-rose-700">
              Complaints
            </Link>
            <Link href="/admin/users" className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700">
              User Management
            </Link>
            <Link href="/admin/reports/overview" className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700">
              Overview Report
            </Link>
          </div>
          <button
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
            className="mt-6 rounded-lg border border-slate-300 px-4 py-2"
          >
            Logout
          </button>
        </div>

        <KpiCards />
        <OverviewReport />
      </div>
    </main>
  );
}
