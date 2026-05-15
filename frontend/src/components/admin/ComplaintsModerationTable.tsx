"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { RefreshCcw } from "lucide-react";

import { ApiClientError } from "@/lib/api/client";

import {
  listAdminComplaints,
  updateAdminComplaintStatus,
} from "@/lib/api/endpoints";

import { getSessionUser } from "@/lib/auth/session";

import type {
  ComplaintItem,
  ComplaintStatus,
} from "@/types/complaint";

const STATUS_STYLES: Record<
  ComplaintStatus,
  string
> = {
  open: "bg-[#2d2418] text-[#ffcb88]",
  escalated: "bg-[#2d1c1c] text-[#ff9d9d]",
  resolved: "bg-[#1c2a22] text-[#9fe3c5]",
};

const STATUS_OPTIONS: {
  value: ComplaintStatus;
  label: string;
}[] = [
  { value: "open", label: "Open" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
];

export default function ComplaintsModerationTable() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<
    ComplaintItem[]
  >([]);

  const [filter, setFilter] = useState<
    ComplaintStatus | "all"
  >("all");

  const [loading, setLoading] = useState(true);

  const [actionId, setActionId] = useState<
    string | null
  >(null);

  const [error, setError] = useState<string | null>(
    null
  );

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const loadComplaints = useCallback(
    async (
      statusFilter: ComplaintStatus | "all" = filter
    ) => {
      setLoading(true);

      setError(null);

      try {
        const data = await listAdminComplaints(
          statusFilter === "all"
            ? undefined
            : statusFilter
        );

        setComplaints(data);
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (
            err.status === 401 ||
            err.status === 403
          ) {
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
    },
    [filter, router]
  );

  useEffect(() => {
    const user = getSessionUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");

      return;
    }

    void loadComplaints();
  }, [router, loadComplaints]);

  async function handleStatusUpdate(
    complaintId: string,
    status: ComplaintStatus
  ) {
    setActionId(complaintId);

    setError(null);

    setSuccess(null);

    try {
      await updateAdminComplaintStatus(
        complaintId,
        status
      );

      setSuccess("Complaint updated successfully.");

      await loadComplaints();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update complaint");
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/3 backdrop-blur-xl">
      <div className="border-b border-white/10 px-7 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Complaints Queue
            </h2>

            <p className="mt-2 text-[15px] text-white/45">
              Monitor escalations and resolve platform
              complaints.
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(event) => {
                const next = event.target.value as
                  | ComplaintStatus
                  | "all";

                setFilter(next);

                void loadComplaints(next);
              }}
              className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All Statuses</option>

              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => void loadComplaints()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {!loading && complaints.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-7 py-5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                  Complaint
                </th>

                <th className="px-7 py-5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                  Raised By
                </th>

                <th className="px-7 py-5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                  Status
                </th>

                <th className="px-7 py-5 text-left text-xs uppercase tracking-[0.16em] text-white/40">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((complaint) => {
                const isBusy =
                  actionId === complaint.id;

                return (
                  <tr
                    key={complaint.id}
                    className="border-b border-white/6 hover:bg-white/2.5"
                  >
                    <td className="px-7 py-6">
                      <p className="max-w-xl text-sm leading-7 text-white/80">
                        {complaint.message}
                      </p>

                      <p className="mt-3 text-xs text-white/35">
                        {complaint.id}
                      </p>
                    </td>

                    <td className="px-7 py-6 text-sm text-white/60">
                      {complaint.raisedByRole}
                    </td>

                    <td className="px-7 py-6">
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${STATUS_STYLES[complaint.status]}`}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    <td className="px-7 py-6">
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              void handleStatusUpdate(
                                complaint.id,
                                option.value
                              )
                            }
                            disabled={
                              isBusy ||
                              complaint.status ===
                                option.value
                            }
                            className="rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/8 hover:text-white disabled:opacity-50"
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
        ) : null}
      </div>
    </section>
  );
}