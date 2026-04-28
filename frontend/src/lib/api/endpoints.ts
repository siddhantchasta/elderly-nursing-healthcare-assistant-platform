import { apiRequest } from "@/lib/api/client";
import type { LoginResponseData, RegisterResponseData, UserRole } from "@/types/auth";

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
