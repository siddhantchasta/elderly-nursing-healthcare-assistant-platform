import Link from "next/link";
import BookingDetailView from "@/components/user/BookingDetailView";

export default async function BookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;

  return (
    <main className="min-h-screen bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Booking Detail</h1>
          <Link href="/user/bookings" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
            Back to Bookings
          </Link>
        </div>

        <BookingDetailView bookingId={bookingId} />
      </div>
    </main>
  );
}
