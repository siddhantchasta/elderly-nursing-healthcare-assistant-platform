import { updateCaregiverVerificationController } from "@/controllers/admin.controller";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  return updateCaregiverVerificationController(request);
}