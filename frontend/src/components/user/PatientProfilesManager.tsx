"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createPatientProfile, listPatientProfiles } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { PatientProfile } from "@/types/patient";
import DashboardSection from "@/components/ui/DashboardSection";
import { ud } from "@/lib/ui/user-dashboard";

export default function PatientProfilesManager() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [medicalNeeds, setMedicalNeeds] = useState("");
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfiles = useCallback(async (withLoading = true) => {
    if (withLoading) {
      setLoadingProfiles(true);
      setError(null);
    }
    try {
      const data = await listPatientProfiles();
      setProfiles(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to fetch patient profiles");
      }
    } finally {
      setLoadingProfiles(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "user") {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      void loadProfiles(false);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [router, loadProfiles]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createPatientProfile({
        age: Number(age),
        medicalNeeds: medicalNeeds.trim(),
      });
      setAge("");
      setMedicalNeeds("");
      setSuccess("Patient profile created successfully.");
      await loadProfiles(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to create patient profile");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Create patient profile"
        description="Add age and medical needs for the elderly or patient you are coordinating care for."
      >
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label htmlFor="age" className={ud.label}>
              Age
            </label>
            <input
              id="age"
              type="number"
              min={0}
              max={150}
              required
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className={ud.input}
            />
          </div>

          <div>
            <label htmlFor="medicalNeeds" className={ud.label}>
              Medical needs
            </label>
            <textarea
              id="medicalNeeds"
              required
              rows={4}
              value={medicalNeeds}
              onChange={(event) => setMedicalNeeds(event.target.value)}
              className={ud.textarea}
            />
          </div>

          {error ? <p className={ud.error}>{error}</p> : null}
          {success ? <p className={ud.success}>{success}</p> : null}

          <button type="submit" disabled={submitting} className={ud.btnPrimary}>
            {submitting ? "Saving..." : "Create profile"}
          </button>
        </form>
      </DashboardSection>

      <DashboardSection
        title="Your patient profiles"
        description="Profiles linked to your bookings and care requests."
        onRefresh={() => void loadProfiles(true)}
      >
        {loadingProfiles ? <p className={ud.muted}>Loading profiles...</p> : null}

        {!loadingProfiles && profiles.length === 0 ? (
          <p className={ud.muted}>No patient profiles yet. Create one above to start booking care.</p>
        ) : null}

        {!loadingProfiles && profiles.length > 0 ? (
          <div className={ud.tableWrap}>
            <table className={ud.table}>
              <thead>
                <tr>
                  <th className={ud.th}>Age</th>
                  <th className={ud.th}>Medical needs</th>
                  <th className={ud.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className={ud.tdStrong}>{profile.age}</td>
                    <td className={ud.td}>{profile.medicalNeeds}</td>
                    <td className={ud.td}>{new Date(profile.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </DashboardSection>
    </div>
  );
}
