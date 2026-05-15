"use client";

import { useRouter } from "next/navigation";

import AdminDashboardShell from "@/components/layout/AdminDashboardShell";

import PendingCaregiversTable from "@/components/admin/PendingCaregiversTable";

import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { clearSession } from "@/lib/auth/session";

export default function AdminPendingCaregiversPage() {
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
          title="Caregiver Verification"
          description="Review pending caregiver applications, validate credentials, and approve trusted professionals for the platform."
        />

        <PendingCaregiversTable />
      </div>
    </AdminDashboardShell>
  );
}