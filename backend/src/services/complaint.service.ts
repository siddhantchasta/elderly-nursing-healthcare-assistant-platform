import Booking from "@/models/Booking";
import Caregiver from "@/models/Caregiver";
import Complaint from "@/models/Complaint";

export interface CreateComplaintInput {
  bookingId: string;
  raisedByUserId: string;
  raisedByRole: "user" | "caregiver";
  message: string;
}

export interface CreatedComplaint {
  id: string;
  bookingId: string;
  raisedByUserId: string;
  raisedByRole: "user" | "caregiver";
  message: string;
  status: "open";
  createdAt: Date;
}

export async function createComplaint(input: CreateComplaintInput): Promise<CreatedComplaint> {
  const booking = await Booking.findById(input.bookingId).lean();

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (input.raisedByRole === "user" && booking.userId.toString() !== input.raisedByUserId) {
    throw new Error("BOOKING_ACCESS_DENIED");
  }

  if (input.raisedByRole === "caregiver" && booking.caregiverId.toString() !== input.raisedByUserId) {
    const caregiverProfile = await Caregiver.findOne({ userId: input.raisedByUserId }).lean();

    if (!caregiverProfile || caregiverProfile._id.toString() !== booking.caregiverId.toString()) {
      throw new Error("BOOKING_ACCESS_DENIED");
    }
  }

  const createdComplaint = await Complaint.create({
    bookingId: input.bookingId,
    raisedByUserId: input.raisedByUserId,
    raisedByRole: input.raisedByRole,
    message: input.message,
    status: "open",
  });

  return {
    id: createdComplaint._id.toString(),
    bookingId: createdComplaint.bookingId.toString(),
    raisedByUserId: createdComplaint.raisedByUserId.toString(),
    raisedByRole: createdComplaint.raisedByRole,
    message: createdComplaint.message,
    status: "open",
    createdAt: createdComplaint.createdAt,
  };
}