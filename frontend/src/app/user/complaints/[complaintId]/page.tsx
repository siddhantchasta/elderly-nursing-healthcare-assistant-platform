import UserPageHeader from "@/components/layout/UserPageHeader";
import ComplaintDetailView from "@/components/user/ComplaintDetailView";

export default async function ComplaintDetailPage({ params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;

  return (
    <div className="mx-auto max-w-4xl">
      <UserPageHeader
        title="Complaint detail"
        description="Status and message for this support request."
        backHref="/user/complaints"
        backLabel="Back to complaints"
      />
      <ComplaintDetailView complaintId={complaintId} />
    </div>
  );
}
