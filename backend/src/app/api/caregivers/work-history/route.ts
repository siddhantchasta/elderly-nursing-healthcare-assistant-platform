import { getCaregiverWorkHistoryController } from "@/controllers/caregiver.controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return getCaregiverWorkHistoryController(request);
}