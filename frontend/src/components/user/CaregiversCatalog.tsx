"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listCaregivers } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { CaregiverListItem } from "@/types/caregiver";

export default function CaregiversCatalog() {
  const router = useRouter();
  const [caregivers, setCaregivers] = useState<CaregiverListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCaregivers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listCaregivers();
      setCaregivers(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch caregivers");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadCaregivers();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadCaregivers]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Verified Caregivers</h2>
        <button onClick={() => void loadCaregivers()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading caregivers...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && caregivers.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No verified caregivers available right now.</p>
      ) : null}

      {!loading && !error && caregivers.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {caregivers.map((caregiver) => (
            <article key={caregiver.id} className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-900">{caregiver.email}</h3>
              <p className="mt-1 text-sm text-slate-600">{caregiver.qualifications}</p>

              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p><span className="font-medium">Rating:</span> {caregiver.rating.toFixed(1)} / 5</p>
                <p><span className="font-medium">Service Areas:</span> {caregiver.serviceAreas.join(", ")}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
