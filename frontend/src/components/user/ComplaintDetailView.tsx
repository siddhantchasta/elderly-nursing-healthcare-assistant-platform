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
  resolved: "bg-emerald-100 text-emerald-800",
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

  if (loading) return <p className="text-sm text-slate-600">Loading complaint detail...</p>;
  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!complaint) return <p className="text-sm text-slate-600">Complaint not found.</p>;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Complaint Information</h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[complaint.status]}`}>
          {complaint.status}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <p><span className="font-medium">Complaint ID:</span> {complaint.id}</p>
        <p><span className="font-medium">Booking ID:</span> {complaint.bookingId}</p>
        <p><span className="font-medium">Raised By:</span> {complaint.raisedByRole}</p>
        <p><span className="font-medium">Message:</span> {complaint.message}</p>
        <p><span className="font-medium">Created At:</span> {new Date(complaint.createdAt).toLocaleString()}</p>
        <p><span className="font-medium">Updated At:</span> {new Date(complaint.updatedAt).toLocaleString()}</p>
      </div>
    </section>
  );
}
