export type BookingType = "hourly" | "daily" | "long_term";

export interface CreateBookingPayload {
  patientId: string;
  caregiverId: string;
  serviceId: string;
  bookingType: BookingType;
  scheduledAt: string;
}

export interface BookingItem {
  id: string;
  userId: string;
  patientId: string;
  caregiverId: string;
  serviceId: string;
  bookingType: BookingType;
  status: "pending" | "accepted" | "rejected" | "in_progress" | "completed";
  scheduledAt: string;
  statusUpdatedAt: string;
}
