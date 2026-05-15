import UserPageHeader from "@/components/layout/UserPageHeader";
import CaregiverComplaintDetailView from "@/components/caregiver/CaregiverComplaintDetailView";

export default async function CaregiverComplaintDetailPage({ params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;

  return (
    <div className="mx-auto max-w-4xl">
      <UserPageHeader
        title="Complaint detail"
        description="Status and details for this support request."
        backHref="/caregiver/complaints"
        backLabel="Complaints"
      />
      <CaregiverComplaintDetailView complaintId={complaintId} />
    </div>
  );
}
