"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, History, MessageSquare, UserCircle } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  getCaregiverProfile,
  getCaregiverWorkHistory,
  listBookings,
  listComplaints,
} from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { getGreeting, VERIFICATION_STYLES } from "@/lib/ui/caregiver-dashboard";
import type { CaregiverProfile } from "@/types/caregiver";

interface DashboardStats {
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  openComplaints: number;
  totalEarnings: number;
}

const QUICK_ACTIONS = [
  {
    href: "/caregiver/profile",
    title: "My profile",
    description: "Update qualifications, availability, and service areas.",
    icon: UserCircle,
  },
  {
    href: "/caregiver/bookings",
    title: "Booking requests",
    description: "Review incoming visits and update job status.",
    icon: Calendar,
    primary: true,
  },
  {
    href: "/caregiver/work-history",
    title: "Work history",
    description: "Track completed visits and earnings over time.",
    icon: History,
  },
  {
    href: "/caregiver/complaints",
    title: "Support & complaints",
    description: "Report issues and follow resolution status.",
    icon: MessageSquare,
  },
] as const;

export default function CaregiverDashboardHome() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "caregiver") {
      router.replace("/login");
      return;
    }
    setEmail(user.email);

    void (async () => {
      try {
        const [bookings, complaints] = await Promise.all([listBookings(), listComplaints()]);

        let completedBookings = 0;
        let totalEarnings = 0;

        try {
          const work = await getCaregiverWorkHistory();
          completedBookings = work.totalCompletedBookings;
          totalEarnings = work.totalEarnings;
        } catch (err) {
          if (!(err instanceof ApiClientError && err.status === 404)) {
            throw err;
          }
        }

        try {
          const profileData = await getCaregiverProfile();
          setProfile(profileData);
        } catch (err) {
          if (!(err instanceof ApiClientError && err.status === 404)) {
            throw err;
          }
        }

        const pendingBookings = bookings.filter((b) => b.status === "pending").length;
        const activeBookings = bookings.filter(
          (b) => b.status === "accepted" || b.status === "in_progress"
        ).length;
        const openComplaints = complaints.filter((c) => c.status === "open" || c.status === "escalated").length;

        setStats({
          pendingBookings,
          activeBookings,
          completedBookings,
          openComplaints,
          totalEarnings,
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
    { label: "Pending requests", value: stats?.pendingBookings, href: "/caregiver/bookings" },
    { label: "Active visits", value: stats?.activeBookings, href: "/caregiver/bookings" },
    { label: "Completed visits", value: stats?.completedBookings, href: "/caregiver/work-history" },
    { label: "Open issues", value: stats?.openComplaints, href: "/caregiver/complaints" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ca09a]">Caregiver dashboard</p>
          <h1 className="mt-2 text-[32px] font-black tracking-[-0.04em] text-[#111111] sm:text-[42px]">
            {greeting}, {displayEmail}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6d7b76]">
            Manage your profile, respond to booking requests, and document care — all in one calm workspace.
          </p>
        </header>

        {!statsLoading && !profile ? (
          <Link
            href="/caregiver/profile"
            className="mb-10 flex items-center justify-between gap-4 rounded-[20px] border border-[#ff6a3d]/25 bg-[#fff8f5] px-6 py-4 transition hover:border-[#ff6a3d]/40"
          >
            <ProfileSetupCta />
            <ArrowRight className="h-5 w-5 shrink-0 text-[#ff6a3d]" aria-hidden />
          </Link>
        ) : null}

        {!statsLoading && profile && profile.verificationStatus === "pending" ? (
          <div className="mb-10 flex items-center justify-between gap-4 rounded-[20px] border border-[#cad5d2] bg-[#eef5f2] px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-[#111111]">Profile under review</p>
              <p className="mt-0.5 text-sm text-[#6d7b76]">
                Your credentials are being verified. You&apos;ll be notified once approved.
              </p>
            </div>
            <span className={`shrink-0 ${VERIFICATION_STYLES.pending} rounded-full px-3 py-1 text-xs font-semibold`}>
              pending
            </span>
          </div>
        ) : null}

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

        {!statsLoading && stats && stats.totalEarnings > 0 ? (
          <div className="mb-10 rounded-[20px] border border-[#e7e7e7] bg-white px-6 py-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ca09a]">Total earnings</p>
            <p className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#111111]">
              Rs {stats.totalEarnings.toLocaleString()}
            </p>
          </div>
        ) : null}

        <section>
          <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">Quick actions</h2>
              <p className="mt-1 text-sm text-[#6d7b76]">Everything you need to deliver trusted in-home care.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

function ProfileSetupCta() {
  return (
    <div>
      <p className="text-sm font-semibold text-[#111111]">Complete your caregiver profile</p>
      <p className="mt-0.5 text-sm text-[#6d7b76]">
        Add qualifications and service areas to start receiving bookings.
      </p>
    </div>
  );
}
