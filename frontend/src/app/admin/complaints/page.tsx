"use client";

import { useRouter } from "next/navigation";

import AdminDashboardShell from "@/components/layout/AdminDashboardShell";

import ComplaintsModerationTable from "@/components/admin/ComplaintsModerationTable";

import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { clearSession } from "@/lib/auth/session";

export default function AdminComplaintsPage() {
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
          title="Complaints Moderation"
          description="Monitor escalations, resolve user concerns, and maintain service quality across the ElderCare platform."
        />

        <ComplaintsModerationTable />
      </div>
    </AdminDashboardShell>
  );
}