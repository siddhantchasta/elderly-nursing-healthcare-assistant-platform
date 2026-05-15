import PatientProfilesManager from "@/components/user/PatientProfilesManager";
import DashboardShell from "@/components/ui/DashboardShell";

export default function UserPatientsPage() {
  return (
    <DashboardShell
      title="Patient Profiles"
      subtitle="Manage health information for your loved ones"
    >
      <PatientProfilesManager />
    </DashboardShell>
  );
}
