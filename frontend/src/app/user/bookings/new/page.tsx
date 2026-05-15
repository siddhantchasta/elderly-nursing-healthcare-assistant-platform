import BookingRequestForm from "@/components/user/BookingRequestForm";
import DashboardShell from "@/components/ui/DashboardShell";

export default function NewBookingPage() {
  return (
    <DashboardShell
      title="Schedule Care"
      subtitle="Book a care appointment for your loved one"
    >
      <div className="mx-auto max-w-2xl">
        <BookingRequestForm />
      </div>
    </DashboardShell>
  );
}
