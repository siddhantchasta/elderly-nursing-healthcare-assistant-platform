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
  rating?: number;
  isAvailable?: boolean;
  verificationStatus?: CaregiverCreateStatus;
}

export interface CreatedCaregiver {
  id: string;
  userId: string;
  qualifications: string;
  rating: number;
  isAvailable: boolean;
  serviceAreas: string[];
  verificationStatus: CaregiverCreateStatus;
}

export interface UpdateCaregiverProfileInput {
  userId: string;
  isAvailable?: boolean;
  serviceAreas?: string[];
}

export interface UpdatedCaregiverProfile {
  id: string;
  isAvailable: boolean;
  serviceAreas: string[];
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

  const createdCaregiver = await Caregiver.create({
    userId: input.userId,
    qualifications: input.qualifications,
    rating: input.rating ?? 0,
    isAvailable: input.isAvailable ?? true,
    serviceAreas: input.serviceAreas,
    verificationStatus: input.verificationStatus ?? "pending",
  });

  return {
    id: createdCaregiver._id.toString(),
    userId: createdCaregiver.userId.toString(),
    qualifications: createdCaregiver.qualifications,
    rating: createdCaregiver.rating,
    isAvailable: createdCaregiver.isAvailable,
    serviceAreas: createdCaregiver.serviceAreas,
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

  await caregiver.save();

  return {
    id: caregiver._id.toString(),
    isAvailable: caregiver.isAvailable,
    serviceAreas: caregiver.serviceAreas,
    updatedAt: caregiver.updatedAt,
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