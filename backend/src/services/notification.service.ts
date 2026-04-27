import Booking, { BookingStatus } from "@/models/Booking";
import Complaint, { ComplaintStatus } from "@/models/Complaint";

// ─── Booking Updates ──────────────────────────────────────────────────────────

export interface BookingStatusUpdateItem {
  bookingId: string;
  patientId: string;
  caregiverId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: Date;
  statusUpdatedAt: Date;
}

// ─── Complaint Status Updates ─────────────────────────────────────────────────

export interface ComplaintStatusUpdateItem {
  complaintId: string;
  bookingId: string;
  raisedByRole: "user" | "caregiver";
  message: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Combined Notifications ───────────────────────────────────────────────────

export interface UserNotifications {
  bookingUpdates: BookingStatusUpdateItem[];
  complaintUpdates: ComplaintStatusUpdateItem[];
}

/**
 * Returns all booking + complaint status signals for a given user in a single
 * parallel fetch. Used by both the REST polling endpoint and the SSE stream.
 */
export async function listUserNotifications(userId: string): Promise<UserNotifications> {
  const [bookings, complaints] = await Promise.all([
    Booking.find({ userId }).sort({ statusUpdatedAt: -1 }).lean(),
    Complaint.find({ raisedByUserId: userId }).sort({ updatedAt: -1 }).lean(),
  ]);

  return {
    bookingUpdates: bookings.map((b) => ({
      bookingId: b._id.toString(),
      patientId: b.patientId.toString(),
      caregiverId: b.caregiverId.toString(),
      serviceId: b.serviceId.toString(),
      status: b.status,
      scheduledAt: b.scheduledAt,
      statusUpdatedAt: b.statusUpdatedAt,
    })),
    complaintUpdates: complaints.map((c) => ({
      complaintId: c._id.toString(),
      bookingId: c.bookingId.toString(),
      raisedByRole: c.raisedByRole,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  };
}

// ─── Backward-compat alias (booking-only) ────────────────────────────────────

/** @deprecated Use listUserNotifications for full coverage including complaints */
export type UserStatusUpdateItem = BookingStatusUpdateItem;

export async function listUserStatusUpdates(userId: string): Promise<BookingStatusUpdateItem[]> {
  const bookings = await Booking.find({ userId })
    .sort({ statusUpdatedAt: -1 })
    .lean();

  return bookings.map((booking) => ({
    bookingId: booking._id.toString(),
    patientId: booking.patientId.toString(),
    caregiverId: booking.caregiverId.toString(),
    serviceId: booking.serviceId.toString(),
    status: booking.status,
    scheduledAt: booking.scheduledAt,
    statusUpdatedAt: booking.statusUpdatedAt,
  }));
}
