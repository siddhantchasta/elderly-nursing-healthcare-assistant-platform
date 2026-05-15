"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  CalendarPlus,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { clearSession, getSessionUser } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/user/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/user/patients", label: "Patient profiles", icon: Users },
  { href: "/user/services", label: "Services", icon: HeartPulse },
  { href: "/user/caregivers", label: "Caregivers", icon: UserCheck },
  { href: "/user/bookings/new", label: "Book care", icon: CalendarPlus, highlight: true },
  { href: "/user/bookings", label: "Bookings", icon: Calendar },
  { href: "/user/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/user/notifications", label: "Notifications", icon: Bell },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/user/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function UserDashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }
    setEmail(user.email);
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 pt-8 pb-10">
        <div className="rounded-2xl bg-white p-1 shadow-sm">
          <img src="/images/avatar.png" alt="ElderCare" className="h-10 w-10 object-cover" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#111111]">ElderCare</span>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#111111] shadow-sm"
                  : "highlight" in item && item.highlight
                    ? "text-[#ff6a3d] hover:bg-white/60"
                    : "text-[#5f6d68] hover:bg-white/50 hover:text-[#111111]"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#ff6a3d]" : ""}`} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#cad5d2]/60 p-4">
        {email ? (
          <p className="mb-3 truncate px-4 text-xs text-[#8ca09a]" title={email}>
            {email}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#5f6d68] transition hover:bg-white/50 hover:text-[#111111]"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111111]">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-[#111111]/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#dfe9e5] transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation"
          className="absolute right-4 top-4 rounded-full p-2 text-[#5f6d68] hover:bg-white/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        {sidebar}
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-[#e7e7e7]/80 bg-[#f7f7f5]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <button
              type="button"
              aria-label="Open menu"
              className="rounded-2xl border border-[#e7e7e7] bg-white p-2.5 text-[#111111] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-1 items-center justify-end gap-3">
              <Link
                href="/user/bookings/new"
                className="hidden items-center gap-2 rounded-full bg-[#ff6a3d] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01] sm:inline-flex"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden />
                Book care
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
