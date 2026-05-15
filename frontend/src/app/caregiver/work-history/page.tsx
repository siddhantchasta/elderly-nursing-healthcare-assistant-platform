import CaregiverDashboardShell from "@/components/ui/CaregiverDashboardShell";
import CaregiverWorkHistory from "@/components/caregiver/CaregiverWorkHistory";

export default function CaregiverWorkHistoryPage() {
  return (
    <CaregiverDashboardShell
      title="Work History"
      subtitle="View your completed jobs and earnings"
    >
      <CaregiverWorkHistory />
    </CaregiverDashboardShell>
  );
}
