"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import {
  createCaregiverProfile,
  getCaregiverProfile,
  listServices,
  updateCaregiverProfile,
} from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { CaregiverProfile } from "@/types/caregiver";
import type { ServiceItem } from "@/types/service";

const VERIFICATION_STYLES: Record<CaregiverProfile["verificationStatus"], string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function parseList(input: string) {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export default function CaregiverProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [qualifications, setQualifications] = useState("");
  const [serviceAreasText, setServiceAreasText] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const hasProfile = Boolean(profile);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [servicesData, profileData] = await Promise.all([
        listServices(),
        getCaregiverProfile(),
      ]);

      setServices(servicesData);
      setProfile(profileData);
      setQualifications(profileData.qualifications);
      setServiceAreasText(profileData.serviceAreas.join(", "));
      setIsAvailable(profileData.isAvailable);
      setSelectedServiceIds(profileData.serviceIds ?? []);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }

        if (err.status === 404 && err.message === "CAREGIVER_PROFILE_NOT_FOUND") {
          const servicesData = await listServices();
          setServices(servicesData);
          setProfile(null);
          setQualifications("");
          setServiceAreasText("");
          setIsAvailable(true);
          setSelectedServiceIds([]);
          setError(null);
          return;
        }

        setError(err.message);
      } else {
        setError("Failed to load caregiver profile");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "caregiver") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadData]);

  const serviceAreaList = useMemo(() => parseList(serviceAreasText), [serviceAreasText]);

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (serviceAreaList.length === 0) {
        setError("Please add at least one service area.");
        return;
      }

      if (!hasProfile) {
        if (!qualifications.trim()) {
          setError("Qualifications are required.");
          return;
        }

        await createCaregiverProfile({
          qualifications: qualifications.trim(),
          serviceAreas: serviceAreaList,
          serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
          isAvailable,
        });
        setSuccess("Caregiver profile created successfully.");
        await loadData();
        return;
      }

      await updateCaregiverProfile({
        isAvailable,
        serviceAreas: serviceAreaList,
        serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
      });
      setSuccess("Caregiver profile updated successfully.");
      await loadData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to save caregiver profile");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Caregiver Profile</h2>
          <p className="mt-1 text-sm text-slate-600">Update qualifications, availability, and service coverage.</p>
        </div>
        {profile ? (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${VERIFICATION_STYLES[profile.verificationStatus]}`}>
            {profile.verificationStatus}
          </span>
        ) : null}
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading profile...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

      {!loading ? (
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="qualifications" className="mb-1 block text-sm font-medium text-slate-700">Qualifications</label>
            <input
              id="qualifications"
              type="text"
              value={qualifications}
              onChange={(event) => setQualifications(event.target.value)}
              disabled={hasProfile}
              placeholder="RN, Geriatric care, physiotherapy"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 disabled:bg-slate-100"
            />
            {hasProfile ? (
              <p className="mt-1 text-xs text-slate-500">Qualifications are set during profile creation.</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="serviceAreas" className="mb-1 block text-sm font-medium text-slate-700">Service Areas</label>
            <textarea
              id="serviceAreas"
              rows={3}
              value={serviceAreasText}
              onChange={(event) => setServiceAreasText(event.target.value)}
              placeholder="Colombo 03, Colombo 05"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
            <p className="mt-1 text-xs text-slate-500">Separate areas with commas.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Services Offered</label>
            {services.length === 0 ? (
              <p className="text-sm text-slate-600">No services available yet.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {services.map((service) => (
                  <label key={service.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-slate-700">{service.serviceName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isAvailable"
              type="checkbox"
              checked={isAvailable}
              onChange={(event) => setIsAvailable(event.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-slate-700">Available for new bookings</label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
            >
              Refresh
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
