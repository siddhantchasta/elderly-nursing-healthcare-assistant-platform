import UserDashboardShell from "@/components/layout/UserDashboardShell";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserDashboardShell>{children}</UserDashboardShell>;
}
