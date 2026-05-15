"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  FileWarning,
  BarChart3,
  BriefcaseMedical,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Caregivers",
    href: "/admin/caregivers/pending",
    icon: ShieldCheck,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Complaints",
    href: "/admin/complaints",
    icon: FileWarning,
  },
  {
    label: "Reports",
    href: "/admin/reports/overview",
    icon: BarChart3,
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: BriefcaseMedical,
  },
];

interface Props {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AdminDashboardShell({
  children,
  onLogout,
}: Props) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#0f1115] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[290px] flex-col border-r border-white/5 bg-[#14171d] lg:flex">
          {/* LOGO */}
          <div className="border-b border-white/5 px-8 py-7">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white p-1 shadow-sm">
                <img
                  src="/images/avatar.png"
                  alt="ElderCare"
                  className="h-12 w-12 object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  ElderCare
                </h1>

                <p className="text-sm text-white/40">
                  Admin Control Center
                </p>
              </div>
            </div>
          </div>

          {/* NAV */}
          <nav className="flex-1 space-y-2 px-5 py-8">
            {navItems.map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all ${
                    active
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  <span className="text-[15px] font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* FOOTER */}
          <div className="border-t border-white/5 p-5">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-4 rounded-2xl bg-white/5 px-5 py-4 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-5 w-5" />

              <span className="text-sm font-medium">
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <section className="flex-1 overflow-hidden">
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2a1f17_0%,#16181d_40%,#0f1115_100%)]">
            <div className="mx-auto max-w-[1700px] p-5 sm:p-8 lg:p-10">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}