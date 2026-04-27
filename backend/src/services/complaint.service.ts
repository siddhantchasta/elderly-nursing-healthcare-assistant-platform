import Booking from "@/models/Booking";
import Caregiver from "@/models/Caregiver";
import Complaint, { COMPLAINT_STATUSES, ComplaintStatus } from "@/models/Complaint";

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

export interface ComplaintListItem {
  id: string;
  bookingId: string;
  raisedByUserId: string;
  raisedByRole: "user" | "caregiver";
  message: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateComplaintStatusInput {
  complaintId: string;
  status: ComplaintStatus;
}

export interface UpdatedComplaintStatus {
  id: string;
  status: ComplaintStatus;
  updatedAt: Date;
}

export interface ListReporterComplaintsInput {
  raisedByUserId: string;
  raisedByRole: "user" | "caregiver";
  status?: ComplaintStatus;
}

export function isValidComplaintStatus(status: string): status is ComplaintStatus {
  return COMPLAINT_STATUSES.includes(status as ComplaintStatus);
}

export async function getComplaintById(complaintId: string): Promise<ComplaintListItem> {
  const complaint = await Complaint.findById(complaintId).lean();

  if (!complaint) {
    throw new Error("COMPLAINT_NOT_FOUND");
  }

  return {
    id: complaint._id.toString(),
    bookingId: complaint.bookingId.toString(),
    raisedByUserId: complaint.raisedByUserId.toString(),
    raisedByRole: complaint.raisedByRole,
    message: complaint.message,
    status: complaint.status,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
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

export async function listComplaints(status?: ComplaintStatus): Promise<ComplaintListItem[]> {
  const filter = status ? { status } : {};

  const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).lean();

  return complaints.map((complaint) => ({
    id: complaint._id.toString(),
    bookingId: complaint.bookingId.toString(),
    raisedByUserId: complaint.raisedByUserId.toString(),
    raisedByRole: complaint.raisedByRole,
    message: complaint.message,
    status: complaint.status,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  }));
}

export async function listReporterComplaints(
  input: ListReporterComplaintsInput
): Promise<ComplaintListItem[]> {
  const filter: {
    raisedByUserId: string;
    raisedByRole: "user" | "caregiver";
    status?: ComplaintStatus;
  } = {
    raisedByUserId: input.raisedByUserId,
    raisedByRole: input.raisedByRole,
  };

  if (input.status) {
    filter.status = input.status;
  }

  const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).lean();

  return complaints.map((complaint) => ({
    id: complaint._id.toString(),
    bookingId: complaint.bookingId.toString(),
    raisedByUserId: complaint.raisedByUserId.toString(),
    raisedByRole: complaint.raisedByRole,
    message: complaint.message,
    status: complaint.status,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  }));
}

export async function updateComplaintStatus(
  input: UpdateComplaintStatusInput
): Promise<UpdatedComplaintStatus> {
  const complaint = await Complaint.findById(input.complaintId);

  if (!complaint) {
    throw new Error("COMPLAINT_NOT_FOUND");
  }

  complaint.status = input.status;
  await complaint.save();

  return {
    id: complaint._id.toString(),
    status: complaint.status,
    updatedAt: complaint.updatedAt,
  };
}