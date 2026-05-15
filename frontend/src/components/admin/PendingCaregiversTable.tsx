"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { RefreshCcw } from "lucide-react";

import { ApiClientError } from "@/lib/api/client";

import {
  listPendingCaregivers,
  updateCaregiverVerification,
} from "@/lib/api/endpoints";

import { getSessionUser } from "@/lib/auth/session";

import type { PendingCaregiverItem } from "@/types/caregiver";

const STATUS_STYLES: Record<
  PendingCaregiverItem["verificationStatus"],
  string
> = {
  pending: "bg-[#2d2418] text-[#ffcb88]",
  verified: "bg-[#1c2a22] text-[#9fe3c5]",
  rejected: "bg-[#2d1c1c] text-[#ff9d9d]",
};

export default function PendingCaregiversTable() {
  const router = useRouter();

  const [caregivers, setCaregivers] = useState<
    PendingCaregiverItem[]
  >([]);

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

  const loadCaregivers = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      const data = await listPendingCaregivers();

      setCaregivers(data);
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
        setError(
          "Failed to load pending caregivers"
        );
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

    void loadCaregivers();
  }, [router, loadCaregivers]);

  async function handleAction(
    caregiverId: string,
    status: "verified" | "rejected"
  ) {
    setActionId(caregiverId);

    setError(null);

    setSuccess(null);

    try {
      await updateCaregiverVerification(
        caregiverId,
        status
      );

      setSuccess(
        `Caregiver ${status} successfully.`
      );

      await loadCaregivers();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError(
          "Failed to update caregiver verification"
        );
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/3 backdrop-blur-xl">
      {/* HEADER */}
      <div className="border-b border-white/10 px-7 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Pending Caregivers
            </h2>

            <p className="mt-2 text-[15px] text-white/45">
              Review, approve, and manage
              caregivers awaiting verification.
            </p>
          </div>

          <button
            onClick={() => void loadCaregivers()}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="px-7 py-16 text-center text-white/50">
            Loading caregivers...
          </div>
        ) : null}

        {!loading && caregivers.length === 0 ? (
          <div className="px-7 py-16 text-center text-white/50">
            No pending caregivers right now.
          </div>
        ) : null}

        {!loading && caregivers.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Caregiver
                </th>

                <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Qualifications
                </th>

                <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Service Areas
                </th>

                <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Status
                </th>

                <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {caregivers.map((caregiver) => {
                const isBusy =
                  actionId === caregiver.id;

                return (
                  <tr
                    key={caregiver.id}
                    className="border-b border-white/6 transition hover:bg-white/2.5"
                  >
                    {/* CAREGIVER */}
                    <td className="px-7 py-6">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {caregiver.userId}
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          Requested{" "}
                          {new Date(
                            caregiver.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    {/* QUALIFICATIONS */}
                    <td className="px-7 py-6">
                      <p className="max-w-sm text-sm leading-7 text-white/70">
                        {
                          caregiver.qualifications
                        }
                      </p>

                      {caregiver.serviceIds.length >
                      0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {caregiver.serviceIds.map(
                            (service) => (
                              <span
                                key={service}
                                className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-white/55"
                              >
                                {service}
                              </span>
                            )
                          )}
                        </div>
                      ) : null}
                    </td>

                    {/* SERVICE AREAS */}
                    <td className="px-7 py-6">
                      <div className="flex max-w-xs flex-wrap gap-2">
                        {caregiver.serviceAreas.map(
                          (area) => (
                            <span
                              key={area}
                              className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-medium text-white/65"
                            >
                              {area}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-7 py-6">
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${STATUS_STYLES[caregiver.verificationStatus]}`}
                      >
                        {
                          caregiver.verificationStatus
                        }
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-7 py-6">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            void handleAction(
                              caregiver.id,
                              "verified"
                            )
                          }
                          disabled={isBusy}
                          className="rounded-xl bg-[#ff6a3d] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            void handleAction(
                              caregiver.id,
                              "rejected"
                            )
                          }
                          disabled={isBusy}
                          className="rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/8 hover:text-white disabled:opacity-50"
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
        ) : null}
      </div>
    </section>
  );
}