"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getComplaintById } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { ComplaintItem } from "@/types/complaint";

const STATUS_STYLES: Record<ComplaintItem["status"], string> = {
  open: "bg-amber-100 text-amber-800",
  escalated: "bg-rose-100 text-rose-800",
  resolved: "bg-green-100 text-green-800",
};

const STATUS_ICONS: Record<ComplaintItem["status"], React.ReactNode> = {
  open: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  escalated: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  resolved: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function ComplaintDetailView({ complaintId }: { complaintId: string }) {
  const router = useRouter();
  const [complaint, setComplaint] = useState<ComplaintItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComplaint = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getComplaintById(complaintId);
      setComplaint(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to fetch complaint detail");
      }
    } finally {
      setLoading(false);
    }
  }, [complaintId, router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadComplaint();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadComplaint]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading issue details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="font-medium text-destructive">Issue not found</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Issue Report</h2>
          <p className="mt-1 text-sm text-muted-foreground">Reference: {complaint.id.slice(0, 8)}...</p>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_STYLES[complaint.status]}`}>
          {STATUS_ICONS[complaint.status]}
          {complaint.status}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg bg-secondary/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your Message</p>
          <p className="mt-2 text-foreground">{complaint.message}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Related Booking</p>
            <p className="mt-1 font-medium text-foreground">{complaint.bookingId.slice(0, 12)}...</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted By</p>
            <p className="mt-1 font-medium capitalize text-foreground">{complaint.raisedByRole}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</p>
            <p className="mt-1 font-medium text-foreground">{new Date(complaint.createdAt).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Updated</p>
            <p className="mt-1 font-medium text-foreground">{new Date(complaint.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {complaint.status !== "resolved" && (
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">
            <span className="font-medium">Note:</span> Our support team is reviewing your concern. You will receive an update once we have more information.
          </p>
        </div>
      )}
    </div>
  );
}
