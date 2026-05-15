import UserPageHeader from "@/components/layout/UserPageHeader";
import CaregiversCatalog from "@/components/user/CaregiversCatalog";

export default function UserCaregiversPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="Caregiver directory"
        description="Browse verified caregivers, qualifications, ratings, and service areas."
      />
      <CaregiversCatalog />
    </div>
  );
}
