import UserPageHeader from "@/components/layout/UserPageHeader";
import CaregiverWorkHistory from "@/components/caregiver/CaregiverWorkHistory";

export default function CaregiverWorkHistoryPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="Work history"
        description="Completed visits and earnings overview for your care work."
        backHref="/caregiver/dashboard"
        backLabel="Overview"
      />
      <CaregiverWorkHistory />
    </div>
  );
}
