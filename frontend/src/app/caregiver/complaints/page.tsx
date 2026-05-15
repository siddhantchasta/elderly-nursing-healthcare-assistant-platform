import CaregiverDashboardShell from "@/components/ui/CaregiverDashboardShell";
import CaregiverComplaintsManager from "@/components/caregiver/CaregiverComplaintsManager";

export default function CaregiverComplaintsPage() {
  return (
    <CaregiverDashboardShell
      title="Complaints"
      subtitle="Report issues related to your bookings"
    >
      <CaregiverComplaintsManager />
    </CaregiverDashboardShell>
  );
}
