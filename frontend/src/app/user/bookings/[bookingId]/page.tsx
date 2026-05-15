import UserPageHeader from "@/components/layout/UserPageHeader";
import BookingDetailView from "@/components/user/BookingDetailView";

export default async function BookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;

  return (
    <div className="mx-auto max-w-5xl">
      <UserPageHeader
        title="Booking detail"
        description="Visit information, care notes, and rating."
        backHref="/user/bookings"
        backLabel="Back to bookings"
      />
      <BookingDetailView bookingId={bookingId} />
    </div>
  );
}
