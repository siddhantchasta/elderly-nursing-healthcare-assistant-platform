"use client";

import { useRouter } from "next/navigation";

import AdminDashboardShell from "@/components/layout/AdminDashboardShell";

import AdminUsersTable from "@/components/admin/AdminUsersTable";

import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { clearSession } from "@/lib/auth/session";

export default function AdminUsersPage() {
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
          title="User Management"
          description="Manage user access, caregiver permissions, and administrative roles across the ElderCare ecosystem."
        />

        <AdminUsersTable />
      </div>
    </AdminDashboardShell>
  );
}