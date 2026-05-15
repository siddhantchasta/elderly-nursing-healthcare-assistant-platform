"use client";

import { useRouter } from "next/navigation";

import AdminDashboardShell from "@/components/layout/AdminDashboardShell";

import ServiceManager from "@/components/admin/ServiceManager";

import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { clearSession } from "@/lib/auth/session";

export default function AdminServicesPage() {
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
          title="Service Management"
          description="Create, update, and organize healthcare service offerings available across the ElderCare platform."
        />

        <ServiceManager />
      </div>
    </AdminDashboardShell>
  );
}