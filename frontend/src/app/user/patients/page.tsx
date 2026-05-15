import UserPageHeader from "@/components/layout/UserPageHeader";
import PatientProfilesManager from "@/components/user/PatientProfilesManager";

export default function UserPatientsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <UserPageHeader
        title="Patient profiles"
        description="Add and manage care recipients — age, medical needs, and history for booking."
      />
      <PatientProfilesManager />
    </div>
  );
}
