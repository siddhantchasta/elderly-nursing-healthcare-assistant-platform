import { apiAuthedRequest, apiRequest } from "@/lib/api/client";
import type { LoginResponseData, RegisterResponseData, UserRole } from "@/types/auth";
import type { CreatePatientPayload, PatientProfile } from "@/types/patient";
import type { ServiceItem } from "@/types/service";
import type { CaregiverListItem } from "@/types/caregiver";

interface RegisterPayload {
  email: string;
  password: string;
  role: Extract<UserRole, "user" | "caregiver">;
}

interface LoginPayload {
  email: string;
  password: string;
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<RegisterResponseData>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponseData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createPatientProfile(payload: CreatePatientPayload) {
  return apiAuthedRequest<PatientProfile>("/api/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listPatientProfiles() {
  return apiAuthedRequest<PatientProfile[]>("/api/patients", {
    method: "GET",
  });
}

export function listServices() {
  return apiRequest<ServiceItem[]>("/api/services", {
    method: "GET",
  });
}

export function listCaregivers() {
  return apiRequest<CaregiverListItem[]>("/api/caregivers", {
    method: "GET",
  });
}
