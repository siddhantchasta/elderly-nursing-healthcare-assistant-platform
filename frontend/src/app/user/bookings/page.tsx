import UserPageHeader from "@/components/layout/UserPageHeader";
import BookingHistory from "@/components/user/BookingHistory";

export default function UserBookingsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <UserPageHeader
        title="My bookings"
        description="Track scheduled visits, status updates, and care notes for each booking."
      />
      <BookingHistory />
    </div>
  );
}
