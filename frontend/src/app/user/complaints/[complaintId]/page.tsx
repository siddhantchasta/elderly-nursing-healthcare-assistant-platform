import Link from "next/link";
import ComplaintDetailView from "@/components/user/ComplaintDetailView";
import DashboardShell from "@/components/ui/DashboardShell";

export default async function ComplaintDetailPage({ params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;

  return (
    <DashboardShell
      title="Issue Details"
      subtitle="View the status and details of your reported concern"
      actions={
        <Link
          href="/user/complaints"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Support
        </Link>
      }
    >
      <div className="mx-auto max-w-2xl">
        <ComplaintDetailView complaintId={complaintId} />
      </div>
    </DashboardShell>
  );
}
