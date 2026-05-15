import UserPageHeader from "@/components/layout/UserPageHeader";
import CaregiverProfileForm from "@/components/caregiver/CaregiverProfileForm";

export default function CaregiverProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <UserPageHeader
        title="My profile"
        description="Your qualifications, service areas, and availability — what families see when booking care."
        backHref="/caregiver/dashboard"
        backLabel="Overview"
      />
      <CaregiverProfileForm />
    </div>
  );
}
