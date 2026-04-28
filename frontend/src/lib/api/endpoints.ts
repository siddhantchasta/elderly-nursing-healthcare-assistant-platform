import { apiAuthedRequest, apiRequest } from "@/lib/api/client";
import type { LoginResponseData, RegisterResponseData, UserRole } from "@/types/auth";
import type { CreatePatientPayload, PatientProfile } from "@/types/patient";
import type { ServiceItem } from "@/types/service";
import type {
  CaregiverListItem,
  CaregiverProfile,
  CreateCaregiverProfilePayload,
  UpdateCaregiverProfilePayload,
} from "@/types/caregiver";
import type { BookingItem, CreateBookingPayload } from "@/types/booking";
import type { CareNoteItem } from "@/types/careNote";
import type { ComplaintItem, CreateComplaintPayload } from "@/types/complaint";
import type { UserNotifications } from "@/types/notification";

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

export function getCaregiverProfile() {
  return apiAuthedRequest<CaregiverProfile>("/api/caregivers/me", {
    method: "GET",
  });
}

export function createCaregiverProfile(payload: CreateCaregiverProfilePayload) {
  return apiAuthedRequest<CaregiverProfile>("/api/caregivers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCaregiverProfile(payload: UpdateCaregiverProfilePayload) {
  return apiAuthedRequest<{ id: string; isAvailable: boolean; serviceAreas: string[]; serviceIds: string[] }>(
    "/api/caregivers",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
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

export function updateBookingDecision(bookingId: string, decision: "accepted" | "rejected") {
  return apiAuthedRequest<{ id: string; status: BookingItem["status"]; statusUpdatedAt: string }>("/api/bookings", {
    method: "PATCH",
    body: JSON.stringify({ bookingId, decision }),
  });
}

export function updateBookingStatus(bookingId: string, status: "in_progress" | "completed") {
  return apiAuthedRequest<{ id: string; status: BookingItem["status"]; statusUpdatedAt: string }>(
    "/api/bookings/status",
    {
      method: "PATCH",
      body: JSON.stringify({ bookingId, status }),
    }
  );
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

export function createComplaint(payload: CreateComplaintPayload) {
  return apiAuthedRequest<ComplaintItem>("/api/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listComplaints() {
  return apiAuthedRequest<ComplaintItem[]>("/api/complaints", {
    method: "GET",
  });
}

export function getComplaintById(complaintId: string) {
  return apiAuthedRequest<ComplaintItem>(`/api/complaints/${complaintId}`, {
    method: "GET",
  });
}

export function listUserNotifications() {
  return apiAuthedRequest<UserNotifications>("/api/notifications/status-updates", {
    method: "GET",
  });
}
