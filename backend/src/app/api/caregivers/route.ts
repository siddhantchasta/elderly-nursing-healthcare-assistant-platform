import {
  createCaregiverController,
  listCaregiversController,
  updateCaregiverProfileController,
} from "@/controllers/caregiver.controller";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request) {
  return withCors(await listCaregiversController(), request);
}

export async function POST(request: Request) {
  return withCors(await createCaregiverController(request), request);
}

export async function PATCH(request: Request) {
  return withCors(await updateCaregiverProfileController(request), request);
}
