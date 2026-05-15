import ServicesCatalog from "@/components/user/ServicesCatalog";
import DashboardShell from "@/components/ui/DashboardShell";

export default function UserServicesPage() {
  return (
    <DashboardShell
      title="Care Services"
      subtitle="Explore our range of professional care offerings"
    >
      <ServicesCatalog />
    </DashboardShell>
  );
}
