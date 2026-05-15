import CaregiversCatalog from "@/components/user/CaregiversCatalog";
import DashboardShell from "@/components/ui/DashboardShell";

export default function UserCaregiversPage() {
  return (
    <DashboardShell
      title="Find Caregivers"
      subtitle="Browse our network of verified healthcare professionals"
    >
      <CaregiversCatalog />
    </DashboardShell>
  );
}
