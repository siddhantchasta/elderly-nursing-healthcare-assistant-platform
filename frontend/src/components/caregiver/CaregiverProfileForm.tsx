"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Star } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  createCaregiverProfile,
  getCaregiverProfile,
  listServices,
  updateCaregiverProfile,
} from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { cd, VERIFICATION_STYLES } from "@/lib/ui/caregiver-dashboard";
import type { CaregiverProfile } from "@/types/caregiver";
import type { ServiceItem } from "@/types/service";
import DashboardSection from "@/components/ui/DashboardSection";

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

  const stats = profile
    ? [
        { label: "Rating", value: profile.rating.toFixed(1), icon: Star },
        { label: "Service areas", value: String(profile.serviceAreas.length), icon: MapPin },
        { label: "Services", value: String(selectedServiceIds.length), icon: CheckCircle2 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {profile ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={cd.kpiCard}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dfe9e5]">
                    <Icon className="h-[18px] w-[18px] text-[#4a6b5c]" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ca09a]">
                      {stat.label}
                    </p>
                    <p className="mt-0.5 text-2xl font-black tracking-tight text-[#111111]">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <DashboardSection
        title={hasProfile ? "Professional profile" : "Create your profile"}
        description={
          hasProfile
            ? "Keep your availability and coverage up to date so families can find you."
            : "Tell families about your qualifications and where you provide care."
        }
        onRefresh={loading ? undefined : () => void loadData()}
      >
        <div className="flex flex-wrap items-center gap-3">
          {profile ? (
            <span className={`${cd.badge} ${VERIFICATION_STYLES[profile.verificationStatus]}`}>
              {profile.verificationStatus}
            </span>
          ) : (
            <span className={`${cd.badge} bg-[#f5efe6] text-[#8a6d3b]`}>Not submitted</span>
          )}
          {profile?.isAvailable ? (
            <span className={`${cd.badge} bg-[#e8f0ec] text-[#3d6b55]`}>Available</span>
          ) : profile ? (
            <span className={`${cd.badge} bg-[#f0f0ee] text-[#6d7b76]`}>Unavailable</span>
          ) : null}
        </div>

        {loading ? <p className={cd.muted}>Loading profile...</p> : null}
        {error ? <p className={`mt-4 ${cd.error}`}>{error}</p> : null}
        {success ? <p className={`mt-4 ${cd.success}`}>{success}</p> : null}

        {!loading ? (
          <form className="mt-8 space-y-8" onSubmit={onSubmit}>
            
              <div>
                <label htmlFor="qualifications" className={cd.label}>
                  Qualifications
                </label>
                <input
                  id="qualifications"
                  type="text"
                  value={qualifications}
                  onChange={(event) => setQualifications(event.target.value)}
                  disabled={hasProfile}
                  placeholder="RN, Geriatric care, physiotherapy"
                  className={cd.input}
                />
                {hasProfile ? (
                  <p className="mt-2 text-xs text-[#8ca09a]">Qualifications are set during profile creation.</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="serviceAreas" className={cd.label}>
                  Service areas
                </label>
                <textarea
                  id="serviceAreas"
                  rows={3}
                  value={serviceAreasText}
                  onChange={(event) => setServiceAreasText(event.target.value)}
                  placeholder="Colombo 03, Colombo 05"
                  className={cd.textarea}
                />
                <p className="mt-2 text-xs text-[#8ca09a]">Separate areas with commas.</p>
              </div>

              <div>
                <label className={cd.label}>Services offered</label>
                {services.length === 0 ? (
                  <p className={cd.muted}>No services available yet.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <label key={service.id} className={cd.serviceChip}>
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="mt-0.5 h-4 w-4 rounded border-[#d8d8d8] text-[#ff6a3d] focus:ring-[#ff6a3d]"
                        />
                        <span className="text-sm font-medium text-[#111111]">{service.serviceName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <label
                htmlFor="isAvailable"
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-[20px] border p-5 transition ${
                  isAvailable ? "border-[#cad5d2] bg-[#eef5f2]" : "border-[#e7e7e7] bg-[#fafaf8]"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Available for new bookings</p>
                  <p className="mt-0.5 text-sm text-[#6d7b76]">
                    {isAvailable
                      ? "Families can request visits while you are marked available."
                      : "You will not receive new booking requests."}
                  </p>
                </div>
                <input
                  id="isAvailable"
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(event) => setIsAvailable(event.target.checked)}
                  className="h-5 w-5 rounded border-[#d8d8d8] text-[#ff6a3d] focus:ring-[#ff6a3d]"
                />
              </label>

              <div className="flex flex-wrap gap-3 border-t border-[#e7e7e7] pt-6">
                <button type="submit" disabled={submitting} className={cd.btnPrimary}>
                  {submitting ? "Saving..." : hasProfile ? "Update profile" : "Create profile"}
                </button>
                <button type="button" onClick={() => void loadData()} className={cd.btnSecondary}>
                  Refresh
                </button>
              </div>
            </form>
        ) : null}
      </DashboardSection>
    </div>
  );
}

