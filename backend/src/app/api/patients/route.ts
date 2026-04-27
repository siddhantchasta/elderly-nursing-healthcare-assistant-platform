import { createPatientController, getPatientProfileController } from "@/controllers/patient.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createPatientController(request);
}

export async function GET(request: Request) {
  return getPatientProfileController(request);
}