import CaregiverDashboardShell from "@/components/ui/CaregiverDashboardShell";
import CaregiverProfileForm from "@/components/caregiver/CaregiverProfileForm";

export default function CaregiverProfilePage() {
  return (
    <CaregiverDashboardShell
      title="My Profile"
      subtitle="Manage your qualifications, availability, and service areas"
    >
      <CaregiverProfileForm />
    </CaregiverDashboardShell>
  );
}
