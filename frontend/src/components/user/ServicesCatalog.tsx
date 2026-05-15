"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { ServiceItem } from "@/types/service";
import DashboardSection from "@/components/ui/DashboardSection";
import { ud } from "@/lib/ui/user-dashboard";

const CATEGORY_LABELS: Record<ServiceItem["category"], string> = {
  nursing_care: "Nursing Care",
  elderly_attendant: "Elderly Attendant",
  physiotherapy: "Physiotherapy",
  post_hospital_care: "Post-Hospital Care",
};

const CATEGORY_ORDER: ServiceItem["category"][] = [
  "nursing_care",
  "elderly_attendant",
  "physiotherapy",
  "post_hospital_care",
];

export default function ServicesCatalog() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    });
  }, [services]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listServices();
      setServices(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch services");
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
      void loadServices();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadServices]);

  return (
    <DashboardSection
      title="Available services"
      description="Professional care options for home and recovery support."
      onRefresh={() => void loadServices()}
    >
      {loading ? <p className={ud.muted}>Loading services...</p> : null}
      {error ? <p className={ud.error}>{error}</p> : null}

      {!loading && !error && services.length === 0 ? (
        <p className={ud.muted}>No services available right now.</p>
      ) : null}

      {!loading && !error && services.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {orderedServices.map((service) => (
            <article key={service.id} className={ud.cardMuted}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4a6b5c]">
                {CATEGORY_LABELS[service.category]}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#111111]">{service.serviceName}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6d7b76]">{service.description}</p>

              <dl className="mt-4 space-y-1.5 text-sm text-[#4b4b4b]">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#8ca09a]">Duration</dt>
                  <dd className="font-medium text-[#111111]">{service.duration}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#8ca09a]">Price</dt>
                  <dd className="font-medium text-[#111111]">Rs {service.price}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#8ca09a]">Qualification</dt>
                  <dd className="text-right font-medium text-[#111111]">{service.requiredQualification}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </DashboardSection>
  );
}
