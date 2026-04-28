import { apiAuthedRequest, apiRequest } from "@/lib/api/client";
import type { LoginResponseData, RegisterResponseData, UserRole } from "@/types/auth";
import type { CreatePatientPayload, PatientProfile } from "@/types/patient";
import type { ServiceItem } from "@/types/service";
import type { CaregiverListItem } from "@/types/caregiver";
import type { BookingItem, CreateBookingPayload } from "@/types/booking";
import type { CareNoteItem } from "@/types/careNote";

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

export function createBooking(payload: CreateBookingPayload) {
  return apiAuthedRequest<BookingItem>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listBookings() {
  return apiAuthedRequest<BookingItem[]>("/api/bookings", {
    method: "GET",
  });
}

export function getBookingById(bookingId: string) {
  return apiAuthedRequest<BookingItem>(`/api/bookings/${bookingId}`, {
    method: "GET",
  });
}

export function listCareNotes(bookingId: string) {
  return apiAuthedRequest<CareNoteItem[]>(`/api/bookings/notes?bookingId=${bookingId}`, {
    method: "GET",
  });
}

export function rateBooking(bookingId: string, rating: number) {
  return apiAuthedRequest<{ bookingId: string; caregiverId: string; userRating: number; caregiverNewAverageRating: number }>(
    `/api/bookings/${bookingId}/rating`,
    {
      method: "POST",
      body: JSON.stringify({ rating }),
    }
  );
}
