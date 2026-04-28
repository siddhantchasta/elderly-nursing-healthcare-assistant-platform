import Link from "next/link";
import CaregiverComplaintDetailView from "@/components/caregiver/CaregiverComplaintDetailView";

export default async function CaregiverComplaintDetailPage({ params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;

  return (
    <main className="min-h-screen bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Complaint Detail</h1>
          <Link href="/caregiver/complaints" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
            Back to Complaints
          </Link>
        </div>

        <CaregiverComplaintDetailView complaintId={complaintId} />
      </div>
    </main>
  );
}
