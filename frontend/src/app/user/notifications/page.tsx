import UserPageHeader from "@/components/layout/UserPageHeader";
import NotificationsPanel from "@/components/user/NotificationsPanel";

export default function UserNotificationsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="Notifications"
        description="Live updates on booking status and complaint resolution."
      />
      <NotificationsPanel />
    </div>
  );
}
