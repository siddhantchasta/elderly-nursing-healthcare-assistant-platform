"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  HeartPulse,
  MessageSquare,
  UserCheck,
  Users,
} from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  listBookings,
  listComplaints,
  listPatientProfiles,
  listUserNotifications,
} from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { getGreeting } from "@/lib/ui/user-dashboard";

interface DashboardStats {
  patients: number;
  bookings: number;
  activeBookings: number;
  openComplaints: number;
  updates: number;
}

const QUICK_ACTIONS = [
  {
    href: "/user/patients",
    title: "Patient profiles",
    description: "Add or review care recipients and medical needs.",
    icon: Users,
  },
  {
    href: "/user/bookings/new",
    title: "Book care",
    description: "Schedule hourly, daily, or long-term visits.",
    icon: Calendar,
    primary: true,
  },
  {
    href: "/user/caregivers",
    title: "Find caregivers",
    description: "Browse verified nurses and attendants.",
    icon: UserCheck,
  },
  {
    href: "/user/services",
    title: "Browse services",
    description: "Explore nursing, therapy, and attendant care.",
    icon: HeartPulse,
  },
  {
    href: "/user/bookings",
    title: "Track bookings",
    description: "View status and care notes for each visit.",
    icon: Calendar,
  },
  {
    href: "/user/complaints",
    title: "Support & complaints",
    description: "Raise issues and follow resolution status.",
    icon: MessageSquare,
  },
] as const;

export default function UserDashboardHome() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }
    setEmail(user.email);

    void (async () => {
      try {
        const [patients, bookings, complaints, notifications] = await Promise.all([
          listPatientProfiles(),
          listBookings(),
          listComplaints(),
          listUserNotifications(),
        ]);

        const activeBookings = bookings.filter(
          (b) => b.status === "pending" || b.status === "accepted" || b.status === "in_progress"
        ).length;
        const openComplaints = complaints.filter((c) => c.status === "open" || c.status === "escalated").length;
        const updates = notifications.bookingUpdates.length + notifications.complaintUpdates.length;

        setStats({
          patients: patients.length,
          bookings: bookings.length,
          activeBookings,
          openComplaints,
          updates,
        });
      } catch (err) {
        if (err instanceof ApiClientError && (err.status === 401 || err.status === 403)) {
          router.replace("/login");
        }
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [router]);

  const greeting = getGreeting();
  const displayEmail = email ? email.split("@")[0] : "there";

  const kpis = [
    { label: "Patient profiles", value: stats?.patients, href: "/user/patients" },
    { label: "Total bookings", value: stats?.bookings, href: "/user/bookings" },
    { label: "Active visits", value: stats?.activeBookings, href: "/user/bookings" },
    { label: "Open issues", value: stats?.openComplaints, href: "/user/complaints" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ca09a]">Family dashboard</p>
        <h1 className="mt-2 text-[32px] font-black tracking-[-0.04em] text-[#111111] sm:text-[42px]">
          {greeting}, {displayEmail}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6d7b76]">
          Manage patient profiles, book verified caregivers, and stay updated on every visit — all in one calm place.
        </p>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group rounded-[24px] border border-[#e7e7e7] bg-white p-6 shadow-sm transition hover:border-[#cad5d2]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ca09a]">{kpi.label}</p>
            <p className="mt-3 text-[36px] font-black leading-none tracking-[-0.03em] text-[#111111]">
              {statsLoading ? "—" : (kpi.value ?? 0)}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#ff6a3d] opacity-0 transition group-hover:opacity-100">
              View
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>
        ))}
      </section>

      {!statsLoading && stats && stats.updates > 0 ? (
        <Link
          href="/user/notifications"
          className="mb-10 flex items-center justify-between gap-4 rounded-[20px] border border-[#cad5d2] bg-[#eef5f2] px-6 py-4 transition hover:border-[#b8cdc4]"
        >
          <div>
            <p className="text-sm font-semibold text-[#111111]">You have {stats.updates} recent updates</p>
            <p className="mt-0.5 text-sm text-[#6d7b76]">Booking and complaint status changes are waiting.</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#4a6b5c]" aria-hidden />
        </Link>
      ) : null}

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">Quick actions</h2>
            <p className="mt-1 text-sm text-[#6d7b76]">Everything you need to coordinate care at home.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isPrimary = "primary" in action && action.primary;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex flex-col rounded-[24px] border p-6 shadow-sm transition ${
                  isPrimary
                    ? "border-[#ff6a3d]/30 bg-[#ff6a3d] text-white hover:scale-[1.01]"
                    : "border-[#e7e7e7] bg-white hover:border-[#cad5d2]"
                }`}
              >
                <div
                  className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${
                    isPrimary ? "bg-white/20" : "bg-[#dfe9e5]"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isPrimary ? "text-white" : "text-[#4a6b5c]"}`} aria-hidden />
                </div>
                <h3 className={`text-lg font-semibold ${isPrimary ? "text-white" : "text-[#111111]"}`}>
                  {action.title}
                </h3>
                <p className={`mt-2 flex-1 text-sm leading-relaxed ${isPrimary ? "text-white/85" : "text-[#6d7b76]"}`}>
                  {action.description}
                </p>
                <span
                  className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${
                    isPrimary ? "text-white" : "text-[#ff6a3d]"
                  }`}
                >
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
