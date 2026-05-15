import UserPageHeader from "@/components/layout/UserPageHeader";
import ServicesCatalog from "@/components/user/ServicesCatalog";

export default function UserServicesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="Service catalog"
        description="Explore nursing, attendant, physiotherapy, and post-hospital care options."
      />
      <ServicesCatalog />
    </div>
  );
}
