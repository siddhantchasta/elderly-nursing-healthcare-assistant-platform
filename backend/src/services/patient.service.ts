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

export interface PatientProfile {
  id: string;
  userId: string;
  age: number;
  medicalNeeds: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createPatientProfile(input: CreatePatientInput): Promise<CreatedPatient> {
  const user = await User.findById(input.userId).lean();

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role !== "user") {
    throw new Error("USER_ROLE_NOT_USER");
  }

  const existingPatient = await Patient.findOne({ userId: input.userId }).lean();

  if (existingPatient) {
    throw new Error("PATIENT_PROFILE_ALREADY_EXISTS");
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

export async function getPatientProfileByUserId(userId: string): Promise<PatientProfile> {
  const patient = await Patient.findOne({ userId }).lean();

  if (!patient) {
    throw new Error("PATIENT_PROFILE_NOT_FOUND");
  }

  return {
    id: patient._id.toString(),
    userId: patient.userId.toString(),
    age: patient.age,
    medicalNeeds: patient.medicalNeeds,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}