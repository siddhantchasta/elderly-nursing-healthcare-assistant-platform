import Link from "next/link";
import CaregiverDashboardShell from "@/components/ui/CaregiverDashboardShell";
import CaregiverBookingDetailView from "@/components/caregiver/CaregiverBookingDetailView";

export default async function CaregiverBookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;

  return (
    <CaregiverDashboardShell
      title="Booking Details"
      subtitle={`Booking ID: ${bookingId}`}
      actions={
        <Link
          href="/caregiver/bookings"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Bookings
        </Link>
      }
    >
      <CaregiverBookingDetailView bookingId={bookingId} />
    </CaregiverDashboardShell>
  );
}
