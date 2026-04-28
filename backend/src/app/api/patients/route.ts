import { createPatientController, listPatientProfilesController } from "@/controllers/patient.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function POST(request: Request) {
  return withCors(await createPatientController(request), request);
}

export async function GET(request: Request) {
  return withCors(await listPatientProfilesController(request), request);
}
