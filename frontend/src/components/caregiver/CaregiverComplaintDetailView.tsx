"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getComplaintById } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { ComplaintItem } from "@/types/complaint";

const STATUS_CONFIG: Record<ComplaintItem["status"], { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  open: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Open",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  escalated: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Escalated",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  resolved: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Resolved",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function CaregiverComplaintDetailView({ complaintId }: { complaintId: string }) {
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
    if (!user || user.role !== "caregiver") {
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-sm text-muted-foreground">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="mt-3 font-medium text-red-700">Failed to load complaint</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">Complaint not found.</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[complaint.status];

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`flex items-center gap-4 rounded-xl ${statusConfig.bg} px-6 py-4`}>
        <div className={statusConfig.text}>{statusConfig.icon}</div>
        <div>
          <p className={`font-semibold ${statusConfig.text}`}>Status: {statusConfig.label}</p>
          <p className="text-sm text-muted-foreground">
            {complaint.status === "open" && "Your complaint is being reviewed by our team."}
            {complaint.status === "escalated" && "This complaint has been escalated for urgent attention."}
            {complaint.status === "resolved" && "This complaint has been resolved."}
          </p>
        </div>
      </div>

      {/* Complaint Details Card */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Complaint Information</h2>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Complaint ID</p>
                <p className="mt-1 font-mono text-sm text-foreground">{complaint.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="mt-1 font-mono text-sm text-foreground">{complaint.bookingId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Raised By</p>
                <p className="mt-1 font-medium capitalize text-foreground">{complaint.raisedByRole}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filed On</p>
                <p className="mt-1 font-medium text-foreground">
                  {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">Complaint Message</p>
              <div className="mt-2 rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-foreground leading-relaxed">{complaint.message}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="mt-1 text-sm text-foreground">
                {new Date(complaint.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div className="flex-1 w-px bg-border"></div>
              </div>
              <div className="pb-6">
                <p className="font-medium text-foreground">Complaint Filed</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {complaint.status !== "open" && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    complaint.status === "resolved" ? "bg-green-600" : "bg-red-600"
                  } text-white`}>
                    {complaint.status === "resolved" ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {complaint.status === "resolved" ? "Complaint Resolved" : "Complaint Escalated"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(complaint.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
