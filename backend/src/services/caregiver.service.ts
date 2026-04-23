import Caregiver from "@/models/Caregiver";

export interface CaregiverListItem {
  id: string;
  userId: string;
  qualifications: string;
  rating: number;
  serviceAreas: string[];
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