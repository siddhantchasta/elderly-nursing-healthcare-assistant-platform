import UserPageHeader from "@/components/layout/UserPageHeader";
import CaregiverComplaintsManager from "@/components/caregiver/CaregiverComplaintsManager";

export default function CaregiverComplaintsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="Complaints"
        description="Report issues on assigned bookings and track resolution status."
        backHref="/caregiver/dashboard"
        backLabel="Overview"
      />
      <CaregiverComplaintsManager />
    </div>
  );
}
