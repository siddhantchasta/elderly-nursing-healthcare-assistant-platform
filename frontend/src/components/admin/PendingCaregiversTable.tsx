"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listPendingCaregivers, updateCaregiverVerification } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { PendingCaregiverItem } from "@/types/caregiver";

const STATUS_STYLES: Record<PendingCaregiverItem["verificationStatus"], string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

export default function PendingCaregiversTable() {
  const router = useRouter();
  const [caregivers, setCaregivers] = useState<PendingCaregiverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCaregivers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listPendingCaregivers();
      setCaregivers(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to load pending caregivers");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadCaregivers();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadCaregivers]);

  async function handleAction(caregiverId: string, status: "verified" | "rejected") {
    setActionId(caregiverId);
    setError(null);
    setSuccess(null);

    try {
      await updateCaregiverVerification(caregiverId, status);
      setSuccess(`Caregiver ${status}.`);
      await loadCaregivers();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update caregiver verification");
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pending Caregivers</h2>
          <p className="mt-1 text-sm text-slate-600">Review caregivers awaiting verification.</p>
        </div>
        <button onClick={() => void loadCaregivers()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading pending caregivers...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

      {!loading && caregivers.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No pending caregivers right now.</p>
      ) : null}

      {!loading && caregivers.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-2 py-2 font-medium">Caregiver</th>
                <th className="px-2 py-2 font-medium">Qualifications</th>
                <th className="px-2 py-2 font-medium">Service Areas</th>
                <th className="px-2 py-2 font-medium">Services</th>
                <th className="px-2 py-2 font-medium">Requested</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {caregivers.map((caregiver) => {
                const isBusy = actionId === caregiver.id;

                return (
                  <tr key={caregiver.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-700">{caregiver.userId}</td>
                    <td className="px-2 py-3 text-sm text-slate-800">{caregiver.qualifications}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{caregiver.serviceAreas.join(", ")}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">
                      {caregiver.serviceIds.length > 0 ? caregiver.serviceIds.join(", ") : "-"}
                    </td>
                    <td className="px-2 py-3 text-sm text-slate-700">{new Date(caregiver.createdAt).toLocaleString()}</td>
                    <td className="px-2 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[caregiver.verificationStatus]}`}>
                        {caregiver.verificationStatus}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => void handleAction(caregiver.id, "verified")}
                          disabled={isBusy}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void handleAction(caregiver.id, "rejected")}
                          disabled={isBusy}
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
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
