import { Types } from "mongoose";
import Booking, { BOOKING_TYPES, BOOKING_STATUSES, BookingStatus, BookingType } from "@/models/Booking";
import Caregiver from "@/models/Caregiver";
import Patient from "@/models/Patient";
import Service from "@/models/Service";
import User from "@/models/User";

export interface CreateBookingInput {
  userId: string;
  patientId: string;
  caregiverId: string;
  serviceId: string;
  bookingType: BookingType;
  scheduledAt: string;
}

export interface CreatedBooking {
  id: string;
  userId: string;
  patientId: string;
  caregiverId: string;
  serviceId: string;
  bookingType: BookingType;
  status: "pending";
  scheduledAt: Date;
  statusUpdatedAt: Date;
}

export const BOOKING_DECISIONS = ["accepted", "rejected"] as const;
export type BookingDecision = (typeof BOOKING_DECISIONS)[number];

export interface UpdateBookingDecisionInput {
  bookingId: string;
  caregiverId: string;
  decision: BookingDecision;
}

export interface UpdatedBookingDecision {
  id: string;
  status: BookingStatus;
  statusUpdatedAt: Date;
}

export interface BookingHistoryQuery {
  userId?: string;
  caregiverId?: string;
}

export interface BookingHistoryItem {
  id: string;
  userId: string;
  patientId: string;
  caregiverId: string;
  serviceId: string;
  bookingType: BookingType;
  status: BookingStatus;
  scheduledAt: Date;
  statusUpdatedAt: Date;
}

export function isValidBookingType(bookingType: string): bookingType is BookingType {
  return BOOKING_TYPES.includes(bookingType as BookingType);
}

export function isValidBookingDecision(decision: string): decision is BookingDecision {
  return BOOKING_DECISIONS.includes(decision as BookingDecision);
}

export function isValidBookingStatus(status: string): status is BookingStatus {
  return BOOKING_STATUSES.includes(status as BookingStatus);
}

export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

export async function createBookingRequest(input: CreateBookingInput): Promise<CreatedBooking> {
  const [user, patient, caregiver, service] = await Promise.all([
    User.findById(input.userId).lean(),
    Patient.findById(input.patientId).lean(),
    Caregiver.findById(input.caregiverId).lean(),
    Service.findById(input.serviceId).lean(),
  ]);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  if (patient.userId.toString() !== input.userId) {
    throw new Error("PATIENT_ACCESS_DENIED");
  }

  if (!caregiver) {
    throw new Error("CAREGIVER_NOT_FOUND");
  }

  if (caregiver.verificationStatus !== "verified" || !caregiver.isAvailable) {
    throw new Error("CAREGIVER_NOT_AVAILABLE");
  }

  if (!service) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  const scheduledAtDate = new Date(input.scheduledAt);

  if (Number.isNaN(scheduledAtDate.getTime())) {
    throw new Error("INVALID_SCHEDULED_AT");
  }

  const now = new Date();

  const createdBooking = await Booking.create({
    userId: input.userId,
    patientId: input.patientId,
    caregiverId: input.caregiverId,
    serviceId: input.serviceId,
    bookingType: input.bookingType,
    status: "pending",
    scheduledAt: scheduledAtDate,
    statusUpdatedAt: now,
  });

  return {
    id: createdBooking._id.toString(),
    userId: createdBooking.userId.toString(),
    patientId: createdBooking.patientId.toString(),
    caregiverId: createdBooking.caregiverId.toString(),
    serviceId: createdBooking.serviceId.toString(),
    bookingType: createdBooking.bookingType,
    status: "pending",
    scheduledAt: createdBooking.scheduledAt,
    statusUpdatedAt: createdBooking.statusUpdatedAt,
  };
}

export async function updateBookingDecision(
  input: UpdateBookingDecisionInput
): Promise<UpdatedBookingDecision> {
  const booking = await Booking.findById(input.bookingId);

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.caregiverId.toString() !== input.caregiverId) {
    throw new Error("BOOKING_CAREGIVER_MISMATCH");
  }

  if (booking.status !== "pending") {
    throw new Error("BOOKING_NOT_PENDING");
  }

  booking.status = input.decision;
  booking.statusUpdatedAt = new Date();

  await booking.save();

  return {
    id: booking._id.toString(),
    status: booking.status,
    statusUpdatedAt: booking.statusUpdatedAt,
  };
}

export async function listBookingHistory(query: BookingHistoryQuery): Promise<BookingHistoryItem[]> {
  const filter: { userId?: string; caregiverId?: string } = {};

  if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.caregiverId) {
    filter.caregiverId = query.caregiverId;
  }

  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();

  return bookings.map((booking) => ({
    id: booking._id.toString(),
    userId: booking.userId.toString(),
    patientId: booking.patientId.toString(),
    caregiverId: booking.caregiverId.toString(),
    serviceId: booking.serviceId.toString(),
    bookingType: booking.bookingType,
    status: booking.status,
    scheduledAt: booking.scheduledAt,
    statusUpdatedAt: booking.statusUpdatedAt,
  }));
}