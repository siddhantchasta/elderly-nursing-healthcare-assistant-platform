import UserPageHeader from "@/components/layout/UserPageHeader";
import CaregiverBookingsManager from "@/components/caregiver/CaregiverBookingsManager";

export default function CaregiverBookingsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="Bookings"
        description="Review incoming requests, accept visits, and update job status."
        backHref="/caregiver/dashboard"
        backLabel="Overview"
      />
      <CaregiverBookingsManager />
    </div>
  );
}
