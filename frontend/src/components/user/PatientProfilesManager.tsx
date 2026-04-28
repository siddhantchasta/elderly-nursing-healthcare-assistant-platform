"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createPatientProfile, listPatientProfiles } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { PatientProfile } from "@/types/patient";

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
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Create Patient Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Add age and medical needs for the elderly/patient profile.</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="age" className="mb-1 block text-sm font-medium text-slate-700">
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="medicalNeeds" className="mb-1 block text-sm font-medium text-slate-700">
              Medical Needs
            </label>
            <textarea
              id="medicalNeeds"
              required
              rows={4}
              value={medicalNeeds}
              onChange={(event) => setMedicalNeeds(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            />
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Create Profile"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Patient Profiles</h2>
          <button onClick={() => void loadProfiles(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            Refresh
          </button>
        </div>

        {loadingProfiles ? <p className="mt-4 text-sm text-slate-600">Loading profiles...</p> : null}

        {!loadingProfiles && profiles.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No patient profiles found.</p>
        ) : null}

        {!loadingProfiles && profiles.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                  <th className="px-2 py-2 font-medium">Age</th>
                  <th className="px-2 py-2 font-medium">Medical Needs</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-900">{profile.age}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{profile.medicalNeeds}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">
                      {new Date(profile.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
