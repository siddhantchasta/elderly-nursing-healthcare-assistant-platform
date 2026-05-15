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
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
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

  if (loadingProfiles) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading patient profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Add profile form */}
      {showForm ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add Patient Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">Enter details about your loved one&apos;s care needs.</p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="age" className="mb-1.5 block text-sm font-medium text-foreground">
                Age
              </label>
              <input
                id="age"
                type="number"
                min={0}
                max={150}
                required
                value={age}
                placeholder="Enter patient age"
                onChange={(event) => setAge(event.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="medicalNeeds" className="mb-1.5 block text-sm font-medium text-foreground">
                Medical Needs & Care Requirements
              </label>
              <textarea
                id="medicalNeeds"
                required
                rows={4}
                value={medicalNeeds}
                placeholder="Describe any medical conditions, mobility requirements, dietary needs, or special care instructions..."
                onChange={(event) => setMedicalNeeds(event.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-5 py-2.5 font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/50 p-6 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Patient Profile
        </button>
      )}

      {/* Existing profiles */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Patient Profiles</h2>
            <p className="mt-1 text-sm text-muted-foreground">{profiles.length} profile{profiles.length !== 1 ? "s" : ""} registered</p>
          </div>
          <button
            onClick={() => void loadProfiles(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>

        {profiles.length === 0 ? (
          <div className="mt-4 rounded-lg bg-secondary/50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <p className="font-medium text-foreground">No patient profiles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a profile to begin booking care services.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-lg border border-border p-4 transition-all hover:border-primary/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Age {profile.age}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{profile.medicalNeeds}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Added {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
