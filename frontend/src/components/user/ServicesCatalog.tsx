"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listServices } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { ServiceItem } from "@/types/service";

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
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Available Services</h2>
        <button onClick={() => void loadServices()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading services...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && services.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No services available right now.</p>
      ) : null}

      {!loading && !error && services.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedServices.map((service) => (
            <article key={service.id} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">{CATEGORY_LABELS[service.category]}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{service.serviceName}</h3>
              <p className="mt-2 text-sm text-slate-600">{service.description}</p>

              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p><span className="font-medium">Duration:</span> {service.duration}</p>
                <p><span className="font-medium">Price:</span> Rs {service.price}</p>
                <p><span className="font-medium">Required Qualification:</span> {service.requiredQualification}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
