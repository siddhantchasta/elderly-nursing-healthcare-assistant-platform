import Booking, { BookingStatus } from "@/models/Booking";

export interface UserStatusUpdateItem {
  bookingId: string;
  patientId: string;
  caregiverId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: Date;
  statusUpdatedAt: Date;
}

export async function listUserStatusUpdates(userId: string): Promise<UserStatusUpdateItem[]> {
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
