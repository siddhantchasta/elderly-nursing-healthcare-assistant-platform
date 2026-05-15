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

const VERIFICATION_CONFIG: Record<CaregiverProfile["verificationStatus"], { bg: string; text: string; label: string; description: string }> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Pending Verification",
    description: "Your profile is under review. You will be notified once verified.",
  },
  verified: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Verified",
    description: "Your profile has been verified. You can now receive bookings.",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Verification Rejected",
    description: "Your profile verification was not successful. Please contact support.",
  },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Verification Status */}
      {profile && (
        <div className={`flex items-center gap-4 rounded-xl ${VERIFICATION_CONFIG[profile.verificationStatus].bg} px-6 py-4`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
            profile.verificationStatus === "verified" ? "bg-green-100" :
            profile.verificationStatus === "rejected" ? "bg-red-100" : "bg-amber-100"
          }`}>
            {profile.verificationStatus === "verified" ? (
              <svg className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            ) : profile.verificationStatus === "rejected" ? (
              <svg className="h-5 w-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-semibold ${VERIFICATION_CONFIG[profile.verificationStatus].text}`}>
              {VERIFICATION_CONFIG[profile.verificationStatus].label}
            </p>
            <p className="text-sm text-muted-foreground">
              {VERIFICATION_CONFIG[profile.verificationStatus].description}
            </p>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Qualifications Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Qualifications</h2>
                <p className="text-sm text-muted-foreground">Your professional certifications and training</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label htmlFor="qualifications" className="mb-2 block text-sm font-medium text-foreground">
              Certifications & Training
            </label>
            <input
              id="qualifications"
              type="text"
              value={qualifications}
              onChange={(event) => setQualifications(event.target.value)}
              disabled={hasProfile}
              placeholder="e.g., RN, Certified Nursing Assistant, Geriatric Care"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-secondary disabled:text-muted-foreground"
            />
            {hasProfile && (
              <p className="mt-2 text-xs text-muted-foreground">
                Qualifications cannot be changed after profile creation. Contact support to update.
              </p>
            )}
          </div>
        </div>

        {/* Service Areas Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Service Areas</h2>
                <p className="text-sm text-muted-foreground">Locations where you can provide care</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label htmlFor="serviceAreas" className="mb-2 block text-sm font-medium text-foreground">
              Areas (comma-separated)
            </label>
            <textarea
              id="serviceAreas"
              rows={3}
              value={serviceAreasText}
              onChange={(event) => setServiceAreasText(event.target.value)}
              placeholder="e.g., Colombo 03, Colombo 05, Dehiwala"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {serviceAreaList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {serviceAreaList.map((area, index) => (
                  <span key={index} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Services Offered</h2>
                <p className="text-sm text-muted-foreground">Select the services you can provide</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      selectedServiceIds.includes(service.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground">{service.serviceName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Availability Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Availability</h2>
                <p className="text-sm text-muted-foreground">Control your booking availability</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="flex cursor-pointer items-center gap-4">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(event) => setIsAvailable(event.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-secondary transition-colors peer-checked:bg-primary"></div>
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card transition-transform peer-checked:translate-x-5"></div>
              </div>
              <div>
                <p className="font-medium text-foreground">Available for New Bookings</p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable
                    ? "You will appear in search results and can receive new booking requests."
                    : "You will not receive new booking requests."}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
