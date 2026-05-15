import type { BookingItem } from "@/types/booking";
import type { CaregiverListItem } from "@/types/caregiver";
import type { PatientProfile } from "@/types/patient";
import type { ServiceItem } from "@/types/service";

const DEFAULT_REFERENCE_LENGTH = 6;

export function formatBookingReference(bookingId: string) {
  const compactId = bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(-DEFAULT_REFERENCE_LENGTH).toUpperCase();

  return compactId ? `BK-${compactId}` : bookingId;
}

export function formatBookingContext(booking: BookingItem, serviceName?: string) {
  const parts = [serviceName ?? "Booking"];
  parts.push(booking.bookingType.replace("_", " "));
  parts.push(new Date(booking.scheduledAt).toLocaleString());

  return parts.join(" · ");
}

export function formatPatientSummary(patient?: PatientProfile | null) {
  if (!patient) return null;

  const needs = patient.medicalNeeds.trim();
  const needsSummary = needs.length > 48 ? `${needs.slice(0, 45).trimEnd()}...` : needs;

  return needsSummary ? `Age ${patient.age} · ${needsSummary}` : `Age ${patient.age}`;
}

export function formatCaregiverSummary(caregiver?: CaregiverListItem | null) {
  if (!caregiver) return null;

  const rating = Number.isFinite(caregiver.rating) ? caregiver.rating.toFixed(1) : null;
  return rating ? `${caregiver.email} · ${rating}★` : caregiver.email;
}

export function formatBookingOptionLabel(booking: BookingItem, service?: ServiceItem | null) {
  const reference = formatBookingReference(booking.id);
  const serviceName = service?.serviceName ?? "Booking";
  const context = `${serviceName} · ${booking.bookingType.replace("_", " ")} · ${new Date(booking.scheduledAt).toLocaleDateString()}`;

  return `${reference} · ${context} · ${booking.status.replace("_", " ")}`;
}