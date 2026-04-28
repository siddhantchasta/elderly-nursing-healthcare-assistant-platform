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
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/user/patients" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Manage Patient Profiles
        </Link>
        <Link href="/user/services" className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700">
          Browse Services
        </Link>
        <Link href="/user/caregivers" className="rounded-lg border border-slate-400 px-4 py-2 text-sm font-medium text-slate-700">
          Browse Caregivers
        </Link>
        <Link href="/user/bookings/new" className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700">
          Create Booking
        </Link>
        <Link href="/user/bookings" className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700">
          Track Bookings
        </Link>
        <Link href="/user/complaints" className="rounded-lg border border-rose-600 px-4 py-2 text-sm font-medium text-rose-700">
          Complaints
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
