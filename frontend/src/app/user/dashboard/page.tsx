"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, getSessionUser } from "@/lib/auth/session";

export default function UserDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-semibold">User Dashboard</h1>
      <p className="mt-2 text-slate-600">Authentication is active. Next step will build user features.</p>
      <div className="mt-6">
        <Link href="/user/patients" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Manage Patient Profiles
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
    </main>
  );
}
