import CaregiverDashboardShell from "@/components/ui/CaregiverDashboardShell";
import CaregiverBookingsManager from "@/components/caregiver/CaregiverBookingsManager";

export default function CaregiverBookingsPage() {
  return (
    <CaregiverDashboardShell
      title="Bookings"
      subtitle="Review incoming requests and manage your jobs"
      actions={
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      }
    >
      <CaregiverBookingsManager />
    </CaregiverDashboardShell>
  );
}
