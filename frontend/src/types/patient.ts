export interface PatientProfile {
  id: string;
  userId: string;
  age: number;
  medicalNeeds: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientPayload {
  age: number;
  medicalNeeds: string;
}
