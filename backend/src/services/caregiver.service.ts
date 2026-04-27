import { Types } from "mongoose";
import Caregiver from "@/models/Caregiver";
import Booking, { BookingStatus } from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";

export const CAREGIVER_CREATE_STATUSES = ["pending", "verified", "rejected"] as const;

export type CaregiverCreateStatus = (typeof CAREGIVER_CREATE_STATUSES)[number];

export interface CreateCaregiverInput {
  userId: string;
  qualifications: string;
  serviceAreas: string[];
  serviceIds?: string[];
  rating?: number;
  isAvailable?: boolean;
}

export interface CreatedCaregiver {
  id: string;
  userId: string;
  qualifications: string;
  rating: number;
  isAvailable: boolean;
  serviceAreas: string[];
  serviceIds: string[];
  verificationStatus: CaregiverCreateStatus;
}

export interface UpdateCaregiverProfileInput {
  userId: string;
  isAvailable?: boolean;
  serviceAreas?: string[];
  serviceIds?: string[];
}

export interface UpdatedCaregiverProfile {
  id: string;
  isAvailable: boolean;
  serviceAreas: string[];
  serviceIds: string[];
  updatedAt: Date;
}

export interface UpdateCaregiverVerificationInput {
  caregiverId: string;
  verificationStatus: CaregiverCreateStatus;
}

export interface UpdatedCaregiverVerification {
  id: string;
  verificationStatus: CaregiverCreateStatus;
}

export interface CaregiverVerificationQueueItem {
  id: string;
  userId: string;
  qualifications: string;
  serviceAreas: string[];
  serviceIds: string[];
  rating: number;
  isAvailable: boolean;
  verificationStatus: CaregiverCreateStatus;
  createdAt: Date;
}

export interface CaregiverListItem {
  id: string;
  userId: string;
  qualifications: string;
  rating: number;
  serviceAreas: string[];
  serviceIds: string[];
}

export interface CaregiverWorkHistoryItem {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  status: BookingStatus;
  scheduledAt: Date;
  servicePrice: number;
}

export interface CaregiverWorkSummary {
  totalCompletedBookings: number;
  totalEarnings: number;
  history: CaregiverWorkHistoryItem[];
}

export interface CaregiverSelfProfile {
  id: string;
  userId: string;
  qualifications: string;
  rating: number;
  isAvailable: boolean;
  serviceAreas: string[];
  serviceIds: string[];
  verificationStatus: CaregiverCreateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function isValidCaregiverStatus(status: string): status is CaregiverCreateStatus {
  return CAREGIVER_CREATE_STATUSES.includes(status as CaregiverCreateStatus);
}

export async function listAvailableCaregivers(): Promise<CaregiverListItem[]> {
  const caregivers = await Caregiver.find({
    verificationStatus: "verified",
    isAvailable: true,
  })
    .sort({ rating: -1, createdAt: -1 })
    .lean();

  return caregivers.map((caregiver) => ({
    id: caregiver._id.toString(),
    userId: caregiver.userId.toString(),
    qualifications: caregiver.qualifications,
    rating: caregiver.rating,
    serviceAreas: caregiver.serviceAreas,
    serviceIds: caregiver.serviceIds.map((serviceId) => serviceId.toString()),
  }));
}

export async function createCaregiverProfile(input: CreateCaregiverInput): Promise<CreatedCaregiver> {
  const user = await User.findById(input.userId).lean();

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role !== "caregiver") {
    throw new Error("USER_ROLE_NOT_CAREGIVER");
  }

  const existingCaregiver = await Caregiver.findOne({ userId: input.userId }).lean();

  if (existingCaregiver) {
    throw new Error("CAREGIVER_PROFILE_ALREADY_EXISTS");
  }

  const serviceIds = Array.from(new Set(input.serviceIds ?? []));

  if (serviceIds.length > 0) {
    const existingServices = await Service.find({ _id: { $in: serviceIds } }).select("_id").lean();

    if (existingServices.length !== serviceIds.length) {
      throw new Error("SERVICE_NOT_FOUND");
    }
  }

  const createdCaregiver = await Caregiver.create({
    userId: input.userId,
    qualifications: input.qualifications,
    rating: input.rating ?? 0,
    isAvailable: input.isAvailable ?? true,
    serviceAreas: input.serviceAreas,
    serviceIds,
    verificationStatus: "pending",
  });

  return {
    id: createdCaregiver._id.toString(),
    userId: createdCaregiver.userId.toString(),
    qualifications: createdCaregiver.qualifications,
    rating: createdCaregiver.rating,
    isAvailable: createdCaregiver.isAvailable,
    serviceAreas: createdCaregiver.serviceAreas,
    serviceIds: createdCaregiver.serviceIds.map((serviceId) => serviceId.toString()),
    verificationStatus: createdCaregiver.verificationStatus,
  };
}

export async function updateCaregiverVerificationStatus(
  input: UpdateCaregiverVerificationInput
): Promise<UpdatedCaregiverVerification> {
  const caregiver = await Caregiver.findById(input.caregiverId);

  if (!caregiver) {
    throw new Error("CAREGIVER_NOT_FOUND");
  }

  caregiver.verificationStatus = input.verificationStatus;
  await caregiver.save();

  return {
    id: caregiver._id.toString(),
    verificationStatus: caregiver.verificationStatus,
  };
}

export async function listCaregiversByVerificationStatus(
  verificationStatus: CaregiverCreateStatus
): Promise<CaregiverVerificationQueueItem[]> {
  const caregivers = await Caregiver.find({ verificationStatus }).sort({ createdAt: 1 }).lean();

  return caregivers.map((caregiver) => ({
    id: caregiver._id.toString(),
    userId: caregiver.userId.toString(),
    qualifications: caregiver.qualifications,
    serviceAreas: caregiver.serviceAreas,
    serviceIds: caregiver.serviceIds.map((serviceId) => serviceId.toString()),
    rating: caregiver.rating,
    isAvailable: caregiver.isAvailable,
    verificationStatus: caregiver.verificationStatus,
    createdAt: caregiver.createdAt,
  }));
}

export async function updateCaregiverProfile(
  input: UpdateCaregiverProfileInput
): Promise<UpdatedCaregiverProfile> {
  const caregiver = await Caregiver.findOne({ userId: input.userId });

  if (!caregiver) {
    throw new Error("CAREGIVER_PROFILE_NOT_FOUND");
  }

  if (input.isAvailable !== undefined) {
    caregiver.isAvailable = input.isAvailable;
  }

  if (input.serviceAreas !== undefined) {
    caregiver.serviceAreas = input.serviceAreas;
  }

  if (input.serviceIds !== undefined) {
    const deduplicatedServiceIds = Array.from(new Set(input.serviceIds));
    const existingServices = await Service.find({ _id: { $in: deduplicatedServiceIds } }).select("_id").lean();

    if (existingServices.length !== deduplicatedServiceIds.length) {
      throw new Error("SERVICE_NOT_FOUND");
    }

    caregiver.serviceIds = deduplicatedServiceIds.map((serviceId) => new Types.ObjectId(serviceId));
  }

  await caregiver.save();

  return {
    id: caregiver._id.toString(),
    isAvailable: caregiver.isAvailable,
    serviceAreas: caregiver.serviceAreas,
    serviceIds: caregiver.serviceIds.map((serviceId) => serviceId.toString()),
    updatedAt: caregiver.updatedAt,
  };
}

export async function getCaregiverProfileByUserId(userId: string): Promise<CaregiverSelfProfile> {
  const caregiver = await Caregiver.findOne({ userId }).lean();

  if (!caregiver) {
    throw new Error("CAREGIVER_PROFILE_NOT_FOUND");
  }

  return {
    id: caregiver._id.toString(),
    userId: caregiver.userId.toString(),
    qualifications: caregiver.qualifications,
    rating: caregiver.rating,
    isAvailable: caregiver.isAvailable,
    serviceAreas: caregiver.serviceAreas,
    serviceIds: caregiver.serviceIds.map((serviceId) => serviceId.toString()),
    verificationStatus: caregiver.verificationStatus,
    createdAt: caregiver.createdAt,
    updatedAt: caregiver.updatedAt,
  };
}

export interface SubmitBookingRatingInput {
  bookingId: string;
  userId: string;
  rating: number;
}

export interface SubmittedBookingRating {
  bookingId: string;
  caregiverId: string;
  userRating: number;
  caregiverNewAverageRating: number;
}

export async function submitBookingRating(
  input: SubmitBookingRatingInput
): Promise<SubmittedBookingRating> {
  const booking = await Booking.findById(input.bookingId);

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.userId.toString() !== input.userId) {
    throw new Error("BOOKING_ACCESS_DENIED");
  }

  if (booking.status !== "completed") {
    throw new Error("BOOKING_NOT_COMPLETED");
  }

  if (booking.userRating !== null && booking.userRating !== undefined) {
    throw new Error("BOOKING_ALREADY_RATED");
  }

  // Persist rating on the booking document
  booking.userRating = input.rating;
  await booking.save();

  // Recompute caregiver average from all rated completed bookings
  const caregiverId = booking.caregiverId.toString();

  const ratedBookings = await Booking.find({
    caregiverId: booking.caregiverId,
    status: "completed",
    userRating: { $ne: null },
  })
    .select("userRating")
    .lean();

  const totalRatings = ratedBookings.length;
  const sumRatings = ratedBookings.reduce(
    (sum, b) => sum + (b.userRating ?? 0),
    0
  );
  const newAverage = totalRatings === 0 ? 0 : Number((sumRatings / totalRatings).toFixed(2));

  await Caregiver.findByIdAndUpdate(booking.caregiverId, {
    $set: { rating: newAverage },
  });

  return {
    bookingId: booking._id.toString(),
    caregiverId,
    userRating: input.rating,
    caregiverNewAverageRating: newAverage,
  };
}

export async function getCaregiverWorkSummary(caregiverId: string): Promise<CaregiverWorkSummary> {
  const workStatuses: BookingStatus[] = ["accepted", "in_progress", "completed"];

  const bookings = await Booking.find({
    caregiverId,
    status: { $in: workStatuses },
  })
    .sort({ scheduledAt: -1 })
    .lean();

  const serviceIds = bookings.map((booking) => booking.serviceId.toString());
  const services = await Service.find({ _id: { $in: serviceIds } }).lean();
  const serviceMap = new Map(services.map((service) => [service._id.toString(), service]));

  const history: CaregiverWorkHistoryItem[] = bookings.map((booking) => {
    const service = serviceMap.get(booking.serviceId.toString());

    return {
      bookingId: booking._id.toString(),
      serviceId: booking.serviceId.toString(),
      serviceName: service?.serviceName ?? "Unknown Service",
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      servicePrice: service?.price ?? 0,
    };
  });

  const completedBookings = history.filter((item) => item.status === "completed");
  const totalEarnings = completedBookings.reduce((sum, item) => sum + item.servicePrice, 0);

  return {
    totalCompletedBookings: completedBookings.length,
    totalEarnings,
    history,
  };
}
