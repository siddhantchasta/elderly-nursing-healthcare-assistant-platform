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

const CATEGORY_COLORS: Record<ServiceItem["category"], string> = {
  nursing_care: "bg-primary/10 text-primary",
  elderly_attendant: "bg-amber-100 text-amber-800",
  physiotherapy: "bg-sky-100 text-sky-800",
  post_hospital_care: "bg-rose-100 text-rose-800",
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
  const [selectedCategory, setSelectedCategory] = useState<ServiceItem["category"] | "all">("all");

  const orderedServices = useMemo(() => {
    let filtered = [...services];
    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }
    return filtered.sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    });
  }, [services, selectedCategory]);

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

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => void loadServices()}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground">No services available</h3>
        <p className="mt-1 text-sm text-muted-foreground">Please check back later for available care services.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          All Services
        </button>
        {CATEGORY_ORDER.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orderedServices.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_COLORS[service.category]}`}>
                {CATEGORY_LABELS[service.category]}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-semibold text-foreground">{service.serviceName}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{service.description}</p>

            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">{service.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold text-primary">Rs {service.price}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Qualification</span>
                <span className="font-medium text-foreground">{service.requiredQualification}</span>
              </div>
            </div>

            <a
              href="/user/bookings/new"
              className="mt-4 block w-full rounded-lg bg-primary/10 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Book This Service
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
