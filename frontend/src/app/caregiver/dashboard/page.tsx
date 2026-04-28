"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSessionUser } from "@/lib/auth/session";

export default function CaregiverDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "caregiver") {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-semibold">Caregiver Dashboard</h1>
      <p className="mt-2 text-slate-600">Authentication is active. Next step will build caregiver features.</p>
      <button
        onClick={() => {
          clearSession();
          router.push("/login");
        }}
        className="mt-6 rounded-lg border border-slate-300 px-4 py-2"
      >
        Logout
      </button>
    </main>
  );
}
