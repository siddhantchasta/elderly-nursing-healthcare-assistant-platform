import Caregiver from "@/models/Caregiver";
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

export interface UpdateCaregiverVerificationInput {
  caregiverId: string;
  verificationStatus: CaregiverCreateStatus;
}

export interface UpdatedCaregiverVerification {
  id: string;
  verificationStatus: CaregiverCreateStatus;
}

export interface CaregiverListItem {
  id: string;
  userId: string;
  qualifications: string;
  rating: number;
  serviceAreas: string[];
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