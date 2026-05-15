import Link from "next/link";
import BookingHistory from "@/components/user/BookingHistory";
import DashboardShell from "@/components/ui/DashboardShell";

export default function UserBookingsPage() {
  return (
    <DashboardShell
      title="My Bookings"
      subtitle="Track and manage your care appointments"
      actions={
        <Link
          href="/user/bookings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Booking
        </Link>
      }
    >
      <BookingHistory />
    </DashboardShell>
  );
}
