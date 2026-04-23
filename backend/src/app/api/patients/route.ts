import { createPatientController } from "@/controllers/patient.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createPatientController(request);
}