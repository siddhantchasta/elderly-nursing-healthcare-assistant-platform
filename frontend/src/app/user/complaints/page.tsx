import ComplaintsManager from "@/components/user/ComplaintsManager";
import DashboardShell from "@/components/ui/DashboardShell";

export default function UserComplaintsPage() {
  return (
    <DashboardShell
      title="Support Center"
      subtitle="Report issues or concerns about your care experience"
    >
      <ComplaintsManager />
    </DashboardShell>
  );
}
