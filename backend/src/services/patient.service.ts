import Patient from "@/models/Patient";
import User from "@/models/User";

export interface CreatePatientInput {
  userId: string;
  age: number;
  medicalNeeds: string;
}

export interface CreatedPatient {
  id: string;
  userId: string;
  age: number;
  medicalNeeds: string;
}

export async function createPatientProfile(input: CreatePatientInput): Promise<CreatedPatient> {
  const user = await User.findById(input.userId).lean();

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role !== "user") {
    throw new Error("USER_ROLE_NOT_USER");
  }

  const createdPatient = await Patient.create({
    userId: input.userId,
    age: input.age,
    medicalNeeds: input.medicalNeeds,
  });

  return {
    id: createdPatient._id.toString(),
    userId: createdPatient.userId.toString(),
    age: createdPatient.age,
    medicalNeeds: createdPatient.medicalNeeds,
  };
}