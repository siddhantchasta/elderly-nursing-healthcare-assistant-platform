"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listCaregivers } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { CaregiverListItem } from "@/types/caregiver";
import DashboardSection from "@/components/ui/DashboardSection";
import { ud } from "@/lib/ui/user-dashboard";

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
    <DashboardSection
      title="Verified caregivers"
      description="Background-checked professionals available in your area."
      onRefresh={() => void loadCaregivers()}
    >
      {loading ? <p className={ud.muted}>Loading caregivers...</p> : null}
      {error ? <p className={ud.error}>{error}</p> : null}

      {!loading && !error && caregivers.length === 0 ? (
        <p className={ud.muted}>No verified caregivers available right now.</p>
      ) : null}

      {!loading && !error && caregivers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {caregivers.map((caregiver) => (
            <article key={caregiver.id} className={ud.cardMuted}>
              <h3 className="text-lg font-semibold text-[#111111]">{caregiver.email}</h3>
              <p className="mt-1 text-sm text-[#6d7b76]">{caregiver.qualifications}</p>

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#8ca09a]">Rating</dt>
                  <dd className="font-semibold text-[#111111]">{caregiver.rating.toFixed(1)} / 5</dd>
                </div>
                <div>
                  <dt className="text-[#8ca09a]">Service areas</dt>
                  <dd className="mt-1 font-medium text-[#4b4b4b]">{caregiver.serviceAreas.join(", ")}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </DashboardSection>
  );
}
