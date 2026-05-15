"use client";

import { useRouter } from "next/navigation";

import AdminDashboardShell from "@/components/layout/AdminDashboardShell";

import OverviewReport from "@/components/admin/OverviewReport";

import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { clearSession } from "@/lib/auth/session";

export default function AdminOverviewReportPage() {
  const router = useRouter();

  return (
    <AdminDashboardShell
      onLogout={() => {
        clearSession();

        router.push("/login");
      }}
    >
      <div className="space-y-8">
        <AdminPageHeader
          title="Platform Reports"
          description="Analyze booking performance, complaints activity, operational metrics, and overall healthcare platform health."
        />

        <OverviewReport />
      </div>
    </AdminDashboardShell>
  );
}