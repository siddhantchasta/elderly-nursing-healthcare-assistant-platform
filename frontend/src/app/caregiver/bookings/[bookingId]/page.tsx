import UserPageHeader from "@/components/layout/UserPageHeader";
import CaregiverBookingDetailView from "@/components/caregiver/CaregiverBookingDetailView";

export default async function CaregiverBookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;

  return (
    <div className="mx-auto max-w-5xl">
      <UserPageHeader
        title="Booking detail"
        description="Visit information and care notes for this booking."
        backHref="/caregiver/bookings"
        backLabel="Bookings"
      />
      <CaregiverBookingDetailView bookingId={bookingId} />
    </div>
  );
}
