import UserPageHeader from "@/components/layout/UserPageHeader";
import BookingRequestForm from "@/components/user/BookingRequestForm";

export default function NewBookingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <UserPageHeader
        title="Book care"
        description="Choose a patient, service, caregiver, and schedule — we’ll handle the rest."
      />
      <BookingRequestForm />
    </div>
  );
}
