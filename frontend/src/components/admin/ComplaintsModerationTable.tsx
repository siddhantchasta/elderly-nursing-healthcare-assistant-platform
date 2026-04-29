"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listAdminComplaints, updateAdminComplaintStatus } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { ComplaintItem, ComplaintStatus } from "@/types/complaint";

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  escalated: "bg-rose-100 text-rose-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
];

export default function ComplaintsModerationTable() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [filter, setFilter] = useState<ComplaintStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadComplaints = useCallback(async (statusFilter: ComplaintStatus | "all" = filter) => {
    setLoading(true);
    setError(null);

    try {
      const data = await listAdminComplaints(statusFilter === "all" ? undefined : statusFilter);
      setComplaints(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load complaints");
      }
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadComplaints();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadComplaints]);

  async function handleStatusUpdate(complaintId: string, status: ComplaintStatus) {
    setActionId(complaintId);
    setError(null);
    setSuccess(null);

    try {
      await updateAdminComplaintStatus(complaintId, status);
      setSuccess("Complaint status updated.");
      await loadComplaints();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update complaint status");
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Complaints Moderation</h2>
          <p className="mt-1 text-sm text-slate-600">Track and resolve complaints raised by users and caregivers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(event) => {
              const next = event.target.value as ComplaintStatus | "all";
              setFilter(next);
              void loadComplaints(next);
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button onClick={() => void loadComplaints()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            Refresh
          </button>
        </div>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading complaints...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

      {!loading && complaints.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No complaints found for the selected filter.</p>
      ) : null}

      {!loading && complaints.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-2 py-2 font-medium">Complaint</th>
                <th className="px-2 py-2 font-medium">Booking</th>
                <th className="px-2 py-2 font-medium">Raised By</th>
                <th className="px-2 py-2 font-medium">Message</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => {
                const isBusy = actionId === complaint.id;

                return (
                  <tr key={complaint.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-700">{complaint.id}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{complaint.bookingId}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{complaint.raisedByRole}</td>
                    <td className="px-2 py-3 text-sm text-slate-800">{complaint.message}</td>
                    <td className="px-2 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[complaint.status]}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => void handleStatusUpdate(complaint.id, option.value)}
                            disabled={isBusy || complaint.status === option.value}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-60"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
