import UserPageHeader from "@/components/layout/UserPageHeader";
import ComplaintsManager from "@/components/user/ComplaintsManager";

export default function UserComplaintsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="Complaints & support"
        description="Report issues with a booking and follow resolution status."
      />
      <ComplaintsManager />
    </div>
  );
}
