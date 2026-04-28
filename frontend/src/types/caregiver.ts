export interface CaregiverListItem {
  id: string;
  userId: string;
  email: string;
  qualifications: string;
  rating: number;
  serviceAreas: string[];
  serviceIds: string[];
}

export type CaregiverVerificationStatus = "pending" | "verified" | "rejected";

export interface CaregiverProfile {
  id: string;
  userId: string;
  qualifications: string;
  rating: number;
  isAvailable: boolean;
  serviceAreas: string[];
  serviceIds: string[];
  verificationStatus: CaregiverVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaregiverProfilePayload {
  qualifications: string;
  serviceAreas: string[];
  serviceIds?: string[];
  rating?: number;
  isAvailable?: boolean;
}

export interface UpdateCaregiverProfilePayload {
  isAvailable?: boolean;
  serviceAreas?: string[];
  serviceIds?: string[];
}
