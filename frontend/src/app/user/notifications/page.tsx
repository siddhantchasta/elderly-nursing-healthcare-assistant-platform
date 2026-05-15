import NotificationsPanel from "@/components/user/NotificationsPanel";
import DashboardShell from "@/components/ui/DashboardShell";

export default function UserNotificationsPage() {
  return (
    <DashboardShell
      title="Notifications"
      subtitle="Stay updated on your bookings and care activities"
    >
      <NotificationsPanel />
    </DashboardShell>
  );
}
