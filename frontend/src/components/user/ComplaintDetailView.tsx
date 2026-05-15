"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getComplaintById } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { ComplaintItem } from "@/types/complaint";
import { COMPLAINT_STATUS_STYLES, ud } from "@/lib/ui/user-dashboard";

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

  if (loading) return <p className={ud.muted}>Loading complaint detail...</p>;
  if (error) return <p className={ud.error}>{error}</p>;
  if (!complaint) return <p className={ud.muted}>Complaint not found.</p>;

  return (
    <section className={ud.card}>
      <div className="flex items-start justify-between gap-3">
        <h2 className={ud.cardTitle}>Complaint information</h2>
        <span className={`${ud.badge} ${COMPLAINT_STATUS_STYLES[complaint.status]}`}>{complaint.status}</span>
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-[#8ca09a]">Complaint ID</dt>
          <dd className="mt-1 font-medium text-[#111111]">{complaint.id}</dd>
        </div>
        <div>
          <dt className="text-[#8ca09a]">Booking ID</dt>
          <dd className="mt-1 font-medium text-[#111111]">{complaint.bookingId}</dd>
        </div>
        <div>
          <dt className="text-[#8ca09a]">Raised by</dt>
          <dd className="mt-1 font-medium text-[#111111]">{complaint.raisedByRole}</dd>
        </div>
        <div>
          <dt className="text-[#8ca09a]">Message</dt>
          <dd className="mt-1 leading-relaxed text-[#4b4b4b]">{complaint.message}</dd>
        </div>
        <div>
          <dt className="text-[#8ca09a]">Created at</dt>
          <dd className="mt-1 font-medium text-[#111111]">{new Date(complaint.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-[#8ca09a]">Updated at</dt>
          <dd className="mt-1 font-medium text-[#111111]">{new Date(complaint.updatedAt).toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  );
}
