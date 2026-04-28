import type { BookingItem } from "@/types/booking";
import type { ComplaintItem } from "@/types/complaint";

export interface BookingStatusUpdateItem {
  bookingId: string;
  patientId: string;
  caregiverId: string;
  serviceId: string;
  status: BookingItem["status"];
  scheduledAt: string;
  statusUpdatedAt: string;
}

export interface ComplaintStatusUpdateItem {
  complaintId: string;
  bookingId: string;
  raisedByRole: ComplaintItem["raisedByRole"];
  message: string;
  status: ComplaintItem["status"];
  createdAt: string;
  updatedAt: string;
}

export interface UserNotifications {
  bookingUpdates: BookingStatusUpdateItem[];
  complaintUpdates: ComplaintStatusUpdateItem[];
}
